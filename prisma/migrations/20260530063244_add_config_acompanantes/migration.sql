/*
  Warnings:

  - You are about to drop the column `configuracion` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "configuracion",
ADD COLUMN     "configPermiteAcompanantes" BOOLEAN NOT NULL DEFAULT true;
