import { prisma } from "../database/prismaClient.js";

export class ModelTravel {
  async getTravelIDByClientNumber(cod_ordem_carga) {
    //console.log(cod_ordem_carga);
    const travel = await prisma.viagem.findMany({
      where: {
        numero_cliente: cod_ordem_carga,
      },
      take: 1,
    });
    //console.log("travel id", travel);

    return travel?.length > 0 ? travel[0].id : undefined;
  }
}
