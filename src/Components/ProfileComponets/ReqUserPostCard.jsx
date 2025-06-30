import React from 'react'
import { AiFillHeart } from 'react-icons/ai'
import { FaComment } from 'react-icons/fa'
import "./ReqUserPostCard.css"

const ReqUserPostCard = ({ post, onClick }) => {
  const hasImage = post.mediaUrls && post.mediaUrls.length > 0;
  const imgSrc = hasImage ? post.mediaUrls[0] : null;
  const maxLength = 80;
  const content =
    post.noiDung && post.noiDung.length > maxLength
      ? post.noiDung.slice(0, maxLength) + "..."
      : post.noiDung;

  return (
    <div className='p-2'>
        <div className='post w-60 h-60 flex items-center justify-center bg-gray-100 relative cursor-pointer' onClick={onClick}>
             {hasImage ? (
                <img className='cursor-pointer w-full h-full object-cover' src={imgSrc} alt="" />
             ) : (
                <div className="flex items-center justify-center w-full h-full text-center p-2 text-gray-700 text-base font-medium">
                  <span style={{ wordBreak: "break-word" }}>{content}</span>
                </div>
             )}
            <div className='overlay'>
                <div className='overlay-text flex justify-between' >
                    <div>
                        <AiFillHeart></AiFillHeart> <span>{post?.soLuotThich || 0}</span>
                    </div>
                    <div> 
                        <FaComment/> <span>{post?.soLuotBinhLuan || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ReqUserPostCard