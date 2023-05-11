/*
  Warnings:

  - Added the required column `status` to the `Story` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StoryStatus" AS ENUM ('PUBLISHED', 'DRAFT', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "PlatformKey" AS ENUM ('TWITTER', 'INSTAGRAM', 'FACEBOOK');

-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "status" "StoryStatus" NOT NULL;

-- CreateTable
CREATE TABLE "Platform" (
    "id" TEXT NOT NULL,
    "key" "PlatformKey" NOT NULL,

    CONSTRAINT "Platform_pkey" PRIMARY KEY ("id")
);
