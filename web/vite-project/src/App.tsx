import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './Home';
import { StoryCreator } from './StoryCreator';
import { StoryLibrary } from './StoryLibrary';
import { VisualNovel } from './VisualNovel';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<StoryCreator />} />
        <Route path="/library" element={<StoryLibrary />} />
        <Route path="/story/:storyId" element={<VisualNovel />} />
      </Routes>
    </BrowserRouter>
  );
};
