/*
  Warnings:

  - You are about to drop the column `surName` on the `User` table. All the data in the column will be lost.
  - Made the column `priority` on table `DatesOnUsers` required. The migration will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
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
    "googlId" TEXT NOT NULL,
    "coockie" TEXT NOT NULL DEFAULT '1',
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL DEFAULT '',
    "lastViewOption" TEXT NOT NULL DEFAULT '1',
    "lastDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("id", "googlId", "name") SELECT "id", "googlId", "name" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User.googlId_unique" ON "User"("googlId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
