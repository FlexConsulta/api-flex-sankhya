import { tableTypes } from "../../shared/tableTypes.js";
import { apiMge, getSankhyaToken } from "./api.js";
import {
  requestBodyDrivers,
  requestBodyOwners,
  requestBodyTravels,
  requestBodyVehicles,
} from "./api.body.js";

export const getSankhyaData = async (tableType, syncType, lastSync) => {
  const token = await getSankhyaToken();
  apiMge.defaults.headers.Cookie = `JSESSIONID=${token}`;

  let dataRequestBody;

  switch (tableType) {
    case tableTypes.motoristas:
      dataRequestBody = requestBodyDrivers(syncType, lastSync);
      break;
    case tableTypes.proprietarios:
      dataRequestBody = requestBodyOwners(syncType, lastSync);
      break;
    case tableTypes.viagens:
      dataRequestBody = requestBodyTravels(syncType, lastSync);
      break;
    case tableTypes.veiculos:
      dataRequestBody = requestBodyVehicles(syncType, lastSync);
      break;
  }

  let response;
  try {
    response = await apiMge.get(
      `service.sbr?serviceName=DbExplorerSP.executeQuery&outputType=json`,
      { data: { ...dataRequestBody } }
    );
  } catch (error) {
    console.log(error);
  }

  dataRequestBody = null;

  return {
    fields: response?.data?.responseBody?.fieldsMetadata,
    data: Array.isArray(response.data.responseBody.rows)
      ? response.data.responseBody.rows
      : [response.data.responseBody.rows],
  };
};
