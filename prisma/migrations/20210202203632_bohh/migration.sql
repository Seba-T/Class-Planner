/*
  Warnings:

  - You are about to drop the column `googlId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `surName` on the `User` table. All the data in the column will be lost.
  - Made the column `subjectId` on table `Date` required. The migration will fail if there are existing NULL values in that column.
  - Made the column `priority` on table `DatesOnUsers` required. The migration will fail if there are existing NULL values in that column.
  - Added the required column `googleId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cookie` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `surname` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User.googlId_unique";

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Date" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "subjectId" INTEGER NOT NULL,
    FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Date" ("id", "date", "subjectId") SELECT "id", "date", "subjectId" FROM "Date";
DROP TABLE "Date";
ALTER TABLE "new_Date" RENAME TO "Date";
CREATE TABLE "new_DatesOnUsers" (
    "userId" INTEGER NOT NULL,
    "dateId" INTEGER NOT NULL,
    "priority" INTEGER NOT NULL,

    PRIMARY KEY ("userId", "dateId"),
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("dateId") REFERENCES "Date" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DatesOnUsers" ("userId", "dateId", "priority") SELECT "userId", "dateId", "priority" FROM "DatesOnUsers";
DROP TABLE "DatesOnUsers";
ALTER TABLE "new_DatesOnUsers" RENAME TO "DatesOnUsers";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "googleId" TEXT NOT NULL,
    "cookie" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "lastViewOption" TEXT NOT NULL DEFAULT 'Month',
    "lastDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("id", "name") SELECT "id", "name" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User.googleId_unique" ON "User"("googleId");
CREATE UNIQUE INDEX "User.cookie_unique" ON "User"("cookie");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
