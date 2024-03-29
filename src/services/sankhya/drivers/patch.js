import "dotenv/config";
import { prisma } from "../../../database/prismaClient.js";
import { ModelDriver } from "../../../models/drivers.js";

export const patchNewDriver = async (dataParsed) => {
  let newDrivers = [];

  const filterDrivers = async (index) => {
    if (!dataParsed[index]) return;

    let driver = {
      nome_mot: dataParsed[index].nome_mot,
      cpf_mot: dataParsed[index].cpf_mot,
      cnh_mot: dataParsed[index].cnh_mot,
      dt_criacao: dataParsed[index].dt_criacao,
      dt_atualizacao: dataParsed[index].dt_atualizacao,
      ativo: true,
    };

    newDrivers.push({
      ...driver,
    });

    driver = null;

    await filterDrivers(index + 1);
  };

  await filterDrivers(0);

  if (newDrivers.length > 0) {
    await prisma.motorista.createMany({
      data: newDrivers,
      skipDuplicates: true,
    });
  }

  newDrivers = null;
};
