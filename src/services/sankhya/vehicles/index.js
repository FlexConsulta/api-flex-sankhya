import "dotenv/config";
import { syncTypes } from "../../../shared/syncTypes.js";
import { getDateFormated } from "../../utils/dateTime.js";
import { stateTypes } from "../../../shared/stateTypes.js";
import { tableTypes } from "../../../shared/tableTypes.js";
import { getLastSync, updateLog } from "../logs.controller.js";
import { getSankhyaData } from "../api.data.js";
import { findFieldIndex } from "../../utils/findFieldIndex.js";
import { createNewVehicles } from "./create.js";
import { updateVehicles } from "./update.js";
import { refreshStatusVehicle } from "./status.js";
import { showLog } from "../../utils/memory.js";

export async function SankhyaServiceVehicle(syncType) {
  const syncTable = tableTypes.veiculos;

  const { lastSync, logId } = await getLastSync(syncType, syncTable);

  const getData = async () => {
    try {
      console.log(syncType, `get ${syncTable} data`);

      const { fields, data } = await getSankhyaData(
        syncTable,
        syncType,
        lastSync
      );

      if (!data) return;

      let dataParsed = data.map((item) => {
        return {
          placa: item[findFieldIndex("PLACACAVALO", fields)],
          renavam: item[findFieldIndex("RENAVAMCAVALO", fields)],
          status: item[findFieldIndex("STATUS", fields)],
          dt_criacao: getDateFormated(item[findFieldIndex("DHINC", fields)]),
          dt_atualizacao: getDateFormated(
            item[findFieldIndex("DATAFLEX", fields)]
          ),
        };
      });

      if (syncType == syncTypes.created) {
        await createNewVehicles(dataParsed);
      } else {
        await updateVehicles(dataParsed);
      }

      await refreshStatusVehicle(dataParsed);

      dataParsed = null;

      showLog(dataParsed?.length);

      await updateLog(logId, stateTypes.success);
    } catch (error) {
      console.log(error);
    }
  };

  await getData(0);
}
