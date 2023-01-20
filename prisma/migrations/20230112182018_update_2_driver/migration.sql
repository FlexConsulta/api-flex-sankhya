/*
  Warnings:

  - The `dt_nascimento` column on the `motoristas` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "motoristas" DROP COLUMN "dt_nascimento",
ADD COLUMN     "dt_nascimento" TIMESTAMP(3);
