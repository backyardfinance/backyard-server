-- AlterTable
ALTER TABLE "Vault" ALTER COLUMN "apy" SET DATA TYPE DECIMAL(38,18);

-- CreateTable
CREATE TABLE "Strategy" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "deposited_amount" DECIMAL(38,18) NOT NULL,
    "current_price" DECIMAL(38,18) NOT NULL,

    CONSTRAINT "Strategy_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Strategy" ADD CONSTRAINT "Strategy_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
