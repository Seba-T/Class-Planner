/*
  Warnings:

  - Made the column `subjectId` on table `Date` required. The migration will fail if there are existing NULL values in that column.

*/
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
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
