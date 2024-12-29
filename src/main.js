let triviaData;
let correctAnswer = ''; // Store the correct answer for the current question
let score = 0; // Initialize the player's score
let round = 1;

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
function showFinalScore() {
  document.getElementById('double-round').style.display = 'none';
  document.getElementById('final-screen').style.display = 'block';
  document.getElementById('final-score-display').textContent = `Your Total Score: ${score}`;
}

// Restart Game
function restartGame() {
  score = 0;
  round = 1;
  document.getElementById('final-screen').style.display = 'none';
  document.getElementById('start-menu').style.display = 'block';
  updateScoreDisplay();
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
  const categoryElements = document.querySelectorAll('.category');
  const clueElements = document.querySelectorAll('.clue');

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
      console.log(round, roundMultiplier);
    });
  });

  // Function to handle answer submission
  const handleSubmission = (clue, pointValue) => {
    const playerAnswer = answerInput.value.toLowerCase();
    const correctAnswer = clue.getAttribute('data-answer');

    if (playerAnswer === correctAnswer) {
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
    clue.removeEventListener('click', () => {});
    updateScoreDisplay();

    setTimeout(() => {
      answerInput.value = '';
      feedback.textContent = '';
      hideModal();

      if (round === 1 && allCluesAnswered()) {
        startDoubleJeopardy();
      } else if (round === 2 && allCluesAnswered()) {
        showFinalScore();
      }
    }, 2000);
  };

  document.querySelectorAll('.clue').forEach(clue => {
    clue.addEventListener('click', () => {
      if (clue.classList.contains('answered')) return;

      const question = clue.getAttribute('data-question');
      const pointValue = parseInt(clue.textContent);

      questionText.textContent = question;
      showModal();

      // Add Enter key event listener
      const handleEnterKey = (event) => {
        if (event.key === 'Enter') {
          handleSubmission(clue, pointValue);
          // Remove the event listener after submission
          answerInput.removeEventListener('keypress', handleEnterKey);
        }
      };

      // Add Enter key support
      answerInput.addEventListener('keypress', handleEnterKey);

      // Update submit button click handler
      submitAnswer.onclick = () => {
        handleSubmission(clue, pointValue);
        // Remove the Enter key event listener when clicking submit
        answerInput.removeEventListener('keypress', handleEnterKey);
      };
    });
  });
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
  const scoreDisplay = document.getElementById('score-display');
  scoreDisplay.textContent = `Score: ${score}`; // Update score display
}

// DOM elements for the modal and input checking
const questionModal = document.querySelector('.question-modal');
const questionText = document.getElementById('question-text');
const answerInput = document.getElementById('answer-input');
const submitAnswer = document.getElementById('submit-answer');
const feedback = document.getElementById('feedback');
