-- CreateEnum
CREATE TYPE "staff_categories" AS ENUM ('ADMINISTRATIVE', 'REGISTRAR', 'MANAGEMENT', 'SUPPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "staff_employment_statuses" AS ENUM ('ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "teacher_workload_types" AS ENUM ('TEACHING', 'HOMEROOM', 'ADMINISTRATIVE', 'EXTRACURRICULAR', 'OTHER');

-- CreateTable
CREATE TABLE "staff_profiles" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "employee_number" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "last_name" TEXT NOT NULL,
    "category" "staff_categories" NOT NULL,
    "designation" TEXT NOT NULL,
    "department" TEXT,
    "phone_number" TEXT,
    "email" TEXT,
    "address" TEXT,
    "employment_status" "staff_employment_statuses" NOT NULL DEFAULT 'ACTIVE',
    "hire_date" DATE NOT NULL,
    "termination_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "staff_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_workload_records" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "teacher_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "workload_type" "teacher_workload_types" NOT NULL,
    "description" TEXT NOT NULL,
    "weekly_periods" INTEGER NOT NULL,
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "teacher_workload_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "staff_profiles_school_category_idx" ON "staff_profiles"("school_id", "category");

-- CreateIndex
CREATE INDEX "staff_profiles_school_status_idx" ON "staff_profiles"("school_id", "employment_status");

-- CreateIndex
CREATE INDEX "staff_profiles_school_last_name_idx" ON "staff_profiles"("school_id", "last_name");

-- CreateIndex
CREATE UNIQUE INDEX "staff_profiles_school_user_key" ON "staff_profiles"("school_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_profiles_school_employee_number_key" ON "staff_profiles"("school_id", "employee_number");

-- CreateIndex
CREATE UNIQUE INDEX "staff_profiles_id_school_key" ON "staff_profiles"("id", "school_id");

-- CreateIndex
CREATE INDEX "teacher_workload_teacher_year_idx" ON "teacher_workload_records"("school_id", "teacher_id", "academic_year_id");

-- CreateIndex
CREATE INDEX "teacher_workload_type_idx" ON "teacher_workload_records"("school_id", "workload_type");

-- CreateIndex
CREATE INDEX "teacher_workload_effective_date_idx" ON "teacher_workload_records"("school_id", "effective_from");

-- AddForeignKey
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_workload_records" ADD CONSTRAINT "teacher_workload_records_teacher_id_school_id_fkey" FOREIGN KEY ("teacher_id", "school_id") REFERENCES "teacher_profiles"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_workload_records" ADD CONSTRAINT "teacher_workload_records_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;
