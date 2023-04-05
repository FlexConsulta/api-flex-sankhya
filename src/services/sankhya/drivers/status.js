import "dotenv/config";
import { prisma } from "../../../database/prismaClient.js";
import { ModelDriver } from "../../../models/drivers.js";
import { enum_status_motorista } from "@prisma/client";

const getStatusMotorista = (value) => {
  switch (value) {
    case 0:
      return enum_status_motorista.Ativo;
    case 1:
      return enum_status_motorista.Vencido;
    case 2:
      return enum_status_motorista.Bloqueado;
    default:
      return enum_status_motorista.Ativo;
  }
};

export const refreshStatusDriver = async (dataParsed) => {
  let modelDriver = new ModelDriver();

  const loopDrivers = async (index) => {
    if (!dataParsed[index]) return;

    const idmotorista = await modelDriver.getDriverIDByCpf(
      dataParsed[index].cpf_mot
    );

    if (!idmotorista)
      throw new Error(`Motorista não encontrado ${dataParsed[index].cpf_mot}`);

    let newStatusDriver = {
      idmotorista,
      idcliente: Number(process.env.ID_CUSTOMER),
      dt_cliente: dataParsed[index].dt_atualizacao,
      dt_atualizacao: new Date(),
      dt_criacao: dataParsed[index].dt_criacao,
      status_motorista: getStatusMotorista(dataParsed[index].status),
    };

    await prisma.status_motoristas.upsert({
      where: {
        idmotorista_idcliente: {
          idmotorista: newStatusDriver.idmotorista,
          idcliente: newStatusDriver.idcliente,
        },
      },
      update: {
        ...newStatusDriver,
      },
      create: {
        ...newStatusDriver,
      },
    });
    newStatusDriver = null;
    await loopDrivers(index + 1);
  };

  await loopDrivers(0);
  modelDriver = null;
};
