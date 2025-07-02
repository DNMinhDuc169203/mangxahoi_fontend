import React from 'react'

const SearchUserCard = () => {
  return (
    <div className='py-2 cursor-pointer'>
        <div className='flex items-center'>  
            <img className='w-10 h-10 rounded-full' src="https://images.pexels.com/photos/160846/french-bulldog-summer-smile-joy-160846.jpeg?auto=compress&cs=tinysrgb&w=600" alt="" />
        <div className='ml-3'>
          <p>full name</p>
          <p className='opacity-70'>username</p>
        </div>
        </div>
    </div>
  )
}

export default SearchUserCard