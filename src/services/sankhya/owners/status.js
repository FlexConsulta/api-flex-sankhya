import { enum_status_proprietario } from '@prisma/client';
import { prisma } from '../../../database/prismaClient.js';
import { ModelOwner } from '../../../models/owners.js';

const getStatusOwner = (value) => {
  switch (value) {
    case 0:
      return enum_status_proprietario.Ativo;
    case 1:
      return enum_status_proprietario.Bloqueado;
    case 2:
      return enum_status_proprietario.Vencido;
    default:
      return enum_status_proprietario.Ativo;
  }
};

export const refreshStatusOwner = async (dataParsed) => {
  let modelOwner = new ModelOwner();

  const loopOwner = async (index) => {
    const data = await dataParsed[index];
    if (!data) return;

    const idproprietario = await modelOwner.getOwnerIDByCpfOrCnpj(
      data.cpf_cnpj_prop
    );

    if (!idproprietario)
      throw new Error(`Proprietário não encontrado ${data.cpf_cnpj_prop}`);

    let newStatusOwner = {
      idproprietario,
      idcliente: Number(process.env.ID_CUSTOMER),
      dt_cliente: data.dt_criacao,
      dt_atualizacao: new Date(),
      dt_criacao: data.dt_criacao,
      status_proprietario: getStatusOwner(data.status),
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
