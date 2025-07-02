import React, { useEffect, useState } from "react";
import SuggetionCard from "./SuggetionCard";
import axios from 'axios';

const HomeRight = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:8080/network/api/nguoi-dung/thong-tin-hien-tai", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data);
      } catch (err) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="">
      <div>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div>
              <img
                className="w-12 h-12 rounded-full"
                src={user?.anhDaiDien || "anhbandau.jpg"}
                alt=""
              />
            </div>
            <div className="ml-3">
              <p>{user?.hoTen || "fullname"}</p>
            </div>
          </div>
          <div>
            <p className="text-blue-700">swith</p>
          </div>
        </div>
        <div className="space-y-5 mt-10">
          {[1, 1, 1, 1].map((item, idx) => (
            <SuggetionCard key={idx} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeRight;
