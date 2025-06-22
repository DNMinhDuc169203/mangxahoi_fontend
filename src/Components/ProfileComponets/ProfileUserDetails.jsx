import React from "react";
import { TbCircleDashed } from "react-icons/tb";

export const ProfileUserDetails = () => {
  return (
    <div className="py-10">
      <div className="flex items-center">
        <div className="w-[15%]">
          <img
            className="w-32 h-32 rounded-full"
            src="https://cdn.pixabay.com/photo/2022/10/11/16/43/french-bulldog-7514725_640.jpg"
            alt=""
          />
        </div>
        <div className="space-y-5">
          <div className="flex space-x-10 items-center">
            <p>username</p>
            <button>Edit Profile</button>
            <TbCircleDashed></TbCircleDashed>
          </div>
          <div className="flex space-x-10">
            <div>
              <span className="font-semibold mr-2">10</span>
              <span>posts</span>
            </div>
            <div>
              <span className="font-semibold mr-2">5</span>
              <span>follower</span>
            </div>
            <div>
              <span className="font-semibold mr-2">7</span>
              <span>flollowing</span>
            </div>
          </div>
          <div>
            <p className="font-semibold">Full Name</p>
            <p className="font-thin text-sm">tao la minh duc</p>
          </div>
        </div>
      </div>
    </div>
  );
};
