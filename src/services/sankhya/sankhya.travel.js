import { apiMge } from "./api.js";
import { SankhyaServiceAuthenticate } from "./sankhya.authenticate.js";
import "dotenv/config";
import { syncTypes } from "../../shared/syncTypes.js";
import { LogsIntegration } from "../../models/logs_integration.js";
import { prisma } from "../../database/prismaClient.js";
import { getDateTimeFromString } from "../utils/dateTime.js";
import { stateTypes } from "../../shared/stateTypes.js";
import { tableTypes } from "../../shared/tableTypes.js";
import { ModelTravel } from "../../models/travels.js";
import { ModelDriver } from "../../models/drivers.js";
import { ModelOwner } from "../../models/owners.js";
import { ModelVehicle } from "../../models/vehicles.js";
import { enum_viagem_cancelado } from "@prisma/client";

const createNewTravels = async (dataParsed) => {
  let modelTravel = new ModelTravel();
  let modelDriver = new ModelDriver();
  let modelOwner = new ModelOwner();
  let modelVehicle = new ModelVehicle();
  let newTravels = [];

  const filterTravels = async (index) => {
    let travel = dataParsed[index];
    if (!travel) return;

    // const id = await modelTravel.getTravelIDByClientNumber(
    //   travel.cod_ordem_carga
    // );
    const id_motorista = await modelDriver.getDriverIDByCpf(
      travel.cpf_motorista
    );
    const id_proprietario = await modelOwner.getOwnerIDByCpfOrCnpj(
      travel.cpf_cnpj_proprietario
    );
    const id_veiculo = await modelVehicle.getVehicleIDByLicensePlate(
      travel.placa_veiculo
    );

    travel["viagem_cancelado"] =
      travel.viagem_cancelado === "S"
        ? enum_viagem_cancelado.Inativo
        : enum_viagem_cancelado.Ativo;

    delete travel.cod_ordem_carga;
    delete travel.cpf_motorista;
    delete travel.cpf_cnpj_proprietario;
    delete travel.placa_veiculo;

    if (id_motorista && id_proprietario && id_veiculo) {
      newTravels.push({
        ...travel,
        id_motorista,
        id_proprietario,
        id_veiculo,
      });
    }

    //console.log("travels", newTravels);
    travel = null;
    await filterTravels(index + 1);
  };

  await filterTravels(0);

  if (newTravels.length > 0) {
    await prisma.viagem.createMany({
      data: newTravels,
      skipDuplicates: true,
    });
  }

  newTravels = null;
  modelTravel = null;
};

const updateTravels = async (dataParsed) => {
  let modelTravel = new ModelTravel();
  const updateTravel = async (index) => {
    let travel = dataParsed[index];
    if (!travel) return;
    //console.log("travel", travel.cod_ordem_carga);
    const id = await modelTravel.getTravelIDByClientNumber(
      travel.cod_ordem_carga
    );

    travel["viagem_cancelado"] =
      travel.viagem_cancelado === "S"
        ? enum_viagem_cancelado.Inativo
        : enum_viagem_cancelado.Ativo;

    delete travel.cod_ordem_carga;
    delete travel.cpf_motorista;
    delete travel.cpf_cnpj_proprietario;
    delete travel.placa_veiculo;
    delete travel.viagem_cancelado;

    if (id) {
      await prisma.viagem.update({
        where: {
          id,
        },
        data: travel,
      });
    }

    travel = null;
    await updateTravel(index + 1);
  };

  await updateTravel(0);
  modelTravel = null;
};

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
            item[`f${field.find((item) => item.name == "DHSAIDA").idx}`]?.$ &&
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
            item[`f${field.find((item) => item.name == "AD_CGCCPF_MOT").idx}`]
              ?.$ &&
            item[`f${field.find((item) => item.name == "AD_CGC_ANTT").idx}`]
              ?.$ &&
            item[`f${field.find((item) => item.name == "Veiculo_PLACA").idx}`]
              ?.$
        )
        .map((item) => {
          return {
            idcliente: Number(process.env.ID_CUSTOMER),
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
            cod_ordem_carga:
              item[`f${field.find((item) => item.name == "ORDEMCARGA").idx}`]
                ?.$,
            cpf_motorista: item[
              `f${field.find((item) => item.name == "AD_CGCCPF_MOT").idx}`
            ]?.$?.replaceAll(".", "").replaceAll("-", ""),
            cpf_cnpj_proprietario:
              item[`f${field.find((item) => item.name == "AD_CGC_ANTT").idx}`]
                ?.$,
            placa_veiculo:
              item[`f${field.find((item) => item.name == "Veiculo_PLACA").idx}`]
                ?.$,
          };
        });

      if (syncType == syncTypes.created) {
        await createNewTravels(dataParsed);
        // } else {
        //   await updateTravels(dataParsed);
      }

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
