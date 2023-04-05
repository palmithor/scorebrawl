/*
  Warnings:

  - You are about to drop the column `createdByUserId` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `createdByUserId` on the `League` table. All the data in the column will be lost.
  - Added the required column `createdBy` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `League` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `League` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Match" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leagueId" TEXT NOT NULL,
    "homeScore" INTEGER NOT NULL,
    "awayScore" INTEGER NOT NULL,
    "homeExpectedElo" REAL NOT NULL,
    "awayExpectedElo" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    CONSTRAINT "Match_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Match" ("awayExpectedElo", "awayScore", "createdAt", "homeExpectedElo", "homeScore", "id", "leagueId", "updatedAt") SELECT "awayExpectedElo", "awayScore", "createdAt", "homeExpectedElo", "homeScore", "id", "leagueId", "updatedAt" FROM "Match";
DROP TABLE "Match";
ALTER TABLE "new_Match" RENAME TO "Match";
CREATE TABLE "new_League" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "logoUrl" TEXT,
    "name" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL
);
INSERT INTO "new_League" ("archived", "createdAt", "id", "logoUrl", "name", "updatedAt") SELECT "archived", "createdAt", "id", "logoUrl", "name", "updatedAt" FROM "League";
DROP TABLE "League";
ALTER TABLE "new_League" RENAME TO "League";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
