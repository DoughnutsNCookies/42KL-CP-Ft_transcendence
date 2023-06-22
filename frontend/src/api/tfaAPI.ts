import { ITFAData } from "../model/TfaData";
import Api from "./api";

export async function getTFA(): Promise<ITFAData> {
  return (await Api.get("/2fa")).data as ITFAData;
}

export async function removeTFA(tfa: string): Promise<ITFAData> {
  Api.updateToken("OTP", tfa);
  return (await Api.delete("/2fa")).data as ITFAData;
}

export async function checkTFA(otp: string): Promise<ITFAData> {
  return (await Api.post("/2fa", { otp: otp })).data as ITFAData;
}

export async function forgotTFA(): Promise<any> {
  return (await Api.get("/2fa/forgot")).data;
}
