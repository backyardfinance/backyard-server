/*
  Warnings:

  - You are about to drop the column `deposited_amount` on the `Strategy` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Vault` table. All the data in the column will be lost.
  - Added the required column `public_key` to the `Vault` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deposited_amount` to the `VaultStartegy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deposited_amount_usd` to the `VaultStartegy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interest_earned` to the `VaultStartegy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interest_earned_uds` to the `VaultStartegy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Strategy" DROP COLUMN "deposited_amount";

-- AlterTable
ALTER TABLE "Vault" DROP COLUMN "address",
ADD COLUMN     "public_key" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "VaultStartegy" ADD COLUMN     "deposited_amount" DECIMAL(38,18) NOT NULL,
ADD COLUMN     "deposited_amount_usd" DECIMAL(38,18) NOT NULL,
ADD COLUMN     "interest_earned" DECIMAL(38,18) NOT NULL,
ADD COLUMN     "interest_earned_uds" DECIMAL(38,18) NOT NULL;
