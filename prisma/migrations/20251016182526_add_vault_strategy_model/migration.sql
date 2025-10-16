-- CreateTable
CREATE TABLE "VaultStartegy" (
    "id" TEXT NOT NULL,
    "strategy_id" TEXT NOT NULL,
    "vault_id" TEXT NOT NULL,

    CONSTRAINT "VaultStartegy_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VaultStartegy" ADD CONSTRAINT "VaultStartegy_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "Strategy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaultStartegy" ADD CONSTRAINT "VaultStartegy_vault_id_fkey" FOREIGN KEY ("vault_id") REFERENCES "Vault"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
