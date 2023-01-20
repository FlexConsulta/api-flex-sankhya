/*
  Warnings:

  - You are about to drop the column `antt_prop` on the `proprietarios` table. All the data in the column will be lost.
  - You are about to drop the column `cadastro_verificado` on the `proprietarios` table. All the data in the column will be lost.
  - You are about to drop the column `dt_validade_antt` on the `proprietarios` table. All the data in the column will be lost.
  - You are about to drop the column `status_antt` on the `proprietarios` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "proprietarios" DROP COLUMN "antt_prop",
DROP COLUMN "cadastro_verificado",
DROP COLUMN "dt_validade_antt",
DROP COLUMN "status_antt";
