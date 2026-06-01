/*
  Warnings:

  - A unique constraint covering the columns `[eventId,correoInvitado]` on the table `EventMember` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `correoInvitado` to the `EventMember` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('INVITADO', 'ACEPTADO');

-- AlterEnum
ALTER TYPE "EventRole" ADD VALUE 'PERSONALIZADO';

-- DropIndex
DROP INDEX "EventMember_eventId_userId_key";

-- AlterTable
ALTER TABLE "EventMember" ADD COLUMN     "correoInvitado" TEXT NOT NULL,
ADD COLUMN     "rolPersonalizado" TEXT,
ADD COLUMN     "status" "MemberStatus" NOT NULL DEFAULT 'INVITADO',
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EventMember_eventId_correoInvitado_key" ON "EventMember"("eventId", "correoInvitado");
