import axios from "axios";
import "dotenv/config";

export const apiMge = axios.create({
  baseURL: `${process.env.SANKHYA_API_SERVER}/mge`,
});

export const apiProd = axios.create({
  baseURL: `${process.env.SANKHYA_API_SERVER}/mgeprod`,
});
