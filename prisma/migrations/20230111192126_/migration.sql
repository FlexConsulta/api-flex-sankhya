/*
  Warnings:

  - You are about to drop the column `cod_parc` on the `proprietarios` table. All the data in the column will be lost.
  - Added the required column `cod_prop` to the `proprietarios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "proprietarios" DROP COLUMN "cod_parc",
ADD COLUMN     "cod_prop" INTEGER NOT NULL;
