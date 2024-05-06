let XorO = "X"
const xlist = []
const olist = []
let playermode = 2
const wins = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6] ]
const bestSpots = [4, 0, 2, 6, 8, 1, 3, 5, 7]
gameOngoing = true;

function toggleplayer(n){
    const onePlayerButton = document.getElementById('one-player-mode');
    const twoPlayerButton = document.getElementById('two-player-mode');
    
    if(n === 1){
        onePlayerButton.classList.add("selected-player");
        twoPlayerButton.classList.remove("selected-player");
        playermode = 1;
        console.log("ONE PLAYER mode selected")
    } else if (n === 2) {
        onePlayerButton.classList.remove("selected-player");
        twoPlayerButton.classList.add("selected-player");
        playermode = 2;
        console.log("TWO PLAYERS mode selected")
    }
}
function playerMoved(num) {
    const square = document.getElementsByClassName('square')[num];
    if (gameOngoing == true){
        if (square.innerText == "") {
            square.innerText = XorO;
            console.log(XorO + " took square " + num)
            if(XorO === "X"){
                xlist.push(num)
                XorO = "O"
            }
            else{
                olist.push(num)
                XorO = "X"
            }
            // if (checkGame() == true){
            //     win();
            // }
            checkGame()
            if(playermode == 1 && XorO == "O"){
                computerMove();
            }
        }
    }
}

function checkGame() {
    for (num in xlist){
        console.log(xlist)
    }
    for (let win of wins) {
        console.log("In checkgame")
        console.log(win)
        if (win.every(element => xlist.includes(element))){
            console.log('X WINS')
            document.getElementsByClassName('message')[0].innerText = "X WINS!!!"
            gameOngoing = false;
            return;
        }
        else if (win.every(element => olist.includes(element))){
            console.log('O WINS')
            document.getElementsByClassName('message')[0].innerText = "O WINS!!!"
            gameOngoing = false;
            return;
        }
        else if (xlist.length + olist.length == 9){
            console.log('TIE')
            document.getElementsByClassName('message')[0].innerText = "TIE!!!"
            gameOngoing = false;
            // return;
        }
    }

}

function computerMove() {
    var posswin = possiblewin(olist);
    var posswin2 = possiblewin(xlist)
    console.log(posswin)
    if(posswin>-1){
        playerMoved(posswin)
    }
    else if (posswin2>-1){
        playerMoved(posswin2)
    }
    else{
        playerMoved(bestMove())
    }

}

function possiblewin(mylist){
    for (let win of wins) {
        if (mylist.includes(win[0]) && mylist.includes(win[1]) && !xlist.includes(win[2])&& ! olist.includes(win[2])){
        console.log(win[2])
        console.log("Block is probably working.")
            return win[2]
        }
        else if (mylist.includes(win[0]) && mylist.includes(win[2]) && !xlist.includes(win[1])&& ! olist.includes(win[1])){
            console.log(win[1])
            return win[1]
        }
        else if (mylist.includes(win[1]) && mylist.includes(win[2]) && !xlist.includes(win[0])&& ! olist.includes(win[0])){
            console.log(win[0])
            return win[0]
        }
    }

}

function goodMove(mylist){
    for (let win of wins) {
        if (mylist.includes(win[0]) && !xlist.includes(win[1]) && !olist.includes(win[1]) && !xlist.includes(win[2])&& ! olist.includes(win[2])){
            return win[2]
        }
        else if (!xlist.includes(win[0]) && !olist.includes(win[0]) && mylist.includes(win[1]) &&  !xlist.includes(win[2])&& ! olist.includes(win[2])){
            return win[0]
        }
        else if (!xlist.includes(win[0]) && !olist.includes(win[0]) &&  !xlist.includes(win[1])&& ! olist.includes(win[1]) && mylist.includes(win[2])){
            return win[0]
        }
    }

}

function bestMove(){
    for (let spot of bestSpots) {
        if(!xlist.includes(spot) && !olist.includes(spot)){
            return spot
        }
    }
}
document.addEventListener('DOMContentLoaded', function() {
    // Your JavaScript code here
    const board = document.querySelector('.board'); // Get the board container

    document.getElementById('reset-button').addEventListener('click', function() {
        xlist.length = 0;
        olist.length = 0;
        gameOngoing = true;
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            square.textContent = '';
        });
        XorO = "X";
        document.querySelector('.message').innerText = 'Welcome!';
    });

    document.getElementById('toggle-classic').addEventListener('click', function() {
        board.classList.toggle('alternate-styling');
        main.classList.toggle('alternate-bg-color');
    const button = document.getElementById('toggle-classic');
    if (button.textContent === 'flashy mode on') {
        button.textContent = 'classic mode on';
    } else {
        button.textContent = 'flashy mode on';
    }
    });
});


const board = document.getElementsByClassName('board')[0];

// apparently a built in class thing
board.addEventListener('keydown', function(event) {
    const squares = Array.from(board.querySelectorAll('.square'));
    const currentSquare = document.activeElement;

    const index = squares.indexOf(currentSquare);
    if (event.key === 'Enter') {
        if (currentSquare.classList.contains('square')) {
            currentSquare.click();
        }
    }
    else{
        switch (event.key) {
            case 'ArrowLeft':
                if (index > 0) {
                    squares[index - 1].focus();
                }
                break;
            case 'ArrowRight':
                if (index < squares.length - 1) {
                    squares[index + 1].focus();
                }
                break;
            case 'ArrowUp':
                if (index > 2) {
                    squares[index - 3].focus();
                }
                break;
            case 'ArrowDown':
                if (index < squares.length - 3) {
                    squares[index + 3].focus();
                }
                break;
        }
    }
});