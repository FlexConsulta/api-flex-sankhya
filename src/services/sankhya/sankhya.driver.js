import { apiMge } from "./api.js";
import { SankhyaServiceAuthenticate } from "./sankhya.authenticate.js";
import "dotenv/config";
import { syncTypes } from "../../shared/syncTypes.js";
import { LogsIntegration } from "../../modules/logs_integration.js";
import { prisma } from "../../database/prismaClient.js";
import { getDateTimeFromString } from "../utils/dateTime.js";
import { stateTypes } from "../../shared/stateTypes.js";
import { tableTypes } from "../../shared/tableTypes.js";

export async function SankhyaServiceDriver(syncType) {
  const sankhyaService = await SankhyaServiceAuthenticate.getInstance();
  const token = await sankhyaService.authUserSankhya(
    process.env.SANKHYA_USER,
    process.env.SANKHYA_PASSWORD
  );
  const logsIntegration = new LogsIntegration();

  // const lastSync = undefined;
  const lastSync = await logsIntegration.findLastSync(
    syncType,
    tableTypes.motoristas
  ); // pegar a data e hora da ultima sincronização do banco de dados

  const logId = await logsIntegration.createSync(
    tableTypes.motoristas,
    syncType,
    stateTypes.inProgress
  );
  if (!lastSync && syncType == syncTypes.created)
    await logsIntegration.createSync(
      tableTypes.motoristas,
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
              TIPPESSOA: {
                $: "F",
              },
              MOTORISTA: {
                $: "S",
              },
            },
          },
          entity: {
            fieldset: {
              list: "NOMEPARC,CGC_CPF,AD_N_REG_CNH,AD_EMIS_AT_CNH,AD_DT_PRIM_HAB,DTNASC,ATIVO,AD_DTINCLUSAO,DTALTER,CODPARC",
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
            nome_mot: item.f0.$,
            cpf_cnpj_mot: item.f1.$,
            cnh_mot: item.f2?.$,
            dt_emissao_cnh: new Date(item.f3?.$),
            dt_primeira_cnh: new Date(item.f4?.$),
            dt_nascimento: new Date(item.f5?.$),
            ativo: item.f6.$ == "S",
            dt_criacao: getDateTimeFromString(item?.f7?.$),
            dt_atualizacao: getDateTimeFromString(item?.f8?.$),
            cod_mot: Number(item.f9.$),
          };
        });

      //console.log("data", dataParsed)

      if (syncType == syncTypes.created) {
        await prisma.motorista.createMany({
          data: dataParsed,
          skipDuplicates: true,
        });
      } else {
        dataParsed.forEach(async (driver) => {
          //console.log("ow", owner)
          delete driver.nome_mot;
          delete driver.cpf_cnpj_mot;

          let driverToUpdate = await prisma.motorista.findMany({
            where: {
              cod_mot: driver?.cod_mot,
            },
          });
          //console.log("toUp", ownerToUpdate)
          if (driverToUpdate.length > 0) {
            await prisma.motorista.update({
              where: {
                id: driverToUpdate[0].id,
              },
              data: driver,
            });
          }
          driverToUpdate = null;
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
