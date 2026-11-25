-- CreateEnum
CREATE TYPE "guardian_relationship_types" AS ENUM ('FATHER', 'MOTHER', 'GRANDFATHER', 'GRANDMOTHER', 'BROTHER', 'SISTER', 'UNCLE', 'AUNT', 'LEGAL_GUARDIAN', 'OTHER');

-- CreateEnum
CREATE TYPE "guardian_relationship_statuses" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "student_guardian_relationships" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "guardian_id" UUID NOT NULL,
    "relationship_type" "guardian_relationship_types" NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "status" "guardian_relationship_statuses" NOT NULL DEFAULT 'PENDING',
    "verification_notes" TEXT,
    "verified_at" TIMESTAMPTZ(3),
    "verified_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "student_guardian_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "student_guardian_student_status_idx" ON "student_guardian_relationships"("school_id", "student_id", "status");

-- CreateIndex
CREATE INDEX "student_guardian_guardian_status_idx" ON "student_guardian_relationships"("school_id", "guardian_id", "status");

-- CreateIndex
CREATE INDEX "student_guardian_status_created_idx" ON "student_guardian_relationships"("school_id", "status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "student_guardian_relationship_key" ON "student_guardian_relationships"("school_id", "student_id", "guardian_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_guardian_relationship_id_school_key" ON "student_guardian_relationships"("id", "school_id");

-- AddForeignKey
ALTER TABLE "student_guardian_relationships" ADD CONSTRAINT "student_guardian_relationships_student_id_school_id_fkey" FOREIGN KEY ("student_id", "school_id") REFERENCES "students"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_guardian_relationships" ADD CONSTRAINT "student_guardian_relationships_guardian_id_school_id_fkey" FOREIGN KEY ("guardian_id", "school_id") REFERENCES "guardian_profiles"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_guardian_relationships" ADD CONSTRAINT "student_guardian_relationships_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
