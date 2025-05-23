/*
  Warnings:

  - A unique constraint covering the columns `[storagePath]` on the table `Files` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Files_storagePath_key" ON "Files"("storagePath");
