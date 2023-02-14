import { prisma } from '../../../database/prismaClient.js';
import { ModelOwner } from '../../../models/owners.js';

export const patchNewOwners = async (dataParsed) => {
  let modelOwner = new ModelOwner();
  let newOwners = [];

  const filterOwners = async (index) => {
    if (!dataParsed[index]) return;

    let owner = {
      ativo: true,
      nome_prop: dataParsed[index].nome_prop,
      cpf_cnpj_prop: dataParsed[index].cpf_cnpj_prop,
      dt_criacao: dataParsed[index].dt_criacao,
      dt_atualizacao: dataParsed[index].dt_atualizacao,
      antt_prop: dataParsed[index].antt_prop,
    };

    newOwners.push({
      ...owner,
    });

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
