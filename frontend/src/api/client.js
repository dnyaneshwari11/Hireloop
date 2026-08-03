import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const registerUser = (first_name, email, password) =>
  API.post('/api/auth/register/', { first_name, email, password });

export const loginUser = (email, password) =>
  API.post('/api/auth/login/', { email, password });

// Jobs
export const getJobs = () => API.get('/api/jobs/');
export const createJob = (data) => API.post('/api/jobs/', data);
export const updateJob = (id, data) => API.patch(`/api/jobs/${id}/`, data);
export const deleteJob = (id) => API.delete(`/api/jobs/${id}/`);
export const getStats = () => API.get('/api/jobs/stats/');

// AI
export const analyzeGap = (jobDescription, resumeText) =>
  API.post('/api/ai/gap-analysis/', { job_description: jobDescription, resume_text: resumeText });

export const generateCoverLetter = (jobId) =>
  API.post('/api/ai/cover-letter/', { job_id: jobId });