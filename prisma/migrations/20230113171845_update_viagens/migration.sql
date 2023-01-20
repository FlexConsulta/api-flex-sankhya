/*
  Warnings:

  - The primary key for the `viagens` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `CARRETA1` on the `viagens` table. All the data in the column will be lost.
  - You are about to drop the column `CARRETA2` on the `viagens` table. All the data in the column will be lost.
  - You are about to drop the column `CARRETA3` on the `viagens` table. All the data in the column will be lost.
  - You are about to drop the column `CARRETA4` on the `viagens` table. All the data in the column will be lost.
  - You are about to drop the column `CIDADE_DESTINO` on the `viagens` table. All the data in the column will be lost.
  - You are about to drop the column `CIDADE_ORIGEM` on the `viagens` table. All the data in the column will be lost.
  - You are about to drop the column `DT_ATUALIZACAO` on the `viagens` table. All the data in the column will be lost.
  - You are about to drop the column `DT_CANCELAMENTO` on the `viagens` table. All the data in the column will be lost.
  - You are about to drop the column `DT_CLIENTE` on the `viagens` table. All the data in the column will be lost.
  - You are about to drop the column `DT_CRIACAO` on the `viagens` table. All the data in the column will be lost.
  - You are about to drop the column `DT_VIAGEM` on the `viagens` table. All the data in the column will be lost.
  - You are about to drop the column `ID` on the `viagens` table. All the data in the column will be lost.
  - You are about to drop the column `IDCLIENT` on the `viagens` table. All the data in the column will be lost.
  - You are about to drop the column `IDMOTORISTA` on the `viagens` table. All the data in the column will be lost.
  - You are about to drop the column `IDPROPRIETARIO` on the `viagens` table. All the data in the column will be lost.
  - You are about to drop the column `IDVEICULO` on the `viagens` table. All the data in the column will be lost.
  - You are about to drop the column `MERCADORIA` on the `viagens` table. All the data in the column will be lost.
  - You are about to drop the column `NUMERO_CLIENTE` on the `viagens` table. All the data in the column will be lost.
  - You are about to drop the column `VIAGEM_CANCELADO` on the `viagens` table. All the data in the column will be lost.
  - Added the required column `cidade_destino` to the `viagens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cidade_origem` to the `viagens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dt_atualizacao` to the `viagens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dt_criacao` to the `viagens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dt_viagem` to the `viagens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_cliente` to the `viagens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_motorista` to the `viagens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_proprietario` to the `viagens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_veiculo` to the `viagens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mercadoria` to the `viagens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `viagem_cancelado` to the `viagens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "viagens" DROP CONSTRAINT "viagens_pkey",
DROP COLUMN "CARRETA1",
DROP COLUMN "CARRETA2",
DROP COLUMN "CARRETA3",
DROP COLUMN "CARRETA4",
DROP COLUMN "CIDADE_DESTINO",
DROP COLUMN "CIDADE_ORIGEM",
DROP COLUMN "DT_ATUALIZACAO",
DROP COLUMN "DT_CANCELAMENTO",
DROP COLUMN "DT_CLIENTE",
DROP COLUMN "DT_CRIACAO",
DROP COLUMN "DT_VIAGEM",
DROP COLUMN "ID",
DROP COLUMN "IDCLIENT",
DROP COLUMN "IDMOTORISTA",
DROP COLUMN "IDPROPRIETARIO",
DROP COLUMN "IDVEICULO",
DROP COLUMN "MERCADORIA",
DROP COLUMN "NUMERO_CLIENTE",
DROP COLUMN "VIAGEM_CANCELADO",
ADD COLUMN     "carreta1" TEXT,
ADD COLUMN     "carreta2" TEXT,
ADD COLUMN     "carreta3" TEXT,
ADD COLUMN     "cidade_destino" TEXT NOT NULL,
ADD COLUMN     "cidade_origem" TEXT NOT NULL,
ADD COLUMN     "dt_atualizacao" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "dt_cancelamento" TIMESTAMP(3),
ADD COLUMN     "dt_criacao" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "dt_viagem" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "id_cliente" INTEGER NOT NULL,
ADD COLUMN     "id_motorista" INTEGER NOT NULL,
ADD COLUMN     "id_proprietario" INTEGER NOT NULL,
ADD COLUMN     "id_veiculo" INTEGER NOT NULL,
ADD COLUMN     "mercadoria" TEXT NOT NULL,
ADD COLUMN     "viagem_cancelado" TEXT NOT NULL,
ADD CONSTRAINT "viagens_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "viagens" ADD CONSTRAINT "viagens_id_motorista_fkey" FOREIGN KEY ("id_motorista") REFERENCES "motoristas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viagens" ADD CONSTRAINT "viagens_id_proprietario_fkey" FOREIGN KEY ("id_proprietario") REFERENCES "proprietarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viagens" ADD CONSTRAINT "viagens_id_veiculo_fkey" FOREIGN KEY ("id_veiculo") REFERENCES "veiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
