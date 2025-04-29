import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import "./styles/QuizPage.scss";

interface QuizOption {
  text: string;
  is_correct: boolean;
}

interface QuizQuestion {
  question: string;
  options: QuizOption[];
  explanation: string;
}

interface Quiz {
  topic: string;
  difficulty: string;
  age_group: string;
  questions: QuizQuestion[];
}

export default function QuizPage() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/latest-story')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.story.quiz) {
          setQuiz(data.story.quiz);
        }
      })
      .catch(err => console.error('Error fetching quiz:', err));
  }, []);

  if (!quiz) return <div className="quiz-container">Loading quiz...</div>;

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswered(true);
    if (quiz.questions[currentQuestion].options[selectedOption].is_correct) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
  };

  return (
    <div className="quiz-container">
      <div className="quiz-content">
        <motion.div 
          className="quiz-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button className="back-button" onClick={() => navigate("/summary")}>
            <ChevronLeft />
          </button>
          <h1 className="quiz-title">Financial Concepts Quiz</h1>
        </motion.div>

        {!quizCompleted ? (
          <motion.div 
            className="quiz-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="quiz-card__header">
              <div className="quiz-progress">
                <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
                <span className="quiz-score">Score: {score}/{currentQuestion}</span>
              </div>
              <div className="quiz-topic">{quiz.topic}</div>
            </div>

            <div className="quiz-card__content">
              <h3 className="question-text">{quiz.questions[currentQuestion].question}</h3>

              <div className="options-grid">
                {quiz.questions[currentQuestion].options.map((option, index) => (
                  <div
                    key={index}
                    className={`option-item ${selectedOption === index ? 'selected' : ''} 
                              ${isAnswered ? (option.is_correct ? 'correct' : 'incorrect') : ''}`}
                    onClick={() => handleOptionSelect(index)}
                  >
                    <span className="option-text">{option.text}</span>
                    {isAnswered && (option.is_correct ? 
                      <CheckCircle2 className="icon-correct" /> : 
                      selectedOption === index && <XCircle className="icon-incorrect" />
                    )}
                  </div>
                ))}
              </div>

              {isAnswered && selectedOption !== null && !quiz.questions[currentQuestion].options[selectedOption].is_correct && (
  <div className="explanation">
    <p>{quiz.questions[currentQuestion].explanation}</p>
  </div>
)}

            </div>

            <div className="quiz-card__footer">
              <button 
                className="nav-button previous"
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
              >
                <ChevronLeft /> Previous
              </button>

              {!isAnswered ? (
                <button
                  className="check-button"
                  onClick={handleCheckAnswer}
                  disabled={selectedOption === null}
                >
                  Check Answer
                </button>
              ) : (
                <button
                  className="next-button"
                  onClick={handleNextQuestion}
                >
                  {currentQuestion < quiz.questions.length - 1 ? "Next Question" : "See Results"}
                  <ChevronRight />
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="quiz-card results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="results-content">
              <h2>Quiz Complete!</h2>
              <div className="score-display">
                <div className="final-score">{score}/{quiz.questions.length}</div>
                <div className="score-message">
                  {score === quiz.questions.length ? "Perfect score! You're a financial expert!" :
                   score >= quiz.questions.length * 0.7 ? "Great job! You have a solid understanding." :
                   "Good effort! Review the concepts and try again."}
                </div>
              </div>

              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${(score / quiz.questions.length) * 100}%` }}
                />
              </div>

              <div className="action-buttons">
                <button className="retry-button" onClick={resetQuiz}>
                  Retry Quiz
                </button>
                <button className="summary-button" onClick={() => navigate("/summary")}>
                  Back to Summary
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
