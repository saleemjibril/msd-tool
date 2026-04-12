import axios from "axios";

const apiOrigin = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
const baseURL = apiOrigin ? `${apiOrigin}/api` : "/api";

const client = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

export function setAdminToken(token) {
  if (token) {
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common.Authorization;
  }
}

export default client;
