-- CreateTable
CREATE TABLE "quizzes" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "examination_id" UUID NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "attempts_allowed" INTEGER NOT NULL DEFAULT 1,
    "shuffle_questions" BOOLEAN NOT NULL DEFAULT false,
    "shuffle_options" BOOLEAN NOT NULL DEFAULT false,
    "show_results_immediately" BOOLEAN NOT NULL DEFAULT false,
    "allow_review" BOOLEAN NOT NULL DEFAULT true,
    "instructions" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "examination_id" UUID NOT NULL,
    "due_date" DATE NOT NULL,
    "due_time" TIME(0),
    "allow_late_submission" BOOLEAN NOT NULL DEFAULT false,
    "late_penalty_percent" DECIMAL(5,2),
    "attempts_allowed" INTEGER NOT NULL DEFAULT 1,
    "attachment_required" BOOLEAN NOT NULL DEFAULT false,
    "submission_instructions" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quizzes_school_id_idx" ON "quizzes"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "quizzes_examination_school_key" ON "quizzes"("examination_id", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "quizzes_id_school_id_key" ON "quizzes"("id", "school_id");

-- CreateIndex
CREATE INDEX "assignments_school_id_due_date_idx" ON "assignments"("school_id", "due_date");

-- CreateIndex
CREATE UNIQUE INDEX "assignments_examination_school_key" ON "assignments"("examination_id", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "assignments_id_school_id_key" ON "assignments"("id", "school_id");

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_examination_id_school_id_fkey" FOREIGN KEY ("examination_id", "school_id") REFERENCES "examinations"("id", "school_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_examination_id_school_id_fkey" FOREIGN KEY ("examination_id", "school_id") REFERENCES "examinations"("id", "school_id") ON DELETE CASCADE ON UPDATE CASCADE;
