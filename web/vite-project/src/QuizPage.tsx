"use client"
import React, { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from 'react-router-dom'
import { Button } from "./Components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./Components/card"
import { RadioGroup, RadioGroupItem } from "./Components/radio-group"
import { Label } from "./Components/label"
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle } from "lucide-react"

interface Question {
  id: number
  text: string
  options: string[]
  correctAnswer: number
}

export default function QuizPage() {
  const navigate = useNavigate()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)

  const questions: Question[] = [
    {
      id: 1,
      text: "How many months of expenses should an emergency fund typically cover?",
      options: ["1 month", "3-6 months", "12 months", "24 months"],
      correctAnswer: 1,
    },
    {
      id: 2,
      text: "Which of the following is the best place to keep an emergency fund?",
      options: ["Under your mattress", "In stocks", "In a high-yield savings account", "In cryptocurrency"],
      correctAnswer: 2,
    },
    {
      id: 3,
      text: "What is NOT considered a good use of emergency funds?",
      options: ["Medical emergency", "Car repair", "Vacation", "Job loss"],
      correctAnswer: 2,
    },
    {
      id: 4,
      text: "Why is having an emergency fund important?",
      options: [
        "To make large purchases",
        "To avoid high-interest debt during emergencies",
        "To invest in the stock market",
        "To impress friends",
      ],
      correctAnswer: 1,
    },
    {
      id: 5,
      text: "What's a good strategy for building an emergency fund?",
      options: [
        "Put all your savings in at once",
        "Wait until you have a high-paying job",
        "Start small and contribute regularly",
        "Borrow money to fund it quickly",
      ],
      correctAnswer: 2,
    },
  ]

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return
    setSelectedOption(index)
  }

  const handleCheckAnswer = () => {
    if (selectedOption === null) return

    setIsAnswered(true)
    if (selectedOption === questions[currentQuestion].correctAnswer) {
      setScore(score + 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedOption(null)
      setIsAnswered(false)
    } else {
      setQuizCompleted(true)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setSelectedOption(null)
      setIsAnswered(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/summary")}
            className="mr-4 rounded-full bg-black/50 backdrop-blur-sm border-white/20 hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <motion.h1
            className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-teal-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Financial Concepts Quiz
          </motion.h1>
        </div>

        {!quizCompleted ? (
          <Card className="border-white/10 bg-black/50 backdrop-blur-md shadow-[0_0_25px_rgba(124,58,237,0.3)]">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white text-xl">
                  Question {currentQuestion + 1} of {questions.length}
                </CardTitle>
                <span className="text-white/70">
                  Score: {score}/{currentQuestion}
                </span>
              </div>
              <CardDescription>Test your knowledge about emergency funds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <h3 className="text-xl font-medium text-white">{questions[currentQuestion].text}</h3>

                <RadioGroup value={selectedOption?.toString()}>
                  {questions[currentQuestion].options.map((option, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-2 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedOption === index
                          ? isAnswered
                            ? index === questions[currentQuestion].correctAnswer
                              ? "bg-green-500/20 border border-green-500/50"
                              : "bg-red-500/20 border border-red-500/50"
                            : "bg-purple-500/20 border border-purple-500/50"
                          : "hover:bg-white/5 border border-white/10"
                      }`}
                      onClick={() => handleOptionSelect(index)}
                    >
                      <RadioGroupItem
                        value={index.toString()}
                        id={`option-${index}`}
                        checked={selectedOption === index}
                        className="text-white"
                      />
                      <Label htmlFor={`option-${index}`} className="text-white flex-1">
                        {option}
                      </Label>
                      {isAnswered &&
                        (index === questions[currentQuestion].correctAnswer ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          selectedOption === index && <XCircle className="h-5 w-5 text-red-500" />
                        ))}
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter className="border-t border-white/10 pt-4 flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
                className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>

              {!isAnswered ? (
                <Button
                  onClick={handleCheckAnswer}
                  disabled={selectedOption === null}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
                >
                  Check Answer
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {currentQuestion < questions.length - 1 ? "Next Question" : "See Results"}{" "}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        ) : (
          <Card className="border-white/10 bg-black/50 backdrop-blur-md shadow-[0_0_25px_rgba(124,58,237,0.3)]">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Quiz Complete!</CardTitle>
              <CardDescription>Your final score</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <div className="mb-6">
                <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-teal-400 bg-clip-text text-transparent mb-2">
                  {score}/{questions.length}
                </div>
                <p className="text-white/70">
                  {score === questions.length
                    ? "Perfect score! You're a financial expert!"
                    : score >= questions.length * 0.7
                    ? "Great job! You have a solid understanding of emergency funds."
                    : "Good effort! Review the concepts and try again."}
                </p>
              </div>

              <div className="w-full max-w-xs mx-auto bg-black/30 rounded-full h-4 mb-8">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full"
                  style={{ width: `${(score / questions.length) * 100}%` }}
                ></div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-white/10 pt-4 flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentQuestion(0)
                  setSelectedOption(null)
                  setIsAnswered(false)
                  setScore(0)
                  setQuizCompleted(false)
                }}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Retry Quiz
              </Button>
              <Button
                onClick={() => navigate("/summary")}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Back to Summary
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
