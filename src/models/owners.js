import { prisma } from "../database/prismaClient.js";

export class ModelOwner {
  async getOwnerIDByCpfOrCnpj(cpf_cnpj_prop) {
    // console.log(cpf_cnpj_prop);
    const owner = await prisma.proprietario.findMany({
      where: {
        cpf_cnpj_prop,
      },
      take: 1,
    });

    // if (!owner?.length > 0) {
    // await SankhyaServiceOwner(type, cpf_cnpj_prop)
    //

    // const owner = await prisma.proprietario.findMany({
    //   where: {
    //     cpf_cnpj_prop,
    //   },
    //   take: 1,
    // });
    //  }
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
