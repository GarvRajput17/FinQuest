import React, { useState } from "react"
import { useNavigate } from 'react-router-dom'
import { motion } from "framer-motion"
import { Button } from "./Components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./Components/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Components/Select"
import { Label } from "./Components/label"
import { Loader2, Sparkles } from "lucide-react"
import "./StoryCreator.scss"


interface StoryParams {
  difficulty: string
  concept: string
  protagonist: string
}

export const StoryCreator = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [params, setParams] = useState<StoryParams>({
    difficulty: "beginner",
    concept: "emergency funds",
    protagonist: "Spider-Man"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
  
    try {
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      });
  
      const data = await response.json()
  
      if (data.success) {
        navigate(`/story/${data.storyId}`);
        // Navigate to the visual novel view with the story ID
        //navigate(`/story/${data.storyId}`)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error generating story:", error)
    } finally {
      setLoading(false)
    }
  }
  
  

  return (
    <div className="story-creator min-h-screen w-full flex flex-col items-center justify-center p-8">
      <motion.div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <motion.h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-teal-400 bg-clip-text text-transparent">
            Create Your Financial Story
          </motion.h1>
          <motion.p className="mt-4 text-white/70">
            Learn financial concepts through an interactive visual novel
          </motion.p>
        </div>

        <Card className="border-white/10 bg-black/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Story Parameters</CardTitle>
            <CardDescription>Choose your learning adventure</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <Select
                    value={params.difficulty}
                    onValueChange={(value) => setParams({ ...params, difficulty: value })}
                  >
                    <SelectTrigger className="bg-black/50 border-white/20">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Financial Concept</Label>
                  <Select
                    value={params.concept}
                    onValueChange={(value) => setParams({ ...params, concept: value })}
                  >
                    <SelectTrigger className="bg-black/50 border-white/20">
                      <SelectValue placeholder="Select concept" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emergency funds">Emergency Funds</SelectItem>
                      <SelectItem value="budgeting">Budgeting</SelectItem>
                      <SelectItem value="investing">Investing</SelectItem>
                      <SelectItem value="saving">Saving</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Protagonist</Label>
                  <Select
                    value={params.protagonist}
                    onValueChange={(value) => setParams({ ...params, protagonist: value })}
                  >
                    <SelectTrigger className="bg-black/50 border-white/20">
                      <SelectValue placeholder="Select protagonist" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Spider-Man">Spider-Man</SelectItem>
                      <SelectItem value="Captain America">Captain America</SelectItem>
                      <SelectItem value="Black Widow">Black Widow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Story...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Story
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
