import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Card, CardContent, CardFooter } from "./Components/card"
import { Button } from "./Components/button"
import { BookOpen, Plus } from "lucide-react"

interface StoryInfo {
  story_id: string
  title: string
  concept: string
  timestamp: string
  cover?: string
}

export const StoryLibrary = () => {
  const [stories, setStories] = useState<StoryInfo[]>([])

  useEffect(() => {
    const mockStories: StoryInfo[] = [
      {
        story_id: "1",
        title: "Spider-Man's Emergency Fund",
        concept: "Emergency Funds",
        timestamp: new Date().toISOString(),
        cover: "/placeholder.svg",
      },
      {
        story_id: "2",
        title: "Captain America's Budget Plan",
        concept: "Budgeting",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        cover: "/placeholder.svg",
      },
      {
        story_id: "3",
        title: "Black Widow's Investment Strategy",
        concept: "Investing",
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        cover: "/placeholder.svg",
      },
    ]

    setStories(mockStories)
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="story-library min-h-screen w-full p-4 md:p-8 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <motion.h1
            className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-teal-400 bg-clip-text text-transparent mb-4 md:mb-0"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Your Story Library
          </motion.h1>

          <Link to="/create">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Plus className="mr-2 h-4 w-4" /> Create New Story
            </Button>
          </Link>
        </div>

        {stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <BookOpen className="h-20 w-20 text-white/30 mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-2">No stories yet</h2>
              <p className="text-white/70 mb-6 text-center">Create your first visual novel to get started</p>

              <Link to="/create">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <Plus className="mr-2 h-4 w-4" /> Create Your First Story
                </Button>
              </Link>
            </motion.div>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {stories.map((story) => (
              <motion.div key={story.story_id} variants={item}>
                <Link to={`/story/${story.story_id}`} className="block h-full">
                  <Card className="overflow-hidden border-white/10 bg-black/50 backdrop-blur-md h-full transition-all duration-300 hover:shadow-[0_0_25px_rgba(124,58,237,0.3)] hover:-translate-y-1">
                    <div className="relative h-48 w-full">
                      <img
                        src={story.cover}
                        alt={story.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                      <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                        {story.concept}
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="text-xl font-bold text-white mb-2">{story.title}</h3>
                      <p className="text-white/70 text-sm">
                        Created {new Date(story.timestamp).toLocaleDateString()}
                      </p>
                    </CardContent>

                    <CardFooter className="p-4 pt-0">
                      <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                        Continue Reading
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
