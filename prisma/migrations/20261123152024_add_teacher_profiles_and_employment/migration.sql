-- CreateEnum
CREATE TYPE "teacher_genders" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "teacher_employment_types" AS ENUM ('PERMANENT', 'CONTRACT', 'TEMPORARY', 'PART_TIME');

-- CreateEnum
CREATE TYPE "teacher_employment_statuses" AS ENUM ('ACTIVE', 'ON_LEAVE', 'ENDED');

-- CreateTable
CREATE TABLE "teacher_profiles" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "last_name" TEXT NOT NULL,
    "gender" "teacher_genders",
    "date_of_birth" DATE,
    "phone_number" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "region" TEXT,
    "photograph" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "teacher_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_employment" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "teacher_id" UUID NOT NULL,
    "employee_number" TEXT,
    "employment_type" "teacher_employment_types" NOT NULL,
    "status" "teacher_employment_statuses" NOT NULL DEFAULT 'ACTIVE',
    "position" TEXT NOT NULL,
    "department" TEXT,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "teacher_employment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "teacher_profiles_school_last_name_idx" ON "teacher_profiles"("school_id", "last_name");

-- CreateIndex
CREATE INDEX "teacher_profiles_school_active_idx" ON "teacher_profiles"("school_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_profiles_school_user_key" ON "teacher_profiles"("school_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_profiles_id_school_key" ON "teacher_profiles"("id", "school_id");

-- CreateIndex
CREATE INDEX "teacher_employment_school_status_idx" ON "teacher_employment"("school_id", "status");

-- CreateIndex
CREATE INDEX "teacher_employment_school_teacher_idx" ON "teacher_employment"("school_id", "teacher_id");

-- CreateIndex
CREATE INDEX "teacher_employment_school_start_date_idx" ON "teacher_employment"("school_id", "start_date");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_employment_school_employee_number_key" ON "teacher_employment"("school_id", "employee_number");

-- AddForeignKey
ALTER TABLE "teacher_profiles" ADD CONSTRAINT "teacher_profiles_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_profiles" ADD CONSTRAINT "teacher_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_employment" ADD CONSTRAINT "teacher_employment_teacher_id_school_id_fkey" FOREIGN KEY ("teacher_id", "school_id") REFERENCES "teacher_profiles"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;
