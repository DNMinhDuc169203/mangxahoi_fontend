import React from 'react'
import { ProfileUserDetails } from '../../Components/HoSo/HoSoChiTietNguoiDung'
import ReqUserPostPart from '../../Components/HoSo/QuanLiBaiVietNguoiDung'

const Profile = ({ userId }) => {
  return (
    <div className='px-20'>
       <div >
          <ProfileUserDetails userId={userId}/>
        </div> 
        <div>
            <ReqUserPostPart userId={userId}/>
        </div>
    </div>
  )
}

export default Profile