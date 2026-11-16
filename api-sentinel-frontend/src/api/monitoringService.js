
import api from "./axiosConfig";

// Fetch all API request logs
export const getAllLogs = async () => {
  const response = await api.get("/api/monitoring/logs");
  return response.data;
};

// Fetch total API request count
export const getLogCount = async () => {
  const response = await api.get("/api/monitoring/logs/count");
  return response.data;
};

// Fetch logs for a specific user
export const getUserLogs = async (username) => {
  const response = await api.get(
    `/api/monitoring/logs/user/${encodeURIComponent(username)}`
  );
  return response.data;
};
