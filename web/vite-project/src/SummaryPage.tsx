"use client"
import React, { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from 'react-router-dom'
import { Button } from "./Components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./Components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Components/Tabs"
import { BookOpen, ChevronLeft, FileText, HelpCircle, MessageSquare } from "lucide-react"
import "./Components/SummaryPage.scss"

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
    <div className="summary-page">
      <div className="summary-page__container">
        <div className="summary-page__header">
          <button className="btn btn--outline" onClick={() => navigate(-1)}>
            <ChevronLeft className="icon" />
          </button>
          <motion.h1
            className="summary-page__header-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Story Complete: Financial Adventure
          </motion.h1>
        </div>

        <div className="summary-page__grid">
          <div className="summary-page__main">
            <div className="summary-page__tabs">
              <div className="summary-page__tabs-list">
                <button className="summary-page__tabs-trigger summary-page__tabs-trigger--active">Concept Summary</button>
                <button className="summary-page__tabs-trigger">Flowchart</button>
              </div>

              <div className="summary-page__card">
                <div className="summary-page__card-header">
                  <h2>Emergency Funds</h2>
                  <p>Key financial concept from your story</p>
                </div>
                <div className="summary-page__card-content">
                  <div className="summary-page__concept">
                    <div className="summary-page__concept-image">
                      <img src="/placeholder.svg" alt="Emergency Fund" />
                    </div>
                    <div className="summary-page__concept-intro">
                      <h3>What is an Emergency Fund?</h3>
                      <p>A financial safety net for unexpected expenses</p>
                    </div>
                  </div>

                  <div className="summary-page__points">
                    <h4>Key Points</h4>
                    <ul className="key-points">
                      <li>An emergency fund should cover 3-6 months of essential expenses</li>
                      <li>Keep your emergency fund in a liquid, easily accessible account</li>
                      <li>High-yield savings accounts are ideal for emergency funds</li>
                      <li>Start small and build up your emergency fund over time</li>
                      <li>Only use your emergency fund for true emergencies</li>
                    </ul>

                    <h4>Benefits</h4>
                    <ul className="benefits">
                      <li>Provides financial security during unexpected situations</li>
                      <li>Reduces the need to rely on high-interest debt</li>
                      <li>Gives you peace of mind and reduces financial stress</li>
                      <li>Allows you to focus on long-term financial goals</li>
                    </ul>

                    <h4>Real-World Application</h4>
                    <p>In the story, MJ used her emergency fund when she lost her job. This gave her time to find the right opportunity without having to take the first job that came along or go into debt.</p>
                  </div>
                </div>
                <div className="summary-page__card-footer">
                  <button className="btn btn--primary" onClick={() => navigate("/quiz")}>
                    <FileText className="icon" /> Take the Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="summary-page__sidebar">
            <div className="summary-page__card">
              <div className="summary-page__card-header">
                <h2>Need Help?</h2>
                <p>Get assistance with financial concepts</p>
              </div>
              <div className="summary-page__chat">
                {showChat ? (
                  <div className="summary-page__chat-container">
                    <div className="summary-page__chat-messages">
                      {chatHistory.length === 0 ? (
                        <div className="summary-page__chat-empty">
                          <MessageSquare className="icon floating-icon" />
                          <p>Ask your personal tutor about emergency funds</p>
                        </div>
                      ) : (
                        chatHistory.map((msg, i) => (
                          <div
                            key={i}
                            className={`summary-page__chat-message ${
                              msg.role === "user" ? "message-user" : "message-assistant"
                            }`}
                          >
                            {msg.content}
                          </div>
                        ))
                      )}
                    </div>
                    <form onSubmit={handleSendMessage} className="summary-page__chat-input">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Ask about emergency funds..."
                      />
                      <button type="submit" className="btn btn--icon">
                        <svg viewBox="0 0 24 24" className="icon">
                          <path d="m22 2-7 20-4-9-9-4Z" />
                          <path d="M22 2 11 13" />
                        </svg>
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="summary-page__chat-welcome">
                    <HelpCircle className="icon floating-icon" />
                    <h3>Have Questions?</h3>
                    <p>Chat with your personal tutor to learn more about emergency funds and financial planning.</p>
                    <button className="btn btn--primary" onClick={() => setShowChat(true)}>
                      <MessageSquare className="icon" /> Chat with Tutor
                    </button>
                  </div>
                )}
              </div>
              <div className="summary-page__card-footer">
                <button className="btn btn--outline" onClick={() => navigate("/library")}>
                  <BookOpen className="icon" /> Back to Library
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
