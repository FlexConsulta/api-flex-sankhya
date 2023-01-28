import express from "express";
import "express-async-errors";
import morgan from "morgan";
import cors from "cors";

import "dotenv/config";
import { SankhyaServiceVehicle } from "./services/sankhya/sankhya.vehicle.js";
import { syncTypes } from "./shared/syncTypes.js";
import { SankhyaServiceOwner } from "./services/sankhya/sankhya.owner.js";
import { SankhyaServiceDriver } from "./services/sankhya/sankhya.driver.js";
import { SankhyaServiceTravel } from "./services/sankhya/sankhya.travel.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

const connectSankhya = async () => {
  console.log("Process started");
  console.log(" ");
  await SankhyaServiceDriver(syncTypes.created);
  console.log("Sync dirvers created");
  await SankhyaServiceOwner(syncTypes.created);
  console.log("Sync owners created");
  await SankhyaServiceVehicle(syncTypes.created);
  console.log("Sync veichiles created");
  await SankhyaServiceTravel(syncTypes.created);
  console.log("Sync travels created");
  await SankhyaServiceDriver(syncTypes.updated);
  console.log("Sync dirvers updated");
  await SankhyaServiceOwner(syncTypes.updated);
  console.log("Sync owners updated");
  await SankhyaServiceVehicle(syncTypes.updated);
  console.log("Sync veichicles updated");
  await SankhyaServiceTravel(syncTypes.updated);
  console.log("Sync traves updated");
  console.log(" ");
  console.log("Process finished");
};

const checkTime = () => {
  setTimeout(async () => {
    const [, minuto] = new Date().toLocaleTimeString().split(":");

    if (minuto == 58) {
      await connectSankhya();
    }
    checkTime();
  }, 6000); //60000
};

checkTime();

// connectSankhya();

app.listen(process.env.PORT, async () => {
  console.log(`App started on ${process.env.PORT} 👍 `);
});
