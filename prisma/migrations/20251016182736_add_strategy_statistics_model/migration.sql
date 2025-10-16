-- CreateTable
CREATE TABLE "StartegyStatistics" (
    "id" TEXT NOT NULL,
    "strategy_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "price" DECIMAL(38,18) NOT NULL,

    CONSTRAINT "StartegyStatistics_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StartegyStatistics" ADD CONSTRAINT "StartegyStatistics_strategy_id_fkey" FOREIGN KEY ("strategy_id") REFERENCES "Strategy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
