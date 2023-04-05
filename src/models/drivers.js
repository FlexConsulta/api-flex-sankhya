import { prisma } from "../database/prismaClient.js";
import { SankhyaServiceDriver } from "../services/sankhya/drivers/index.js";
import { syncTypes } from "../shared/syncTypes.js";

export class ModelDriver {
  async getDriverIDByCpf(cpf_mot, reconcile = false) {
    // console.log(cpf_mot);
    let driver = await prisma.motorista.findMany({
      where: {
        cpf_mot,
      },
      take: 1,
    });

    if (reconcile && !(driver?.length > 0)) {
      await SankhyaServiceDriver(syncTypes.patch, cpf_mot);

      driver = await prisma.motorista.findMany({
        where: {
          cpf_mot,
        },
        take: 1,
      });
    }

    return driver?.length > 0 ? driver[0].id : undefined;
  }

  async getStatusDriversByIdMotoristaAndIdCliente(idmotorista, idcliente) {
    const status_motorista = await prisma.status_motoristas.findMany({
      where: {
        idmotorista,
        idcliente,
      },
      take: 1,
    });

    return status_motorista?.length > 0 ? status_motorista[0].id : undefined;
  }
}
