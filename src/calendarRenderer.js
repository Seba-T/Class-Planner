const dateHelper = require("./dateHelper.js");

const schedule = require("./schedule.json");

const prisma = require("@prisma/client").PrismaClient;

const prismaClient = new prisma();

async function getUsersPerDayAndSubject(date) {
  const copy = new Date(date.getTime());
  copy.setHours(1, 0, 0, 0);
  const query = await prismaClient.date.findMany({
    where: {
      date: copy,
    },
    select: {
      Subject: { select: { name: true } },
      users: {
        select: {
          priority: true,
          User: {
            select: {
              name: true,
              surname: true,
            },
          },
        },
      },
    },
  });
  const resp = {};
  query.forEach((elm) => {
    elm.users.sort((a, b) => a.priority - b.priority);
    resp[elm.Subject.name] = elm.users;
  });
  console.log(resp);
  return query.length > 0 ? resp : false;
}

async function getVis(viewOption, startDay) {
  switch (viewOption) {
    case "Day": {
      const users = await getUsersPerDayAndSubject(startDay);
      const grdRows = schedule[startDay.getDay() - 1]?.length;
      const grdClms = 1;
      let notUsed = true;
      const cellContent = schedule[startDay.getDay() - 1].map((subj) => {
        // array full of subjects, ordered by hour
        return {
          title: subj,
          users:
            users.hasOwnProperty(subj) && notUsed
              ? users[subj].map((user) => {
                  notUsed = false;
                  return [
                    user.User.surname.toLowerCase() +
                      " " +
                      user.User.name.toLowerCase(),
                    user.priority,
                  ];
                })
              : false,
          date: new Date(startDay.getTime()).toISOString(),
        };
      });
      // console.log(cellContent);
      return { cellContent, grdRows, grdClms };
    }

    case "Week": {
      const grdRows = Object.values(schedule).sort(
        (a, b) => b.length - a.length
      )[0].length;
      const grdClms = 6;
      const cellNumb = grdRows * grdClms;
      const cellContent = new Array(cellNumb).fill("");
      let newDate = new Date(startDay.getTime());
      for (let day = 0; day < grdClms; day++) {
        const users = await getUsersPerDayAndSubject(newDate);
        let notUsed = true;
        schedule[day].forEach((subj, indexSubj) => {
          const index = day + indexSubj * grdClms;
          cellContent[index] = {
            title: subj,
            users:
              users.hasOwnProperty(subj) && notUsed
                ? users[subj].map((user) => {
                    notUsed = false;
                    return [user.User.surname.toLowerCase(), user.priority];
                  })
                : false,
            date: new Date(newDate.getTime()).toISOString(),
          };
        });
        dateHelper.addDays(newDate, 1);
      }
      return { cellContent, grdRows, grdClms };
    }

    case "Month": {
      const grdRows = 5;
      const grdClms = 7;
      const cellNumb = grdRows * grdClms;
      const cellContent = new Array(cellNumb);
      let newDate = new Date(startDay.getTime()); //firstWeekDayOfMonth
      dateHelper.getFirstDayOfWeek(newDate);
      getWeekday = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
      });
      for (let day = 0; day < cellNumb; day++) {
        cellContent[day] = {
          title:
            (day < 7 ? getWeekday.format(newDate) + "<br>" : "") +
            newDate.getDate(),
          users: (await getUsersPerDayAndSubject(newDate))
            ? "availableDate"
            : " ",
          date: new Date(newDate.getTime()).toISOString(),
        };
        dateHelper.addDays(newDate, 1);
      }
      return { cellContent, grdRows, grdClms };
    }

    case "Year": {
      const grdRows = 2;
      const grdClms = 2;
      const cellTitles = await Promise.all(
        new Array(4).fill("").map(async (_, index) => {
          const newDate = new Date(startDay.getTime());

          newDate.setMonth(newDate.getMonth() + index + 1);
          return await displayCalendarGrid("Month", new Date(newDate));
        })
      );
      const cellContent = cellTitles.map((title, index) => {
        const newDate = new Date(startDay.getTime());
        newDate.setMonth(newDate.getMonth() + index + 1);
        return { title: title, date: newDate, users: false };
      });
      return { cellContent, grdRows, grdClms };
    }
  }
}

async function displayCalendarGrid(viewOption, startDay) {
  const { grdClms, grdRows, cellContent } = await getVis(viewOption, startDay);
  // console.log(schedule);
  const cellNumb = grdRows * grdClms;
  const isWeekend = getIsWeekend(viewOption, startDay, cellNumb);

  const style = `
    grid-template-columns: repeat(${grdClms}, calc(100%/ ${grdClms}));
    grid-template-rows: repeat(${grdRows}, calc(100%/ ${grdRows}));
  `;

  const gridContent = [];
  for (let x = 0; x < cellNumb; x++) {
    const onClickCode = `
      window.state.updateView({
        viewOption: '${getNewViewOption(viewOption)}',
        date: '${cellContent[x].date}',
        direction: 0
      })`;

    gridContent.push(`
      <div
        class="gridCell ${
          isWeekend[x] + (viewOption === "Month") ? cellContent[x].users : " "
        }"
        onclick = "${onClickCode}">`);

    gridContent.push(`
      <div class="cellContent">
        ${cellContent[x].title}
      </div>
    `);

    if (cellContent[x].users && viewOption !== "Month") {
      cellContent[x].users.forEach((user) =>
        gridContent.push(`<div class="priority_${user[1]}">${user[0]}</div>`)
      );
    }

    gridContent.push(`</div>`);
  }

  return `
    <div class="calendarGrid" style="${style}">
      ${gridContent.join("")}
    </div>
  `;
}

function getNewViewOption(prevViewOption) {
  return prevViewOption === "Year" ? "Month" : "Day";
}

function getIsWeekend(viewOption, startDay, cellNumb) {
  switch (viewOption) {
    case "Day":
      return startDay.getDay() === 6 ? "weekend" : " ";
    case "Week":
      return new Array(cellNumb).fill(false).map((a) => (a ? "weekend" : " "));
    case "Month":
      return Array.from(Array(cellNumb), (_, index) => {
        return Number.isInteger((index + 1) / 7) ? "weekend" : " ";
      });
    case "Year":
      return new Array(cellNumb).fill("");
  }
}

module.exports = displayCalendarGrid;
