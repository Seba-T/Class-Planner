-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "googlId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "teacher" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Date" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "subjectId" INTEGER,
    FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DatesOnUsers" (
    "userId" INTEGER NOT NULL,
    "dateId" INTEGER NOT NULL,
    "priority" INTEGER,

    PRIMARY KEY ("userId", "dateId"),
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("dateId") REFERENCES "Date" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User.googlId_unique" ON "User"("googlId");

-- CreateIndex
CREATE UNIQUE INDEX "Subject.name_unique" ON "Subject"("name");
