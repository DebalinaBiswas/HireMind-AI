import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const uploadResume = async (name, email, role, resume) => {
  const formData = new FormData();

  formData.append("name", name);
  formData.append("email", email);
  formData.append("role", role);
  formData.append("resume", resume);

  const response = await API.post(
    "/api/v1/resume/upload",
    formData
  );

  return response.data;
};

export default API;