import axios from "axios";
const BASE_URL = "http://localhost:3500";

// Make requests without Authorization
export default axios.create({
  baseURL: BASE_URL,
});

// Make requests with Authorization
export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});
