/*
  Warnings:

  - Added the required column `platform` to the `Vault` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VaultPlatform" AS ENUM ('Jupiter', 'Kamino');

-- AlterTable
ALTER TABLE "Vault" ADD COLUMN     "platform" "VaultPlatform" NOT NULL;
