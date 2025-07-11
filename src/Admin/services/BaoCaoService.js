import axios from 'axios';

const BASE_URL = 'http://localhost:8080/network/api/admin/bao-cao';

export const fetchReports = (params) => {
  // params: { trangThai, page, size }
  return axios.get(BASE_URL, { params });
};
