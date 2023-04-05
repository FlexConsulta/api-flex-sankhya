import "dotenv/config";
import { syncTypes } from "../../../shared/syncTypes.js";
import { getDateFormated } from "../../utils/dateTime.js";
import { stateTypes } from "../../../shared/stateTypes.js";
import { tableTypes } from "../../../shared/tableTypes.js";
import { getLastSync, updateLog } from "../logs.controller.js";
import { createNewOwners } from "./create.js";
import { updateOwners } from "./update.js";
import { refreshStatusOwner } from "./status.js";
import { findFieldIndex } from "../../utils/findFieldIndex.js";
import { getSankhyaData } from "../api.data.js";
import { showLog } from "../../utils/memory.js";
import { patchNewOwners } from "./patch.js";

export async function SankhyaServiceOwner(syncType, cpf_cnpj_prop = null) {
  const syncTable = tableTypes.proprietarios;
  const { lastSync, logId } = await getLastSync(syncType, syncTable);

  const getData = async () => {
    try {
      console.log(syncType, `get ${syncTable} data`);

      const { fields, data } = await getSankhyaData(
        syncTable,
        syncType,
        lastSync,
        cpf_cnpj_prop
      );

      if (!data[0]) {
        console.log(logId, stateTypes.success);
        await updateLog(logId, stateTypes.success);
        return;
      }
      console.log(logId, stateTypes.success);

      // console.log(data);

      let dataParsed = data.map((item) => {
        return {
          cpf_cnpj_prop: item[findFieldIndex("CGC_CPF", fields)],
          nome_prop: item[findFieldIndex("RAZAOSOCIAL", fields)],
          status: item[findFieldIndex("STATUS", fields)],
          antt_prop: item[findFieldIndex("ANTT", fields)],
          dt_criacao: getDateFormated(item[findFieldIndex("DTCAD", fields)]),
          dt_atualizacao: getDateFormated(
            item[findFieldIndex("DATAFLEX", fields)]
          ),
        };
      });
      //console.log(dataParsed[0]);

      if (syncType == syncTypes.created) {
        await createNewOwners([...dataParsed]);
      } else if (syncType == syncTypes.updated) {
        await updateOwners([...dataParsed]);
      } else if (syncType == syncTypes.patch) {
        await patchNewOwners([...dataParsed]);
      }

      await refreshStatusOwner(dataParsed);

      dataParsed = null;

      showLog(dataParsed?.length);

      await updateLog(logId, stateTypes.success);
    } catch (error) {
      console.log(`Error on getData :`, error);
    }
  };

  await getData(0);
}
