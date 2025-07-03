import React from 'react'
import { useNavigate } from 'react-router-dom';

const SearchUserCard = ({ user }) => {
  const avatar = user?.anhDaiDien || "/anhbandau.jpg";
  const fullName = user?.hoTen || "full name";
  const navigate = useNavigate();
  return (
    <div className='py-2 cursor-pointer' onClick={() => navigate(`/profile/${user.id}`)}>
        <div className='flex items-center'>  
            <img className='w-10 h-10 rounded-full' src={avatar} alt="avatar" />
        <div className='ml-3'>
          <p>{fullName}</p>
        </div>
        </div>
    </div>
  )
}

export default SearchUserCard