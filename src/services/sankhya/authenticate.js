import "dotenv/config";
import { apiMge } from "./api.js";

export class SankhyaServiceAuthenticate {
  static instance = null;
  user = "";
  password = "";
  token = "";

  constructor() {
    this.idUsuario = "";
  }

  static async getInstance() {
    if (!this.instance) {
      this.instance = new SankhyaServiceAuthenticate();
    }
    return this.instance;
  }

  authUserSankhya = async (user, password) => {
    try {
      if (user && password) {
        this.user = user;
        this.password = password;
      }

      let config = {
        headers: {
          // AppKey: 'b4f1d94f-33f4-4f04-afdd-61442eaebd74',
          "Content-Type": "application/json;charset=UTF-8",
        },
      };

      const requestBody = {
        requestBody: {
          NOMUSU: {
            $: this.user.toUpperCase(),
          },
          INTERNO: {
            $: this.password,
          },
          KEEPCONNECTED: {
            $: "S",
          },
        },
      };

      if (this.token != "")
        apiMge.defaults.headers.Cookie = `JSESSIONID=${this.token}`;

      const response = await apiMge.post(
        `service.sbr?serviceName=MobileLoginSP.login&outputType=json`,
        requestBody,
        config
      );
      this.token = response?.data?.responseBody?.jsessionid?.$;

      return this.token;
    } catch (error) {
      console.log(error);
    }
  };
}
