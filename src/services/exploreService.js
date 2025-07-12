import axios from "axios";

const API_URL = "http://localhost:8080/network/api/bai-viet/hashtag-uu-tien"; // Đổi lại nếu BE khác

export const fetchExplorePosts = async (page = 0, size = 10) => {
  const res = await axios.get(`${API_URL}?page=${page}&size=${size}`);
  return res.data;
}; 