/*
  Warnings:

  - You are about to drop the column `current_price` on the `Strategy` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Strategy" DROP COLUMN "current_price",
ADD COLUMN     "name" TEXT;
