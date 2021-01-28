const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const crypton = require("crypto");

const path = require("path");
const fs = require("fs");

const prisma = require("@prisma/client").PrismaClient;
const prismaClient = new prisma();

const calendarRenderer = require("./calendarRenderer");

const csurf = require("csurf");
const csrfProtection = csurf({ cookie: { httpOnly: true } });

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(CLIENT_ID);
const app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", express.static(path.join(__dirname, "../public")));

app.post("/tokensignin", async (req, res) => {
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: req.body,
      audience: `00965066281-tcj9qciujqodr2bs6sl4hc85mhmips1b.apps.googleusercontent.com`,
    });
    const payload = ticket.getPayload();
    const userid = payload["sub"];
    if (payload["hd"] !== "istitutobrunofranchetti.edu.it") throw "Devi accedere con la mail istitutionale!";
    return userid;
  }
  try {
    const userid = await verify();
    const newCookie = crypton.randomBytes(25).toString('hex');
    await prismaClient.user.upsert({
      where: { googleId: userid },
      update: { cookie: newCookie },
      create: { googleId: userid, name: '', surName:''},
    });
    res.cookie("googleId", userid);


    prismaClient.user.findUnique({
      where: {
        googleId: userid,
      },
      rejectOnNotFound: true
    }).then((resolve) => {
       

    }, (reject) => {})
    



  } catch (err) {
    console.log(err);
  }
});

app.get("/src/date/:date/viewOption/:viewOption", async (req, res) => {
  // console.log(req.params);
  // res.cookie("googleId", );
  // req.cookies
  const response = await calendarRenderer(
    req.params.viewOption,
    new Date(req.params.date)
  );
  res.send(response);
  // res.send(JSON.stringify(resp));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(3000);

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
