const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const crypton = require("crypto");

const path = require("path");
const fs = require("fs");

const prisma = require("@prisma/client").PrismaClient;
const prismaClient = new prisma();

const calendarRenderer = require("./calendarRenderer.js");

const csurf = require("csurf");
const csrfProtection = csurf({ cookie: { httpOnly: true } });

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(
  "900965066281-tcj9qciujqodr2bs6sl4hc85mhmips1b.apps.googleusercontent.com"
);
const app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", express.static(path.join(__dirname, "../public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));

app.post("/tokensignin", async (req, res) => {
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: req.body,
      audience: `900965066281-tcj9qciujqodr2bs6sl4hc85mhmips1b.apps.googleusercontent.com`,
    });
    const payload = ticket.getPayload();
    const id = payload["sub"];
    const name = payload["given_name"];
    const surname = payload["family_name"];
    // if (payload["hd"] !== "istitutobrunofranchetti.edu.it")
    //   throw "Devi accedere con la mail istitutionale!";
    return { id, name, surname };
  }
  try {
    const user = await verify();
    // console.log(user.name);
    const newCookie = req.cookies.hasOwnProperty("googleId")
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
    res.cookie("googleId", newCookie, {
      httpOnly: true,
      maxAge: 24 * 3600 * 1000,
    }).status(200).send(user.name + " " + user.surname);
    console.log(newCookie);
  } catch (err) {
    console.log(err);
  }
});

app.post("/getcalendarview", async (req, res) => {
  const response = await calendarRenderer(
    req.body.viewOption,
    new Date(req.body.date)
  );
  await prismaClient.user.update({
    where: { cookie: req.cookies.googleId },
    data: {
      lastDate: new Date(req.body.date),
      lastViewOption: req.body.viewOption,
    },
  });

  res.send(response);
  // res.send(JSON.stringify(resp));
});

app.get("/getview", async (req, res) => {
  const user = await prismaClient.user.findFirst({
    where: { cookie: req.cookies.googleId },
    select: { lastViewOption: true, lastDate: true },
  });
  res.send(user);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(80);

// app.get("/json", function (req, res) {

//   prismaClient.user
//     .findFirst({ where: { id: JSON.stringify(req.id) } })
//     .then((data) => res.json(JSON.parse(data.surName)));
// });
// app.post("/json", function (req, res) {

//   prismaClient.user
//     .upsert({
//       where: { id: 0 },
//       update: { id: 0, name: JSON.stringify(req.body) },
//       create: {
//         id: 0,
//         name: JSON.stringify(req.body.name),
//         surName: JSON.stringify(req.body.surName),
//       },
//     })
//     .then(() => {
//       res.send();
//     });
//});
