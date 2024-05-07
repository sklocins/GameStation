document.addEventListener('DOMContentLoaded', function() {
    const squares = document.querySelectorAll('.square');
    const all_options = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    // const orig_game_list = ['-',  2 ,  8 , '-', '-', '-',  7 , '-', '-',
    //                         '-', '-',  7 , '-', '-', '-', '-',  9 ,  3 ,
    //                         '-', '-', '-', '-', '-', '-',  4 , '-', '-',
    //                         '-', '-',  4 , '-', '-', '-',  3 , '-',  5 ,
    //                         '-', '-', '-', '-', '-',  5 , '-',  1 , '-',
    //                         '-',  8 , '-',  1 ,  6 ,  9 , '-', '-', '-',
    //                         '-', '-', '-', '-',  1 , '-', '-', '-',  9 ,
    //                         5 , '-', '-', '-', '-', '-', '-',  3 , '-',
    //                         '-', '-',  9 ,  2 , '-',  4 , '-', '-', '-'];
    const orig_game_list = [ 3 ,  9 , '-', '-',  7 , '-', '-', '-',  5 ,
                            '-', '-', '-', '-', '-',  3 , '-', '-',  2 ,
                            '-', '-', '-',  4 ,  1 , '-', '-', '-', '-',
                            '-',  5 , '-', '-', '-', '-',  2 , '-', '-',
                            6 , '-',  9 , '-', '-', '-',  7 , '-',  4 ,
                            '-', '-',  4 , '-', '-', '-', '-',  1 , '-',
                            '-', '-', '-', '-',  3 ,  2 , '-', '-', '-',
                            7 , '-', '-',  6 , '-', '-', '-', '-', '-',
                            2 , '-', '-', '-',  5 , '-', '-',  4 ,  8 ];
    let game_list = [];
    let blank_squares = [];
    let move_log = [];
    let selected_num = 0;
    let chaining_check_mode_on = false;
    let game_won = false;
    setup();
    // console.log(sortByPossibleValues(blank_squares));

    document.getElementById('move-button').addEventListener('click', make_move);
    document.getElementById('undo-button').addEventListener('click', undo_move);
    document.getElementById('reset-button').addEventListener('click', setup);
    squares.forEach(square => {
        square.addEventListener('click', function() {
            const content = square.innerText.trim();
            selected_num = content;
            highlight_num(content);
        });
    });
    //On clicking a cell with a number, highlight that number in all cells.
    function highlight_num(content){
        squares.forEach(otherSquare => {
            const otherContent = otherSquare.innerText.trim();
            if (content.length === 1 && content === otherContent) {
                otherSquare.classList.add('highlighted');
            } else if (otherContent.includes(' ')) {
                const numbers = otherContent.split(' ');
                const highlightedText = numbers.map(num => {
                    if (num === content) {
                        return `<span class = "highlighted"> ${num} </span>`;
                    } else {
                        return num;
                    }
                }).join(' ');
                otherSquare.innerHTML = highlightedText;
            } else {
                otherSquare.classList.remove('highlighted');
            }
        });
    }
    function setup(){
        //Copies the original game list on the board and playing matrix,
        //resets move_log (and blank_squares attribute), and fill in starter 
        //options for blank squares (numbers that could be put in and not conflict with rcg.)
        game_list = [...orig_game_list];
        blank_squares = [];
        move_log = [];
        let chaining_check_mode_on = false;
        let game_won = false;
        for (let i = 0; i < 81; i++) {
            if(game_list[i] != '-'){
                squares[i].innerText = game_list[i];
            }
            else{
                fill_in_options(i);
                squares[i].style.fontSize = "18px";
                blank_squares.push(i);
            }
        }
    }
    function fill_in_options(index){
        //Fills in the numbers (options) for the blank that don't conflict 
        //with filled in numbers in the row, col, or group.
        let options = [];
        let nums_in_col = get_nums_in_squares(get_squares_in_col(index));
        let nums_in_row = get_nums_in_squares(get_squares_in_row(index));
        let nums_in_group = get_nums_in_squares(get_squares_in_group(index));
        for (let num of all_options){
            if (!nums_in_col.includes(num) && !nums_in_row.includes(num) && !nums_in_group.includes(num)){
                options.push(num);
            }
        }
        result = options.join(' ');
        game_list[index] = options;
        squares[index].innerText = result;
    }
    function fill_in_value(index, new_value){
        squares[index].style.fontSize = "5vw";
        squares[index].innerText = new_value;
        game_list[index] = new_value;
        // console.log("changing blank at ", sq_index, " to ", new_value)
        let index_in_blanksquares = blank_squares.indexOf(index);
        //FIXME - Maybe have some assert statement here later
        blank_squares.splice(index_in_blanksquares, 1);
    }
    function remove_option_from_square(square, option){
        //if the option is in the square, remove it and
        //return whether it needed to be removed
        let removal = false;
        let index_of_option = game_list[square].indexOf(option);
        if (index_of_option !== -1) {
            console.log("Removing ", option, " from square ", square)
            game_list[square].splice(index_of_option, 1);
            result = game_list[square].join(' ');
            squares[square].innerText = result;
            removal = true;
        }
        return removal;
    }
    function check_for_one_option(){ 
        //check each blank to see if there is only possibility
        // and returns that blank square
        for (let square of blank_squares) {
            if (game_list[square].length == 1){
                return square;
            }
        }
        return null;
    }
    function check_for_win(){ 
        //check to se if there is a win
        if(blank_squares.length == 0){
            game_won = true;
            if (!chaining_check_mode_on){
                console.log("You won!!!!")
                return true;
            }
        }
        return false;
    }
    function check_for_loss(){ 
        //check to se if the board is directly invalid
        for (let square of blank_squares){
            if(game_list[square].length == 0){
                console.log("WOAH! It's saying ", square, "would be optionless! Loss!")
                return true;
            }
        }
        return false;
    }
    function get_col(index){    //return the column # of an index
        return index % 9;
    }

    function get_row(index){    //return the row # of an index
        return Math.floor(index/9);
    }

    function get_group(index){  //return the group # of an index
        let index_col = get_col(index);
        let index_row = get_row(index);
        let start_col = index_col - index_col % 3;
        let start_row = index_row - index_row % 3;
        return (start_row + start_col/3);
    }

    function get_nums_in_squares(list_of_squares){ //return a list of numbers in the squares given
        nums_in_list = [];
        for (let square of list_of_squares) {
            if (!blank_squares.includes(square)){
                nums_in_list.push(game_list[square]);
            }
        }
        return nums_in_list;
    }
    function get_squares_in_col(index){
        //return the squares in the column that the index is in
        let start = get_col(index);
        let squares_in_col = [];
        for (let i = start; i < squares.length; i += 9) {
            squares_in_col.push(i);
        }
        return squares_in_col;
    }
    function get_squares_in_row(index){
        //return the squares in the row that the index is in
        let start = get_row(index) * 9;
        let squares_in_row = [];
        for (let i = start; i < start + 9; i += 1) {
            squares_in_row.push(i);
        }
        return squares_in_row;
    }
    function get_squares_in_group(index){
        //return the squares in the group that the index is in
        let index_col = get_col(index);
        let index_row = get_row(index);
        let start_col = index_col - index_col % 3;
        let start_row = index_row - index_row % 3;
        let squares_in_group = [];
        for (let row = start_row; row < start_row + 3; row += 1) {
            for (let col = start_col; col < start_col + 3; col += 1) {
                squares_in_group.push(row * 9 + col);
            }
        }
        return squares_in_group;
    }
    function convert_group_to_square(group_num){
        //returns a square in the group (for if you want to use a 
        //function that returns something based on an index instead of group #)
        return 9 * Math.floor(group_num) + (group_num % 3) * 3;     
    }
    function get_associated_sqs(index){
        //takes an index and group of every blank square
        // in the given squares row, col, or group
        let associated_sqs = [];
        for (let blank of blank_squares){
            if (get_col(index) == get_col(blank) || get_row(index) == get_row(blank) || get_group(index) == get_group(blank)){
                if (blank != index) {
                    associated_sqs.push(blank);
                }
            }
        }
        return associated_sqs;
    }
    function get_blanks(sqs){
        //Takes a list of squares and remove the ones that aren't blank
        let blanks_list = [];
        for (let sq of sqs){
            if(blank_squares.includes(sq)){
                blanks_list.push(sq);
            }
        }
        return blanks_list;
    }
    function combine_lists(list1, list2){
        //Preforms a set intersection on two lists
        //NOTE: early on, due to the problems iterating with sets,
        // I decided to start with lists. FIXME: should I rethink?
        let resultant_list = [];
        for (let el of all_options){
            if(list1.includes(el) || list2.includes(el)){
                resultant_list.push(el)
            }
        }
        return resultant_list;
    }
    function deepCopy(list) {
        if (!Array.isArray(list)) {
            return list;
        }
        let copiedList = [];
        for (let i = 0; i < list.length; i++) {
            copiedList.push(deepCopy(list[i]));
        }
        return copiedList;
    }
    function make_move() {
        //either fills in a value or removes an option from a group
        let sq_to_change = check_for_one_option();
        if(sq_to_change != null){
            let new_value = game_list[sq_to_change][0];
            update_game(sq_to_change, [], [], [new_value]);
            return true;
        }
        for(let num of all_options){ 
            let groups = [ [], [], [], [], [], [], [], [], [] ];
            let rows = [ [], [], [], [], [], [], [], [], [] ];
            let cols = [ [], [], [], [], [], [], [], [], [] ];
            //go through the blanks w/ num and put them in the appropriate groups
            for (let blank of blank_squares){
                if(game_list[blank].includes(num)){
                    rows[get_row(blank)].push(blank);
                    cols[get_col(blank)].push(blank);
                    groups[get_group(blank)].push(blank);
                }
            }
            for(let rowcolgroup = 0; rowcolgroup < 9; rowcolgroup++){
                let my_list_rowcolgroup = [rows[rowcolgroup], cols[rowcolgroup], groups[rowcolgroup]];
                let association_types = ["row", "col", "group"];
                let associated_sqs = [get_squares_in_row(rowcolgroup * 9), get_squares_in_col(rowcolgroup), get_squares_in_group(convert_group_to_square(rowcolgroup))];
                for(let i = 0; i < 3; i++){
                    let association_type = association_types[i];
                    let my_list = my_list_rowcolgroup[i];
                    if(my_list.length == 1){
                        update_game(my_list[0], [], [], [num]);
                        return true;
                    }
                    else if (my_list.length > 0){
                        same_row = true;
                        same_col = true;
                        same_group = true;
                        for (let sq of my_list){
                            if(get_row(sq) != get_row(my_list[0])){
                                same_row = false;
                            }
                            if(get_col(sq) != get_col(my_list[0])){
                                same_col = false;
                            }
                            if(get_group(sq) != get_group(my_list[0])){
                                same_group = false;
                            }
                        }
                        if(same_row && (association_type != "row")){
                            if(update_game("-", associated_sqs[i], get_squares_in_row(my_list[0]), [num]) == true){
                                return true;
                            }
                        }
                        if(same_col && (association_type != "col")){
                            if(update_game("-", associated_sqs[i], get_squares_in_col(my_list[0]), [num]) == true){
                                return true;
                            }
                        }
                        if(same_group && (association_type != "group")){
                            if(update_game("-", associated_sqs[i], get_squares_in_group(my_list[0]), [num]) == true){
                                return true;
                            }
                        }
                    }
                }
            }
            
        }
        let my_answer = look_for_pattern();
        // console.log("check", my_answer)
        if(my_answer[0]){
            if(update_game("-", my_answer[2], my_answer[3] ,my_answer[1])){
                return true;
            }
        }
        if(chaining_check_mode_on == false){
            console.log("chaining on...")
            chaining();
        }
        console.log("uh oh")
        highlight_num(selected_num);
        return false;
    }
    function update_game(index, original_squares, eligible_squares, values){
        //Updates the gameboard based on the move:
        // if there is an index, fill in that value, and put all
        //sqs in the same rcg in eligibile squares
        // then, go through "eligible squares" (the sqs that may
        //need the values removed), and if they are not original sqs
        // and are blank and have the value, remove it and document.
        //function will return whether or not an update could be made
        let change_occurred = false;
        let move_log_entry = {};
        let squares_affected = [];
        let old_options = [];
        for(let value of values){
            squares_affected.push([]);
        }        
        if(index != "-"){
            old_options = game_list[index];
            fill_in_value(index, values[0]);
            //FIXME assert statement
            change_occurred = true;
            eligible_squares = get_associated_sqs(index);
        }
        for (let square of eligible_squares){
        //  if not in first thing and is blank
            if (!original_squares.includes(square) && blank_squares.includes(square)){
                for (let i = 0; i < values.length; i++){
                    if (remove_option_from_square(square, values[i])) {
                        squares_affected[i].push(square);
                        change_occurred = true;
                    }
                }
            }

        }
        if(change_occurred){
            move_log_entry["index"] = index;
            move_log_entry["new_values"] = values;
            move_log_entry["old_options"] = old_options;
            move_log_entry["squares_affected"] = squares_affected;
            move_log.push(move_log_entry);
        }
        return change_occurred;
    }
    function undo_move() {
        //Reverts to one move prior using the change log
        if(move_log.length < 1){
            //FIXME do a warning
            console.log("Whoops... nothing to undo");
            return
        }
        let last_move = move_log.pop();
        let index = last_move["index"];
        let new_values = last_move["new_values"];
        for (let i = 0; i < new_values.length; i++){
            for (let square of last_move["squares_affected"][i]){
                console.log(square);
                game_list[square].push(new_values[i]);
                game_list[square].sort();
                squares[square].innerText = game_list[square].join(' ');
            }
        }
        if( index != '-'){
            blank_squares.push(index);
            blank_squares.sort();
            game_list[index] = last_move["old_options"];
            squares[index].style.fontSize = "18px"
            squares[index].innerText = game_list[index].join(' ');
        }
        highlight_num(selected_num);
    }
    function look_for_pattern(){
        //Goes through each association on the board, and calls is_set_pattern of all the blanks
        //in that association
        // for each of the row/col/group
        for (let row_col_group = 0; row_col_group < 9; row_col_group++){
            rcg_squares_list = [get_blanks(get_squares_in_col(row_col_group)), get_blanks(get_squares_in_row(row_col_group * 9)), get_blanks(get_squares_in_group(convert_group_to_square(row_col_group)))];
            // for row, col, and group
            for (let rcg of rcg_squares_list){
                let my_answer = is_set_pattern([], [], rcg, rcg);
                if( my_answer[0]){
                    return my_answer;
                }
            }
        }
        return [false, [], [], []];
    }
    //takes a list of blanks from a association and returns if they have a subset that helps
    function is_set_pattern(list_of_els, list_sqs_added, list_sqs_remain, rcg_sqs){
               //Given a list of elements that is a set union of a list of squares, and a second list
       // of squares that can also be added to the set, as well as a a count of blanks in the
       // association, the function recursively decides if there is a possible set of the squares
       // added and any other combination of squares from the remaining squares list such that
       // all the elements (options) from all the squares has the same cardinality as the list of
       // squares. We know there can be no such subset if the combined elements are the number of
       // blanks.
        // console.log("list_of_els:", list_of_els, "list_sqs_added:", list_sqs_added, "list_sqs_remain:", list_sqs_remain, "num_blank_sqs:", num_blank_sqs)
        // console.log("list", list_sqs_added);
        // console.log("len", list_sqs_added.length);
        // for (let item of list_sqs_added){
        //     console.log(item)
        // }
        if(list_of_els.length == rcg_sqs.length){
            return [false, [], [], rcg_sqs];
        }
        if(list_of_els.length == list_sqs_added.length && list_of_els.length > 0){
            for(let sq of rcg_sqs){
                if(blank_squares.includes(sq) && !list_sqs_added.includes(sq)){
                    for(let el of list_of_els){
                        if(game_list[sq].includes(el)){
                            console.log(sq, "includes ", el)
                            return [true , list_of_els, list_sqs_added, rcg_sqs];
                        }
                    }
                }
            }
        }
        for (let i = 0; i < list_sqs_remain.length; i++){
            // console.log("i", i);
            let new_els_list = combine_lists(list_of_els, game_list[list_sqs_remain[i]]);
            let new_sqs_added = list_sqs_added.slice();
            new_sqs_added.push(list_sqs_remain[i]);
            // console.log("List before slice:", list_sqs_remain);
            let new_remain_list = list_sqs_remain.slice(i + 1);
            // console.log("spliced list:", new_remain_list);
            let my_answer = is_set_pattern(new_els_list, new_sqs_added, new_remain_list, rcg_sqs);
            if (my_answer[0] == true){
                return my_answer;
            }
        }
        return [false, [], [], rcg_sqs];
    }
    function chaining(){
        //checks to see if filling in a square would cause a chain
        //reaction that created a board that broke the rules
        let count = 1;
        chaining_check_mode_on = true;
        let temp_blank_squares = deepCopy(blank_squares);
        let temp_game_list = deepCopy(game_list);
        let temp_move_log = deepCopy(move_log);
        let sorted_blanks = sortByPossibleValues(blank_squares);

        // for (let val of game_list[sorted_blanks[0]]){
        chaining_check_mode_on = true;
        console.log("Candidate: ", sorted_blanks[0], " val: ", game_list[sorted_blanks[0]][1]);
        update_game(sorted_blanks[0], [], [], [game_list[sorted_blanks[0]][1]]);
        while(make_move()){
            console.log(count);
            count++;
        }
        console.log("loss? ", check_for_loss());
        console.log("win? ", check_for_win());
        // if(check_for_loss() || check_for_win()){
        //     break;
        // }
        // revert(temp_blank_squares, temp_game_list, temp_move_log);
        // }
    }
    function revert(temp_blank_squares, temp_game_list, temp_move_log){
        //temp function to revert chaining
        chaining_check_mode_on = false;
        blank_squares = deepCopy(temp_blank_squares);
        game_list = deepCopy(temp_game_list);
        move_log = deepCopy(temp_move_log);
        console.log("Blanks: ", blank_squares);
        console.log("Gamelist: ", game_list);
        console.log("Movelog: ", move_log);
        // fill_in_value(blank_squares[0], game_list[blank_squares[0]]);
        for (let i = 0; i < 81; i++){
            if(blank_squares.includes(i)){
                squares[i].innerText = game_list[i].join(' ');
                squares[i].style.fontSize = "18px";
            }
            else{
                squares[i].innerText = game_list[i];
                squares[i].style.fontSize = "5vw";
            }
        }
        highlight_num(selected_num);
    }
    function sortByPossibleValues(blanks) {
        // Sort the blank squares array based on the length of the list at the corresponding index in gameList
        blanks.sort((index1, index2) => {
            const possibleValues1 = Array.isArray(game_list[index1]) ? game_list[index1].length : 0;
            const possibleValues2 = Array.isArray(game_list[index2]) ? game_list[index2].length : 0;
            return possibleValues1 - possibleValues2;
        });
        return blanks;
    }
});