import express from "express";
import "express-async-errors";
import morgan from "morgan";
import cors from "cors";

import "dotenv/config";
import { SankhyaServiceVehicle } from "./services/sankhya/vehicles/index.js";
import { syncTypes } from "./shared/syncTypes.js";
import { SankhyaServiceOwner } from "./services/sankhya/owners/index.js";
import { SankhyaServiceDriver } from "./services/sankhya/drivers/index.js";
import { SankhyaServiceTravel } from "./services/sankhya/travels/index.js";
import { dateLessThanNow } from "./services/utils/dateTime.js";
import { tableTypes } from "./shared/tableTypes.js";
import { getLastSync } from "./services/sankhya/logs.controller.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

const connectSankhya = async (syncOptions) => {
  console.log("Process started");

  if (syncOptions.driver) {
    const syncCreate = async () => {
      console.log("Sync dirvers started");
      await SankhyaServiceDriver(syncTypes.created);
      console.log("Sync dirvers created");

      const { lastSync } = await getLastSync(
        syncTypes.created,
        tableTypes.motoristas
      );

      if (dateLessThanNow({ lastSync })) await syncCreate();
    };
    await syncCreate();

    const syncUpdate = async () => {
      console.log("Sync dirvers started");
      await SankhyaServiceDriver(syncTypes.updated);
      console.log("Sync dirvers updated");

      const { lastSync } = await getLastSync(
        syncTypes.updated,
        tableTypes.motoristas
      );

      if (dateLessThanNow({ lastSync })) await syncUpdate();
    };
    await syncUpdate();
    console.log("Sync dirvers finished");
  }

  if (syncOptions.owner) {
    const syncCreate = async () => {
      console.log("Sync owners started");
      await SankhyaServiceOwner(syncTypes.created);
      console.log("Sync owners created");

      const { lastSync } = await getLastSync(
        syncTypes.created,
        tableTypes.proprietarios
      );

      if (dateLessThanNow({ lastSync })) await syncCreate();
    };
    await syncCreate();

    const syncUpdate = async () => {
      console.log("Sync owners started");
      await SankhyaServiceOwner(syncTypes.updated);
      console.log("Sync owners updated");

      const { lastSync } = await getLastSync(
        syncTypes.updated,
        tableTypes.proprietarios
      );

      if (dateLessThanNow({ lastSync })) await syncUpdate();
    };
    await syncUpdate();
  }

  if (syncOptions.veichile) {
    const syncCreate = async () => {
      console.log("Sync veichiles started");
      await SankhyaServiceVehicle(syncTypes.created);
      console.log("Sync veichiles created");

      const { lastSync } = await getLastSync(
        syncTypes.created,
        tableTypes.veiculos
      );

      if (dateLessThanNow({ lastSync })) await syncCreate();
    };
    await syncCreate();

    const syncUpdate = async () => {
      console.log("Sync veichicles started");
      await SankhyaServiceVehicle(syncTypes.updated);
      console.log("Sync veichicles updated");

      const { lastSync } = await getLastSync(
        syncTypes.updated,
        tableTypes.veiculos
      );

      if (dateLessThanNow({ lastSync })) await syncUpdate();
    };
    await syncUpdate();
  }

  if (syncOptions.travel) {
    const syncTravelCreate = async () => {
      console.log("Sync travels started");
      await SankhyaServiceTravel(syncTypes.created);
      console.log("Sync travels created");

      const { lastSync } = await getLastSync(
        syncTypes.created,
        tableTypes.viagens
      );

      if (dateLessThanNow({ lastSync })) await syncTravelCreate();
    };
    await syncTravelCreate();

    const syncTravelUpdate = async () => {
      console.log("Sync travels started");
      await SankhyaServiceTravel(syncTypes.updated);
      console.log("Sync traves updated");

      const { lastSync } = await getLastSync(
        syncTypes.updated,
        tableTypes.viagens
      );

      if (dateLessThanNow({ lastSync })) await syncTravelUpdate();
    };
    await syncTravelUpdate();
  }
  console.log(" ");
  console.log("Process finished");
};

const checkTime = () => {
  setTimeout(async () => {
    const [hora, minuto] = new Date().toLocaleTimeString().split(":");

    if (hora == 23 && minuto == 55) {
      await connectSankhya({
        driver: true,
        owner: true,
        veichile: true,
        travel: true,
      });
    }
    checkTime();
  }, 6000); //60000
};

app.listen(process.env.PORT, async () => {
  console.log(`App started on ${process.env.PORT} 👍 `);

  await connectSankhya({
    driver: true,
    owner: true,
    veichile: true,
    travel: true,
  });

  checkTime();
});

//Error: Motorista não encontrado 47716548832
//50350730091
