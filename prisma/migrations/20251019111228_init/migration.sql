/*
  Warnings:

  - You are about to drop the column `index` on the `Vault` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Vault_index_key";

-- AlterTable
ALTER TABLE "Vault" DROP COLUMN "index";
