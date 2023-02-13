import { prisma } from '../database/prismaClient.js';
import { SankhyaServiceOwner } from '../services/sankhya/owners/index.js';
import { syncTypes } from '../shared/syncTypes.js';

export class ModelOwner {
  async getOwnerIDByCpfOrCnpj(cpf_cnpj_prop) {
    //console.log(cpf_cnpj_prop);
    let owner = await prisma.proprietario.findMany({
      where: {
        cpf_cnpj_prop,
      },
      take: 1,
    });

    if (!owner?.length > 0) {
      await SankhyaServiceOwner(syncTypes.patch, cpf_cnpj_prop);

      owner = await prisma.proprietario.findMany({
        where: {
          cpf_cnpj_prop,
        },
        take: 1,
      });
      console.log('id2', owner[0].id);
    }
    //console.log('id', owner[0].id);
    return owner?.length > 0 ? owner[0].id : undefined;
  }

  async getStatusOwnersByIdProprietarioAndIdCliente(idproprietario, idcliente) {
    const status_proprietario = await prisma.status_proprietarios.findMany({
      where: {
        idproprietario,
        idcliente,
      },
      take: 1,
    });

    return status_proprietario?.length > 0
      ? status_proprietario[0].id
      : undefined;
  }
}
