import "dotenv/config";
import { prisma } from "../../../database/prismaClient.js";
import { ModelDriver } from "../../../models/drivers.js";

export const createNewDriver = async (dataParsed) => {
  let modelDriver = new ModelDriver();
  let newDrivers = [];

  const filterDrivers = async (index) => {
    if (!dataParsed[index]) return;

    const id = await modelDriver.getDriverIDByCpf(dataParsed[index].cpf_mot);

    if (!id) {
      let driver = {
        nome_mot: dataParsed[index].nome_mot,
        cpf_mot: dataParsed[index].cpf_mot,
        cnh_mot: dataParsed[index].cnh_mot,
        dt_criacao: new Date(),
        dt_atualizacao: new Date(),
        ativo: true,
      };

      newDrivers.push({
        ...driver,
      });

      if (newDrivers.length >= 50) {
        await prisma.motorista.createMany({
          data: newDrivers,
          skipDuplicates: true,
        });
      }

      newDrivers = [];

      driver = null;
    }

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
  modelDriver = null;
};
