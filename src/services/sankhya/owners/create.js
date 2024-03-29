import { prisma } from "../../../database/prismaClient.js";
import { ModelOwner } from "../../../models/owners.js";

export const createNewOwners = async (dataParsed) => {
  let modelOwner = new ModelOwner();
  let newOwners = [];

  const filterOwners = async (index) => {
    if (!dataParsed[index]) return;

    const id = await modelOwner.getOwnerIDByCpfOrCnpj(
      dataParsed[index].cpf_cnpj_prop
    );

    let owner = {
      ativo: true,
      nome_prop: dataParsed[index].nome_prop,
      cpf_cnpj_prop: dataParsed[index].cpf_cnpj_prop,
      dt_criacao: new Date(),
      dt_atualizacao: new Date(),
      antt_prop: dataParsed[index].antt_prop,
    };

    if (!id) {
      newOwners.push({
        ...owner,
      });
    }

    if (newOwners.length >= 50) {
      await prisma.proprietario.createMany({
        data: newOwners,
        skipDuplicates: true,
      });
      newOwners = [];
    }

    owner = null;
    await filterOwners(index + 1);
  };

  await filterOwners(0);

  if (newOwners.length > 0) {
    await prisma.proprietario.createMany({
      data: newOwners,
      skipDuplicates: true,
    });
  }

  newOwners = null;
  modelOwner = null;
};
