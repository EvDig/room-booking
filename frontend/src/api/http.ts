import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "/api";

export const http = axios.create({
  baseURL: baseURL,
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
