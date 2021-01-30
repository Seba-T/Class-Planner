/*
  Warnings:

  - You are about to drop the column `googlId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `coockie` on the `User` table. All the data in the column will be lost.
  - Added the required column `googleId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User.googlId_unique";

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "googleId" TEXT NOT NULL,
    "cookie" TEXT NOT NULL DEFAULT '1',
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "lastViewOption" TEXT NOT NULL DEFAULT 'Month',
    "lastDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("id", "name", "surname", "lastViewOption", "lastDate") SELECT "id", "name", "surname", "lastViewOption", "lastDate" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User.googleId_unique" ON "User"("googleId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
