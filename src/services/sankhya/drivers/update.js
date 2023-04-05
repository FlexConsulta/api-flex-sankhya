import "dotenv/config";
import { prisma } from "../../../database/prismaClient.js";
import { ModelDriver } from "../../../models/drivers.js";

export const updateDrivers = async (dataParsed) => {
  let modelDriver = new ModelDriver();

  const updateDriver = async (index) => {
    if (!dataParsed[index]) return;

    const id = await modelDriver.getDriverIDByCpf(
      dataParsed[index].cpf_mot,
      true
    );

    let driver = {
      cnh_mot: dataParsed[index].cnh_mot,
      dt_criacao: dataParsed[index].dt_criacao,
      dt_atualizacao: dataParsed[index].dt_atualizacao,
    };

    if (id) {
      await prisma.motorista.update({
        where: {
          id: id,
        },
        data: driver,
      });
    }

    driver = null;
    await updateDriver(index + 1);
  };

  await updateDriver(0);

  modelDriver = null;
};
