import api from '../shared/api';

export const getDashboardMetrics = async () => {
  const response = await api.get('/admin/dashboard/metrics');
  return response.data;
};
