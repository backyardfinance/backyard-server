/*
  Warnings:

  - A unique constraint covering the columns `[xId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "xId" TEXT,
ADD COLUMN     "xUsername" TEXT;

-- CreateTable
CREATE TABLE "WhitelistParticipant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wallet_connected" BOOLEAN NOT NULL DEFAULT false,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "twitter_linked" BOOLEAN NOT NULL DEFAULT false,
    "twitter_followed" BOOLEAN NOT NULL DEFAULT false,
    "post_retweeted" BOOLEAN NOT NULL DEFAULT false,
    "nft_tx_signature" TEXT,
    "nft_leaf_index" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhitelistParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WhitelistParticipant_userId_key" ON "WhitelistParticipant"("userId");

-- CreateIndex
CREATE INDEX "WhitelistParticipant_userId_idx" ON "WhitelistParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_xId_key" ON "User"("xId");

-- AddForeignKey
ALTER TABLE "WhitelistParticipant" ADD CONSTRAINT "WhitelistParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
