import { apiMge } from "./api.js";
import { SankhyaServiceAuthenticate } from "./authenticate.js";
import "dotenv/config";
import { syncTypes } from "../../shared/syncTypes.js";
import { LogsIntegration } from "../../models/logs_integration.js";
import { prisma } from "../../database/prismaClient.js";
import { getDateTimeFromString } from "../utils/dateTime.js";
import { stateTypes } from "../../shared/stateTypes.js";
import { tableTypes } from "../../shared/tableTypes.js";
import { ModelVehicle } from "../../models/vehicles.js";
import { enum_status_veiculo } from "@prisma/client";

const createNewVehicles = async (dataParsed) => {
  let modelVehicle = new ModelVehicle();
  let newVehicle = [];

  const filterVehicles = async (index) => {
    let vehicle = dataParsed[index];
    if (!vehicle) return;

    const id = await modelVehicle.getVehicleIDByLicensePlate(vehicle.placa);

    if (!id) {
      newVehicle.push({
        ...vehicle,
      });
    }

    vehicle = null;
    await filterVehicles(index + 1);
  };

  await filterVehicles(0);

  if (newVehicle.length > 0) {
    await prisma.veiculo.createMany({
      data: newVehicle,
      skipDuplicates: true,
    });
  }

  // console.log("veiculos sankhya", dataParsed.length);
  // console.log(
  //   "veiculos incluídos",
  //   newVehicle.filter((driver) => driver.id == null).length
  // );

  newVehicle = null;
  modelVehicle = null;
};

const updateVehicles = async (dataParsed) => {
  let modelVehicle = new ModelVehicle();

  const updateVehicle = async (index) => {
    let vehicle = dataParsed[index];
    if (!vehicle) return;

    const id = await modelVehicle.getVehicleIDByLicensePlate(vehicle.placa);

    if (id) {
      await prisma.veiculo.update({
        where: {
          id,
        },
        data: vehicle,
      });
    }

    vehicle = null;
    await updateVehicle(index + 1);
  };

  await updateVehicle(0);
  modelVehicle = null;
};

const refreshStatusVehicle = async (dataParsed) => {
  let modelVehicle = new ModelVehicle();

  const loopVehicle = async (index) => {
    let newStatusVehicle = dataParsed[index];
    if (!newStatusVehicle) return;

    const id = await modelVehicle.getVehicleIDByLicensePlate(
      newStatusVehicle.placa
    );

    if (!id)
      throw new Error(`Veículo não encontrado ${newStatusVehicle.placa}`);

    newStatusVehicle["idveiculo"] = id;
    newStatusVehicle["idcliente"] = Number(process.env.ID_CUSTOMER);
    newStatusVehicle["dt_cliente"] = newStatusVehicle.dt_criacao;
    newStatusVehicle["status_veiculo"] =
      newStatusVehicle.ativo === true
        ? enum_status_veiculo.Ativo
        : enum_status_veiculo.Vencido;

    delete newStatusVehicle.placa;
    delete newStatusVehicle.renavam;
    delete newStatusVehicle.ativo;

    await prisma.status_veiculos.upsert({
      where: {
        idveiculo_idcliente: {
          idveiculo: newStatusVehicle.idveiculo,
          idcliente: newStatusVehicle.idcliente,
        },
      },
      update: {
        ...newStatusVehicle,
      },
      create: {
        ...newStatusVehicle,
      },
    });

    newStatusVehicle = null;
    await loopVehicle(index + 1);
  };

  await loopVehicle(0);
  modelVehicle = null;
};

export async function SankhyaServiceVehicle(syncType) {
  const sankhyaService = await SankhyaServiceAuthenticate.getInstance();
  const token = await sankhyaService.authUserSankhya(
    process.env.SANKHYA_USER,
    process.env.SANKHYA_PASSWORD
  );
  const logsIntegration = new LogsIntegration();

  // const lastSync = undefined;
  const lastSync = await logsIntegration.findLastSync(
    syncType,
    tableTypes.veiculos
  ); // pegar a data e hora da ultima sincronização do banco de dados

  const logId = await logsIntegration.createSync(
    tableTypes.veiculos,
    syncType,
    stateTypes.inProgress
  );
  if (!lastSync && syncType == syncTypes.created)
    await logsIntegration.createSync(
      tableTypes.veiculos,
      syncTypes.updated,
      stateTypes.success
    );

  const requestBody = (page) => {
    const criteria = lastSync
      ? {
          expression: {
            $:
              syncType == syncTypes.created
                ? `this.AD_DHINC > TO_DATE('${lastSync}', 'dd/mm/yyyy HH24:MI:SS')`
                : `this.AD_DHALT > TO_DATE('${lastSync}', 'dd/mm/yyyy HH24:MI:SS')`,
          },
        }
      : {};

    return {
      requestBody: {
        dataSet: {
          rootEntity: "Veiculo",
          includePresentationFields: "S",
          offsetPage: page,
          criteria,
          entity: {
            fieldset: {
              list: "PLACA,RENAVAM,ATIVO,AD_DHALT,AD_DHINC,CODVEICULO",
            },
          },
        },
      },
    };
  };

  apiMge.defaults.headers.Cookie = `JSESSIONID=${token}`;

  const getData = async (page) => {
    try {
      console.log(page, syncType, "page");

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
        .filter((item) => item?.f0?.$)
        .map((item) => {
          return {
            placa: item.f0.$,
            renavam: item.f1.$,
            ativo: item.f2.$ == "S",
            dt_criacao: getDateTimeFromString(item?.f4?.$),
            dt_atualizacao: getDateTimeFromString(item?.f3?.$),
          };
        });

      if (syncType == syncTypes.created) {
        await createNewVehicles(dataParsed);
      } else {
        await updateVehicles(dataParsed);
      }

      await refreshStatusVehicle(dataParsed);

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
