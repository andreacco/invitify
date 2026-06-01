/*
  Warnings:

  - Changed the type of `role` on the `EventMember` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EventRole" AS ENUM ('NOVIA', 'NOVIO', 'QUINCEANERA', 'CUMPLEANERO', 'ANFITRION', 'PAREJA_DEL_FESTEJADO', 'MAMA_DEL_FESTEJADO', 'PAPA_DEL_FESTEJADO', 'WEDDING_PLANNER', 'ORGANIZADOR', 'ADMIN');

-- AlterTable
ALTER TABLE "EventMember" DROP COLUMN "role",
ADD COLUMN     "role" "EventRole" NOT NULL;

-- DropEnum
DROP TYPE "Role";
