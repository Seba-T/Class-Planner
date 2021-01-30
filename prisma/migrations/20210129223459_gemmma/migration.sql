-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "googleId" TEXT NOT NULL,
    "cookie" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "lastViewOption" TEXT NOT NULL DEFAULT 'Month',
    "lastDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("id", "googleId", "cookie", "name", "surname", "lastViewOption", "lastDate") SELECT "id", "googleId", "cookie", "name", "surname", "lastViewOption", "lastDate" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User.googleId_unique" ON "User"("googleId");
CREATE UNIQUE INDEX "User.cookie_unique" ON "User"("cookie");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
