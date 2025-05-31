/*
  Warnings:

  - You are about to drop the column `subject` on the `ContactRequest` table. All the data in the column will be lost.
  - Added the required column `phone` to the `ContactRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ContactRequest" DROP COLUMN "subject",
ADD COLUMN     "phone" TEXT NOT NULL;
