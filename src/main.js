let triviaData;
let correctAnswer = ''; // Store the correct answer for the current question
let score = 0; // Initialize the player's score
let round = 1;
let singleJeopardyAnswers = [];

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

// Function to end the game and show final score
function showFinalScore(singleJeopardyResults, doubleJeopardyResults) {
  document.getElementById('double-round').style.display = 'none';
  document.getElementById('final-screen').style.display = 'block';
  document.getElementById('final-score-display').textContent = `Your Total Score: ${score}`;

  const allResults = [...singleJeopardyResults, ...doubleJeopardyResults];

  // Calculate statistics
  const totalQuestionsAnswered = allResults.length;
  const correctAnswers = allResults.filter(result => result.isCorrect).length;
  const totalPointsEarned = allResults.reduce((sum, result) => sum + result.pointsEarned, 0);

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

  // Use data to display detailed statistics on final screen
  console.log('Game Statistics:', {
    totalQuestionsAnswered,
    correctAnswers,
    totalPointsEarned,
    categoryStats
  });
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

  selectedCategories.forEach((categoryName, categoryIndex) => {
    const questions = data[categoryName];

    if (!questions) {
      console.error(`Category "${categoryName}" is not found in data.`);
      return;
    }

    const randomQuestions = getRandomQuestions(questions, 5);

    categoryElements[categoryIndex].textContent = categoryName;
    randomQuestions.forEach((question, i) => {
      const clue = clueElements[categoryIndex * 5 + i];
      clue.setAttribute('data-question', question.question);
      clue.setAttribute('data-answer', question.answer.toLowerCase());
      clue.textContent = question.value * roundMultiplier;
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
      score += pointValue;
    } else {
      feedback.textContent = `Wrong! The correct answer was ${correctAnswer}.`;
      feedback.style.color = 'red';
      clue.style.backgroundColor = 'red';
      score -= pointValue;
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
