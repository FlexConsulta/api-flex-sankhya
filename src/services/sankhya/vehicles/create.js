import { prisma } from "../../../database/prismaClient.js";
import { ModelVehicle } from "../../../models/vehicles.js";

export const createNewVehicles = async (dataParsed) => {
  let modelVehicle = new ModelVehicle();
  let newVehicle = [];

  const filterVehicles = async (index) => {
    if (!dataParsed[index]) return;

    const id = await modelVehicle.getVehicleIDByLicensePlate(
      dataParsed[index].placa
    );

    let vehicle = {
      ativo: true,
      placa: dataParsed[index].placa,
      renavam: dataParsed[index].renavam,
      dt_criacao: new Date(),
      dt_atualizacao: new Date(),
    };

    if (!id) {
      newVehicle.push({
        ...vehicle,
      });
    }

    if (newVehicle.length >= 50) {
      await prisma.veiculo.createMany({
        data: newVehicle,
        skipDuplicates: true,
      });
      newVehicle = [];
    }
    vehicle = null;
    await filterVehicles(index + 1);
  };

  await filterVehicles(0);

  if (newVehicle.length > 0) {
    await prisma.veiculo.createMany({
      data: newVehicle,
      skipDuplicates: true,
    });
  }

  newVehicle = null;
  modelVehicle = null;
};
