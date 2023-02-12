import { prisma } from "../../../database/prismaClient.js";
import { ModelTravel } from "../../../models/travels.js";
import { getLocalID } from "../../utils/dataLocalID.js";

export const updateTravels = async (dataParsed) => {
  let modelTravel = new ModelTravel();
  const updateTravel = async (index) => {
    if (!dataParsed[index]) return;

    const id = await modelTravel.getTravelIDByClientNumber(
      dataParsed[index].numero_cliente
    );

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
      if (id) {
        await prisma.viagem.update({
          where: {
            id,
          },
          data: travel,
        });
      }
    }

    travel = null;
    await updateTravel(index + 1);
  };

  await updateTravel(0);
  modelTravel = null;
};
