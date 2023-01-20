/*
  Warnings:

  - Made the column `status` on table `integracao_sankhya` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "integracao_sankhya" ALTER COLUMN "status" SET NOT NULL;
