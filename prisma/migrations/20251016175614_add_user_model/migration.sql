-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "wallet" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
