import React from 'react'

const SuggetionCard = () => {
  return (
    <div>
      
    <div className='flex justify-between items-center'>
      
        <div className='flex items-center'>
            <img className='w-9 h-9 rounded-full' src="https://cdn.pixabay.com/photo/2024/04/08/11/42/doggy-8683291_640.jpg" alt="" />
            <div className='ml-2'>
                <p className='text-sm font-semibold'>username</p>
                <p className='text-sm font-semibold opacity-65'>2 bạn chung</p>
            </div>
        </div>
        <p className='text-blue-700 text-sm font-semibold'>kết bạn</p>
    </div>
    </div>
  )
}

export default SuggetionCard