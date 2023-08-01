import axios from "axios";
import { getAccessTokenCookie } from "./jwt";

const API_BASE_URL = process.env.API_BASE_URL;
const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST",
  "Access-Control-Allow-Credentials": "true",
};

const getAuthHeaders = () => {
  const accessToken = getAccessTokenCookie();
  return {
    ...headers,
    Authorization: `Bearer ${accessToken}`,
    "Access-Control-Allow-Methods":
      "GET, POST, PUT, PATCH, POST, DELETE, OPTIONS",
  };
};

// Endpoints for users
const register = async (credentials) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/Authentication/Register`,
      credentials,
      { headers: headers }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    } else {
      throw new Error("Registration failed");
    }
  }
};
const login = async (credentials) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/Authentication/Login`,
      credentials,
      { headers: headers }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    } else {
      throw new Error("Login failed");
    }
  }
};
const logout = async (refreshToken) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/Authentication/Logout`,
      refreshToken,
      { headers: headers }
    );
    return response.data;
  } catch (error) {
    throw new Error("Logout failed");
  }
};
const refreshTokens = async (tokens) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/Authentication/RefreshToken`,
      tokens,
      { headers: headers }
    );
    return response.data;
  } catch (error) {
    throw new Error("Refreshing the tokens failed");
  }
};

// Endpoints for data, need authorization
const getBooks = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/Books`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error("Data fetching failed");
  }
};
const getBook = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/Books/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error("Data fetching failed");
  }
};
const addBook = async (book) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/Books`,
      { headers: getAuthHeaders() },
      book
    );
    return response.data;
  } catch (error) {
    throw new Error("Adding data failed");
  }
};
const updateBook = async (book) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/api/Books`,
      { headers: getAuthHeaders() },
      book
    );
    return response.data;
  } catch (error) {
    throw new Error("Updating data failed");
  }
};
const deleteBook = async (id) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/api/Books`,
      { headers: getAuthHeaders() },
      id
    );
    return response.data;
  } catch (error) {
    throw new Error("Updating data failed");
  }
};

export {
  register,
  login,
  logout,
  refreshTokens,
  getBooks,
  getBook,
  addBook,
  updateBook,
  deleteBook,
};
