-- CreateTable
CREATE TABLE "admission_status_history" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "application_id" UUID NOT NULL,
    "changed_by_id" UUID NOT NULL,
    "previous_status" "admission_statuses",
    "new_status" "admission_statuses" NOT NULL,
    "reason" TEXT,
    "changed_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admission_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admission_status_history_school_application_idx" ON "admission_status_history"("school_id", "application_id", "changed_at");

-- CreateIndex
CREATE INDEX "admission_status_history_actor_idx" ON "admission_status_history"("changed_by_id", "changed_at");

-- AddForeignKey
ALTER TABLE "admission_status_history" ADD CONSTRAINT "admission_status_history_application_id_school_id_fkey" FOREIGN KEY ("application_id", "school_id") REFERENCES "admission_applications"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_status_history" ADD CONSTRAINT "admission_status_history_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
