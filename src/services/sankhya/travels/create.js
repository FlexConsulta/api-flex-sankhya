import { prisma } from "../../../database/prismaClient.js";
import { getLocalID } from "../../utils/dataLocalID.js";

export const createNewTravels = async (dataParsed) => {
  let newTravels = [];

  const filterTravels = async (index) => {
    if (!dataParsed[index]) return;

    const { idmotorista, idproprietario, idveiculo, isValidData } =
      await getLocalID(dataParsed[index]);

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

      dt_cliente: dataParsed[index].dt_viagem,
      dt_criacao: dataParsed[index].dt_criacao,
      dt_atualizacao: dataParsed[index].dt_atualizacao,

      idmotorista,
      idproprietario,
      idveiculo,
    };

    console.log(idmotorista, idproprietario, idveiculo, isValidData);

    if (isValidData) {
      newTravels.push({
        ...travel,
      });
    }
    console.log(newTravels.length, " ", travel.numero_cliente);
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
