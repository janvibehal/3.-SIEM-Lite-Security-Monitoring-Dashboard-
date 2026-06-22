/*
  Warnings:

  - A unique constraint covering the columns `[token_id]` on the table `email_verification_tokens` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `token_id` to the `email_verification_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "email_verification_tokens_expires_at_idx";

-- AlterTable
ALTER TABLE "email_verification_tokens" ADD COLUMN     "token_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "metadata" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_token_id_key" ON "email_verification_tokens"("token_id");

-- CreateIndex
CREATE INDEX "email_verification_tokens_token_id_idx" ON "email_verification_tokens"("token_id");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
