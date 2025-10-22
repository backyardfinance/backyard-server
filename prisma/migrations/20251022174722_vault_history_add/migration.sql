/*
  Warnings:

  - You are about to drop the column `apy` on the `Vault` table. All the data in the column will be lost.
  - You are about to drop the column `asset_price` on the `Vault` table. All the data in the column will be lost.
  - You are about to drop the column `tvl` on the `Vault` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Strategy" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Vault" DROP COLUMN "apy",
DROP COLUMN "asset_price",
DROP COLUMN "tvl",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "current_apy" DECIMAL(38,18) NOT NULL DEFAULT 0,
ADD COLUMN     "current_asset_price" DECIMAL(38,18) NOT NULL DEFAULT 0,
ADD COLUMN     "current_tvl" DECIMAL(38,18) NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "VaultStartegy" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "VaultHistory" (
    "id" TEXT NOT NULL,
    "vaultId" TEXT NOT NULL,
    "tvl" DECIMAL(38,18) NOT NULL,
    "apy" DECIMAL(38,18) NOT NULL,
    "asset_price" DECIMAL(38,18) NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VaultHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VaultHistory_vaultId_recorded_at_idx" ON "VaultHistory"("vaultId", "recorded_at");

-- CreateIndex
CREATE UNIQUE INDEX "VaultHistory_vaultId_recorded_at_key" ON "VaultHistory"("vaultId", "recorded_at");

-- AddForeignKey
ALTER TABLE "VaultHistory" ADD CONSTRAINT "VaultHistory_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "Vault"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
