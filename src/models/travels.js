import { prisma } from "../database/prismaClient.js";

export class ModelTravel {
  async getTravelIDByClientNumber(numero_cliente) {
    //console.log(numero_cliente);
    const travel = await prisma.viagem.findMany({
      where: {
        numero_cliente,
        idcliente: Number(process.env.ID_CUSTOMER),
      },
      take: 1,
    });
    //console.log("travel id", travel);

    return travel?.length > 0 ? travel[0].id : undefined;
  }
}
