import { prisma } from "../../../database/prismaClient.js";
import { ModelOwner } from "../../../models/owners.js";

export const updateOwners = async (dataParsed) => {
  let modelOwner = new ModelOwner();

  const updateOwner = async (index) => {
    if (!dataParsed[index]) return;

    const id = await modelOwner.getOwnerIDByCpfOrCnpj(
      dataParsed[index].cpf_cnpj_prop
    );

    let owner = {
      dt_atualizacao: new Date(),
      antt_prop: dataParsed[index].antt_prop,
    };

    if (id) {
      await prisma.proprietario.update({
        where: {
          id,
        },
        data: owner,
      });
    }

    owner = null;
    await updateOwner(index + 1);
  };

  await updateOwner(0);
  modelOwner = null;
};
