/*
  Warnings:

  - You are about to drop the column `address` on the `Vault` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[index]` on the table `Vault` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `index` to the `Vault` table without a default value. This is not possible if the table is not empty.
  - Added the required column `public_key` to the `Vault` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Vault` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vault" DROP COLUMN "address",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "index" INTEGER NOT NULL,
ADD COLUMN     "public_key" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Vault_index_key" ON "Vault"("index");
