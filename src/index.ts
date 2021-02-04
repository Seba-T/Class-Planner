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
const r2 = express.Router();

app.post("/tokensignin", async (req, res) => {
  // console.log("I have been called");
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
    const newCookie = req.cookies.hasOwnProperty?.("googleId")
      ? req.cookies.googleId
      : crypton.randomBytes(25).toString("hex");
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
    res
      .status(200)
      .cookie("googleId", newCookie, {
        httpOnly: true,
        maxAge: 31 * 24 * 3600 * 1000,
      })
      .send(user.name + " " + user.surname);
  } catch (err) {
    // console.log(err);
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
  updateLastView = async function () {
    await prismaClient.user.update({
      where: { cookie: req.cookies.googleId },
      data: {
        lastDate: new Date(req.body.date),
        lastViewOption: req.body.viewOption,
      },
    });
  };
  if (!alreadyCalled) {
    alreadyCalled = true;
    setTimeout(() => {
      alreadyCalled = false;
      updateLastView();
    }, 20 * 1000);
  }
  res.send(response);
});

app.get("/getview", async (req, res) => {
  const user = await prismaClient.user.findFirst({
    where: { cookie: req.cookies.googleId },
    select: { lastViewOption: true, lastDate: true },
  });
  res.send(user);
});

// app.post("/test", async (req, res) => {
//   res.send(resp);
// });

app.use(
  r1.all("*", async function (req, res, next) {
    if (req.cookies.hasOwnProperty?.("googleId")) {
      try {
        await prismaClient.user.findFirst({
          where: { cookie: req.cookies.googleId },
          rejectOnNotFound: true,
        });
      } catch (err) {
        res.render("loginpage", {
          googleAppId: privateInfo.googleAppId,
          domainName: privateInfo.domainName,
        });
      }
      next();
    } else {
      res.render("loginpage", {
        googleAppId: privateInfo.googleAppId,
        domainName: privateInfo.domainName,
      });
    }
  }),
  express.static(path.join(__dirname, "../public"))
);

app.listen(80);
