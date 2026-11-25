-- CreateTable
CREATE TABLE "guardian_profiles" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "last_name" TEXT NOT NULL,
    "gender" "applicant_genders",
    "date_of_birth" DATE,
    "phone_number" TEXT NOT NULL,
    "alternate_phone" TEXT,
    "email" TEXT,
    "occupation" TEXT,
    "address" TEXT,
    "city" TEXT,
    "region" TEXT,
    "preferred_language" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "guardian_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "guardian_profiles_school_last_name_idx" ON "guardian_profiles"("school_id", "last_name");

-- CreateIndex
CREATE INDEX "guardian_profiles_school_phone_idx" ON "guardian_profiles"("school_id", "phone_number");

-- CreateIndex
CREATE INDEX "guardian_profiles_school_active_idx" ON "guardian_profiles"("school_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "guardian_profiles_school_user_key" ON "guardian_profiles"("school_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "guardian_profiles_id_school_key" ON "guardian_profiles"("id", "school_id");

-- AddForeignKey
ALTER TABLE "guardian_profiles" ADD CONSTRAINT "guardian_profiles_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardian_profiles" ADD CONSTRAINT "guardian_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
