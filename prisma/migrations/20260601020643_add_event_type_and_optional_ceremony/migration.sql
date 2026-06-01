/*
  Warnings:

  - The `tipo` column on the `Event` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `ubicacionRecepcion` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('BODA', 'QUINCEANOS', 'CUMPLEANOS', 'BABY_SHOWER', 'GRADUACION', 'PRIMERA_COMUNION', 'BAUTIZO', 'OTRO');

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "ubicacionRecepcion" SET NOT NULL,
DROP COLUMN "tipo",
ADD COLUMN     "tipo" "EventType" NOT NULL DEFAULT 'BODA';

-- DropEnum
DROP TYPE "TipoEvento";
