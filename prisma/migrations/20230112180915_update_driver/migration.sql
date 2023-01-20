/*
  Warnings:

  - The primary key for the `motoristas` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ATIVO` on the `motoristas` table. All the data in the column will be lost.
  - You are about to drop the column `CADASTRO_VERIFICADO` on the `motoristas` table. All the data in the column will be lost.
  - You are about to drop the column `CATEGORIA_CNH_MOT` on the `motoristas` table. All the data in the column will be lost.
  - You are about to drop the column `CNH_MOT` on the `motoristas` table. All the data in the column will be lost.
  - You are about to drop the column `COD_SITUACAO_CNH_MOT` on the `motoristas` table. All the data in the column will be lost.
  - You are about to drop the column `CPF_MOT` on the `motoristas` table. All the data in the column will be lost.
  - You are about to drop the column `DT_ATUALIZACAO` on the `motoristas` table. All the data in the column will be lost.
  - You are about to drop the column `DT_CRIACAO` on the `motoristas` table. All the data in the column will be lost.
  - You are about to drop the column `DT_EMISSAO_CNH` on the `motoristas` table. All the data in the column will be lost.
  - You are about to drop the column `DT_NASCIMENTO` on the `motoristas` table. All the data in the column will be lost.
  - You are about to drop the column `DT_PRIMEIRA_CNH` on the `motoristas` table. All the data in the column will be lost.
  - You are about to drop the column `DT_VALIDADE_CNH` on the `motoristas` table. All the data in the column will be lost.
  - You are about to drop the column `FOTO_MOTORISTA` on the `motoristas` table. All the data in the column will be lost.
  - You are about to drop the column `ID` on the `motoristas` table. All the data in the column will be lost.
  - You are about to drop the column `NOME_MAE` on the `motoristas` table. All the data in the column will be lost.
  - You are about to drop the column `NOME_MOT` on the `motoristas` table. All the data in the column will be lost.
  - You are about to drop the column `NOME_PAI` on the `motoristas` table. All the data in the column will be lost.
  - Added the required column `cod_mot` to the `motoristas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cpf_mot` to the `motoristas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dt_atualizacao` to the `motoristas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dt_criacao` to the `motoristas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nome_mot` to the `motoristas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "motoristas" DROP CONSTRAINT "motoristas_pkey",
DROP COLUMN "ATIVO",
DROP COLUMN "CADASTRO_VERIFICADO",
DROP COLUMN "CATEGORIA_CNH_MOT",
DROP COLUMN "CNH_MOT",
DROP COLUMN "COD_SITUACAO_CNH_MOT",
DROP COLUMN "CPF_MOT",
DROP COLUMN "DT_ATUALIZACAO",
DROP COLUMN "DT_CRIACAO",
DROP COLUMN "DT_EMISSAO_CNH",
DROP COLUMN "DT_NASCIMENTO",
DROP COLUMN "DT_PRIMEIRA_CNH",
DROP COLUMN "DT_VALIDADE_CNH",
DROP COLUMN "FOTO_MOTORISTA",
DROP COLUMN "ID",
DROP COLUMN "NOME_MAE",
DROP COLUMN "NOME_MOT",
DROP COLUMN "NOME_PAI",
ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "cnh_mot" TEXT,
ADD COLUMN     "cod_mot" INTEGER NOT NULL,
ADD COLUMN     "cpf_mot" TEXT NOT NULL,
ADD COLUMN     "dt_atualizacao" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "dt_criacao" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "dt_emissao_cnh" TIMESTAMP(3),
ADD COLUMN     "dt_nascimento" TEXT,
ADD COLUMN     "dt_primeira_cnh" TIMESTAMP(3),
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "nome_mot" TEXT NOT NULL,
ADD CONSTRAINT "motoristas_pkey" PRIMARY KEY ("id");
