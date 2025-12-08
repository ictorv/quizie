import React, { useState, useEffect } from 'react';
import { RiQuestionnaireLine, RiHome3Line, RiRestartLine } from 'react-icons/ri';
import questionsData from './questions.json'; // ✅ Using external questions.json

const STORAGE_KEY = 'quiz_state_v1';

function App() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [quizType, setQuizType] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // restore state on first render
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) {
          setPlayerName(parsed.playerName ?? '');
          setQuizType(parsed.quizType ?? null);
          setCurrentQuestion(parsed.currentQuestion ?? 0);
          setShowResults(parsed.showResults ?? false);
          setScore(parsed.score ?? 0);
          setSelectedAnswers(parsed.selectedAnswers ?? []);
          setShowFeedback(parsed.showFeedback ?? false);
          setIsCorrect(parsed.isCorrect ?? false);
          setAnsweredQuestions(parsed.answeredQuestions ?? []);
          setTimeSpent(parsed.timeSpent ?? 0);
          setQuestionStartTime(Date.now());
        }
      }
    } catch (e) {
      console.error('Failed to load quiz state', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // persist state whenever it changes
  useEffect(() => {
    if (!isHydrated) return;
    const stateToSave = {
      playerName,
      quizType,
      currentQuestion,
      showResults,
      score,
      selectedAnswers,
      showFeedback,
      isCorrect,
      answeredQuestions,
      timeSpent,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [
    isHydrated,
    playerName,
    quizType,
    currentQuestion,
    showResults,
    score,
    selectedAnswers,
    showFeedback,
    isCorrect,
    answeredQuestions,
    timeSpent,
  ]);

  if (!isHydrated) {
    return null;
  }

  const allQuestions = questionsData.questions;
  const questions = quizType ? allQuestions.filter((q) => q.type === quizType) : [];

  const totalQuestions = questions.length;
  const currentQ = questions[currentQuestion] || {};
  const isMultiSelect = currentQ.type === 'multi';

  const handleAnswer = (answer) => {
    if (showFeedback) return;
    if (isMultiSelect) {
      setSelectedAnswers((prev) =>
        prev.includes(answer) ? prev.filter((a) => a !== answer) : [...prev, answer]
      );
    } else {
      setSelectedAnswers([answer]);
    }
  };

  const handleCheckAnswer = () => {
    if (selectedAnswers.length === 0) return;

    setShowFeedback(true);

    let correct = false;
    if (isMultiSelect) {
      const sortedSelected = [...selectedAnswers].sort();
      const sortedCorrect = [...currentQ.correctAnswer].sort();
      correct = JSON.stringify(sortedSelected) === JSON.stringify(sortedCorrect);
    } else {
      correct = selectedAnswers[0] === currentQ.correctAnswer;
    }

    setIsCorrect(correct);
    if (correct) {
      setScore((prev) => prev + 1);
    }

    // Track answered question with details
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
    setTimeSpent((prev) => prev + timeTaken);
    setAnsweredQuestions((prev) => [
      ...prev,
      {
        questionIndex: currentQuestion,
        question: currentQ.text,
        userAnswer: selectedAnswers,
        correctAnswer: currentQ.correctAnswer,
        isCorrect: correct,
        timeSpent: timeTaken,
      },
    ]);
  };

  const handleNext = () => {
    setSelectedAnswers([]);
    setShowFeedback(false);
    setQuestionStartTime(Date.now());

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleSubmitQuiz = () => {
    setShowFeedback(false);
    setShowResults(true);
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setShowResults(false);
    setScore(0);
    setSelectedAnswers([]);
    setShowFeedback(false);
    setAnsweredQuestions([]);
    setTimeSpent(0);
    setQuestionStartTime(Date.now());
  };

  const goHome = () => {
    setQuizType(null);
    setCurrentQuestion(0);
    setShowResults(false);
    setScore(0);
    setSelectedAnswers([]);
    setShowFeedback(false);
    setIsCorrect(false);
    setAnsweredQuestions([]);
    setTimeSpent(0);
  };

  const readableQuizType = () => {
    if (quizType === 'true_false') return 'TF';
    if (quizType === 'multiple_choice') return 'MCQ';
    if (quizType === 'multi') return 'MSQ';
    return '';
  };

  const ResultIcon = () => <RiQuestionnaireLine />;

  // Step 1: ask for full name
  if (!playerName) {
    return (
      <div style={styles.container}>
        <div style={styles.quizCard}>
          <h1 style={styles.resultsTitle}>Welcome to the Quiz</h1>
          <p style={{ marginBottom: '16px', color: '#6b7280' }}>
            Enter your full name to begin.
          </p>
          <input
            style={styles.nameInput}
            placeholder="Your full name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
        </div>
      </div>
    );
  }

  // Step 2: select quiz type
  if (!quizType) {
    return (
      <div style={styles.container}>
        <div style={styles.quizCard}>
          <h1 style={styles.resultsTitle}>Hello, {playerName}</h1>
          <p style={{ marginBottom: '20px', color: '#6c757d' }}>
            Choose a question type to start the quiz.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              style={styles.nextBtn}
              onClick={() => {
                setQuizType('true_false');
                setCurrentQuestion(0);
                setShowResults(false);
                setScore(0);
                setSelectedAnswers([]);
                setShowFeedback(false);
                setIsCorrect(false);
                setAnsweredQuestions([]);
                setTimeSpent(0);
                setQuestionStartTime(Date.now());
              }}
            >
              True / False
            </button>
            <button
              style={styles.nextBtn}
              onClick={() => {
                setQuizType('multiple_choice');
                setCurrentQuestion(0);
                setShowResults(false);
                setScore(0);
                setSelectedAnswers([]);
                setShowFeedback(false);
                setIsCorrect(false);
                setAnsweredQuestions([]);
                setTimeSpent(0);
                setQuestionStartTime(Date.now());
              }}
            >
              MCQ
            </button>
            <button
              style={styles.nextBtn}
              onClick={() => {
                setQuizType('multi');
                setCurrentQuestion(0);
                setShowResults(false);
                setScore(0);
                setSelectedAnswers([]);
                setShowFeedback(false);
                setIsCorrect(false);
                setAnsweredQuestions([]);
                setTimeSpent(0);
                setQuestionStartTime(Date.now());
              }}
            >
              MSQ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (showResults) {
    const percentage = totalQuestions
      ? Math.round((score / totalQuestions) * 100)
      : 0;

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    const avgTimePerQuestion = answeredQuestions.length
      ? Math.floor(timeSpent / answeredQuestions.length)
      : 0;

    return (
      <div style={styles.container}>
        <div style={styles.resultsCard}>
          <div style={styles.resultIcon}>
            <ResultIcon />
          </div>
          <h1 style={styles.resultsTitle}>Quiz Complete, {playerName}</h1>
          <div style={styles.scoreCircle}>
            <div style={styles.scoreNumber}>{score}</div>
            <div style={styles.scoreTotal}>/ {totalQuestions}</div>
          </div>
          <p style={styles.scorePercent}>{percentage}% Correct</p>

          {/* Stats Section */}
          <div style={styles.statsContainer}>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{formatTime(timeSpent)}</div>
              <div style={styles.statLabel}>Total Time</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{formatTime(avgTimePerQuestion)}</div>
              <div style={styles.statLabel}>Avg/Question</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{answeredQuestions.length}</div>
              <div style={styles.statLabel}>Answered</div>
            </div>
          </div>

          {/* Review Section */}
          {answeredQuestions.length > 0 && (
            <details style={styles.reviewSection}>
              <summary style={styles.reviewSummary}>📋 Review Answers</summary>
              <div style={styles.reviewList}>
                {answeredQuestions.map((q, idx) => (
                  <div key={idx} style={styles.reviewItem}>
                    <div style={styles.reviewHeader}>
                      <span style={q.isCorrect ? styles.correctBadge : styles.incorrectBadge}>
                        {q.isCorrect ? '✓' : '✗'}
                      </span>
                      <span style={styles.reviewQuestionNum}>Q{q.questionIndex + 1}</span>
                      <span style={styles.reviewTime}>{formatTime(q.timeSpent)}</span>
                    </div>
                    <div style={styles.reviewQuestion}>{q.question}</div>
                    <div style={styles.reviewAnswers}>
                      <div style={styles.reviewAnswerRow}>
                        <span style={styles.answerLabel}>Your answer:</span>
                        <span style={styles.answerValue}>
                          {Array.isArray(q.userAnswer)
                            ? q.userAnswer.join(', ')
                            : q.userAnswer}
                        </span>
                      </div>
                      {!q.isCorrect && (
                        <div style={styles.reviewAnswerRow}>
                          <span style={styles.answerLabel}>Correct:</span>
                          <span style={{...styles.answerValue, color: '#16a34a'}}>
                            {Array.isArray(q.correctAnswer)
                              ? q.correctAnswer.join(', ')
                              : q.correctAnswer}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
            <button style={styles.restartBtn} onClick={restartQuiz}>
              <RiRestartLine style={{ marginRight: 6 }} />
              Restart Same Quiz
            </button>
            <button style={styles.restartBtn} onClick={goHome}>
              <RiHome3Line style={{ marginRight: 6 }} />
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz screen
  return (
    <div style={styles.container}>
      <div style={styles.quizCard}>
        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <RiQuestionnaireLine />
          </div>
          <div style={styles.headerInfo}>
            <div style={styles.questionCounter}>
              {playerName} • {readableQuizType()} • Question {currentQuestion + 1} of{' '}
              {totalQuestions}
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <button style={styles.backBtn} onClick={goHome}>
              <RiHome3Line style={{ marginRight: 6 }} />
              Home
            </button>
          </div>
        </div>

        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
            }}
          />
        </div>

        <h2 style={styles.questionText}>{currentQ.text}</h2>

        {isMultiSelect && (
          <div style={styles.multiSelectHint}>Select all that apply</div>
        )}

        <div style={styles.optionsContainer}>
          {currentQ.options?.map((option, index) => {
            let buttonStyle = { ...styles.optionBtn };

            if (showFeedback) {
              if (isMultiSelect) {
                if (currentQ.correctAnswer.includes(option)) {
                  buttonStyle = { ...buttonStyle, ...styles.correctOption };
                } else if (selectedAnswers.includes(option)) {
                  buttonStyle = { ...buttonStyle, ...styles.wrongOption };
                } else {
                  buttonStyle = { ...buttonStyle, ...styles.disabledOption };
                }
              } else {
                if (option === currentQ.correctAnswer) {
                  buttonStyle = { ...buttonStyle, ...styles.correctOption };
                } else if (selectedAnswers.includes(option)) {
                  buttonStyle = { ...buttonStyle, ...styles.wrongOption };
                } else {
                  buttonStyle = { ...buttonStyle, ...styles.disabledOption };
                }
              }
            } else if (selectedAnswers.includes(option)) {
              buttonStyle = { ...buttonStyle, ...styles.selectedOption };
            }

            return (
              <button
                key={index}
                style={buttonStyle}
                onClick={() => handleAnswer(option)}
                disabled={showFeedback}
              >
                <span style={styles.optionIcon}>
                  {isMultiSelect
                    ? selectedAnswers.includes(option)
                      ? '✓'
                      : '□'
                    : String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div style={styles.feedbackCard}>
            <div style={styles.feedbackHeader}>
              <span style={styles.feedbackIcon}>{isCorrect ? '✔' : '✖'}</span>
              <span style={isCorrect ? styles.correctText : styles.incorrectText}>
                {isCorrect ? 'Correct' : 'Incorrect'}
              </span>
            </div>

            {!isCorrect && (
              <div style={styles.correctAnswerBox}>
                <div style={styles.correctLabel}>Correct Answer</div>
                <div style={styles.correctAnswer}>
                  {isMultiSelect ? (
                    currentQ.correctAnswer.map((answer, idx) => (
                      <div key={idx} style={styles.correctAnswerItem}>
                        • {answer}
                      </div>
                    ))
                  ) : (
                    currentQ.correctAnswer
                  )}
                </div>
              </div>
            )}

            <button style={styles.nextBtn} onClick={handleNext}>
              {currentQuestion === totalQuestions - 1 ? 'See Results' : 'Next Question →'}
            </button>
          </div>
        )}

        {!showFeedback && (
          <div style={styles.controls}>
            {currentQuestion > 0 && (
              <button
                style={styles.backBtn}
                onClick={() => {
                  setCurrentQuestion(currentQuestion - 1);
                  setSelectedAnswers([]);
                }}
              >
                ← Back
              </button>
            )}

            <div style={{ flex: 1 }} />

            <button style={styles.backBtn} onClick={handleSubmitQuiz}>
              Submit Quiz
            </button>

            {selectedAnswers.length > 0 && (
              <button style={styles.checkBtn} onClick={handleCheckAnswer}>
                Check Answer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// All styles remain exactly the same as before
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: '#f3f4f6',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  quizCard: {
    width: '100%',
    maxWidth: '640px',
    background: 'linear-gradient(145deg, #ffffff, #f9fafb)',
    borderRadius: '18px',
    padding: '30px',
    boxShadow: '0 18px 45px rgba(15, 23, 42, 0.12)',
    border: '1px solid #e5e7eb',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  headerIcon: {
    fontSize: '28px',
    color: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  questionCounter: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: 500,
  },
  progressBar: {
    height: '6px',
    background: '#e5e7eb',
    borderRadius: '999px',
    overflow: 'hidden',
    marginBottom: '30px',
  },
  progressFill: {
    height: '100%',
    background: '#2563eb',
    borderRadius: '999px',
    transition: 'width 0.5s ease',
  },
  questionText: {
    fontSize: '22px',
    fontWeight: 600,
    color: '#111827',
    marginBottom: '20px',
    lineHeight: 1.4,
  },
  multiSelectHint: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '20px',
    padding: '8px 12px',
    background: '#f9fafb',
    borderRadius: '8px',
    border: '1px dashed #d1d5db',
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '25px',
  },
  optionBtn: {
    padding: '16px 20px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    background: '#ffffff',
    fontSize: '16px',
    color: '#111827',
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.2s ease',
  },
  selectedOption: {
    borderColor: '#2563eb',
    background: '#eff6ff',
    color: '#1d4ed8',
  },
  correctOption: {
    borderColor: '#16a34a',
    background: '#ecfdf3',
    color: '#15803d',
  },
  wrongOption: {
    borderColor: '#dc2626',
    background: '#fef2f2',
    color: '#b91c1c',
  },
  disabledOption: {
    opacity: 0.55,
    cursor: 'not-allowed',
  },
  optionIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: '14px',
    background: '#f3f4f6',
    flexShrink: 0,
  },
  feedbackCard: {
    padding: '20px',
    background: '#f9fafb',
    borderRadius: '10px',
    marginTop: '20px',
    border: '1px solid #e5e7eb',
  },
  feedbackHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '15px',
    fontSize: '20px',
    fontWeight: 600,
  },
  feedbackIcon: {
    fontSize: '28px',
  },
  correctText: {
    color: '#16a34a',
  },
  incorrectText: {
    color: '#dc2626',
  },
  correctAnswerBox: {
    background: '#ecfdf3',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '15px',
    borderLeft: '4px solid #16a34a',
  },
  correctLabel: {
    fontSize: '12px',
    color: '#16a34a',
    fontWeight: 600,
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  correctAnswer: {
    fontSize: '16px',
    color: '#111827',
    fontWeight: 500,
  },
  correctAnswerItem: {
    padding: '4px 0',
  },
  controls: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  backBtn: {
    padding: '10px 18px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    background: '#ffffff',
    fontSize: '14px',
    fontWeight: 500,
    color: '#4b5563',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },
  checkBtn: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    background: '#2563eb',
    fontSize: '15px',
    fontWeight: 600,
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  nextBtn: {
    width: '100%',
    padding: '14px',
    border: 'none',
    borderRadius: '8px',
    background: '#2563eb',
    fontSize: '16px',
    fontWeight: 600,
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  resultsCard: {
    width: '100%',
    maxWidth: '500px',
    background: 'linear-gradient(145deg, #ffffff, #f9fafb)',
    borderRadius: '18px',
    padding: '50px 40px',
    textAlign: 'center',
    boxShadow: '0 18px 45px rgba(15, 23, 42, 0.12)',
    border: '1px solid #e5e7eb',
  },
  resultIcon: {
    fontSize: '52px',
    marginBottom: '20px',
    color: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsTitle: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#111827',
    marginBottom: '30px',
  },
  scoreCircle: {
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    background: '#2563eb',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
  },
  scoreNumber: {
    fontSize: '48px',
    fontWeight: 700,
    color: '#ffffff',
    lineHeight: 1,
  },
  scoreTotal: {
    fontSize: '24px',
    color: 'rgba(255,255,255,0.9)',
  },
  scorePercent: {
    fontSize: '20px',
    color: '#6b7280',
    marginBottom: '30px',
    fontWeight: 500,
  },
  restartBtn: {
    padding: '14px 32px',
    border: 'none',
    borderRadius: '8px',
    background: '#2563eb',
    fontSize: '16px',
    fontWeight: 600,
    color: '#ffffff',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },
  nameInput: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '15px',
    outline: 'none',
  },
  statsContainer: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    marginBottom: '25px',
  },
  statBox: {
    background: '#f9fafb',
    padding: '12px 20px',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    textAlign: 'center',
    minWidth: '90px',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#2563eb',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: 500,
  },
  reviewSection: {
    marginTop: '25px',
    marginBottom: '20px',
    textAlign: 'left',
    background: '#f9fafb',
    borderRadius: '10px',
    padding: '15px',
    border: '1px solid #e5e7eb',
  },
  reviewSummary: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#111827',
    cursor: 'pointer',
    userSelect: 'none',
    padding: '5px',
  },
  reviewList: {
    marginTop: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  reviewItem: {
    background: '#ffffff',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  reviewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  correctBadge: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: '#16a34a',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  incorrectBadge: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: '#dc2626',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  reviewQuestionNum: {
    fontWeight: 600,
    color: '#6b7280',
    fontSize: '14px',
    marginLeft: 'auto',
  },
  reviewTime: {
    fontSize: '12px',
    color: '#9ca3af',
    fontWeight: 500,
  },
  reviewQuestion: {
    fontSize: '15px',
    color: '#374151',
    marginBottom: '12px',
    lineHeight: 1.5,
  },
  reviewAnswers: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  reviewAnswerRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  },
  answerLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#6b7280',
    minWidth: '80px',
  },
  answerValue: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#111827',
    flex: 1,
  },
};

export default App;
