import axios from "axios";

// ✅ Use environment variable if defined (good for Vercel)
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://taskvault-lite.onrender.com/";

// ✅ Create axios instance
const API = axios.create({
  baseURL: BASE_URL,
});

// ✅ Automatically attach JWT token for all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
