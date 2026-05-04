import api from './axiosConfig';

export const healthApi = {
  checkHealth: () => api.get('/actuator/health'),
};
