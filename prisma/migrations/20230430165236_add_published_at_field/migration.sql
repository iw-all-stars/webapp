/*
  Warnings:

  - Added the required column `publishedAt` to the `Story` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "publishedAt" TIMESTAMP(3) NOT NULL;
