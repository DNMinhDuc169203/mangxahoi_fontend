import axios from 'axios';

const BASE_URL = 'http://localhost:8080/network/api/admin/bai-viet';

export const fetchPosts = (params) => {
  return axios.get(`${BASE_URL}/tim-kiem`, { params });
};

export const hidePost = (postId, adminId, lyDo) => {
  return axios.post(`${BASE_URL}/${postId}/an?adminId=${adminId}`, { lyDo });
};

export const deletePost = (postId, adminId, lyDo) => {
  return axios.delete(`${BASE_URL}/${postId}?adminId=${adminId}`, { data: { lyDo } });
};

export const restorePost = (postId, adminId) => {
  return axios.post(`${BASE_URL}/${postId}/hien?adminId=${adminId}`);
}; 