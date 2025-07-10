import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080/network/api/tinnhan";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`
  };
}

export async function guiTinNhan(data) {
  const res = await axios.post(`${API_BASE}/gui`, data, {
    headers: {
      ...getAuthHeader(),
      "Content-Type": "application/json"
    }
  });
  return res.data;
}

export async function taoCuocTroChuyen(data) {
  const res = await axios.post(`${API_BASE}/cuoc-tro-chuyen/tao`, data, {
    headers: {
      ...getAuthHeader(),
      "Content-Type": "application/json"
    }
  });
  return res.data;
}

export async function themThanhVien(data) {
  const res = await axios.post(`${API_BASE}/cuoc-tro-chuyen/them-thanh-vien`, data, {
    headers: {
      ...getAuthHeader(),
      "Content-Type": "application/json"
    }
  });
  return res.data;
}

export async function thuHoiTinNhan(data) {
  const res = await axios.post(`${API_BASE}/tin-nhan/thu-hoi`, data, {
    headers: {
      ...getAuthHeader(),
      "Content-Type": "application/json"
    }
  });
  return res.data;
}

export async function timKiemTinNhan(data) {
  const res = await axios.post(`${API_BASE}/tin-nhan/tim-kiem`, data, {
    headers: {
      ...getAuthHeader(),
      "Content-Type": "application/json"
    }
  });
  return res.data;
}

export async function uploadTinNhanFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await axios.post(`${API_BASE}/tin-nhan/upload-file`, formData, {
    headers: {
      ...getAuthHeader(),
      // KHÔNG set Content-Type, axios sẽ tự động set multipart/form-data
    }
  });
  return res.data;
}

export async function getDanhSachCuocTroChuyen() {
  const res = await axios.get(`${API_BASE}/cuoc-tro-chuyen/danh-sach`, {
    headers: {
      ...getAuthHeader()
    }
  });
  return res.data;
}

export async function markMessagesAsRead(idCuocTroChuyen) {
  const token = localStorage.getItem("token");
  await fetch("http://localhost:8080/network/api/tinnhan/danh-dau-da-doc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ idCuocTroChuyen }),
  });
}

export async function markGroupMessagesAsRead(idCuocTroChuyen) {
  const token = localStorage.getItem("token");
  await fetch("http://localhost:8080/network/api/tinnhan/nhom/danh-dau-da-doc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ idCuocTroChuyen }),
  });
} 