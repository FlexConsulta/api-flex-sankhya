import { enum_status_proprietario } from "@prisma/client";
import { prisma } from "../../../database/prismaClient.js";
import { ModelOwner } from "../../../models/owners.js";

const getStatusOwner = (value) => {
  switch (value) {
    case 0:
      return enum_status_proprietario.Ativo;
    case 1:
      return enum_status_proprietario.Vencido;
    case 2:
      return enum_status_proprietario.Bloqueado;
    default:
      return enum_status_proprietario.Ativo;
  }
};

export const refreshStatusOwner = async (dataParsed) => {
  let modelOwner = new ModelOwner();

  const loopOwner = async (index) => {
    if (!dataParsed[index]) return;

    const idproprietario = await modelOwner.getOwnerIDByCpfOrCnpj(
      dataParsed[index].cpf_cnpj_prop
    );

    if (!idproprietario)
      throw new Error(
        `Proprietário não encontrado ${dataParsed[index].cpf_cnpj_prop}`
      );

    let newStatusOwner = {
      idproprietario,
      idcliente: Number(process.env.ID_CUSTOMER),
      dt_cliente: dataParsed[index].dt_atualizacao,
      dt_atualizacao: new Date(),
      dt_criacao: dataParsed[index].dt_criacao,
      status_proprietario: getStatusOwner(dataParsed[index].status),
    };

    await prisma.status_proprietarios.upsert({
      where: {
        idproprietario_idcliente: {
          idproprietario: newStatusOwner.idproprietario,
          idcliente: newStatusOwner.idcliente,
        },
      },
      update: {
        ...newStatusOwner,
      },
      create: {
        ...newStatusOwner,
      },
    });

    newStatusOwner = null;
    await loopOwner(index + 1);
  };

  await loopOwner(0);
  modelOwner = null;
};
