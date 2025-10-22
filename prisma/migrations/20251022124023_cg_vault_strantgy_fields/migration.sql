/*
  Warnings:

  - You are about to drop the column `interest_earned_uds` on the `VaultStartegy` table. All the data in the column will be lost.
  - Added the required column `interest_earned_usd` to the `VaultStartegy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VaultStartegy" DROP COLUMN "interest_earned_uds",
ADD COLUMN     "interest_earned_usd" DECIMAL(38,18) NOT NULL;
