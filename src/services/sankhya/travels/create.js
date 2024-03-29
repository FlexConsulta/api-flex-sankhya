import { prisma } from "../../../database/prismaClient.js";
import { getLocalID } from "../../utils/dataLocalID.js";

export const createNewTravels = async (dataParsed) => {
  let newTravels = [];

  const filterTravels = async (index) => {
    if (!dataParsed[index]) return;

    const { idmotorista, idproprietario, idveiculo, isValidData } =
      await getLocalID(dataParsed[index]);

    console.log(
      "idmotorista:",
      idmotorista,
      "idproprietario:",
      idproprietario,
      "idveiculo:",
      idveiculo,
      "isValidData:",
      isValidData
    );

    let travel = {
      numero_cliente: dataParsed[index].numero_cliente,
      dt_viagem: dataParsed[index].dt_viagem,
      mercadoria: dataParsed[index].mercadoria,
      cidade_origem: dataParsed[index].cidade_origem,
      cidade_destino: dataParsed[index].cidade_destino,

      carreta1: dataParsed[index].carreta1,
      carreta2: dataParsed[index].carreta2,
      carreta3: dataParsed[index].carreta3,

      viagem_cancelado: dataParsed[index].viagem_cancelado,
      dt_cancelamento: dataParsed[index].dt_cancelamento,
      idcliente: dataParsed[index].idcliente,

      dt_cliente: dataParsed[index].dt_atualizacao,
      dt_criacao: new Date(),
      dt_atualizacao: new Date(),

      idmotorista,
      idproprietario,
      idveiculo,
    };

    if (isValidData) {
      newTravels.push({
        ...travel,
      });
    }

    if (newTravels.length >= 50) {
      await prisma.viagem.createMany({
        data: newTravels,
        skipDuplicates: true,
      });
      newTravels = [];
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
