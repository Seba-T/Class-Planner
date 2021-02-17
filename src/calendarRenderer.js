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
  // console.log(resp);
  return query.length > 0 ? resp : false;
}

async function getDatesPerMonth(date) {
  const startDate = new Date(date.getTime());
  startDate.setHours(1, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);
  const query = await prismaClient.date.findMany({
    where: {
      AND: [
        {
          date: {
            gte: startDate,
          },
        },
        {
          date: {
            lte: endDate,
          },
        },
      ],
    },
    select: {
      date: true,
    },
  });
  return query.map((elm) => elm.date);
}
async function getVis(viewOption, startDay) {
  switch (viewOption) {
    case "Day": {
      const users = await getUsersPerDayAndSubject(startDay);
      const grdRows = schedule[startDay.getDay() - 1].length;
      const grdClms = 1;
      let used = {};
      const cellContent = schedule[startDay.getDay() - 1].map((subj) => {
        // array full of subjects, ordered by hour
        return {
          title: subj,
          users:
            users.hasOwnProperty(subj) && !used[subj]
              ? users[subj].map((user) => {
                  used[subj] = true;
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
      cellContent.forEach((elm, idx) => {
        if (
          cellContent?.[idx - 1]?.title === elm.title &&
          cellContent?.[idx - 1].users.length > 4
        ) {
          cellContent[idx].users = cellContent[idx - 1].users.splice(4);
        }
      });
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
        let used = {};
        schedule[day].forEach((subj, indexSubj) => {
          const index = day + indexSubj * grdClms;
          cellContent[index] = {
            title: subj,
            users:
              users.hasOwnProperty(subj) && !used[subj]
                ? users[subj].map((user) => {
                    used[subj] = true;
                    return [user.User.surname.toLowerCase(), user.priority];
                  })
                : false,
            date: new Date(newDate.getTime()).toISOString(),
          };

          if (
            cellContent?.[index - grdClms]?.title === cellContent[index].title &&
            cellContent?.[index - grdClms]?.users.length > 4
          ) {
            cellContent[index].users = cellContent[index - grdClms].users.splice(4);
          }
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
      const availableDays = await getDatesPerMonth(newDate);
      const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      for (let day = 0; day < cellNumb; day++) {
        cellContent[day] = {
          title: (day < 7 ? weekdays[day] + "<br>" : "") + newDate.getDate(),
          users: availableDays.find(
            (date) => date.toDateString() === newDate.toDateString()
          ),
          date: newDate.toISOString(),
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
          newDate.setMonth(newDate.getMonth() + index);
          return await displayCalendarGrid("Month", new Date(newDate));
        })
      );
      const cellContent = cellTitles.map((title, index) => {
        const newDate = new Date(startDay.getTime());
        newDate.setMonth(newDate.getMonth() + index);
        return { title: title, date: newDate, users: false };
      });
      return { cellContent, grdRows, grdClms };
    }
  }
}

async function displayCalendarGrid(viewOption, startDay) {
  const { grdClms, grdRows, cellContent } = await getVis(viewOption, startDay);
  const cellNumb = grdRows * grdClms;
  const isWeekend = getIsWeekend(viewOption, startDay, cellNumb);

  const style = `
    grid-template-columns: repeat(${grdClms}, calc(100%/ ${grdClms}));
    grid-template-rows: repeat(${grdRows}, calc(100%/ ${grdRows}));
  `;

  const gridContent = [];
  for (let x = 0; x < cellNumb; x++) {
    const onClickCode =
      (viewOption !== "Day" && new Date(cellContent[x].date).getDay() !== 0) ||
      viewOption === "Year"
        ? `window.state.updateView({
        viewOption: '${getNewViewOption(viewOption)}',
        date: '${cellContent[x].date}',
        direction: 0
      })`
        : `signUpForDate({subject: '${cellContent[x].title}', date: '${cellContent[x].date}'})`;

    gridContent.push(`
      <div
        class="${viewOption !== "Year" ? "gridCell " : "gridCellYear "}${
      isWeekend[x]
    } ${cellContent[x].users ? " availableDate" : ""}" ${
      cellContent[x].users && viewOption === "Day"
        ? 'data-toggle="modal" data-target="#signUpForDate"'
        : ""
    }
        onclick = "${onClickCode}">`);

    gridContent.push(`
      <div class="cellContent">
        ${
          viewOption !== "Year" && viewOption !== "Month"
            ? cellContent[x].title.trim().slice(0, 3) +
              '<span class="hideCont">' +
              cellContent[x].title.trim().slice(3) +
              "</span>"
            : cellContent[x].title
        }
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
      return new Array(cellNumb).fill(
        startDay.getDay() === 0 ? "weekend" : " "
      );
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
