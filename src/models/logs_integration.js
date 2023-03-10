import { prisma } from "../database/prismaClient.js";
// import { getDateTimeNow } from "../services/utils/dateTime.js";

export class LogsIntegration {
  async findLastSync(syncType, tableName) {
    const lastSync = await prisma.integracaoSankhya.findMany({
      where: {
        type_sync: syncType,
        table_name: tableName,
      },
      orderBy: {
        last_sync: "desc",
      },
      take: 1,
    });

    if (lastSync?.length > 0) {
      return (
        lastSync[0].last_sync.toLocaleDateString() +
        " " +
        lastSync[0].last_sync.toLocaleTimeString()
      );
    } else {
      return null;
    }
  }

  async createSync(tableName, syncType, state) {
    // const last_sync = getDateTimeNow();
    // console.log("last_sync--->>", last_sync);
    const newSync = await prisma.integracaoSankhya.create({
      data: {
        last_sync: new Date(),
        type_sync: syncType,
        page: 0,
        table_name: tableName,
        state,
      },
    });

    return newSync.id;
  }

  async updateSync(id, state) {
    const updateSync = await prisma.integracaoSankhya.update({
      where: {
        id,
      },
      data: {
        page: 0,
        state,
      },
    });
    return updateSync;
  }
}
