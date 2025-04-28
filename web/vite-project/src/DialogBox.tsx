"use client"
import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TypewriterText } from "./TyepwriterTest"
import { Button } from "./Components/button"
import { ChevronRight } from "lucide-react"

interface DialogBoxProps {
  dialogue?: {
    character: string
    text: string
    hint?: string
  }
  onNext: () => void
}

export const DialogBox = ({ dialogue, onNext }: DialogBoxProps) => {
  const [isTyping, setIsTyping] = useState(true)
  const [isSkipped, setIsSkipped] = useState(false)

  const handleTypingComplete = () => {
    setIsTyping(false)
  }

  const handleSkip = () => {
    if (isTyping) {
      setIsSkipped(true)
      setIsTyping(false)
    }
  }

  useEffect(() => {
    setIsTyping(true)
    setIsSkipped(false)
  }, [dialogue])

  if (!dialogue) {
    return null
  }

  return (
    <motion.div
      className="dialog-box fixed bottom-8 left-1/2 transform -translate-x-1/2 w-[90%] max-w-4xl z-30 mx-auto"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      <div className="relative backdrop-blur-md bg-black/70 border border-white/10 rounded-xl p-6 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
        <div className="absolute -top-3 left-8 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-bold shadow-lg">
          {dialogue.character}
        </div>

        <div className="mt-4 text-white text-lg md:text-xl leading-relaxed min-h-[100px]">
          {isSkipped ? (
            <p>{dialogue.text}</p>
          ) : (
            <TypewriterText text={dialogue.text} onComplete={handleTypingComplete} speed={isTyping ? 30 : 0} />
          )}
        </div>

        <div className="flex justify-between items-center mt-4">
          {dialogue.hint && (
            <div className="text-white/70 text-sm italic">
              <span className="text-yellow-400 font-semibold">Hint:</span> {dialogue.hint}
            </div>
          )}

          <div className="flex gap-2 ml-auto">
            {isTyping && (
              <Button variant="outline" onClick={handleSkip} className="border-white/20 text-white hover:bg-white/10">
                Skip
              </Button>
            )}

            <AnimatePresence>
              {!isTyping && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <Button
                    onClick={onNext}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    Next <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
