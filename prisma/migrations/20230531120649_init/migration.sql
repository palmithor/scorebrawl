/*
  Warnings:

  - You are about to drop the column `isPrivate` on the `League` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "League" DROP COLUMN "isPrivate";
ALTER TABLE "League" ADD COLUMN     "visibility" STRING NOT NULL DEFAULT 'public';
