import Cookies from "js-cookie";
import moment from "moment";
import { logout, refreshTokens } from "../api/endpoints";

const ACCESS_TOKEN_COOKIE_NAME = "access_token";
const REFRESH_TOKEN_COOKIE_NAME = "refresh_token";

const fiveMinutes = 5 / (24 * 60);

// JWT helper, return token in JSON format
const parseJwt = (token) => {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
};

// Cookies
const setAccessTokenCookie = (accessToken) => {
  return new Promise((resolve) => {
    Cookies.set(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
      expires: fiveMinutes,
    });
    resolve();
  });
};
const getAccessTokenCookie = () => {
  return Cookies.get(ACCESS_TOKEN_COOKIE_NAME);
};
const removeAccessTokenCookie = () => {
  Cookies.remove(ACCESS_TOKEN_COOKIE_NAME);
};
const setRefreshTokenCookie = (refreshToken) => {
  return new Promise((resolve) => {
    Cookies.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, { expires: 7 });
    resolve();
  });
};
const getRefreshTokenCookie = () => {
  return Cookies.get(REFRESH_TOKEN_COOKIE_NAME);
};
const removeRefreshTokenCookie = () => {
  Cookies.remove(REFRESH_TOKEN_COOKIE_NAME);
};

// Token refresh
const checkAndRefreshToken = async () => {
  const accessToken = getAccessTokenCookie();
  const refreshToken = getRefreshTokenCookie();

  if (
    accessToken === null ||
    accessToken === undefined ||
    accessToken === "undefined" ||
    accessToken === ""
  ) {
    if (refreshToken === undefined || refreshToken === "undefined") {
      removeAccessTokenCookie();
      removeRefreshTokenCookie();
    } else if (
      refreshToken !== null &&
      refreshToken !== undefined &&
      refreshToken !== ""
    ) {
      const response = await logout({ refreshToken: refreshToken });
      if (response !== null) {
        removeAccessTokenCookie();
        removeRefreshTokenCookie();
      }
    }
    return;
  } else {
    const tokens = {
      token: accessToken,
      refreshToken: refreshToken,
    };
    const parsedAccessToken = parseJwt(accessToken);
    const expirationDate = moment
      .unix(parsedAccessToken.exp)
      .subtract(1, "minute")
      .toDate(); // 1 minute less
    const now = new Date();

    if (now > expirationDate) {
      const response = await refreshTokens(tokens);
      if (response !== null) {
        await Promise.all([
          setAccessTokenCookie(response.token),
          setRefreshTokenCookie(response.refreshToken),
        ]);
      }
      return;
    }
  }
  return;
};

export {
  parseJwt,
  setAccessTokenCookie,
  getAccessTokenCookie,
  removeAccessTokenCookie,
  setRefreshTokenCookie,
  getRefreshTokenCookie,
  removeRefreshTokenCookie,
  checkAndRefreshToken,
};
