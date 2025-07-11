// Service gọi API trending hashtag cho admin

const API_BASE = 'http://localhost:8080/network/api/admin/trending-hashtags';

export async function getTrendingHashtags() {
  const res = await fetch(`${API_BASE}`);
  if (!res.ok) throw new Error('Lấy trending hashtag thất bại');
  return res.json();
}

export async function promoteHashtag(id, moTaUuTien) {
  const res = await fetch(`${API_BASE}/${id}/promote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ moTaUuTien }),
  });
  if (!res.ok) throw new Error('Ưu tiên hashtag thất bại');
  return res.json();
}

export async function unpromoteHashtag(id) {
  const res = await fetch(`${API_BASE}/${id}/unpromote`, {
    method: 'POST' });
  if (!res.ok) throw new Error('Hủy ưu tiên hashtag thất bại');
  return res.json();
}

export async function getPostsByHashtag(id) {
  const res = await fetch(`${API_BASE}/${id}/posts`);
  if (!res.ok) throw new Error('Lấy bài viết theo hashtag thất bại');
  return res.json();
} 