/*
  Warnings:

  - Added the required column `telefono` to the `InvitadoPrincipal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InvitadoPrincipal" ADD COLUMN     "telefono" TEXT NOT NULL;
