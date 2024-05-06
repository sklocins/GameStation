let gameBoard = [];
let blueStart = [48, 50, 52, 54, 57, 59, 61, 63];
let redStart = [0, 2, 4, 6, 9, 11, 13, 15];
// let blueStart = [16, 18, 20, 29, 25, 31, 32];
// let redStart = [0, 2, 4, 6, 9, 11, 13, 15];
let blueCount = 8;
let redCount = 8;
let playerTurn = 1;
let selectedChecker = null;
let selectedSquare = null;
let jumping = false;
let playerMode = 2;
let gameOngoing = true;
document.addEventListener('DOMContentLoaded', function() {
    const board = document.querySelector('.board');
    const squares = document.querySelectorAll('.square');

    gameSetUp();

    function gameSetUp(){
        playerTurn = 1;
        selectedChecker = null;
        selectedSquare = null;
        jumping = false;
        playerMode = 2;
        gameBoard = [];
        gameOngoing = true;
        for (let i = 0; i < 50; i++) {
            gameBoard.push(' ');
            removeChecker(i);
        }
        blueCount = 8;
        redCount = 8;

        for(let space of blueStart){
            placeChecker(1, space);
        }
        for(let space of redStart){
            placeChecker(2, space);
        }
        document.querySelector('.message').innerText = "Welcome! Blue's move...";
        // console.log("Welcome! Blue's move...")
    }

    function placeChecker(player, location){
        const square = document.getElementsByClassName('square')[location];
        const newDiv = document.createElement('div');
        if(player === 1){
            newDiv.classList.add("checker");
            newDiv.classList.add("blue");
            newDiv.innerText = " "
            square.appendChild(newDiv);
            gameBoard[location] = "B";
        }
        else{
            newDiv.classList.add("checker");
            newDiv.classList.add("red");
            newDiv.innerText = " "
            square.appendChild(newDiv);
            gameBoard[location] = "R";
        }
    }

    function removeChecker(location){
        const square = document.getElementsByClassName('square')[location];

        while (square.firstChild) {
            square.removeChild(square.firstChild);
        }
    }

    //This function handles clicking any square or checker
    //First it selects the checker if appropriate, or if it's an empty square
    //and a selected checker, if it's legal it will move it there
    function playerMove(clickedSquare) {
        if (!gameOngoing) {
            return;
        }
        // console.log("Click " + clickedSquare)
        let checker = squares[clickedSquare].querySelector('.checker');
        //if the selected checker is indeed a checker
        // console.log("Selected square: " + selectedSquare)
        if (checker) {
            //if it's a valid checker
            if((playerTurn == 1 && checker.classList.contains("blue"))||
                (playerTurn == 2 && checker.classList.contains("red"))){
                //if there is already a selected checker unselect
                if (selectedChecker) {
                    selectedChecker.style.border = "solid black 1px";
                }
                checker.style.border = "solid yellow 5px";
                selectedChecker = checker;
                selectedSquare = clickedSquare;
            }
        }
        //or if it's a blank square, and there is a selected checker, and the square is black
        else if (selectedChecker  && squares[clickedSquare].classList.contains("black")){
            //check that it's a legal move
            if(moveIsLegal(selectedSquare, clickedSquare)) {
                let startRow = selectedSquare % 8;
                let endRow = clickedSquare % 8;
                let startCol = Math.floor(selectedSquare / 8);
                let endCol = Math.floor(clickedSquare / 8);
                //if it's a jump, remove checker and add jump button
                if (Math.abs(startRow-endRow)>1){
                    let squareBetween = (startRow + endRow)/2 + (startCol + endCol)/2 * 8
                    selectedSquare = clickedSquare
                    removeChecker(squareBetween)
                    if(playerTurn == 1){
                        redCount = redCount - 1
                    }
                    else{
                        blueCount = blueCount - 1
                    }
                    checkForWin()
                    addJumpButton()
                }
                //king player if necessary
                if((playerTurn == 1 && clickedSquare < 8) || (playerTurn == 2 && clickedSquare > 56)){
                    selectedChecker.innerText = "K"
                    // selectedChecker.style.border = "solid green 5px";
                }
                //move the checker to the new square
                squares[clickedSquare].appendChild(selectedChecker);
                //if we're not in the middle of jumping, unhighlight selected checker 
                //and move to the next turn
                if(jumping == false){
                    selectedChecker.style.border = "solid black 1px";
                    selectedChecker = null;
                    selectedSquare = null;
                    nextTurn();
                    // emptySquaresAround(20, 1)
                }
                //or if we are in the middle of jumping, make our start square where we moved
                else{
                    selectedSquare = clickedSquare;
                }
            }
        }
    }

    function checkForWin(){
        console.log("bluecount = " + blueCount + " redCount = " + redCount)
        if(redCount < 1){
            document.querySelector('.message').innerText = "Blue Wins!";
            console.log("blue wins")
            gameOngoing = false
        }
        if(blueCount < 1){
            document.querySelector('.message').innerText = "Red Wins!";
            console.log("red wins")
            gameOngoing = false
        }
    }

    function nextTurn(){
        if(gameOngoing == false){
            return
        }
        console.log("Next turn")
        if (playerTurn == 1){
            console.log("Checking for moves for red")
            playerTurn = 2
            document.querySelector('.message').innerText = "Red's move...";
            if(checkForMoves(2) == false){
                if(checkForMoves(1) == false){
                    console.log("No more moves")
                    document.querySelector('.message').innerText = "Uh-oh! No more moves for either player! Tie.";
                }
                else{
                    playerTurn = 1
                    console.log("No more moves for red.")
                    document.querySelector('.message').innerText = "Uh-oh! No moves available for Red. Skipping to blue...";
                }
            }
        }
        else{
            console.log("Checking for moves for blue")
            document.querySelector('.message').innerText = "Blue's move...";
            playerTurn = 1
            if(checkForMoves(1) == false){
                if(checkForMoves(2) == false){
                    console.log("No more moves")
                    document.querySelector('.message').innerText = "Uh-oh! No more moves for either player! Tie.";
                }
                else{
                    playerTurn = 2
                    console.log("No more moves for blue.")
                    document.querySelector('.message').innerText = "Uh-oh! No moves available for Blue. Skipping to red...";
                }
            }
        }

    }

    function moveIsLegal(startSquare, endSquare){
        // console.log(startSquare + "Checking legality to" + endSquare)
        let isKing = (squares[startSquare].querySelector('.checker').innerText === "K")
        let startRow = startSquare % 8;
        let startCol = Math.floor(startSquare / 8);
        let endRow = endSquare % 8;
        let endCol = Math.floor(endSquare / 8);
        let moveY = endCol - startCol;
        let moveX = endRow - startRow;

        //check that if they are not a king they are going in the right direction
        if(checkCorrectDirection(moveY, isKing)){
            //if the move is regular
            if((Math.abs(moveX) == 1) && (Math.abs(moveY) == 1) && (jumping == false)){
                return true;
            }
            //or if it goes diagonal 2 spaces
            else if((Math.abs(moveX) == 2) && (Math.abs(moveY) == 2)){
                let squareBetween = getSquareBetween(startSquare, endSquare)
                if((squares[squareBetween].querySelector('.checker.blue') && playerTurn == 2) || (squares[squareBetween].querySelector('.checker.red') && playerTurn == 1) ){
                    return true;
                }
            }
        }
        return false;
    }

    function checkCorrectDirection(moveY, isKing){
        return (isKing || (playerTurn == 1 && (moveY < 0)) || (playerTurn == 2 && (moveY > 0)));
    }
    //this function simply returns the square number between two squares
    function getSquareBetween(startSquare, endSquare){
        let startRow = startSquare % 8;
        let startCol = Math.floor(startSquare / 8);
        let endRow = endSquare % 8;
        let endCol = Math.floor(endSquare / 8);
        let squareBetween = (startRow + endRow)/2 + (startCol + endCol)/2 * 8;
        return squareBetween;

    }

    function addJumpButton() {
        if (!jumping) {
            jumping = true;
            const button = document.createElement('button');
            button.textContent = 'Done Jumping';
            
            button.addEventListener('click', handleJumpButtonClick);
            
            document.querySelector('.message').appendChild(button);
        }
    }
    
    function handleJumpButtonClick() {
        jumping = false;
        selectedChecker.style.border = "solid black 1px";
        selectedChecker = null;
        selectedSquare = null;
        const button = this;
        if (button && button.parentNode) {
            button.parentNode.removeChild(button);
        }
        nextTurn();
    }
    function checkForMoves(playerToCheck){
        let jumpPossibilities = [];
        let singlePossibilities = [];
        //if we're in the middle of a jump
        if (jumping){
            //remember the square will be selected, so we check all squares 2x2 from that one
            let jumpPossibilities = emptySquaresAround(selectedSquare, 2);
            //for all the 4 squares that could be reached by the selected square jumping
            for(let poss of jumpPossibilities){
                // console.log("checking for a move from " + selectedSquare + " to " + poss)
                //if that is a legal move
                if(moveIsLegal(selectedSquare,poss)){
                    //if it's not the computer's turn, the player has a turn possibility of 
                    //clicking "done jumping" so we can just return true
                    if(playerMode == 2 || playerTurn == 1){
                        return true;
                    }
                    //
                    else{
                        jumpPossibilities.push([selectedSquare, poss])
                        playerMove(poss)
                        // console.log("playing poss" + poss)
                        return true;
                    }
                }
            }
            handleJumpButtonClick();
            return false;
        }
        for (let i2 = 0; i2 < squares.length; i2++) {
            const square = squares[i2];
            var checker = null;
            if(playerToCheck == 1){
                checker = square.querySelector('.checker.blue');
            }
            else{
                checker = square.querySelector('.checker.red');
            }
            if (checker) {
                // myAvailableCheckers.push(i)
                // checker.style.border = "solid purple 5px"
                //find the possible jumps and add them
                let checkerMoves = emptySquaresAround(i2, 2);
                //check the jumps and add them
                for(let poss of checkerMoves){
                    // console.log("checking for a move from " + i2 + " to " + poss)
                    //if there is a legal jump and not comps turn we can return because there is a move
                    if(moveIsLegal(i2,poss)){
                        if(playerMode == 2 || playerTurn == 1){
                            return true;
                        }
                        //or if it is the computer's turn, do the jump
                        else{
                            jumpPossibilities.push([i2, poss])
                            playerMove(i2)
                            // console.log("playing poss" + poss)
                            playerMove(poss)
                            while(checkForMoves()){
                                console.log("move")
                            }
                            return true;
                        }
                    }
                }
                //and the possible single moves
                checkerMoves = emptySquaresAround(i2, 1);
                for(let poss of checkerMoves){
                    if(moveIsLegal(i2,poss)){
                        if(playerMode == 2 || playerTurn == 1){
                            return true;
                        }
                        else{
                            singlePossibilities.push([i2, poss])
                            playerMove(i2)
                            playerMove(poss)
                            return true;
                        }
                    }
                }

                // if (checkCheckerForMoves(i2)) {
                //     return true;
                // }
            }
        }
        return false;
    }
    //this deals with finding squares diagonally 1 or 2 away that have no 
    //checker and thus could be a move
    //remember that the check for Legality is going to ensure direction and that 
    //if there is a checker in between for jumping
    function emptySquaresAround(location, numSquaresAround){
        // console.log("Empty squares around " + location + " " + numSquaresAround)
        const row = Math.floor(location / 8);
        const col = location % 8;
        myPotentials = [];
        myAvailable = [];
        //push all possible squares 1x1 away
        if((col-numSquaresAround) > -1){
            if((row-numSquaresAround) > -1){
                myPotentials.push((row-numSquaresAround)*8+col-numSquaresAround)
            }
            if((row+numSquaresAround) < 8){
                myPotentials.push((row+numSquaresAround)*8+col-numSquaresAround)
            }
        }
        if((col+numSquaresAround) < 8){
            if((row-numSquaresAround) > -1){
                myPotentials.push((row-numSquaresAround)*8+col+numSquaresAround)
                // console.log("row " + row-numSquaresAround + " col " + col+numSquaresAround + " final " + ((row-numSquaresAround)*8+col+numSquaresAround))
            }
            if((row+numSquaresAround) < 8){
                myPotentials.push((row+numSquaresAround)*8+col+numSquaresAround)
                // console.log("row " + row+numSquaresAround + " col " + col+numSquaresAround + " final " + ((row+numSquaresAround)*8+col+numSquaresAround))
            }
        }
        // squares[location].style.border = "solid green 10px"
        for(let potential of myPotentials){
            // console.log("For square " + location + " we have " + potential)
            //if it is 0-63
            if(potential > -1 && potential < 64){
                //and there is no checker in it
                if(!squares[potential].querySelector('.checker')){
                    myAvailable.push(potential)
                }
            }
        }
        return myAvailable;
    }

    document.getElementById('reset-button').addEventListener('click', function() {
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            square.textContent = '';
        });
        playerTurn = 1;
        gameSetUp();
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

    squares.forEach((square, index) => {
        square.addEventListener('click', () => playerMove(index));
    });
});

function playerMoved(square) {
    // console.log(square)
}

function toggleplayer(n){
    const onePlayerButton = document.getElementById('one-player-mode');
    const twoPlayerButton = document.getElementById('two-player-mode');
    
    if(n === 1){
        onePlayerButton.classList.add("selected-player");
        twoPlayerButton.classList.remove("selected-player");
        playerMode = 1;
        console.log("ONE PLAYER mode selected")
    } else if (n === 2) {
        onePlayerButton.classList.remove("selected-player");
        twoPlayerButton.classList.add("selected-player");
        playerMode = 2;
        console.log("TWO PLAYERS mode selected")
    }
}
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
            if (index > 7) {
                squares[index - 8].focus();
            }
            break;
        case 'ArrowDown':
            if (index < squares.length - 8) {
                squares[index + 8].focus();
            }
            break;
    }
});