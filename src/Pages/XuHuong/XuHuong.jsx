import React, { useEffect, useState } from "react";
import { fetchExplorePosts } from "../../services/exploreService";
import BaiDang from "../../Components/BaiViet/BaiDang";
import { Spin, Empty, Pagination } from "antd";

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetchExplorePosts(page - 1, 10)
      .then((data) => {
        setPosts(data.baiViet || []);
        setTotal((data.tongSoTrang || 1) * 10);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="max-w-2xl mx-auto lg:ml-40 py-6 px-2">
      <h2 className="text-2xl font-bold mb-4 text-red-600">Khám phá Hashtag Ưu Tiên</h2>
      {loading ? (
        <div className="flex justify-center py-10"><Spin size="large" /></div>
      ) : posts.length === 0 ? (
        <Empty description="Chưa có bài viết nào với hashtag ưu tiên tuần này." />
      ) : (
        <>
          <div className="space-y-6">
            {posts.map((post) => (
              <BaiDang key={post.id} post={post} />
            ))}
          </div>
          <div className="flex justify-center mt-6">
            <Pagination
              current={page}
              pageSize={10}
              total={total}
              onChange={setPage}
              showSizeChanger={false}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Explore; 