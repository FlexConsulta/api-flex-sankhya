import "dotenv/config";
import { syncTypes } from "../../../shared/syncTypes.js";
import { getDateFormated } from "../../utils/dateTime.js";
import { stateTypes } from "../../../shared/stateTypes.js";
import { tableTypes } from "../../../shared/tableTypes.js";
import { getLastSync, updateLog } from "../logs.controller.js";
import { getSankhyaData } from "../api.data.js";
import { findFieldIndex } from "../../utils/findFieldIndex.js";
import { createNewTravels } from "./create.js";
import { updateTravels } from "./update.js";
import { showLog } from "../../utils/memory.js";
import { enum_viagem_cancelado } from "@prisma/client";

export async function SankhyaServiceTravel(syncType) {
  const syncTable = tableTypes.viagens;

  const { lastSync, logId } = await getLastSync(syncType, syncTable);

  const getData = async () => {
    try {
      console.log(syncType, `get ${syncTable} data`);

      const { fields, data } = await getSankhyaData(
        syncTable,
        syncType,
        lastSync
      );

      if (!data[0]) {
        await updateLog(logId, stateTypes.success);
        return;
      }

      let dataParsed = data.map((item) => {
        return {
          idcliente: Number(process.env.ID_CUSTOMER),
          numero_cliente: `${item[
            findFieldIndex("CODEMP", fields)
          ].toString()}-${item[findFieldIndex("NUVIAGEM", fields)].toString()}`,
          dt_viagem: getDateFormated(item[findFieldIndex("DTEMISSAO", fields)]),
          mercadoria: item[findFieldIndex("PRODUTO", fields)],
          cidade_origem: item[findFieldIndex("CIDADEUFORIGEM", fields)],
          cidade_destino: item[findFieldIndex("CIDADEUFDESTINO", fields)],
          carreta1: item[findFieldIndex("CAR1PLACA", fields)],
          carreta2: item[findFieldIndex("CAR2PLACA", fields)],
          carreta3: item[findFieldIndex("CAR3PLACA", fields)],
          cpf_motorista: item[findFieldIndex("MOTCPF", fields)],
          cpf_cnpj_proprietario: item[findFieldIndex("PROPCPFCNPJ", fields)],
          placa_veiculo: item[findFieldIndex("CAVPLACA", fields)],
          dt_cancelamento:
            item[findFieldIndex("STATUS_CTE", fields)] > 0 ? new Date() : null,
          viagem_cancelado:
            item[findFieldIndex("STATUS_CTE", fields)] > 0
              ? enum_viagem_cancelado.S
              : enum_viagem_cancelado.N,
          dt_cliente: getDateFormated(
            item[findFieldIndex("DATAFLEX", fields)],
            false
          ),
          dt_criacao: new Date(),
          dt_atualizacao: new Date(),
        };
      });

      // console.log("----->", dataParsed);

      if (syncType == syncTypes.created) {
        await createNewTravels([...dataParsed]);
      } else {
        await updateTravels([...dataParsed]);
      }

      dataParsed = null;

      showLog(dataParsed?.length);

      await updateLog(logId, stateTypes.success);
    } catch (error) {
      console.log(error);
    }
  };

  await getData(0);
}
