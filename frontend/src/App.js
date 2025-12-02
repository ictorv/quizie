import React, { useState } from 'react';
import questionsData from './questions.json';

function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const questions = questionsData.questions;
  const totalQuestions = questions.length;
  const currentQ = questions[currentQuestion];
  const isMultiSelect = currentQ.type === 'multi';

  const handleAnswer = (answer) => {
    if (showFeedback) return;
    
    if (isMultiSelect) {
      setSelectedAnswers(prev => {
        if (prev.includes(answer)) {
          return prev.filter(a => a !== answer);
        } else {
          return [...prev, answer];
        }
      });
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
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedAnswers([]);
    setShowFeedback(false);
    
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setShowResults(false);
    setScore(0);
    setSelectedAnswers([]);
    setShowFeedback(false);
  };

  if (showResults) {
    const percentage = Math.round((score / totalQuestions) * 100);
    
    return (
      <div style={styles.container}>
        <div style={styles.resultsCard}>
          <div style={styles.resultIcon}>
            {percentage >= 70 ? '🎉' : percentage >= 50 ? '👍' : '📚'}
          </div>
          <h1 style={styles.resultsTitle}>Quiz Complete!</h1>
          <div style={styles.scoreCircle}>
            <div style={styles.scoreNumber}>{score}</div>
            <div style={styles.scoreTotal}>/ {totalQuestions}</div>
          </div>
          <p style={styles.scorePercent}>{percentage}% Correct</p>
          <button style={styles.restartBtn} onClick={restartQuiz}>
            🔄 Take Quiz Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.quizCard}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerIcon}>📝</div>
          <div style={styles.questionCounter}>
            Question {currentQuestion + 1} of {totalQuestions}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={styles.progressBar}>
          <div style={{
            ...styles.progressFill,
            width: `${((currentQuestion + 1) / totalQuestions) * 100}%`
          }} />
        </div>

        {/* Question */}
        <h2 style={styles.questionText}>{currentQ.text}</h2>
        
        {isMultiSelect && (
          <div style={styles.multiSelectHint}>
            💡 Select all that apply
          </div>
        )}

        {/* Options */}
        <div style={styles.optionsContainer}>
          {currentQ.options.map((option, index) => {
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
            } else {
              if (selectedAnswers.includes(option)) {
                buttonStyle = { ...buttonStyle, ...styles.selectedOption };
              }
            }
            
            return (
              <button
                key={index}
                style={buttonStyle}
                onClick={() => handleAnswer(option)}
                disabled={showFeedback}
              >
                <span style={styles.optionIcon}>
                  {isMultiSelect ? (
                    selectedAnswers.includes(option) ? '✓' : '□'
                  ) : (
                    String.fromCharCode(65 + index)
                  )}
                </span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div style={styles.feedbackCard}>
            <div style={styles.feedbackHeader}>
              <span style={styles.feedbackIcon}>
                {isCorrect ? '✅' : '❌'}
              </span>
              <span style={isCorrect ? styles.correctText : styles.incorrectText}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </span>
            </div>
            
            {!isCorrect && (
              <div style={styles.correctAnswerBox}>
                <div style={styles.correctLabel}>Correct Answer:</div>
                <div style={styles.correctAnswer}>
                  {isMultiSelect ? (
                    currentQ.correctAnswer.map((answer, idx) => (
                      <div key={idx} style={styles.correctAnswerItem}>• {answer}</div>
                    ))
                  ) : (
                    currentQ.correctAnswer
                  )}
                </div>
              </div>
            )}
            
            <button style={styles.nextBtn} onClick={handleNext}>
              {currentQuestion === totalQuestions - 1 ? 'See Results 🎯' : 'Next Question →'}
            </button>
          </div>
        )}

        {/* Controls */}
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
            
            {selectedAnswers.length > 0 && (
              <button style={styles.checkBtn} onClick={handleCheckAnswer}>
                Check Answer ✓
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: '#f8f9fa',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  quizCard: {
    width: '100%',
    maxWidth: '600px',
    background: 'white',
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #e9ecef',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  headerIcon: {
    fontSize: '28px',
  },
  questionCounter: {
    fontSize: '14px',
    color: '#6c757d',
    fontWeight: '500',
  },
  progressBar: {
    height: '6px',
    background: '#e9ecef',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '30px',
  },
  progressFill: {
    height: '100%',
    background: '#4a90e2',
    borderRadius: '10px',
    transition: 'width 0.5s ease',
  },
  questionText: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#212529',
    marginBottom: '20px',
    lineHeight: '1.4',
  },
  multiSelectHint: {
    fontSize: '13px',
    color: '#6c757d',
    marginBottom: '20px',
    padding: '8px 12px',
    background: '#f8f9fa',
    borderRadius: '8px',
    border: '1px dashed #dee2e6',
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '25px',
  },
  optionBtn: {
    padding: '16px 20px',
    border: '2px solid #e9ecef',
    borderRadius: '10px',
    background: 'white',
    fontSize: '16px',
    color: '#212529',
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.2s ease',
  },
  selectedOption: {
    borderColor: '#4a90e2',
    background: '#f0f7ff',
    color: '#4a90e2',
  },
  correctOption: {
    borderColor: '#28a745',
    background: '#f1f9f3',
    color: '#28a745',
  },
  wrongOption: {
    borderColor: '#dc3545',
    background: '#fff5f5',
    color: '#dc3545',
  },
  disabledOption: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  optionIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '14px',
    background: '#f8f9fa',
    flexShrink: 0,
  },
  feedbackCard: {
    padding: '20px',
    background: '#f8f9fa',
    borderRadius: '10px',
    marginTop: '20px',
    border: '1px solid #e9ecef',
  },
  feedbackHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '15px',
    fontSize: '20px',
    fontWeight: '600',
  },
  feedbackIcon: {
    fontSize: '32px',
  },
  correctText: {
    color: '#28a745',
  },
  incorrectText: {
    color: '#dc3545',
  },
  correctAnswerBox: {
    background: '#f1f9f3',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '15px',
    borderLeft: '4px solid #28a745',
  },
  correctLabel: {
    fontSize: '12px',
    color: '#28a745',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  correctAnswer: {
    fontSize: '16px',
    color: '#212529',
    fontWeight: '500',
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
    padding: '12px 20px',
    border: '2px solid #e9ecef',
    borderRadius: '8px',
    background: 'white',
    fontSize: '15px',
    fontWeight: '500',
    color: '#6c757d',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  checkBtn: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    background: '#4a90e2',
    fontSize: '15px',
    fontWeight: '600',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  nextBtn: {
    width: '100%',
    padding: '14px',
    border: 'none',
    borderRadius: '8px',
    background: '#4a90e2',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  resultsCard: {
    width: '100%',
    maxWidth: '500px',
    background: 'white',
    borderRadius: '16px',
    padding: '50px 40px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #e9ecef',
  },
  resultIcon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  resultsTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#212529',
    marginBottom: '30px',
  },
  scoreCircle: {
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    background: '#4a90e2',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)',
  },
  scoreNumber: {
    fontSize: '48px',
    fontWeight: '700',
    color: 'white',
    lineHeight: '1',
  },
  scoreTotal: {
    fontSize: '24px',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  scorePercent: {
    fontSize: '20px',
    color: '#6c757d',
    marginBottom: '30px',
    fontWeight: '500',
  },
  restartBtn: {
    padding: '14px 32px',
    border: 'none',
    borderRadius: '8px',
    background: '#4a90e2',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

export default App;