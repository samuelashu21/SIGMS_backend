-- CreateTable
CREATE TABLE "user_school_memberships" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "role" "user_roles" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "joined_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "user_school_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_school_memberships_school_role_idx" ON "user_school_memberships"("school_id", "role");

-- CreateIndex
CREATE INDEX "user_school_memberships_user_active_idx" ON "user_school_memberships"("user_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "user_school_memberships_user_school_key" ON "user_school_memberships"("user_id", "school_id");

-- AddForeignKey
ALTER TABLE "user_school_memberships" ADD CONSTRAINT "user_school_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_school_memberships" ADD CONSTRAINT "user_school_memberships_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
