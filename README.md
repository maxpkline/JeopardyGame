# Jeopardy Trivia Game

Welcome to the Jeopardy Trivia Game! This project is a fun, interactive web-based game inspired by the classic quiz show Jeopardy. Players select categories and answer trivia questions to accumulate points. 

---

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Gameplay Instructions](#gameplay-instructions)
- [Code Overview](#code-overview)
- [Contributing](#contributing)
- [License](#license)

---

## Features
- **Dynamic Question Pool**: Pulls trivia questions from a JSON file.
- **Category Selection**: Players are able to specify up to five categories to play each round, or they are automatically randomized each playthrough.
- **Two Rounds**: Includes Single Jeopardy and Double Jeopardy rounds with scaling points.
- **Scorekeeping**: Tracks player score across the game through single and double Jeopardy.
- **Levenshtein-Based Matching**: Evaluates similarity between user answers and correct answers for better accuracy, set to around 90% accuracy based match.
<!--
- **Responsive Design**: Works on both desktop and mobile devices.
-->
- **Randomized Questions**: Provides unique gameplay experiences in each round through random questions for each category.

---

## Technologies Used
- **HTML/CSS**: For the game's structure and style.
- **JavaScript**: Core logic, game flow, and interactivity.
- **JSON**: To store and fetch trivia questions.

---

## Getting Started
### Prerequisites
To run this game locally, ensure you have:
- A modern web browser (e.g., Chrome, Firefox, Safari)
- A basic text editor (optional, for viewing/editing code)

### Installation
1. Clone or download this repository to your computer.
2. Place the `questions.json` file in the `/src` directory.
3. Open the `index.html` file in your web browser.

---

## Gameplay Instructions
1. **Start Menu**:
   - Choose up to five categories from the available list.
   - You do not have to choose any categories, this is just an option to study specific topics/categories. 
   - Start the game to begin the Single Jeopardy round.

2. **Single Jeopardy**:
   - Each category contains five clues each.
   - Answer questions by typing your response in the input box and pressing submit or the enter key.
   - You will gain or lose points based on correct or incorrect answers.
   - Players must complete all clues to advance to Double Jeopardy.

3. **Double Jeopardy**:
   - Questions in the Double Jeopardy round have double the point value.
   - Play through another set of five clues per category.

4. **Final Score**:
   - Players have the chance to view their total score at the end of the game.
   - Statistics for each category 
   - There is also the option to restart and try again.

---

## Code Overview
### Key Files
- **`index.html`**: Defines the game’s structure and elements.
- **`style.css`**: Adds styling for the game.
- **`script.js`**: Implements game logic, including:
  - Category and question management
  - Answer validation using Levenshtein similarity
  - Gameplay progression and score tracking
- **`questions.json`**: Stores trivia questions, answers, and point values.

### Notable Functions
- **`setupGameBoard(data, roundMultiplier)`**:
  Prepares the game board for each round by populating categories and clues.
- **`handleSubmission(clue, pointValue)`**:
  Validates user answers, provides feedback, and updates the score.
- **`calculateSimilarity(str1, str2)`**:
  Uses the Levenshtein algorithm to match player answers with correct ones.
- **`updateScoreDisplay()`**:
  Updates the score shown to the player.

---
<!--
## Contributing
Contributions are welcome! Here’s how you can help:
1. Fork this repository.
2. Create a new branch (`git checkout -b feature/YourFeatureName`).
3. Make your changes and test them.
4. Commit your changes (`git commit -m "Add feature: YourFeatureName"`).
5. Push your branch (`git push origin feature/YourFeatureName`).
6. Open a Pull Request.

---
-->

## License
This project is licensed under the [MIT License](LICENSE).

---

## Acknowledgements
Thank you to the creators of the classic Jeopardy game show for the inspiration. This project aims to emulate the fun and challenge of trivia!

---

Enjoy the game and aim for the highest score!
