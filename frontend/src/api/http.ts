import axios from "axios";

export const http = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("HTTP Error:", error);
    return Promise.reject(error);
  }
);
