import { prisma } from '../database/prismaClient.js';
import { SankhyaServiceVehicle } from '../services/sankhya/vehicles/index.js';
import { syncTypes } from '../shared/syncTypes.js';

export class ModelVehicle {
  async getVehicleIDByLicensePlate(placa) {
    // console.log(placa);
    const vehicle = await prisma.veiculo.findMany({
      where: {
        placa,
      },
      take: 1,
    });

    if (!vehicle?.length > 0) {
      await SankhyaServiceVehicle(syncTypes.patch, placa);

      const vehicle = await prisma.veiculo.findMany({
        where: {
          placa,
        },
        take: 1,
      });
    }

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
