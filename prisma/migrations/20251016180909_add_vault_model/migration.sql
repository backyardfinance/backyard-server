-- CreateTable
CREATE TABLE "Vault" (
    "id" TEXT NOT NULL,
    "address" TEXT,
    "name" TEXT NOT NULL,
    "tvl" DECIMAL(38,18) NOT NULL,
    "apy" DECIMAL(12,8) NOT NULL,

    CONSTRAINT "Vault_pkey" PRIMARY KEY ("id")
);
