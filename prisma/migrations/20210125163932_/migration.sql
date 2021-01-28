/*
  Warnings:

  - The migration will change the primary key for the `Date` table. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Date" (
    "id" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "subjectId" INTEGER NOT NULL,

    PRIMARY KEY ("date", "subjectId"),
    FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Date" ("id", "date", "subjectId") SELECT "id", "date", "subjectId" FROM "Date";
DROP TABLE "Date";
ALTER TABLE "new_Date" RENAME TO "Date";
CREATE UNIQUE INDEX "Date.id_unique" ON "Date"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;