-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "configMostrarMapaCeremonia" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "configMostrarMapaRecepcion" BOOLEAN NOT NULL DEFAULT true;
