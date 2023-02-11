import axios from "axios";
import "dotenv/config";
import { SankhyaServiceAuthenticate } from "./authenticate.js";

export const apiMge = axios.create({
  baseURL: `${process.env.SANKHYA_API_SERVER}/mge`,
});

export const apiProd = axios.create({
  baseURL: `${process.env.SANKHYA_API_SERVER}/mgeprod`,
});

export const getSankhyaToken = async () => {
  const sankhyaService = await SankhyaServiceAuthenticate.getInstance();
  const token = await sankhyaService.authUserSankhya(
    process.env.SANKHYA_USER,
    process.env.SANKHYA_PASSWORD
  );

  return token;
};
