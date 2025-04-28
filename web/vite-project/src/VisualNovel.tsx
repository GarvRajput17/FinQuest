import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StoryScene } from './StoryScene'
import { DialogBox } from './DialogBox'
import { CharacterSprite } from './CharacterSprite'
import { Controls } from './controls'
import { Button } from './Components/button'
import { useNavigate } from 'react-router-dom'


const getBackgroundForScene = (backgrounds: Record<string, string>, sceneIndex: number) => {
  const locationKeys = ['Main location', 'Secondary location']
  const availableBackgrounds = Object.entries(backgrounds)
    .filter(([key]) => locationKeys.includes(key))
    .map(([_, url]) => url)

  // Cycle through backgrounds or use random selection
  return availableBackgrounds[sceneIndex % availableBackgrounds.length] || availableBackgrounds[Math.floor(Math.random() * availableBackgrounds.length)]
}

interface StoryData {
  plot: {
    title: string
    setup: string
    location: string
  }
  dialogue: Array<{
    character: string
    text: string
    hint?: string
  }>
  visuals: {
    characters: Array<any>
    backgrounds: Array<any>
    financial_elements: string
  }
  generated_images: {
    cover: string
    characters: Record<string, string>
    backgrounds: Record<string, string>
  }
  hooks: {
    pop_culture: string
    music: string
  }
}

const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-black">
    <motion.div
      className="h-16 w-16"
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    >
      <div className="h-full w-full rounded-full border-4 border-t-purple-500 border-r-pink-500 border-b-blue-500 border-l-teal-500" />
    </motion.div>
  </div>
)

export const VisualNovel = () => {
  const [story, setStory] = useState<StoryData | null>(null)
  const [currentScene, setCurrentScene] = useState(0)
  const [showCover, setShowCover] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    console.log('🎬 Initializing Visual Novel component')
    fetchLatestStory()
  }, [])

  const fetchLatestStory = async () => {
    console.log('🔍 Fetching latest story from API...')
    try {
      const response = await fetch('http://localhost:5000/api/latest-story')
      const data = await response.json()
      console.log('📖 Story data received:', JSON.stringify(data, null, 2))
      console.log('Story object:', data.story)
      console.log('Dialogue:', data.story?.dialogue)
      setStory(data.story)
      console.log('✨ Story state updated')
    } catch (error) {
      console.error('❌ Error fetching story:', error)
    }
  }

  if (!story || !story.dialogue) {
    console.log('⏳ Story loading or not found')
    return <LoadingSpinner />
  }

  if (showCover) {
    return (
      <div className="fixed inset-0 bg-black">
        <motion.div 
          className="w-full h-full relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <img 
            src={story.generated_images.cover} 
            alt="Story Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-teal-400 bg-clip-text text-transparent mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {story.plot.title}
            </motion.h1>
            <motion.p
              className="text-white/70 max-w-2xl mx-auto mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {story.plot.setup}
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <Button 
                onClick={() => setShowCover(false)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-full font-bold"
              >
                Begin Your Journey
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  console.log(`🎯 Rendering scene ${currentScene + 1} of ${story.dialogue.length}`)

  return (
    <div className="visual-novel fixed inset-0 bg-black">
      <AnimatePresence mode="sync">
        {story.dialogue[currentScene] && (
          <>
            <StoryScene
  key={`scene-${currentScene}`}
  background={getBackgroundForScene(story.generated_images.backgrounds, currentScene)}
  character={story.generated_images.characters[story.dialogue[currentScene].character]}
/>
            <DialogBox
              key={`dialog-${currentScene}`}
              dialogue={story.dialogue[currentScene]}
              onNext={() => {
                console.log('➡️ Moving to next scene')
                if (currentScene + 1 < story.dialogue.length) {
                  setCurrentScene(prev => prev + 1)
                } else {
                  navigate('/summary')
                }
              }}
            />
            <Controls
              key="controls"
              onSave={() => console.log('💾 Save requested')}
              onLoad={() => console.log('📂 Load requested')}
              //coverImage={story.generated_images.cover}
              title={story.plot.title}
              progress={`${currentScene + 1}/${story.dialogue.length}`}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
