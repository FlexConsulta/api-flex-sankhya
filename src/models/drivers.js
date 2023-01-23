import { prisma } from "../database/prismaClient.js";

export class ModelDriver {
  async getDriverIDByCpf(cpf_mot) {
    // console.log(cpf_mot);
    const driver = await prisma.motorista.findMany({
      where: {
        cpf_mot,
      },
      take: 1,
    });

    return driver?.length > 0 ? driver[0].id : undefined;
  }
}
