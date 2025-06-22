import React from "react";
import SuggetionCard from "./SuggetionCard";

const HomeRight = () => {
  return (
    <div className="">
      <div>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div>
              <img
                className="w-12 h-12 rounded-full"
                src="https://cdn.pixabay.com/photo/2025/01/08/19/02/border-collie-9319990_640.jpg"
                alt=""
              />
            </div>
            <div className="ml-3">
              <p>fullname</p>
              <p className="opacity-60">username</p>
            </div>
          </div>

          <div>
            <p className="text-blue-700">swith</p>
          </div>
        </div>
        <div className="space-y-5 mt-10">
          {[1, 1, 1, 1].map((item) => (
            <SuggetionCard />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeRight;
