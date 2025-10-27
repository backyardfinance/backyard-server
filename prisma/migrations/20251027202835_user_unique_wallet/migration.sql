/*
  Warnings:

  - A unique constraint covering the columns `[wallet]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `wallet` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "wallet" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_wallet_key" ON "User"("wallet");
