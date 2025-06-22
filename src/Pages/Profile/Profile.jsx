import React from 'react'
import { ProfileUserDetails } from '../../Components/ProfileComponets/ProfileUserDetails'
import ReqUserPostPart from '../../Components/ProfileComponets/ReqUserPostPart'

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