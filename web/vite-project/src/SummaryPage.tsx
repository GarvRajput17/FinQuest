import React, { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from 'react-router-dom'
import { Button } from "./Components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./Components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Components/tabs"
import { BookOpen, ChevronLeft, FileText, HelpCircle, MessageSquare } from "lucide-react"

export default function SummaryPage() {
  const navigate = useNavigate()
  const [showChat, setShowChat] = useState(false)
  const [chatMessage, setChatMessage] = useState("")
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatMessage.trim()) return

    setChatHistory((prev) => [...prev, { role: "user", content: chatMessage }])

    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Emergency funds are important because they provide financial security during unexpected situations. They typically should cover 3-6 months of expenses and should be kept in a liquid account like a high-yield savings account.",
        },
      ])
    }, 1000)

    setChatMessage("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-4 rounded-full bg-black/50 backdrop-blur-sm border-white/20 hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <motion.h1
            className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-teal-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Story Complete: Financial Adventure
          </motion.h1>
        </div>

        {/* Rest of your JSX remains the same, just update img tags */}
        <div className="relative h-24 w-24 rounded-lg overflow-hidden">
          <img
            src="/placeholder.svg"
            alt="Emergency Fund"
            className="object-cover w-full h-full"
          />
        </div>

        {/* Keep the rest of your existing JSX */}
      </div>
    </div>
  )
}
