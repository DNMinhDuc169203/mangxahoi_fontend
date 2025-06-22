import React from 'react'
import StoryViewer from '../../Components/StoryComponets/StoryViewer'

const Story = () => {
    const story=[
    {
        image:"https://cdn.pixabay.com/photo/2023/01/03/16/00/dog-7694676_1280.jpg"
    },{
        image:"https://images.pexels.com/photos/58997/pexels-photo-58997.jpeg?auto=compress&cs=tinysrgb&w=600"
    },{
        image:"https://images.pexels.com/photos/825947/pexels-photo-825947.jpeg?auto=compress&cs=tinysrgb&w=600"
    }
]
  return (
    <div>
        <StoryViewer stories={story} />
    </div>
  )
}

export default Story