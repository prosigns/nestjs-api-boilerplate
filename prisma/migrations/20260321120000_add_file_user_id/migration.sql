-- Legacy rows cannot be attributed; remove before enforcing ownership (dev/boilerplate safe).
DELETE FROM "File";

-- AlterTable
ALTER TABLE "File" ADD COLUMN "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "File_userId_idx" ON "File"("userId");
