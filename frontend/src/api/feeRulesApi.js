import api from './axiosConfig';

export const feeRulesApi = {
  getAll:     ()          => api.get('/fee-rules'),
  getActive:  ()          => api.get('/fee-rules/active'),
  create:     (data)      => api.post('/fee-rules', data),
  update:     (id, data)  => api.put(`/fee-rules/${id}`, data),
  deactivate: (id)        => api.patch(`/fee-rules/${id}/deactivate`),
};
