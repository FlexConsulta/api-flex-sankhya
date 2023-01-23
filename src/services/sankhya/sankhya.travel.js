import { apiMge } from "./api.js";
import { SankhyaServiceAuthenticate } from "./sankhya.authenticate.js";
import "dotenv/config";
import { syncTypes } from "../../shared/syncTypes.js";
import { LogsIntegration } from "../../models/logs_integration.js";
import { prisma } from "../../database/prismaClient.js";
import { getDateTimeFromString } from "../utils/dateTime.js";
import { stateTypes } from "../../shared/stateTypes.js";
import { tableTypes } from "../../shared/tableTypes.js";

export async function SankhyaServiceTravel(syncType) {
  const sankhyaService = await SankhyaServiceAuthenticate.getInstance();
  const token = await sankhyaService.authUserSankhya(
    process.env.SANKHYA_USER,
    process.env.SANKHYA_PASSWORD
  );
  const logsIntegration = new LogsIntegration();

  // const lastSync = undefined;
  const lastSync = await logsIntegration.findLastSync(
    syncType,
    tableTypes.viagens
  ); // pegar a data e hora da ultima sincronização do banco de dados

  const logId = await logsIntegration.createSync(
    tableTypes.viagens,
    syncType,
    stateTypes.inProgress
  );
  if (!lastSync && syncType == syncTypes.created)
    await logsIntegration.createSync(
      tableTypes.viagens,
      syncTypes.updated,
      stateTypes.success
    );

  const requestBody = (page) => {
    const criteria = lastSync
      ? {
          expression: {
            $:
              syncType == syncTypes.created
                ? `this.DHINCLUSAO > TO_DATE('${lastSync}', 'dd/mm/yyyy HH24:MI:SS')`
                : `this.DTALTER > TO_DATE('${lastSync}', 'dd/mm/yyyy HH24:MI:SS')`,
          },
        }
      : {};

    return {
      requestBody: {
        dataSet: {
          rootEntity: "OrdemCarga",
          includePresentationFields: "S",
          offsetPage: page,
          criteria,
          entity: {
            fieldset: {
              list: "*",
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
      let fields = response.data.responseBody.entities.metadata.fields.field;
      let field = fields.map((item, idx) => {
        return {
          name: item.name,
          idx,
        };
      });

      const totalRecords = response.data.responseBody.entities.total;
      let data = Array.isArray(response.data.responseBody.entities.entity)
        ? response.data.responseBody.entities.entity
        : [response.data.responseBody.entities.entity];

      if (!data) return;

      let dataParsed = data
        .filter(
          (item) =>
            item[`f${field.find((item) => item.name == "CODPARCCLI").idx}`]
              ?.$ &&
            item[
              `f${
                field.find((item) => item.name == "CidadeOrigem_NOMECID").idx
              }`
            ]?.$ &&
            item[`f${field.find((item) => item.name == "AD_UFORIGEM").idx}`]
              ?.$ &&
            item[
              `f${
                field.find((item) => item.name == "CidadeDestino_NOMECID").idx
              }`
            ]?.$ &&
            item[`f${field.find((item) => item.name == "AD_UFDESTINO").idx}`]
              ?.$ &&
            item[`f${field.find((item) => item.name == "ORDEMCARGA").idx}`]
              ?.$ &&
            item[
              `f${field.find((item) => item.name == "CODPARCMOTORISTA").idx}`
            ]?.$ &&
            item[`f${field.find((item) => item.name == "CODPARCPROPANTT").idx}`]
              ?.$ &&
            item[`f${field.find((item) => item.name == "CODVEICULO").idx}`]?.$
        )
        .map((item) => {
          return {
            id_cliente: Number(
              item[`f${field.find((item) => item.name == "CODPARCCLI").idx}`]?.$
            ),
            dt_viagem: getDateTimeFromString(
              item[`f${field.find((item) => item.name == "DHSAIDA").idx}`]?.$,
              true
            ),
            mercadoria:
              item[
                `f${field.find((item) => item.name == "Produto_DESCRPROD").idx}`
              ]?.$,
            cidade_origem:
              item[
                `f${
                  field.find((item) => item.name == "CidadeOrigem_NOMECID").idx
                }`
              ]?.$ +
              " - " +
              item[`f${field.find((item) => item.name == "AD_UFORIGEM").idx}`]
                ?.$,
            cidade_destino:
              item[
                `f${
                  field.find((item) => item.name == "CidadeDestino_NOMECID").idx
                }`
              ]?.$ +
              " - " +
              item[`f${field.find((item) => item.name == "AD_UFDESTINO").idx}`]
                ?.$,
            carreta1: item[
              `f${
                field.find((item) => item.name == "VeiculoReboque1_MARCAPLACA")
                  .idx
              }`
            ]?.$?.replaceAll("[", "")?.replaceAll("]", ""),
            carreta2: item[
              `f${
                field.find((item) => item.name == "VeiculoReboque2_MARCAPLACA")
                  .idx
              }`
            ]?.$?.replaceAll("[", "")?.replaceAll("]", ""),
            carreta3: item[
              `f${
                field.find((item) => item.name == "VeiculoReboque3_MARCAPLACA")
                  .idx
              }`
            ]?.$?.replaceAll("[", "")?.replaceAll("]", ""),
            viagem_cancelado:
              item[`f${field.find((item) => item.name == "AD_SOLCANCEXT").idx}`]
                ?.$,
            dt_cancelamento: getDateTimeFromString(
              item[`f${field.find((item) => item.name == "DHCANCEL").idx}`]?.$,
              true
            ),
            dt_criacao: getDateTimeFromString(
              item[`f${field.find((item) => item.name == "DHINCLUSAO").idx}`]?.$
            ),
            dt_atualizacao: getDateTimeFromString(
              item[`f${field.find((item) => item.name == "DTALTER").idx}`]?.$
            ),
            cod_motorista: Number(
              item[
                `f${field.find((item) => item.name == "CODPARCMOTORISTA").idx}`
              ]?.$
            ),
            cod_proprietario: Number(
              item[
                `f${field.find((item) => item.name == "CODPARCPROPANTT").idx}`
              ]?.$
            ),
            cod_veiculo: Number(
              item[`f${field.find((item) => item.name == "CODVEICULO").idx}`]?.$
            ),
            cod_ordem_carga: Number(
              item[`f${field.find((item) => item.name == "ORDEMCARGA").idx}`]?.$
            ),
          };
        });

      dataParsed.forEach(async (travel) => {
        let motorista = await prisma.motorista.findMany({
          where: {
            cod_mot: travel.cod_motorista,
          },
        });

        let proprietario = await prisma.proprietario.findMany({
          where: {
            cod_prop: travel.cod_proprietario,
          },
        });

        let veiculo = await prisma.veiculo.findMany({
          where: {
            id_vehicle_customer: travel.cod_veiculo,
          },
        });

        if (
          motorista.length > 0 &&
          proprietario.length > 0 &&
          veiculo.length > 0
        ) {
          const id_motorista = motorista[0].id;
          const id_proprietario = proprietario[0].id;
          const id_veiculo = veiculo[0].id;

          delete travel.cod_motorista;
          delete travel.cod_proprietario;
          delete travel.cod_veiculo;

          travel["id_motorista"] = id_motorista;
          travel["id_proprietario"] = id_proprietario;
          travel["id_veiculo"] = id_veiculo;

          if (syncType == syncTypes.created) {
            await prisma.viagem.createMany({
              data: travel,
              skipDuplicates: true,
            });
          } else {
            let ordemToUpdate = await prisma.viagem.findMany({
              where: {
                cod_ordem_carga: travel.cod_ordem_carga,
              },
            });

            if (ordemToUpdate.length > 0) {
              await prisma.viagem.update({
                where: {
                  id: ordemToUpdate[0].id,
                },
                data: travel,
              });
            }

            ordemToUpdate = null;
          }
        }
        motorista = null;
        proprietario = null;
        veiculo = null;
      });

      dataParsed = null;
      data = null;
      response = null;
      dataRequestBody = null;
      field = null;
      fields = null;

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
