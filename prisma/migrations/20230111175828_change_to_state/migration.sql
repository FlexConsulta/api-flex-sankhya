/*
  Warnings:

  - You are about to drop the column `status` on the `integracao_sankhya` table. All the data in the column will be lost.
  - Added the required column `state` to the `integracao_sankhya` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "integracao_sankhya" DROP COLUMN "status",
ADD COLUMN     "state" TEXT NOT NULL;
