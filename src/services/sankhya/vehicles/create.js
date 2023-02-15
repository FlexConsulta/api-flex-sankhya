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
      dt_criacao: dataParsed[index].dt_criacao,
      dt_atualizacao: dataParsed[index].dt_atualizacao,
    };

    if (!id) {
      newVehicle.push({
        ...vehicle,
      });
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
