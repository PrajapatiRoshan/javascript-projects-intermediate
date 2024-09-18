'use strict';

const number = document.querySelector('.number');
const body = document.querySelector('body');
const scoreEl = document.querySelector('.score');
const gessEl = document.querySelector('.guess');
const messageEl = document.querySelector('.message');
const checkBtn = document.querySelector('.check');
const agianbtn = document.querySelector('.again');
const highScoreEl = document.querySelector('.highscore');

let secretNumber = Math.trunc(Math.random() * 20) + 1;
let score = 20;
let highscore = 0;

const displayMessage = function (message) {
  messageEl.textContent = message;
};

checkBtn.addEventListener('click', function () {
  const guess = Number(gessEl.value);
  console.log(guess);

  // When there is no input
  if (!guess) {
    displayMessage('⛔️ No number!');
    // When player wins
  } else if (guess === secretNumber) {
    displayMessage('🎉 Correct Number!');
    number.textContent = secretNumber;
    body.style.backgroundColor = '#215c0f';
    number.style.width = '30rem';

    if (score > highscore) {
      highscore = score;
      highScoreEl.textContent = highscore;
    }

    // When guess is wrong
  } else if (guess !== secretNumber) {
    if (score > 1) {
      displayMessage(guess > secretNumber ? '📈 Too high!' : '📉 Too low!');
      score--;
      scoreEl.textContent = score;
    } else {
      displayMessage('💥 You lost the game!');
      scoreEl.textContent = 0;
    }
  }
});

agianbtn.addEventListener('click', function () {
  score = 20;
  secretNumber = Math.trunc(Math.random() * 20) + 1;
  displayMessage('Start guessing...');
  scoreEl.textContent = score;
  number.textContent = '?';
  gessEl.value = '';
  body.style.backgroundColor = '#222';
  number.style.width = '15rem';
});
