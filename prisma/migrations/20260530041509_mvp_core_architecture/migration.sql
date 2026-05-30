-- CreateEnum
CREATE TYPE "Role" AS ENUM ('NOVIA', 'NOVIO', 'WEDDING_PLANNER', 'CO_ADMIN');

-- CreateEnum
CREATE TYPE "RsvpStatus" AS ENUM ('PENDIENTE', 'CONFIRMADO', 'RECHAZADO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventMember" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "ubicacionCeremonia" TEXT NOT NULL,
    "ubicacionRecepcion" TEXT NOT NULL,
    "configuracion" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvitadoPrincipal" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "codigoAcceso" TEXT NOT NULL,
    "nombreFamilia" TEXT NOT NULL,
    "pasesTotales" INTEGER NOT NULL,
    "statusRSVP" "RsvpStatus" NOT NULL DEFAULT 'PENDIENTE',
    "fechaConfirmacion" TIMESTAMP(3),
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvitadoPrincipal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asistente" (
    "id" TEXT NOT NULL,
    "invitadoPrincipalId" TEXT NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "asiste" BOOLEAN NOT NULL DEFAULT false,
    "menuSeleccionado" TEXT,
    "restricciones" TEXT,
    "cancionSugerida" TEXT,

    CONSTRAINT "Asistente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaseDigital" (
    "id" TEXT NOT NULL,
    "invitadoPrincipalId" TEXT NOT NULL,
    "qrSecureToken" TEXT NOT NULL,
    "asistentesEsperados" INTEGER NOT NULL,
    "asistentesIngresados" INTEGER NOT NULL DEFAULT 0,
    "validado" BOOLEAN NOT NULL DEFAULT false,
    "fechaValidacion" TIMESTAMP(3),

    CONSTRAINT "PaseDigital_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "EventMember_eventId_userId_key" ON "EventMember"("eventId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "InvitadoPrincipal_codigoAcceso_key" ON "InvitadoPrincipal"("codigoAcceso");

-- CreateIndex
CREATE UNIQUE INDEX "PaseDigital_invitadoPrincipalId_key" ON "PaseDigital"("invitadoPrincipalId");

-- CreateIndex
CREATE UNIQUE INDEX "PaseDigital_qrSecureToken_key" ON "PaseDigital"("qrSecureToken");

-- AddForeignKey
ALTER TABLE "EventMember" ADD CONSTRAINT "EventMember_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMember" ADD CONSTRAINT "EventMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitadoPrincipal" ADD CONSTRAINT "InvitadoPrincipal_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asistente" ADD CONSTRAINT "Asistente_invitadoPrincipalId_fkey" FOREIGN KEY ("invitadoPrincipalId") REFERENCES "InvitadoPrincipal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaseDigital" ADD CONSTRAINT "PaseDigital_invitadoPrincipalId_fkey" FOREIGN KEY ("invitadoPrincipalId") REFERENCES "InvitadoPrincipal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
