/*
  Warnings:

  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "user";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'player'
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizedId" TEXT NOT NULL,
    "maxPlayers" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "format" TEXT NOT NULL,
    CONSTRAINT "Tournament_organizedId_fkey" FOREIGN KEY ("organizedId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_TournamentToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_TournamentToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Tournament" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TournamentToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Tournament_organizedId_idx" ON "Tournament"("organizedId");

-- CreateIndex
CREATE UNIQUE INDEX "_TournamentToUser_AB_unique" ON "_TournamentToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_TournamentToUser_B_index" ON "_TournamentToUser"("B");
