import { prisma } from '../../../database/prismaClient.js';
import { ModelOwner } from '../../../models/owners.js';

export const patchNewOwners = async (dataParsed) => {
  let modelOwner = new ModelOwner();
  let newOwners = [];

  const filterOwners = async (index) => {
    if (!dataParsed[index]) return;
    const data = await dataParsed[index];

    let owner = {
      ativo: true,
      nome_prop: data.nome_prop,
      cpf_cnpj_prop: data.cpf_cnpj_prop,
      dt_criacao: data.dt_criacao,
      dt_atualizacao: data.dt_atualizacao,
      antt_prop: data.antt_prop,
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
    console.log('created');
  }

  newOwners = null;
  modelOwner = null;
};
