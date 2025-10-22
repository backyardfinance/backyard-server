/*
  Warnings:

  - A unique constraint covering the columns `[public_key]` on the table `Vault` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Vault_public_key_key" ON "Vault"("public_key");
