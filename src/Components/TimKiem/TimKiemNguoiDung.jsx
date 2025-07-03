import React from 'react'

const SearchUserCard = ({ user }) => {
  const avatar = user?.anhDaiDien || "/anhbandau.jpg";
  const fullName = user?.hoTen || "full name";
  return (
    <div className='py-2 cursor-pointer'>
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