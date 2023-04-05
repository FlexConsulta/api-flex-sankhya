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
      return lastSync[0].last_sync;
    } else {
      return null;
    }
  }

  async createSync(tableName, syncType, state) {
    const date = await this.findLastSync(syncType, tableName);

    const currentDate = new Date();
    let last_sync = new Date(date.setDate(date.getDate() + 1));

    if (last_sync >= currentDate) last_sync = currentDate;

    const newSync = await prisma.integracaoSankhya.create({
      data: {
        last_sync,
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
