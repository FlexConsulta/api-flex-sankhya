import { prisma } from '../../../database/prismaClient.js';
import { ModelOwner } from '../../../models/owners.js';

export const createNewOwners = async (dataParsed) => {
  let modelOwner = new ModelOwner();
  let newOwners = [];

  const filterOwners = async (index) => {
    const data = await dataParsed[index];
    if (!data) return;

    const id = await modelOwner.getOwnerIDByCpfOrCnpj(data.cpf_cnpj_prop);

    let owner = {
      ativo: true,
      nome_prop: data.nome_prop,
      cpf_cnpj_prop: data.cpf_cnpj_prop,
      dt_criacao: data.dt_criacao,
      dt_atualizacao: data.dt_atualizacao,
      antt_prop: data.antt_prop,
    };

    if (!id) {
      newOwners.push({
        ...owner,
      });
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
