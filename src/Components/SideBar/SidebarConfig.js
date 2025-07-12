import {AiFillCompass, AiFillHeart, AiFillHome, AiFillMessage, AiFillPlusCircle, AiOutlineCompass, AiOutlineHeart, AiOutlineHome, AiOutlineMessage, AiOutlinePlusCircle, AiOutlineSearch} from 'react-icons/ai'
import { RiVideoFill, RiVideoLine } from 'react-icons/ri'
import { CgProfile } from 'react-icons/cg'
import { HiOutlineUserGroup } from 'react-icons/hi'

export const menu =[
    {title:"Home",icon: <AiOutlineHome className='text-2xl mr-5'></AiOutlineHome>, activeIcon: <AiFillHome className='text-2xl mr-5 text-red-500'></AiFillHome>},
    {title:"Search", icon:<AiOutlineSearch className='text-2xl mr-5'></AiOutlineSearch>, activeIcon:<AiOutlineSearch className='text-2xl mr-5 text-red-500'></AiOutlineSearch>},
    {title:"Explore",icon:<AiOutlineCompass className='text-2xl mr-5'></AiOutlineCompass>, activeIcon:<AiFillCompass className='text-2xl mr-5 text-red-500'></AiFillCompass>, path: "/explore"},
    {title:"Friends",icon: <HiOutlineUserGroup className='text-2xl mr-5' />, activeIcon: <HiOutlineUserGroup className='text-2xl mr-5 text-red-500' />, path: "/friends"},
    {title:"Message",icon:<AiOutlineMessage className='text-2xl mr-5'></AiOutlineMessage>, activeIcon:<AiFillMessage className='text-2xl mr-5 text-red-500'></AiFillMessage>,path: "/messages" },
    {title:"Notification",icon:<AiOutlineHeart className='text-2xl mr-5'></AiOutlineHeart>, activeIcon:<AiFillHeart className='text-2xl mr-5 text-red-500'></AiFillHeart>},
    {title:"Create",icon:<AiOutlinePlusCircle className='text-2xl mr-5'></AiOutlinePlusCircle>, activeIcon:<AiFillPlusCircle className='text-2xl mr-5 text-red-500'></AiFillPlusCircle>},
    {title:"Profile",icon:<CgProfile className='text-2xl mr-5'></CgProfile>, activeIcon:<CgProfile className='text-2xl mr-5 text-red-500'></CgProfile>}
]
    
