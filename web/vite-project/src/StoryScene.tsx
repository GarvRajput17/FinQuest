"use client"
import React  from "react"
import { motion } from "framer-motion"
import { CharacterSprite } from "./CharacterSprite"

interface StorySceneProps {
  background?: string
  character?: string
}

const sceneTransitions = {
  background: {
    initial: { scale: 1.1, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.1, opacity: 0 },
    transition: { duration: 1, ease: "easeOut" },
  },
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.5 },
  }
}

export const StoryScene = ({ background, character }: StorySceneProps) => {
  return (
    <div className="story-scene fixed inset-0 z-0 overflow-hidden">
      {/* Dynamic Background */}
      <motion.div
        className="absolute inset-0 transform-gpu"
        {...sceneTransitions.background}
      >
        <img 
          src={background}
          alt="Scene Background"
          className="w-full h-full object-cover"
        />
        
        {/* Overlays remain the same */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
          {...sceneTransitions.overlay}
        />
        <div className="absolute inset-0 mix-blend-overlay bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
      </motion.div>
      
      {character && (
        <div className="absolute bottom-0 right-0 h-[85vh] w-1/2 flex items-end justify-center">
          <CharacterSprite imageUrl={character} />
        </div>
      )}
    </div>
  )
}
