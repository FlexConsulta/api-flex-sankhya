import { enum_status_veiculo } from "@prisma/client";
import { prisma } from "../../../database/prismaClient.js";
import { ModelVehicle } from "../../../models/vehicles.js";

const getStatusVehicle = (value) => {
  switch (value) {
    case 0:
      return enum_status_veiculo.Ativo;
    case 1:
      return enum_status_veiculo.Bloqueado;
    case 2:
      return enum_status_veiculo.Vencido;
    default:
      return enum_status_veiculo.Ativo;
  }
};

export const refreshStatusVehicle = async (dataParsed) => {
  let modelVehicle = new ModelVehicle();

  const loopVehicle = async (index) => {
    if (!dataParsed[index]) return;

    const idveiculo = await modelVehicle.getVehicleIDByLicensePlate(
      dataParsed[index].placa
    );

    if (!idveiculo)
      throw new Error(`Veículo não encontrado ${dataParsed[index].placa}`);

    let newStatusVehicle = {
      idveiculo,
      idcliente: Number(process.env.ID_CUSTOMER),
      dt_cliente: dataParsed[index].dt_criacao,
      dt_atualizacao: new Date(),
      dt_criacao: dataParsed[index].dt_criacao,
      status_veiculo: getStatusVehicle(dataParsed[index].status),
    };

    await prisma.status_veiculos.upsert({
      where: {
        idveiculo_idcliente: {
          idveiculo: newStatusVehicle.idveiculo,
          idcliente: newStatusVehicle.idcliente,
        },
      },
      update: {
        ...newStatusVehicle,
      },
      create: {
        ...newStatusVehicle,
      },
    });

    newStatusVehicle = null;
    await loopVehicle(index + 1);
  };

  await loopVehicle(0);
  modelVehicle = null;
};
