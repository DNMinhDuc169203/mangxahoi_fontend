import React from 'react'
import { ProfileUserDetails } from '../../Components/HoSo/HoSoChiTietNguoiDung'
import ReqUserPostPart from '../../Components/HoSo/QuanLiBaiVietNguoiDung'

const Profile = () => {
  return (
    <div className='px-20'>
       <div >
          <ProfileUserDetails/>
        </div> 
        <div>
            <ReqUserPostPart/>
        </div>
    </div>
  )
}

export default Profile