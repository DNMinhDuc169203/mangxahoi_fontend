import React from 'react'
import { ProfileUserDetails } from '../../Components/HoSo/HoSoChiTietNguoiDung'
import ReqUserPostPart from '../../Components/HoSo/QuanLiBaiVietNguoiDung'

const Profile = ({ userId }) => {
  return (
    <div className="flex">
      <div className="w-[88px] md:w-[220px] min-w-[88px] md:min-w-[220px]" ></div>
      <div className="flex-1 px-8 md:px-20">
        <div>
          <ProfileUserDetails userId={userId}/>
        </div>
        <div>
          <ReqUserPostPart userId={userId}/>
        </div>
      </div>
    </div>
  )
}

export default Profile