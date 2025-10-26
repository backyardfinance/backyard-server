/*
  Warnings:

  - Added the required column `input_token_mint` to the `Vault` table without a default value. This is not possible if the table is not empty.
  - Added the required column `our_lp_mint` to the `Vault` table without a default value. This is not possible if the table is not empty.
  - Added the required column `protocol_lp_mint` to the `Vault` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vault" ADD COLUMN     "input_token_mint" TEXT NOT NULL,
ADD COLUMN     "our_lp_mint" TEXT NOT NULL,
ADD COLUMN     "protocol_lp_mint" TEXT NOT NULL;
