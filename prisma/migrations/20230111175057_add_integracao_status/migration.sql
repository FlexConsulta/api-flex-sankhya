/*
  Warnings:

  - Added the required column `status` to the `integracao_sankhya` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "integracao_sankhya" ADD COLUMN  "status" TEXT NULL;
