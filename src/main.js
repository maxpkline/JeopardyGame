let triviaData;
let correctAnswer = ''; // Store the correct answer for the current question
let score = 0; // Initialize the player's score
let round = 1;
let singleJeopardyAnswers = [];
let doubleJeopardyAnswers = [];

document.addEventListener('DOMContentLoaded', () => {
  updateScoreDisplay();

  // Limit category selection to 5
  const checkboxes = document.querySelectorAll('input[name="category-selection"]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', handleCategorySelection);
  });
});

function handleCategorySelection(event) {
  const selectedCheckboxes = document.querySelectorAll('input[name="category-selection"]:checked');

  if (selectedCheckboxes.length > 5) {
    // Uncheck the first selected checkbox if more than 5 are checked
    selectedCheckboxes[0].checked = false;
  }
}

function getSelectedCategories(allCategories) {
  let selectedCategories = [];
  document.querySelectorAll('input[name="category-selection"]:checked').forEach(checkbox => {
    console.log(checkbox.value);
    selectedCategories.push(checkbox.value);
  });

  // Add random categories if fewer than 5 are selected
  while (selectedCategories.length < 5) {
    const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)];
    if (!selectedCategories.includes(randomCategory)) {
      selectedCategories.push(randomCategory);
    }
  }

  return selectedCategories;
}

// Function to start the game
function startGame() {
  document.getElementById('start-menu').style.display = 'none';
  document.getElementById('single-round').style.display = 'block';
  document.body.style.backgroundImage = 'url("public/singleroundtest1.png")';
  setupGameBoard(triviaData, 1); // Pass round 1 for normal point values
}

// Function to start Double Jeopardy
function startDoubleJeopardy() {
  round = 2;
  document.getElementById('single-round').style.display = 'none';
  document.getElementById('double-round').style.display = 'block';
  setupGameBoard(triviaData, 2); // Pass round 2 for double point values
  console.log('Double Jeopardy started, round:', round);
}


// Function to show the final score
function showFinalScore(singleJeopardyResults, doubleJeopardyResults) {
  document.getElementById('double-round').style.display = 'none';
  document.getElementById('final-screen').style.display = 'block';

  const allResults = [...singleJeopardyResults, ...doubleJeopardyResults];

  // Calculate statistics
  const totalQuestionsAnswered = allResults.length;
  const correctAnswers = allResults.filter(result => result.isCorrect).length;
  const totalPointsEarned = allResults.reduce((sum, result) => sum + result.pointsEarned, 0);

  document.getElementById('final-score-display').textContent = `Your Total Score: $${totalPointsEarned}`;

  // Group results by category
  const categoryStats = allResults.reduce((stats, result) => {
    if (!stats[result.category]) {
      stats[result.category] = {
        correct: 0,
        total: 0,
        points: 0
      };
    }
    stats[result.category].total++;
    if (result.isCorrect) {
      stats[result.category].correct++;
    }
    stats[result.category].points += result.pointsEarned;
    return stats;
  }, {});

  // Create container for category statistics
  const overallStatsContainer = document.createElement('div');
    overallStatsContainer.className = 'category-stats';
    overallStatsContainer.style.width = '65%';
  const statsContainer = document.createElement('div');
  statsContainer.className = 'category-stats';

  // Add overall statistics
  const overallStats = document.createElement('div');
  const overallStatsTitle = document.createElement('h2');
  overallStatsTitle.textContent = 'Overall Performance';
  overallStatsTitle.className = 'overall-game-stats-title';
  overallStats.className = 'overall-game-stats';

  // Calculate most/least accurate and points-earning categories
  const mostAccurateCategory = Object.entries(categoryStats).reduce(
      (max, [category, stats]) => (stats.correct / stats.total > max.accuracy ? { category, accuracy: stats.correct / stats.total } : max),
      { category: null, accuracy: 0 }
  );

  const leastAccurateCategory = Object.entries(categoryStats).reduce(
      (min, [category, stats]) => (stats.correct / stats.total < min.accuracy ? { category, accuracy: stats.correct / stats.total } : min),
      { category: null, accuracy: Infinity }
  );

  const topPointsCategory = Object.entries(categoryStats).reduce(
      (max, [category, stats]) => (stats.points > max.points ? { category, points: stats.points } : max),
      { category: null, points: 0 }
  );

  const leastPointsCategory = Object.entries(categoryStats).reduce(
      (min, [category, stats]) => (stats.points < min.points ? { category, points: stats.points } : min),
      { category: null, points: Infinity }
  );

  overallStats.innerHTML = `
  <div class="overall-stats-column">
    <p>Questions Answered: ${totalQuestionsAnswered}</p>
    <p>Correct Answers: ${correctAnswers}</p>
    <p>Accuracy: ${Math.round((correctAnswers / totalQuestionsAnswered) * 100)}%</p>
    <p>Total Points: ${totalPointsEarned}</p>
  </div>
  <div class="overall-stats-column">
    <p>Most Accurate Category: ${mostAccurateCategory.category || 'N/A'} (${Math.round(mostAccurateCategory.accuracy * 100)}%)</p>
    <p>Least Accurate Category: ${leastAccurateCategory.category || 'N/A'} (${Math.round(leastAccurateCategory.accuracy * 100)}%)</p>
    <p>Top Points-Earning Category: ${topPointsCategory.category || 'N/A'} ($${topPointsCategory.points})</p>
    <p>Least Points-Earning Category: ${leastPointsCategory.category || 'N/A'} ($${leastPointsCategory.points})</p>
  </div>
`;
    overallStatsContainer.appendChild(overallStatsTitle);
    overallStatsContainer.appendChild(overallStats);

  // Adding individual category statistics
  Object.entries(categoryStats).forEach(([category, stats]) => {
    const categoryDiv = document.createElement('div');
    const categoryTitle = document.createElement('h2');
    categoryTitle.className = 'category-stat-title';
    categoryTitle.textContent = category;
    categoryDiv.className = 'category-stat';

    // Calculate accuracy percentage
    const accuracy = Math.round((stats.correct / stats.total) * 100);

    categoryDiv.innerHTML = `
      <p>Correct: ${stats.correct}/${stats.total}</p>
      <p>Accuracy: ${accuracy}%</p>
      <p>Points Earned: ${stats.points}</p>
    `;

    // Add color coding based on performance
    if (accuracy >= 80) {
      categoryTitle.style.backgroundColor = '#00ff00'; // Bright green for excellent
    } else if (accuracy >= 60) {
      categoryTitle.style.backgroundColor = '#ffff00'; // Yellow for good
    } else {
      categoryTitle.style.backgroundColor = '#ff6b6b'; // Light red for needs improvement
    }

    statsContainer.appendChild(categoryTitle);
    statsContainer.appendChild(categoryDiv);
  });

  // Add the stats container to the final screen
  const finalScreen = document.getElementById('final-screen');

  // Clear any existing stats first
  const existingStats = finalScreen.querySelector('.category-stats');
  if (existingStats) {
    existingStats.remove();
  }

  // Append the updated stats container first
  finalScreen.appendChild(overallStatsContainer);
  finalScreen.appendChild(statsContainer);

  // Find existing chart container or create new one
  let chartContainer = finalScreen.querySelector('.chart-container');
  const correctAnswersPerCategory = Object.keys(categoryStats).map(cat => categoryStats[cat].correct);
  chartContainer = createPerformanceChart(categoryStats, correctAnswersPerCategory, chartContainer);

  // Ensure chart container is appended after stats
  if (chartContainer) {
    finalScreen.appendChild(chartContainer); // Appending ensures proper placement
  }

  // Log game statistics
  console.log('Game Statistics:', {
    totalQuestionsAnswered,
    correctAnswers,
    totalPointsEarned,
    categoryStats
  });
}

// Function to create the final score page performance chart
function createPerformanceChart(categoryStats, correctAnswers, existingContainer = null) {
  // Use existing container or create new one
  const chartContainer = existingContainer || document.createElement('div');
  if (!existingContainer) {
    chartContainer.className = 'chart-container';
    chartContainer.style.width = '80%';
    chartContainer.style.margin = '20px auto';
  }

  // Clear any existing content
  chartContainer.innerHTML = '';

  const canvas = document.createElement('canvas');
  canvas.id = 'statisticsChart';
  chartContainer.appendChild(canvas);

  const categories = Object.keys(categoryStats);
  const totalPoints = categories.map(cat => categoryStats[cat].points);

  // Create the chart
  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: categories,
      datasets: [
        {
          label: 'Correct Answers',
          data: correctAnswers,
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          yAxisID: 'y'
        },
        {
          label: 'Points Earned',
          data: totalPoints,
          backgroundColor: 'rgba(255, 159, 64, 0.7)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          type: 'linear',
          position: 'left',
          title: {
            display: true,
            text: 'Number of Correct Answers'
          }
        },
        y1: {
          type: 'linear',
          position: 'right',
          title: {
            display: true,
            text: 'Points Earned'
          },
          grid: {
            drawOnChartArea: false
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Performance by Category',
          font: {
            size: 16
          }
        },
        legend: {
          position: 'top'
        }
      }
    }
  });

  return chartContainer;
}

// Restart Game
function restartGame() {
  score = 0;
  round = 1;
  updateScoreDisplay();
  location.reload();
}

// Show the modal with a fade-in effect
function showModal() {
  questionModal.classList.add('show');
}

// Hide the modal with a fade-out effect
function hideModal() {
  questionModal.classList.remove('show');
}

// Fetch trivia questions from the file
fetch('src/questions.json')
    .then(response => response.json())
    .then(data => {
      triviaData = data;
    })
    .catch(error => console.error('Error loading trivia questions:', error));

// Modify setupGameBoard to accept round multiplier
function setupGameBoard(data, roundMultiplier) {
  const allCategories = Object.keys(data);
  let selectedCategories = getSelectedCategories(allCategories);
  const currentRoundSelector = round === 1 ? '#single-round' : '#double-round';
  const categoryElements = document.querySelector(currentRoundSelector).querySelectorAll('.category');
  const clueElements = document.querySelector(currentRoundSelector).querySelectorAll('.clue');

  // Get the correct modal elements based on current round
  const questionModal = document.querySelector(`${currentRoundSelector} .question-modal`);
  const questionText = round === 1 ?
      document.getElementById('question-text') :
      document.querySelector(`${currentRoundSelector} .question-text`);
  const answerInput = round === 1 ?
      document.getElementById('answer-input') :
      document.querySelector(`${currentRoundSelector} .answer-input`);
  const submitAnswer = round === 1 ?
      document.getElementById('submit-answer') :
      document.querySelector(`${currentRoundSelector} .submit-answer`);
  const feedback = round === 1 ?
      document.getElementById('feedback') :
      document.querySelector(`${currentRoundSelector} .feedback`);

  const pointValues = [200, 400, 600, 800, 1000]; // Static point values for each question

  selectedCategories.forEach((categoryName, categoryIndex) => {
    const questions = data[categoryName];

    if (!questions) {
      console.error(`Category "${categoryName}" is not found in data.`);
      return;
    }

    const randomQuestions = getRandomQuestions(questions, pointValues.length);

    categoryElements[categoryIndex].textContent = categoryName;
    randomQuestions.forEach((question, i) => {
      const clue = clueElements[categoryIndex * pointValues.length + i];
      clue.setAttribute('data-question', question.question);
      clue.setAttribute('data-answer', question.answer.toLowerCase());
      clue.textContent = `$${pointValues[i] * roundMultiplier}`;
    });
  });

  // Function to show modal with fade-in effect
  const showModal = () => {
    questionModal.classList.add('show');
  };

  // Function to hide modal with fade-out effect
  const hideModal = () => {
    questionModal.classList.remove('show');
  };

  // Initialize arrays to store detailed answer tracking
  let singleJeopardyResults = [];
  let doubleJeopardyResults = [];

  // Function to handle answer submission
  const handleSubmission = (clue, pointValue) => {
    const playerAnswer = answerInput.value.toLowerCase().trim();
    const correctAnswer = clue.getAttribute('data-answer').toLowerCase().trim();
    const category = categoryElements[Math.floor(clue.dataset.index / 5)].textContent;

    // Remove articles and extra spaces from both answers
    const cleanPlayerAnswer = playerAnswer.replace(/^(a|an|the)\s+/, '').trim();
    const cleanCorrectAnswer = correctAnswer.replace(/^(a|an|the)\s+/, '').trim();

    const similarity = calculateSimilarity(cleanPlayerAnswer, cleanCorrectAnswer);
    const similarityThreshold = 75;
    const isCorrect = similarity >= similarityThreshold;

    // Create result object for this answer
    const result = {
      category: category,
      question: clue.getAttribute('data-question'),
      correctAnswer: correctAnswer,
      playerAnswer: playerAnswer,
      pointValue: pointValue,
      isCorrect: isCorrect,
      pointsEarned: isCorrect ? pointValue : -pointValue
    };

    // Store the result in the appropriate array
    if (round === 1) {
      singleJeopardyResults.push(result);
      singleJeopardyAnswers.push(result);
    } else {
      doubleJeopardyResults.push(result);
    }

    if (isCorrect) {
      feedback.textContent = 'Correct!';
      feedback.style.color = 'green';
      clue.style.backgroundColor = 'green';
      score += parseInt(clue.textContent.replace('$', ''), 10);
    } else {
      // startDoubleJeopardy();
      // fillTestAnswers();
      // showFinalScore(singleJeopardyAnswers, doubleJeopardyAnswers);
      feedback.textContent = `Wrong! The correct answer was ${correctAnswer}.`;
      feedback.style.color = 'red';
      clue.style.backgroundColor = 'red';
      score -= parseInt(clue.textContent.replace('$', ''), 10);
    }

    clue.classList.add('answered');
    updateScoreDisplay();

    setTimeout(() => {
      answerInput.value = '';
      feedback.textContent = '';
      hideModal();

      if (round === 1 && allCluesAnswered()) {
        console.log('Single Jeopardy Results:', singleJeopardyResults);
        startDoubleJeopardy();
      } else if (round === 2 && allCluesAnswered()) {
        console.log('Double Jeopardy Results:', doubleJeopardyResults);
        showFinalScore(singleJeopardyAnswers, doubleJeopardyResults);
      }
    }, 2000);
  };

  // Update clueElements setup to include index
  clueElements.forEach((clue, index) => {
    clue.dataset.index = index;  // Add index for category reference
    clue.addEventListener('click', () => {
      if (clue.classList.contains('answered')) return;

      const question = clue.getAttribute('data-question');
      const pointValue = parseInt(clue.textContent);

      questionText.textContent = question;
      showModal();
      answerInput.value = '';
      answerInput.focus();

      const handleEnterKey = (event) => {
        if (event.key === 'Enter') {
          handleSubmission(clue, pointValue);
          answerInput.removeEventListener('keypress', handleEnterKey);
        }
      };

      answerInput.addEventListener('keypress', handleEnterKey);

      submitAnswer.onclick = () => {
        handleSubmission(clue, pointValue);
        answerInput.removeEventListener('keypress', handleEnterKey);
      };
    });
  });
}

// helper function for testing
function fillTestAnswers() {
  const singleJeopardyCategories = 5; // Total categories in Single Jeopardy
  const doubleJeopardyCategories = 5; // Total categories in Double Jeopardy
  const questionsPerCategory = 5; // Number of questions per category
  const singleJeopardyPointBase = 200; // Base point value for Single Jeopardy
  const doubleJeopardyPointBase = 400; // Base point value for Double Jeopardy

  singleJeopardyAnswers = [];
  doubleJeopardyAnswers = [];

  // Helper to generate random correct/incorrect results
  const generateQuestionData = (categoryName, questionIndex, pointValue) => {
    const isCorrect = Math.random() < 0.5; // Randomize correct/incorrect answers
    return {
      category: categoryName,
      question: `Question ${questionIndex + 1}`,
      correctAnswer: `Correct Answer ${questionIndex + 1}`,
      playerAnswer: isCorrect ? `Correct Answer ${questionIndex + 1}` : `Wrong Answer ${questionIndex + 1}`,
      pointValue: pointValue,
      isCorrect: isCorrect,
      pointsEarned: isCorrect ? pointValue : -pointValue
    };
  };

  // Generate Single Jeopardy data
  for (let categoryIndex = 0; categoryIndex < singleJeopardyCategories; categoryIndex++) {
    const categoryName = `Single Category ${categoryIndex + 1}`;
    for (let questionIndex = 0; questionIndex < questionsPerCategory; questionIndex++) {
      singleJeopardyAnswers.push(
          generateQuestionData(
              categoryName,
              questionIndex,
              singleJeopardyPointBase * (questionIndex + 1) // Increment points based on the question number
          )
      );
    }
  }

  // Generate Double Jeopardy data
  for (let categoryIndex = 0; categoryIndex < doubleJeopardyCategories; categoryIndex++) {
    const categoryName = `Double Category ${categoryIndex + 1}`;
    for (let questionIndex = 0; questionIndex < questionsPerCategory; questionIndex++) {
      doubleJeopardyAnswers.push(
          generateQuestionData(
              categoryName,
              questionIndex,
              doubleJeopardyPointBase * (questionIndex + 1) // Increment points based on the question number
          )
      );
    }
  }

  console.log('Test Single Jeopardy Answers:', singleJeopardyAnswers);
  console.log('Test Double Jeopardy Results:', doubleJeopardyAnswers);
}

// Function to calculate Levenshtein distance between two strings
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
            dp[i - 1][j - 1] + 1,
            dp[i - 1][j] + 1,
            dp[i][j - 1] + 1
        );
      }
    }
  }
  return dp[m][n];
}

// Function to calculate similarity percentage between two strings
function calculateSimilarity(str1, str2) {
  const maxLength = Math.max(str1.length, str2.length);
  const distance = levenshteinDistance(str1, str2);
  return ((maxLength - distance) / maxLength) * 100;
}

function allCluesAnswered() {
  const currentRoundSelector = round === 1 ? '#single-round' : '#double-round';
  const clues = document.querySelector(currentRoundSelector).querySelectorAll('.clue');
  const allAnswered = Array.from(clues).every(clue => clue.classList.contains('answered'));
  console.log(`Round ${round}: ${clues.length} clues checked, all answered: ${allAnswered}`);
  return allAnswered;
}

// Function to get random questions from a category
function getRandomQuestions(questions, count) {
  const shuffled = questions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Function to update the score display
function updateScoreDisplay() {
  const singleScoreDisplay = document.getElementById('score-display');
  const doubleScoreDisplay = document.getElementById('score-display-double');

  // Update both displays if they exist
  if (singleScoreDisplay) {
    singleScoreDisplay.textContent = `Score: ${score}`;
  }
  if (doubleScoreDisplay) {
    doubleScoreDisplay.textContent = `Score: ${score}`;
  }
}

// DOM elements for the modal and input checking
const questionModal = document.querySelector('.question-modal');
const questionText = document.getElementById('question-text');
const answerInput = document.getElementById('answer-input');
const submitAnswer = document.getElementById('submit-answer');
const feedback = document.getElementById('feedback');
