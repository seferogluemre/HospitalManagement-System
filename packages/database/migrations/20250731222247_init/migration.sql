/*
  Warnings:

  - A unique constraint covering the columns `[tc_no]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tc_no` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "appointment_status" AS ENUM ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'NO_SHOW', 'CANCELLED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "tc_no" VARCHAR(11) NOT NULL;

-- CreateTable
CREATE TABLE "clinics" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(100),
    "address" VARCHAR(255),
    "phone" VARCHAR(20),
    "email" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "clinics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "specialty" VARCHAR(100) NOT NULL,
    "clinic_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "phone_number" VARCHAR(20),
    "address" VARCHAR(255),
    "date_of_birth" TIMESTAMP(3),
    "family_doctor_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secretaries" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "secretaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secretary_clinics" (
    "id" SERIAL NOT NULL,
    "secretary_id" INTEGER NOT NULL,
    "clinic_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "secretary_clinics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "appointment_date" TIMESTAMP(3) NOT NULL,
    "status" "appointment_status" NOT NULL,
    "description" TEXT,
    "notes" TEXT,
    "completed_at" TIMESTAMP(3),
    "created_by_secretary_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "target_roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "author_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clinics_uuid_key" ON "clinics"("uuid");

-- CreateIndex
CREATE INDEX "clinics_deleted_at_idx" ON "clinics"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_uuid_key" ON "doctors"("uuid");

-- CreateIndex
CREATE INDEX "doctors_user_id_idx" ON "doctors"("user_id");

-- CreateIndex
CREATE INDEX "doctors_clinic_id_idx" ON "doctors"("clinic_id");

-- CreateIndex
CREATE INDEX "doctors_deleted_at_idx" ON "doctors"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "patients_uuid_key" ON "patients"("uuid");

-- CreateIndex
CREATE INDEX "patients_user_id_idx" ON "patients"("user_id");

-- CreateIndex
CREATE INDEX "patients_family_doctor_id_idx" ON "patients"("family_doctor_id");

-- CreateIndex
CREATE INDEX "patients_deleted_at_idx" ON "patients"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "secretaries_uuid_key" ON "secretaries"("uuid");

-- CreateIndex
CREATE INDEX "secretaries_user_id_idx" ON "secretaries"("user_id");

-- CreateIndex
CREATE INDEX "secretaries_deleted_at_idx" ON "secretaries"("deleted_at");

-- CreateIndex
CREATE INDEX "secretary_clinics_secretary_id_idx" ON "secretary_clinics"("secretary_id");

-- CreateIndex
CREATE INDEX "secretary_clinics_clinic_id_idx" ON "secretary_clinics"("clinic_id");

-- CreateIndex
CREATE UNIQUE INDEX "secretary_clinics_secretary_id_clinic_id_key" ON "secretary_clinics"("secretary_id", "clinic_id");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_uuid_key" ON "Appointment"("uuid");

-- CreateIndex
CREATE INDEX "Appointment_patient_id_idx" ON "Appointment"("patient_id");

-- CreateIndex
CREATE INDEX "Appointment_doctor_id_idx" ON "Appointment"("doctor_id");

-- CreateIndex
CREATE INDEX "Appointment_appointment_date_idx" ON "Appointment"("appointment_date");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE INDEX "Appointment_deleted_at_idx" ON "Appointment"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "announcements_uuid_key" ON "announcements"("uuid");

-- CreateIndex
CREATE INDEX "announcements_is_active_idx" ON "announcements"("is_active");

-- CreateIndex
CREATE INDEX "announcements_deleted_at_idx" ON "announcements"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_tc_no_key" ON "users"("tc_no");

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_family_doctor_id_fkey" FOREIGN KEY ("family_doctor_id") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secretaries" ADD CONSTRAINT "secretaries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secretary_clinics" ADD CONSTRAINT "secretary_clinics_secretary_id_fkey" FOREIGN KEY ("secretary_id") REFERENCES "secretaries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secretary_clinics" ADD CONSTRAINT "secretary_clinics_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_created_by_secretary_id_fkey" FOREIGN KEY ("created_by_secretary_id") REFERENCES "secretaries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
