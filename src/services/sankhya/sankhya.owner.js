import { apiMge } from "./api.js";
import { SankhyaServiceAuthenticate } from "./sankhya.authenticate.js";
import "dotenv/config";
import { syncTypes } from "../../shared/syncTypes.js";
import { LogsIntegration } from "../../modules/logs_integration.js";
import { prisma } from "../../database/prismaClient.js";
import { getDateTimeFromString } from "../utils/dateTime.js";
import { stateTypes } from "../../shared/stateTypes.js";
import { tableTypes } from "../../shared/tableTypes.js";

export async function SankhyaServiceOwner(syncType) {
  const sankhyaService = await SankhyaServiceAuthenticate.getInstance();
  const token = await sankhyaService.authUserSankhya(
    process.env.SANKHYA_USER,
    process.env.SANKHYA_PASSWORD
  );
  const logsIntegration = new LogsIntegration();

  // const lastSync = undefined;
  const lastSync = await logsIntegration.findLastSync(
    syncType,
    tableTypes.proprietarios
  ); // pegar a data e hora da ultima sincronização do banco de dados

  const logId = await logsIntegration.createSync(
    tableTypes.proprietarios,
    syncType,
    stateTypes.inProgress
  );
  if (!lastSync && syncType == syncTypes.created)
    await logsIntegration.createSync(
      tableTypes.proprietarios,
      syncTypes.updated,
      stateTypes.success
    );

  const requestBody = (page) => {
    const criteria = lastSync
      ? {
          expression: {
            $:
              syncType == syncTypes.created
                ? `this.AD_DTINCLUSAO > TO_DATE('${lastSync}', 'dd/mm/yyyy HH24:MI:SS')`
                : `this.DTALTER > TO_DATE('${lastSync}', 'dd/mm/yyyy HH24:MI:SS')`,
          },
        }
      : {};

    return {
      requestBody: {
        dataSet: {
          rootEntity: "Parceiro",
          includePresentationFields: "S",
          offsetPage: page,
          criteria,
          dataRow: {
            localFields: {
              TRANSPORTADORA: {
                $: "S",
              },
            },
          },
          entity: {
            fieldset: {
              list: "NOMEPARC,CGC_CPF,ATIVO,AD_DTINCLUSAO,DTALTER,CODPARC",
            },
          },
        },
      },
    };
  };

  apiMge.defaults.headers.Cookie = `JSESSIONID=${token}`;

  const getData = async (page) => {
    try {
      console.log(page, "page");

      let dataRequestBody = requestBody(page);

      let response = await apiMge.get(
        `service.sbr?serviceName=CRUDServiceProvider.loadRecords&outputType=json`,
        { data: { ...dataRequestBody } }
      );

      const totalRecords = response.data.responseBody.entities.total;
      let data = Array.isArray(response.data.responseBody.entities.entity)
        ? response.data.responseBody.entities.entity
        : [response.data.responseBody.entities.entity];

      if (!data) return;

      let dataParsed = data
        .filter((item) => item?.f1?.$)
        .map((item) => {
          return {
            nome_prop: item.f0.$,
            cpf_cnpj_prop: item.f1.$,
            ativo: item.f2.$ == "S",
            dt_criacao: getDateTimeFromString(item?.f4?.$),
            dt_atualizacao: getDateTimeFromString(item?.f3?.$),
            cod_prop: Number(item.f5.$),
          };
        });

      if (syncType == syncTypes.created) {
        await prisma.proprietario.createMany({
          data: dataParsed,
          skipDuplicates: true,
        });
      } else {
        dataParsed.forEach(async (owner) => {
          let ownerToUpdate = await prisma.proprietario.findMany({
            where: {
              cod_prop: owner?.cod_prop,
            },
          });

          if (ownerToUpdate.length > 0) {
            await prisma.proprietario.update({
              where: {
                id: ownerToUpdate[0].id,
              },
              data: owner,
            });
          }
          ownerToUpdate = null;
        });
      }

      dataParsed = null;
      data = null;
      response = null;
      dataRequestBody = null;

      const used = process.memoryUsage().heapUsed / 1024 / 1024;
      console.log(
        `The app uses approximately ${Math.round(used * 100) / 100} MB`
      );

      await logsIntegration.updateSync(logId, page, stateTypes.inProgress); // gravar dados de sincronizacao no banco de dados (data e hora e tipo, se foi created ou updated), pagina, nome do sincronismo
      if (process.env.SANKHYA_PAGINATION == totalRecords) {
        await getData(page + 1);
      } else {
        console.log(syncType, stateTypes.success);
        //fazer updateStatus success
        await logsIntegration.updateSync(logId, page, stateTypes.success);
      }
    } catch (error) {
      console.log(`Error on getData with page ${page}:`, error);
      //faz updateStatus error
      await logsIntegration.updateSync(logId, page, stateTypes.error);

      if (process.env.IGNORE_ERROR == "YES") {
        await getData(page + 1);
      }
    }
  };

  await getData(0);
}
