const liDOMsArray = document.getElementsByTagName("li");
let button = document.getElementById("play");
let userGuess = 0;
let compGuess = 0;
let computerScore = 0;
let userScore = 0;
let rock = 1;
let paper = 2;
let scissor = 3;
let playButton = document.getElementById("play");
let playerObj = {
  name: "",
  score: 0,
};

console.log(playerObj);
const baseUrl =
  "https://stensaxpase-d3b57-default-rtdb.europe-west1.firebasedatabase.app/";

async function getHighScores() {
try {

  console.log("get HIgh score!!!!");
  const url = baseUrl + `scores/.json`;
  const response = await fetch(url);
  const scores = await response.json();
  const scoresArray = Object.entries(scores);
  let sortHighscores = scoresArray.sort((a, b) => b[1].score - a[1].score);
  sortHighscores = sortHighscores.slice(0, 5)
  console.log(sortHighscores);
  
  //Loopar igenom de sorterade highscorsen och skriver ut de i DOM:en.
  sortHighscores.forEach(
    (score, i) => { liDOMsArray[i].innerHTML = `${score[1].name}: ${score[1].score}` }
  )
  return scores;
} catch (error) {
  let errorMsg = document.createElement('h1');
  errorMsg.innerText = `Something went wrong!!!`
  document.body.appendChild(errorMsg)
  console.log(`${error} "DET SKET SIG"`)
}

}

getHighScores();

//play-knapp så att spelet startar efter att användaren angivit namn i form input
playButton.addEventListener("click", (event) => {
  let inputName = document.getElementById("name").value;
  event.preventDefault();
  playerObj.name = inputName;
  console.log(playerObj.name);


  updateData(playerObj);
});

//uppdaterar highscore i db
async function updateData(obj) {
  console.log("UPDATE DB!!!!");
  const objData = await getHighScores();
  console.log(objData);

  const url = baseUrl + `scores/${obj.name}.json`;
  const init = {
    method: "PUT",
    body: JSON.stringify(obj),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  };

  const response = await fetch(url, init);
  const data = await response.json();
  console.log(data, "confimed update!!!");
  return data;
}

const stoneButton = document.querySelector("#sten-user");
const scissorsButton = document.querySelector("#sax-user");
const paperButton = document.querySelector("#pase-user");
const playGame = document.querySelector("#play");

stoneButton.addEventListener("click", handleGuess);
scissorsButton.addEventListener("click", handleGuess);
paperButton.addEventListener("click", handleGuess);
playGame.addEventListener("click", play);

const h2ComputerChoice = document.querySelector("#computerChoice");
const h2UserChoice = document.querySelector("#userChoice");
const h2ComputerScore = document.querySelector("#computerScore");
h2ComputerScore.innerText = "0";

const h2UserScore = document.querySelector("#userScore");
h2UserScore.innerText = "0";

const userName = document.querySelector("#player");

function play(event) {
  event.preventDefault();
  userName.innerText = document.getElementById("name").value;
}

function handleGuess(event) {
  let compGuess = 1 + Math.floor(Math.random() * 3);
  if (compGuess == 1) {
    h2ComputerChoice.innerText = "Rock";
  } else if (compGuess == 2) {
    h2ComputerChoice.innerText = "Paper";
  } else if (compGuess == 3) {
    h2ComputerChoice.innerText = " Scissor";
  }

  if (event.target.id == "sten-user") {
    userGuess = 1;
    h2UserChoice.innerText = "Rock";
  } else if (event.target.id == "pase-user") {
    userGuess = 2;
    h2UserChoice.innerText = "Paper";
  } else if (event.target.id == "sax-user") {
    userGuess = 3;
    h2UserChoice.innerText = "Scissor";
  }

  if (
    (compGuess == rock && userGuess == scissor) ||
    (compGuess == scissor && userGuess == paper) ||
    (compGuess == paper && userGuess == rock)
  ) {
    computerScore++;
    h2ComputerScore.innerText = computerScore + " points";
    h2UserScore.innerText = 0 + " points";
  } else if (
    (compGuess == scissor && userGuess == rock) ||
    (compGuess == paper && userGuess == scissor) ||
    (compGuess == rock && userGuess == paper)
  ) {
    userScore++;
    h2ComputerScore.innerText = computerScore + " points";
    h2UserScore.innerText = userScore + " points";
  }

  setTimeout(function () {
    if (compGuess == userGuess) {
      h2ComputerScore.innerText = computerScore + " points";
      h2UserScore.innerText = userScore + " points";
      alert('Tie!');
    }
  }, 300);


  countScores();

  
  setTimeout(async function () {
    try {
      const theData = await getHighScores();
      console.log(theData);
      if (computerScore == 1) {
        computerScore = 0;
      } else if (userScore < theData.score) {
        console.log("din mamma");
        playerObj.score = userScore;
        userScore++;

        computerScore = 0;
        alert(document.getElementById("name").value + " won!");
        console.log(document.getElementById("name").value + "");
      }
    } catch {

    }

  }, 200);
}


//kontrollerar redan existerande highscore
async function countScores() {

  const theData = await getHighScores();

  let arrayOfData = Object.entries(theData);
  console.log(arrayOfData);

  arrayOfData.forEach((score, i) => {
    console.log(score[1].score);
    if (userScore <= score[1].score) {
     
    }
    if (userScore >= score[1].score) {
      score[1].score = userScore;
     
    }
  });

  if (computerScore === 1) {
    playerObj.score = userScore;  //tilldelar current score
    console.log(playerObj, "result!!");

    completeRestrtHandeling()
    alert("The computer won");
   
  }

}


async function completeRestrtHandeling() {
  await updateData(playerObj);  // skickar til fb
  await getHighScores()
  restartGame();
}


function restartGame() {
  console.log("restart!!!");
  computerScore = 0
  playerObj.score = 0
  h2ComputerScore.innerText = "0";
  h2UserScore.innerText = "0";
  h2UserChoice.innerText = "";
  h2ComputerChoice.innerText = "";
  document.getElementById("name").value = "";
  userName.innerText = "Player";
}
