// assign is better than replace because it doesn't reset the history

import Api from "./api";

interface IResponse {
  redirectUrl: string;
}

export function checkAuth(code: string | null) {
  return Api.post("/auth", {
    code: code,
  });
}

async function login() {
  Api.updateToken(
    "Authorization",
    document.cookie
      .split(";")
      .find((cookie) => cookie.includes("Authorization"))
      ?.split("=")[1] ?? ""
  );
  Api.updateToken("GoogleLogin", sessionStorage.getItem('google') ?? "false");
  Api.get<IResponse>("/auth").then((res) => { window.location.assign(res.data.redirectUrl); })
}

export default login;