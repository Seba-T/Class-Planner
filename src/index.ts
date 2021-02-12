const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const crypton = require("crypto");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");

const prisma = require("@prisma/client").PrismaClient;
const prismaClient = new prisma();

const calendarRenderer = require("./calendarRenderer.js");
const privateInfo = require("../privateInfo.json");
const schedule = require("./schedule.json");
const dateHelper = require("./dateHelper.js");

const csurf = require("csurf");
const csrfProtection = csurf({ cookie: { httpOnly: true } });

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(privateInfo.googleAppId);
const app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
// app.use("/calendar", express.static(path.join(__dirname, "../public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

const r1 = express.Router();

async function authenticateReq(req, res, next) {
  if (
    Object.keys(req.cookies).length !== 0 &&
    req.cookies.hasOwnProperty("session")
  ) {
    try {
      await prismaClient.user.findUnique({
        where: { cookie: req.cookies.session },
        rejectOnNotFound: true,
      });
    } catch (err) {
      res.status(403).render("loginpage", {
        googleAppId: privateInfo.googleAppId,
        domainName: privateInfo.domainName,
      });
    }
    next();
  } else {
    res.status(403).render("loginpage", {
      googleAppId: privateInfo.googleAppId,
      domainName: privateInfo.domainName,
    });
  }
}

app.post("/tokensignin", async (req, res) => {
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: req.body,
      audience: privateInfo.googleAppId,
    });
    const payload = ticket.getPayload();
    const id = payload["sub"];
    const name = payload["given_name"];
    const surname = payload["family_name"];
    if (payload["hd"] !== "istitutobrunofranchetti.edu.it")
      throw "Questo non è l'account istituzionale!";
    return { id, name, surname };
  }
  try {
    const user = await verify();
    const newCookie = crypton.randomBytes(25).toString("hex");
    await prismaClient.user.upsert({
      where: { googleId: user.id },
      update: { cookie: newCookie },
      create: {
        googleId: user.id,
        name: user.name,
        surname: user.surname,
        cookie: newCookie,
      },
    });
    const datesOnUser = await prismaClient.user.findUnique({
      where: { cookie: newCookie },
      select: {
        role: true,
        dates: {
          select: {
            Date: {
              select: {
                date: true,
                Subject: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    const formattedDatesOnUser = datesOnUser.dates.map((elm) => {
      return { date: elm.Date.date, subject: elm.Date.Subject.name };
    });
    const userRole = datesOnUser.role;
    res
      .status(200)
      .cookie("session", newCookie, {
        httpOnly: true,
        maxAge: 31 * 24 * 3600 * 1000,
      })
      .json({
        name: user.name + " " + user.surname,
        googleId: user.id,
        dates: formattedDatesOnUser,
        role: userRole,
      });
  } catch (err) {
    console.log(err);
    res.status(403).send(err);
  }
});
app.post("/getcalendarview", async (req, res) => {
  var updateLastView;
  var alreadyCalled = false;
  const response = await calendarRenderer(
    req.body.viewOption,
    new Date(req.body.date)
  );

  updateLastView = async function (cookie, lastDate, lastViewOption) {
    try {
      await prismaClient.user.update({
        where: { cookie: cookie },
        data: {
          lastDate: lastDate,
          lastViewOption: lastViewOption,
        },
        rejectOnNotFound: true,
      });
    } catch (err) {
      console.log(err);
    }
  };
  const cookie = req.cookies.session;
  const lastDate = new Date(req.body.date);
  const lastViewOption = req.body.viewOption;
  var timeOut;
  if (lastViewOption === "Day") {
    updateLastView(cookie, lastDate, lastViewOption);
    clearTimeout(timeOut);
    alreadyCalled = false;
  } else if (!alreadyCalled) {
    alreadyCalled = true;
    timeOut = setTimeout(() => {
      alreadyCalled = false;
      updateLastView(cookie, lastDate, lastViewOption);
    }, 20 * 1000);
  }
  res.send(response);
});

app.get("/getview", async (req, res) => {
  //gets last view
  try {
    const user = await prismaClient.user.findUnique({
      where: { cookie: req.cookies.session },
      select: { lastViewOption: true, lastDate: true },
      rejectOnNotFound: true,
    });
    res.send(user);
  } catch (err) {
    res.status(403).render("loginpage", {
      googleAppId: privateInfo.googleAppId,
      domainName: privateInfo.domainName,
    });
  }
});

app.post("/signupfordate", async (req, res) => {
  const date = new Date(req.body.date);
  date.setHours(1, 0, 0, 0);
  try {
    const userId = (
      await prismaClient.user.findUnique({
        where: { cookie: req.cookies.session },
        select: { id: true },
        rejectOnNotFound: true,
      })
    ).id;
    const dateId = (
      await prismaClient.date.findFirst({
        where: { date: date, Subject: { name: req.body.subject } },
        select: { id: true },
        rejectOnNotFound: true,
      })
    ).id;
    switch (req.body.action) {
      case "CREATE":
        await prismaClient.datesOnUsers.create({
          data: {
            priority: req.body.priority,
            userId: userId,
            dateId: dateId,
          },
        });
        break;
      case "DELETE":
        const deleteId = (
          await prismaClient.datesOnUsers.findFirst({
            where: { userId: userId, dateId: dateId },
            select: { id: true },
          })
        ).id;
        await prismaClient.datesOnUsers.delete({
          where: { id: deleteId },
        });
        break;
      default:
        return 0;
    }
  } catch (e) {
    res.status(422).send(e);
  }
  res.status(200).send("operazione confermata!");
});
app.get("/getinsertdateview", async (req, res) => {
  try {
    const lastDate = (
      await prismaClient.user.findUnique({
        where: { cookie: req.cookies.session },
        select: { lastDate: true },
        rejectOnNotFound: true,
      })
    ).lastDate;
    res.render("insertdateview", {
      date: lastDate,
    });
  } catch (err) {
    res.render("loginpage", {
      googleAppId: privateInfo.googleAppId,
      domainName: privateInfo.domainName,
    });
  }
});
app.post("/availabledates", async (req, res) => {
  const avlweekdays = [];
  schedule.forEach((a, index) => {
    const elmPos = a.find(
      (b) => b.toLowerCase() === req.body.subject.toLowerCase()
    );
    if (elmPos !== undefined) avlweekdays.push(index);
  });
  const now = new Date();
  now.setDate(now.getDate() + 1 - now.getDay());
  const week = avlweekdays.map((a) => now.getTime() + 24 * 3600 * 1000 * a);
  const avldates = Array.from(new Array(10), (_, index) =>
    week.map((a) => new Date(a + 7 * 24 * 3600 * 1000 * index).toDateString())
  )
    .reduce((acc, val) => acc.concat(val), [])
    .slice(0, 10);
  res.json(avldates);
});

app.post("/createdate", async (req, res) => {
  try {
    const role = (
      await prismaClient.user.findUnique({
        where: { cookie: req.cookies.session },
        select: { role: true },
        rejectOnNotFound: true,
      })
    ).role;
    if (role === "admin") {
      const dates = req.body.dates.map((a) => new Date(a));
      dates.forEach((date) => date.setHours(1, 0, 0, 0));
      const newDates = await Promise.all(
        dates.map(
          async (date) =>
            await prismaClient.date.create({
              data: {
                date: date,
                Subject: {
                  connect: { name: req.body.subject },
                },
              },
            })
        )
      );
      res.status(200).send(newDates);
    } else {
      res.status(422).send("You are not allowed to make this request!");
    }
  } catch (err) {
    res.render("loginpage", {
      googleAppId: privateInfo.googleAppId,
      domainName: privateInfo.domainName,
    });
  }
});
// app.post("/test", (req, res) => {
//   console.log(req.body);
//   res.send("funziona");
// });
app.use(
  r1.all("*", authenticateReq),
  express.static(path.join(__dirname, "../public"))
);
app.listen(80);
