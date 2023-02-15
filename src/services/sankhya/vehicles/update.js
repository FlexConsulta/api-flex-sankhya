import { prisma } from "../../../database/prismaClient.js";
import { ModelVehicle } from "../../../models/vehicles.js";

export const updateVehicles = async (dataParsed) => {
  let modelVehicle = new ModelVehicle();

  const updateVehicle = async (index) => {
    if (!dataParsed[index]) return;

    const id = await modelVehicle.getVehicleIDByLicensePlate(
      dataParsed[index].placa
    );

    let vehicle = {
      renavam: dataParsed[index].renavam,
      dt_atualizacao: dataParsed[index].dt_atualizacao,
    };

    if (id) {
      await prisma.veiculo.update({
        where: {
          id,
        },
        data: vehicle,
      });
    }

    vehicle = null;
    await updateVehicle(index + 1);
  };

  await updateVehicle(0);
  modelVehicle = null;
};
