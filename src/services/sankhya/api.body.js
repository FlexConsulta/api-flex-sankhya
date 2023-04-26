const getDataFim = (lastSync) => {
  const newDate = new Date(lastSync);
  if (!newDate) throw new Error("lastSync null in getDataFim");
  let data_fim = new Date(newDate.setDate(newDate.getDate() + 1));
  const currentDate = new Date();
  if (data_fim >= currentDate) data_fim = currentDate;
  return data_fim;
};

export const requestBodyDrivers = (lastSync, dWhere = null) => {
  let where;
  if (dWhere) {
    where = `AND CGC_CPF = '${dWhere}'`;
  } else {
    let data_fim = getDataFim(lastSync);
    where = `AND DATAFLEX >= TO_DATE('${lastSync.toLocaleDateString()}', 'dd/mm/yyyy') AND DATAFLEX <= TO_DATE('${data_fim.toLocaleDateString()}', 'dd/mm/yyyy')`;
  }

  return {
    requestBody: {
      sql: `SELECT * FROM AD_VWTBCFLEXMOT WHERE CGC_CPF IS NOT NULL ${where}`,
    },
  };
};
export const requestBodyOwners = (lastSync, pWhere = null) => {
  let where;
  if (pWhere) {
    where = `AND CGC_CPF = '${pWhere}'`;
  } else {
    let data_fim = getDataFim(lastSync);
    where = `AND DATAFLEX >= TO_DATE('${lastSync.toLocaleDateString()}', 'dd/mm/yyyy') AND DATAFLEX <= TO_DATE('${data_fim.toLocaleDateString()}', 'dd/mm/yyyy')`;
  }

  return {
    requestBody: {
      sql: `SELECT * FROM AD_VWTBCFLEXPROP WHERE CGC_CPF IS NOT NULL ${where}`,
    },
  };
};
export const requestBodyVehicles = (lastSync, vWhere = null) => {
  let where;

  if (vWhere) {
    where = `AND PLACACAVALO = '${vWhere}'`;
  } else {
    let data_fim = getDataFim(lastSync);
    where = `AND DATAFLEX >= TO_DATE('${lastSync.toLocaleDateString()}', 'dd/mm/yyyy') AND DATAFLEX <= TO_DATE('${data_fim.toLocaleDateString()}', 'dd/mm/yyyy')`;
  }
  return {
    requestBody: {
      sql: `SELECT * FROM AD_VWTBCFLEXVEI WHERE PLACACAVALO IS NOT NULL ${where}`,
    },
  };
};
export const requestBodyTravels = (lastSync) => {
  let data_fim = getDataFim(lastSync);
  const where = `AND DATAFLEX >= TO_DATE('${lastSync.toLocaleDateString()}', 'dd/mm/yyyy') AND DATAFLEX <= TO_DATE('${data_fim.toLocaleDateString()}', 'dd/mm/yyyy')`;

  return {
    requestBody: {
      // sql: `SELECT * FROM AD_VWTBCFLEXCTE WHERE DATAFLEX is not null and DTEMISSAO is not null and NUVIAGEM > 0 AND DTEMISSAO >= TO_DATE('12/04/2023', 'dd/mm/yyyy') AND DTEMISSAO <= TO_DATE('13/04/2023', 'dd/mm/yyyy') and MOTCPF ='50350730091'`,
      sql: `SELECT * FROM AD_VWTBCFLEXCTE WHERE DATAFLEX is not null and DTEMISSAO is not null and NUVIAGEM > 0 ${where}`,
    },
  };
};
