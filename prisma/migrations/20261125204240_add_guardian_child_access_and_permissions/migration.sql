-- CreateTable
CREATE TABLE "guardian_permissions" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "relationship_id" UUID NOT NULL,
    "can_view_academic_records" BOOLEAN NOT NULL DEFAULT true,
    "can_view_attendance" BOOLEAN NOT NULL DEFAULT true,
    "can_view_exam_results" BOOLEAN NOT NULL DEFAULT true,
    "can_view_report_cards" BOOLEAN NOT NULL DEFAULT true,
    "can_view_timetable" BOOLEAN NOT NULL DEFAULT true,
    "can_view_announcements" BOOLEAN NOT NULL DEFAULT true,
    "can_receive_notifications" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "guardian_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guardian_permissions_relationship_id_key" ON "guardian_permissions"("relationship_id");

-- CreateIndex
CREATE INDEX "guardian_permissions_school_idx" ON "guardian_permissions"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "guardian_permissions_relationship_school_key" ON "guardian_permissions"("relationship_id", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "guardian_permissions_id_school_key" ON "guardian_permissions"("id", "school_id");

-- AddForeignKey
ALTER TABLE "guardian_permissions" ADD CONSTRAINT "guardian_permissions_relationship_id_school_id_fkey" FOREIGN KEY ("relationship_id", "school_id") REFERENCES "student_guardian_relationships"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;
