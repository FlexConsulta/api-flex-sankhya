import { prisma } from "../database/prismaClient.js";

export class ModelVehicle {
  async getVehicleIDByLicensePlate(placa) {
    // console.log(placa);
    const vehicle = await prisma.veiculo.findMany({
      where: {
        placa,
      },
      take: 1,
    });

    return vehicle?.length > 0 ? vehicle[0].id : undefined;
  }

  async getStatusVehiclesByIdVeiculoAndIdCliente(idveiculo, idcliente) {
    const status_veiculo = await prisma.status_veiculos.findMany({
      where: {
        idveiculo,
        idcliente,
      },
      take: 1,
    });

    return status_veiculo?.length > 0 ? status_veiculo[0].id : undefined;
  }
}
