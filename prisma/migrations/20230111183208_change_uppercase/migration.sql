/*
  Warnings:

  - The primary key for the `proprietarios` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ANTT_PROP` on the `proprietarios` table. All the data in the column will be lost.
  - You are about to drop the column `ATIVO` on the `proprietarios` table. All the data in the column will be lost.
  - You are about to drop the column `CADASTRO_VERIFICADO` on the `proprietarios` table. All the data in the column will be lost.
  - You are about to drop the column `CPF_CNPJ_PROP` on the `proprietarios` table. All the data in the column will be lost.
  - You are about to drop the column `DT_ATUALIZACAO` on the `proprietarios` table. All the data in the column will be lost.
  - You are about to drop the column `DT_CRIACAO` on the `proprietarios` table. All the data in the column will be lost.
  - You are about to drop the column `DT_VALIDADE_ANTT` on the `proprietarios` table. All the data in the column will be lost.
  - You are about to drop the column `ID` on the `proprietarios` table. All the data in the column will be lost.
  - You are about to drop the column `NOME_PROP` on the `proprietarios` table. All the data in the column will be lost.
  - You are about to drop the column `STATUS_ANTT` on the `proprietarios` table. All the data in the column will be lost.
  - Added the required column `cpf_cnpj_prop` to the `proprietarios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dt_atualizacao` to the `proprietarios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dt_criacao` to the `proprietarios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nome_prop` to the `proprietarios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "proprietarios" DROP CONSTRAINT "proprietarios_pkey",
DROP COLUMN "ANTT_PROP",
DROP COLUMN "ATIVO",
DROP COLUMN "CADASTRO_VERIFICADO",
DROP COLUMN "CPF_CNPJ_PROP",
DROP COLUMN "DT_ATUALIZACAO",
DROP COLUMN "DT_CRIACAO",
DROP COLUMN "DT_VALIDADE_ANTT",
DROP COLUMN "ID",
DROP COLUMN "NOME_PROP",
DROP COLUMN "STATUS_ANTT",
ADD COLUMN     "antt_prop" TEXT,
ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "cadastro_verificado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cpf_cnpj_prop" TEXT NOT NULL,
ADD COLUMN     "dt_atualizacao" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "dt_criacao" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "dt_validade_antt" TIMESTAMP(3),
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "nome_prop" TEXT NOT NULL,
ADD COLUMN     "status_antt" TEXT,
ADD CONSTRAINT "proprietarios_pkey" PRIMARY KEY ("id");
