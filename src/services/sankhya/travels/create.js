import { prisma } from "../../../database/prismaClient.js";
import { getLocalID } from "../../utils/dataLocalID.js";

export const createNewTravels = async (dataParsed) => {
  let newTravels = [];

  const filterTravels = async (index) => {
    if (!dataParsed[index]) return;

    const { idmotorista, idproprietario, idveiculo, isValidData } =
      await getLocalID(dataParsed[index]);

    let travel = {
      ...dataParsed[index],
      dt_cancelamento:
        dataParsed[index]?.viagem_cancelado == "S" ? new Date() : null,
      idmotorista,
      idproprietario,
      idveiculo,
    };

    if (isValidData) {
      newTravels.push({
        ...travel,
      });
    }

    travel = null;
    await filterTravels(index + 1);
  };

  await filterTravels(0);

  if (newTravels.length > 0) {
    await prisma.viagem.createMany({
      data: newTravels,
      skipDuplicates: true,
    });
  }

  newTravels = null;
};
