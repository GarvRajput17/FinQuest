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
  characters: {
    protagonist: string
    mentor: string
    friend: string
  }
  entertainment: {
    netflix_show: string
    spotify_track: string
  }
}

export const StoryCreator = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [params, setParams] = useState<StoryParams>({
    difficulty: "beginner",
    concept: "emergency funds",
    protagonist: "Spider-Man",
    characters: {
      protagonist: "Spider-Man",
      mentor: "Iron Man",
      friend: "MJ",
    },
    entertainment: {
      netflix_show: "Stranger Things",
      spotify_track: "Anti-Hero By Taylor Swift",
    },
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
        body: JSON.stringify({
          difficulty: params.difficulty,
          concept: params.concept,
          characters: params.characters,
          entertainment: params.entertainment
        })
      });
      const data = await response.json()
      if (data.success) {
        navigate(`/story/${data.storyId}`);
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
    <div className="story-creator">
      <motion.div 
        className="story-creator__container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="story-creator__header">
          <motion.h1 
            className="story-creator__title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Create Your Financial Story
          </motion.h1>
          <motion.p 
            className="story-creator__subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Customize your visual novel with characters, financial concepts, and entertainment references
          </motion.p>
        </div>

        <Card className="story-creator__card">
          <CardHeader>
            <CardTitle className="story-creator__card-title">Story Parameters</CardTitle>
            <CardDescription>Configure your story settings</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="story-creator__form">
              <div className="story-creator__form-grid">
                <div className="story-creator__form-column">
                  <div className="story-creator__form-group">
                    <Label htmlFor="difficulty" className="story-creator__label">
                      Difficulty Level
                    </Label>
                    <Select
                      value={params.difficulty}
                      onValueChange={(value) => setParams({ ...params, difficulty: value })}
                    >
                      <SelectTrigger id="difficulty" className="story-creator__select-trigger">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent className="story-creator__select-content">
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="story-creator__form-group">
                    <Label htmlFor="concept" className="story-creator__label">
                      Financial Concept
                    </Label>
                    <Select 
                      value={params.concept} 
                      onValueChange={(value) => setParams({ ...params, concept: value })}
                    >
                      <SelectTrigger id="concept" className="story-creator__select-trigger">
                        <SelectValue placeholder="Select concept" />
                      </SelectTrigger>
                      <SelectContent className="story-creator__select-content">
                        <SelectItem value="emergency funds">Emergency Funds</SelectItem>
                        <SelectItem value="budgeting">Budgeting</SelectItem>
                        <SelectItem value="investing">Investing</SelectItem>
                        <SelectItem value="saving">Saving</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="story-creator__form-group">
                    <Label htmlFor="protagonist" className="story-creator__label">
                      Protagonist
                    </Label>
                    <Select
                      value={params.characters.protagonist}
                      onValueChange={(value) =>
                        setParams({
                          ...params,
                          characters: { ...params.characters, protagonist: value },
                        })
                      }
                    >
                      <SelectTrigger id="protagonist" className="story-creator__select-trigger">
                        <SelectValue placeholder="Select protagonist" />
                      </SelectTrigger>
                      <SelectContent className="story-creator__select-content">
                        <SelectItem value="Spider-Man">Spider-Man</SelectItem>
                        <SelectItem value="Captain America">Captain America</SelectItem>
                        <SelectItem value="Black Widow">Black Widow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="story-creator__form-column">
                  <div className="story-creator__form-group">
                    <Label htmlFor="mentor" className="story-creator__label">
                      Mentor
                    </Label>
                    <Select
                      value={params.characters.mentor}
                      onValueChange={(value) =>
                        setParams({
                          ...params,
                          characters: { ...params.characters, mentor: value },
                        })
                      }
                    >
                      <SelectTrigger id="mentor" className="story-creator__select-trigger">
                        <SelectValue placeholder="Select mentor" />
                      </SelectTrigger>
                      <SelectContent className="story-creator__select-content">
                        <SelectItem value="Iron Man">Iron Man</SelectItem>
                        <SelectItem value="Doctor Strange">Doctor Strange</SelectItem>
                        <SelectItem value="Black Panther">Black Panther</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="story-creator__form-group">
                    <Label htmlFor="friend" className="story-creator__label">
                      Friend
                    </Label>
                    <Select
                      value={params.characters.friend}
                      onValueChange={(value) =>
                        setParams({
                          ...params,
                          characters: { ...params.characters, friend: value },
                        })
                      }
                    >
                      <SelectTrigger id="friend" className="story-creator__select-trigger">
                        <SelectValue placeholder="Select friend" />
                      </SelectTrigger>
                      <SelectContent className="story-creator__select-content">
                        <SelectItem value="MJ">MJ</SelectItem>
                        <SelectItem value="Ned">Ned</SelectItem>
                        <SelectItem value="Gwen">Gwen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="story-creator__form-group">
                    <Label htmlFor="netflix" className="story-creator__label">
                      Netflix Show Reference
                    </Label>
                    <Select
                      value={params.entertainment.netflix_show}
                      onValueChange={(value) =>
                        setParams({
                          ...params,
                          entertainment: { ...params.entertainment, netflix_show: value },
                        })
                      }
                    >
                      <SelectTrigger id="netflix" className="story-creator__select-trigger">
                        <SelectValue placeholder="Select show" />
                      </SelectTrigger>
                      <SelectContent className="story-creator__select-content">
                        <SelectItem value="Stranger Things">Stranger Things</SelectItem>
                        <SelectItem value="Bridgerton">Bridgerton</SelectItem>
                        <SelectItem value="Squid Game">Squid Game</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="story-creator__button-container">
                <Button
                  type="submit"
                  className="story-creator__submit-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="story-creator__button-icon story-creator__button-icon--spin" />
                      Generating Story...
                    </>
                  ) : (
                    <>
                      <Sparkles className="story-creator__button-icon" />
                      Generate Story
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="story-creator__card-footer">
            <p className="story-creator__footer-text">Your story will be generated based on these parameters</p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
