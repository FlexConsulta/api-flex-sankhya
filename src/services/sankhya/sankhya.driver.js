import { apiMge } from "./api.js";
import { SankhyaServiceAuthenticate } from "./sankhya.authenticate.js";
import "dotenv/config";
import { syncTypes } from "../../shared/syncTypes.js";
import { LogsIntegration } from "../../models/logs_integration.js";
import { prisma } from "../../database/prismaClient.js";
import { getDateFormated } from "../utils/dateTime.js";
import { stateTypes } from "../../shared/stateTypes.js";
import { tableTypes } from "../../shared/tableTypes.js";
import { ModelDriver } from "../../models/drivers.js";
import { enum_status_motorista } from "@prisma/client";
import { findFieldIndex } from "../utils/findFieldIndex.js";
import { showLog } from "../utils/memory.js";

const refreshStatusDriver = async (dataParsed) => {
  let modelDriver = new ModelDriver();

  const loopDrivers = async (index) => {
    if (!dataParsed[index]) return;

    const idmotorista = await modelDriver.getDriverIDByCpf(
      dataParsed[index].cpf_mot
    );

    if (!idmotorista)
      throw new Error(`Motorista não encontrado ${dataParsed[index].cpf_mot}`);

    let newStatusDriver = {
      idmotorista,
      idcliente: Number(process.env.ID_CUSTOMER),
      dt_cliente: dataParsed[index].dt_criacao,
      dt_atualizacao: new Date(),
      dt_criacao: dataParsed[index].dt_criacao,
      status_motorista:
        enum_status_motorista[dataParsed[index].status_motorista],
    };

    await prisma.status_motoristas.upsert({
      where: {
        idmotorista_idcliente: {
          idmotorista: newStatusDriver.idmotorista,
          idcliente: newStatusDriver.idcliente,
        },
      },
      update: {
        ...newStatusDriver,
      },
      create: {
        ...newStatusDriver,
      },
    });

    newStatusDriver = null;
    await loopDrivers(index + 1);
  };

  await loopDrivers(0);
  modelDriver = null;
};

const updateDrivers = async (dataParsed) => {
  let modelDriver = new ModelDriver();

  const updateDriver = async (index) => {
    let driver = dataParsed[index];
    if (!driver) return;

    const id = await modelDriver.getDriverIDByCpf(driver.cpf_mot);

    delete driver.nome_mot;
    delete driver.cpf_mot;
    delete driver.status_motorista;

    if (id) {
      await prisma.motorista.update({
        where: {
          id: id,
        },
        data: driver,
      });
    }

    driver = null;
    await updateDriver(index + 1);
  };

  await updateDriver(0);

  modelDriver = null;
};

const createNewDriver = async (dataParsed) => {
  let modelDriver = new ModelDriver();
  let newDrivers = [];

  const filterDrivers = async (index) => {
    if (!dataParsed[index]) return;

    const id = await modelDriver.getDriverIDByCpf(dataParsed[index].cpf_mot);

    if (!id) {
      let driver = {
        nome_mot: dataParsed[index].nome_mot,
        cpf_mot: dataParsed[index].cpf_mot,
        cnh_mot: dataParsed[index].cnh_mot,
        dt_criacao: dataParsed[index].dt_criacao,
        dt_atualizacao: dataParsed[index].dt_atualizacao,
        ativo: true,
      };

      newDrivers.push({
        ...driver,
      });

      driver = null;
    }

    await filterDrivers(index + 1);
  };

  await filterDrivers(0);

  if (newDrivers.length > 0) {
    const data = await prisma.motorista.createMany({
      data: newDrivers,
      skipDuplicates: true,
    });
    console.log("motoristas criados", data);
  }

  newDrivers = null;
  modelDriver = null;
};

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

  const requestBody = () => {
    const where = lastSync
      ? syncType == syncTypes.created
        ? `AND DTCAD >= TO_DATE('${lastSync}', 'dd/mm/yyyy HH24:MI:SS')`
        : `AND DATAFLEX >= TO_DATE('${lastSync}', 'dd/mm/yyyy HH24:MI:SS')`
      : ` `;

    return {
      requestBody: {
        sql: `SELECT NOMEPARC, CGC_CPF, CNH, STATUS, DTCAD, DATAFLEX FROM AD_VWTBCFLEXMOT WHERE CGC_CPF IS NOT NULL ${where}`,
      },
    };
  };

  apiMge.defaults.headers.Cookie = `JSESSIONID=${token}`;

  const getData = async () => {
    try {
      console.log(syncType, "page");

      let dataRequestBody = requestBody();

      let response = await apiMge.get(
        `service.sbr?serviceName=DbExplorerSP.executeQuery&outputType=json`,
        { data: { ...dataRequestBody } }
      );

      let fields = response?.data?.responseBody?.fieldsMetadata;

      let data = Array.isArray(response.data.responseBody.rows)
        ? response.data.responseBody.rows
        : [response.data.responseBody.rows];

      if (!data) return;

      let dataParsed = data.map((item) => {
        return {
          nome_mot: item[findFieldIndex("NOMEPARC", fields)],
          cpf_mot: item[findFieldIndex("CGC_CPF", fields)],
          cnh_mot: item[findFieldIndex("CNH", fields)],
          status_motorista: item[findFieldIndex("STATUS", fields)],
          dt_criacao: getDateFormated(item[findFieldIndex("DTCAD", fields)]),
          dt_atualizacao: getDateFormated(
            item[findFieldIndex("DATAFLEX", fields)]
          ),
        };
      });

      if (syncType == syncTypes.created) {
        await createNewDriver(dataParsed);
      } else {
        await updateDrivers(dataParsed);
      }

      await refreshStatusDriver(dataParsed);

      dataParsed = null;
      data = null;
      response = null;
      dataRequestBody = null;

      showLog(dataParsed?.length);

      await logsIntegration.updateSync(logId, page, stateTypes.inProgress); // gravar dados de sincronizacao no banco de dados (data e hora e tipo, se foi created ou updated), pagina, nome do sincronismo
      await logsIntegration.updateSync(logId, page, stateTypes.success);
    } catch (error) {
      console.log(`Error on getData with page ${page}:`, error);
      await logsIntegration.updateSync(logId, page, stateTypes.error);
    }
  };

  await getData(0);
}
