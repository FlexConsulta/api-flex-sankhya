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
  await SankhyaServiceTravel(syncTypes.created);
  await SankhyaServiceTravel(syncTypes.updated);
  console.log("Process finished")
};

const teste = async () => {
  await connectSankhya();
};

teste();

app.listen(process.env.PORT, async () => {
  console.log(`App started on ${process.env.PORT} 👍 `);
});
