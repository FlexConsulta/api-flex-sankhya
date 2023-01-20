/*
  Warnings:

  - Added the required column `cod_parc` to the `proprietarios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "proprietarios" ADD COLUMN     "cod_parc" INTEGER NOT NULL;
