import { apiRequest } from '../shared/api/apiClient';

export const fetchSalesAnalytics = async (timeframe = 'daily', startDate = null, endDate = null) => {
  let url = `/pharmacy/analytics/sales?timeframe=${timeframe}`;
  if (startDate && endDate) {
    url += `&start_date=${startDate}&end_date=${endDate}`;
  }
  return await apiRequest.get(url);
};

export const fetchDemandAnalytics = async (timeframe = 'monthly', startDate = null, endDate = null) => {
  let startStr = startDate;
  let endStr = endDate;

  if (!startStr || !endStr) {
    const end = new Date();
    const start = new Date();

    if (timeframe === 'daily') {
      // start date is same as end date
    } else if (timeframe === 'weekly') {
      start.setDate(end.getDate() - 7);
    } else if (timeframe === 'monthly') {
      start.setMonth(end.getMonth() - 1);
    } else if (timeframe === 'yearly' || timeframe === 'annually') {
      start.setFullYear(end.getFullYear() - 1);
    }

    startStr = start.toISOString().split('T')[0];
    endStr = end.toISOString().split('T')[0];
  }

  return await apiRequest.get(`/pharmacy/analytics/demand?start_date=${startStr}&end_date=${endStr}`);
};

export const fetchAnalyticsInsights = async (type = 'demand') => {
  return await apiRequest.get(`/pharmacy/analytics/insights?type=${type}`);
};
