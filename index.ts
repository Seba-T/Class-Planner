const express = require("express");
const bodyparser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
const prisma = require("@prisma/client").PrismaClient;
const app = express();
const calendarRenderer = require("./public/api/calendarRenderer");
// import { calendarRenderer } from "./public/api/calendarRenderer.js";

app.use(cookieParser());
app.use(bodyparser.json());

app.use("/", express.static(path.join(__dirname, "public")));
const prismaClient = new prisma();
// prismaClient.user.findMany({where: {name: "Giulio"}}).then((data) => console.log(data));

app.get("/json", function (req, res) {
  // fs.readFile("./test.json", (err, data) => {
  //     const json = JSON.parse(data);
  //     res.json(json);
  // })
  prismaClient.user
    .findFirst({ where: { id: JSON.stringify(req.id) } })
    .then((data) => res.json(JSON.parse(data.surName)));
});
app.post("/json", function (req, res) {
  // fs.writeFile("./test.json", JSON.stringify(req.body), (err, data) => {
  //     res.send();
  // })
  prismaClient.user
    .upsert({
      where: { id: 0 },
      update: { id: 0, name: JSON.stringify(req.body) },
      create: {
        id: 0,
        name: JSON.stringify(req.body.name),
        surName: JSON.stringify(req.body.surName),
      },
    })
    .then(() => {
      res.send();
    });
});

app.get("/api/date/:date/viewOption/:viewOption", async (req, res) => {
  // console.log(req.params);
  const response = await calendarRenderer(req.params.viewOption, new Date(req.params.date));
  // console.log(response);
  res.send(response);
  // res.send(JSON.stringify(resp));
});

app.get("/api/calendarRenderer", (req, res) => {
  res.json(JSON.parse(calendarRenderer(req.viewOption, req.startDay)));
});

app.get( "*", ( req, res ) => {
  res.sendFile( path.join(__dirname, "public/index.html"));
} );

app.listen(3000);

type a = string;