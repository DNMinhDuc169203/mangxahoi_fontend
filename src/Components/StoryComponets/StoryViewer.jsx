import React, { useEffect, useState } from "react";

import Progressbar from "./Progressbar";
import styled from "styled-components";

const StoryViewConatiner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: black;
`;
const StoryImage = styled.img`
  max-height: 90vh;
  object-fit: contain;
`;

const StoryViewer = ({ stories }) => {
  const [curentStoryIndex, setCurentStoryIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNextStory = () => {
    if (curentStoryIndex < stories.length - 1) {
      setCurentStoryIndex(curentStoryIndex + 1);
      setActiveIndex(activeIndex + 1);
    } else if (curentStoryIndex === stories.length - 1) {
      setCurentStoryIndex(0);
      setActiveIndex(0);
    }
  };
  useEffect(() => {
    const inverval = setInterval(() => {
      handleNextStory();
    }, 2000);
    return () => clearInterval(inverval);
  }, [curentStoryIndex]);

  return (
    <div className="relative w-full">
      <StoryViewConatiner>
        <StoryImage src={stories?.[curentStoryIndex].image} />

        <div className="absolute top-0 flex w-full">
          {stories.map((item, index) => (
            <Progressbar
              key={index}
              duration={2000}
              index={index}
              activeIndex={activeIndex}
            />
          ))}
        </div>
      </StoryViewConatiner>
    </div>
  );
};

export default StoryViewer;
