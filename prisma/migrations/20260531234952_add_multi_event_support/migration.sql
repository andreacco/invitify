/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('BODA', 'QUINCE_ANOS', 'BAUTIZO', 'CUMPLEANOS', 'CORPORATIVO', 'OTRO');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'ORGANIZADOR';
ALTER TYPE "Role" ADD VALUE 'ANFITRION';

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "tipo" "TipoEvento" NOT NULL DEFAULT 'BODA',
ALTER COLUMN "ubicacionCeremonia" DROP NOT NULL,
ALTER COLUMN "ubicacionRecepcion" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");
