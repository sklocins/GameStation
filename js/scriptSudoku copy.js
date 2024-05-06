document.addEventListener('DOMContentLoaded', function() {
    const squares = document.querySelectorAll('.square');
    const all_options = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const orig_game_list = ['-',  8 , '-', '-', '-',  9 , '-', '-', '-',
                             2 , '-',  9 , '-',  4 , '-',  5 , '-', '-',
                            '-',  1 , '-', '-', '-',  6 , '-',  7 , '-',
                            '-', '-', '-', '-', '-', '-',  2 , '-',  6 ,
                            '-',  3 , '-', '-', '-', '-', '-',  5 , '-',
                             6 , '-',  1 , '-', '-', '-', '-', '-', '-',
                            '-',  5 , '-',  3 , '-', '-', '-',  1 , '-',
                            '-', '-',  4 , '-',  2 , '-',  9 , '-',  3 ,
                            '-', '-', '-',  1 , '-', '-', '-',  4 , '-'];
    // const orig_game_list = [ 3 ,  9 , '-', '-',  7 , '-', '-', '-',  5 ,
    // '-', '-', '-', '-', '-',  3 , '-', '-',  2 ,
    // '-', '-', '-',  4 ,  1 , '-', '-', '-', '-',
    // '-',  5 , '-', '-', '-', '-',  2 , '-', '-',
    // 6 , '-',  9 , '-', '-', '-',  7 , '-',  4 ,
    // '-', '-',  4 , '-', '-', '-', '-',  1 , '-',
    // '-', '-', '-', '-',  3 ,  2 , '-', '-', '-',
    // 7 , '-', '-',  6 , '-', '-', '-', '-', '-',
    // 2 , '-', '-', '-',  5 , '-', '-',  4 ,  8 ];
    let game_list = [];
    let blank_squares = [];
    let move_log = [];
    let selected_num = 0;
    setup();

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
        for (let i = 0; i < 81; i++) {
            if(game_list[i] != '-'){
                squares[i].innerText = game_list[i]
            }
            else{
                fill_in_options(i);
                squares[blank].style.fontSize = "18px";
                blank_squares.push(i);
            }
        }
    }
    function fill_in_options(index){
        //Fills in the numbers (options) for the blank that don't conflict 
        //with filled in numbers in the row, col, or group.
        let options = []
        let nums_in_col = get_nums_in_squares(get_squares_in_col(index));
        let nums_in_row = get_nums_in_squares(get_squares_in_row(index));
        let nums_in_group = get_nums_in_squares(get_squares_in_group(index));
        for (let num of all_options){
            if (!nums_in_col.includes(num) && !nums_in_row.includes(num) && !nums_in_group.includes(num)){
                options.push(num)
            }
        }
        result = options.join(' ')
        game_list[index] = options;
        squares[index].innerText = result;
    }

    function get_col(index){
        return index % 9;
    }

    function get_row(index){
        return Math.floor(index/9);
    }

    function get_group(index){
        let index_col = get_col(index)
        let index_row = get_row(index)
        let start_col = index_col - index_col % 3;
        let start_row = index_row - index_row % 3;
        return (start_row + start_col/3);
    }

    function get_nums_in_squares(list_of_squares){
        nums_in_list = [];
        for (let square of list_of_squares) {
            if (!blank_squares.includes(square)){
                nums_in_list.push(parseInt(squares[square].innerText))
            }
        }
        return nums_in_list;
    }
    function get_squares_in_col(index){
        let start = get_col(index);
        let squares_in_col = [];
        for (let i = start; i < squares.length; i += 9) {
            squares_in_col.push(i);
        }
        return squares_in_col;
    }
    function get_squares_in_row(index){
        let start = get_row(index) * 9;
        let squares_in_row = [];
        for (let i = start; i < start + 9; i += 1) {
            squares_in_row.push(i);
        }
        return squares_in_row;
    }
    function get_squares_in_group(index){
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

    function make_move() {
        //check each blank to see if there is only possibility
        for (let i = 0; i < blank_squares.length; i++) {
            if (game_list[blank_squares[i]].length == 1){
                let sq_index = blank_squares[i];
                let new_value = game_list[sq_index][0];
                update_game(sq_index, new_value)
                return
            }
        }
        let squares_with_num_in_row = [];
        let squares_with_num_in_col = [];
        for(let num of all_options){ 
            let groups = [ [], [], [], [], [], [], [], [], [] ];
            //go through the blanks w/ num and put them in the appropriate groups
            for (let blank of blank_squares){
                if(game_list[blank].includes(num)){
                    groups[get_group(blank)].push(blank);
                }
            }
            for(let rowcolgroup = 0; rowcolgroup < 9; rowcolgroup++){
                squares_with_num_in_row = [];
                squares_with_num_in_col = [];
                //checks the row
                for(let sq = rowcolgroup * 9; sq < (rowcolgroup + 1) * 9; sq++){
                    if(blank_squares.includes(sq)){
                        if(game_list[sq].includes(num)){
                            squares_with_num_in_row.push(sq);
                        }
                    }
                }
                //checks the col
                for(let sq = rowcolgroup; sq < squares.length; sq+=9){
                    if(blank_squares.includes(sq)){
                        if(game_list[sq].includes(num)){
                            squares_with_num_in_col.push(sq);
                        }
                    }
                }
                let my_list_rowcolgroup = [squares_with_num_in_row, squares_with_num_in_col, groups[rowcolgroup]];
                let association_types = ["row", "col", "group"];
                let associated_sqs = [get_squares_in_row(rowcolgroup * 9), get_squares_in_col(rowcolgroup), get_squares_in_group(convert_group_to_square(rowcolgroup))];
                for(let i = 0; i < 3; i++){
                    let association_type = association_types[i];
                    let my_list = my_list_rowcolgroup[i];
                    if(my_list.length == 1){
                        update_game(my_list[0], num);
                        return
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
                            if(update_area(associated_sqs[i], get_squares_in_row(my_list[0]), [num]) == true){
                                return;
                            }
                        }
                        if(same_col && (association_type != "col")){
                            if(update_area(associated_sqs[i], get_squares_in_col(my_list[0]), [num]) == true){
                                return;
                            }
                        }
                        if(same_group && (association_type != "group")){
                            if(update_area(associated_sqs[i], get_squares_in_group(my_list[0]), [num]) == true){
                                return;
                            }
                        }
                    }
                }
            }
            highlight_num(selected_num);
        }
        let my_answer = look_for_pattern();
        console.log("check", my_answer)
        if(my_answer[0]){
            // console.log("HIIII");
            // console.log("1:", my_answer[1]);
            // console.log("2:", my_answer[2]);
            // console.log(my_answer);
            if(update_area( my_answer[2], my_answer[3] ,my_answer[1])){
                return;
            }
        }
        console.log("uh oh")
    }
    function look_for_pattern(){
        // for each of the row/col/group
        for (let row_col_group = 0; row_col_group < 9; row_col_group++){
            rcg_squares_list = [get_squares_in_col(row_col_group), get_squares_in_row(row_col_group * 9), get_squares_in_group(convert_group_to_square(row_col_group))];
            // rcg_nums_list = [get_nums_in_squares(get_squares_in_col(row_col_group)), get_nums_in_squares(get_squares_in_row(row_col_group * 9)), get_nums_in_squares(get_squares_in_group(convert_group_to_square(row_col_group)))];
            // for row, col, and group
            for (let x = 0; x < rcg_squares_list.length; x++){
                let my_blanks_in_rcg = [];
                let my_blank_count = 0;
                // for each square in rcg
                for (let i = 0; i < rcg_squares_list[x].length; i++){
                    if(blank_squares.includes(rcg_squares_list[x][i])){
                        my_blanks_in_rcg.push(rcg_squares_list[x][i]);
                        my_blank_count += 1;
                    }
                }
                
                let my_answer = is_set_pattern([], [], my_blanks_in_rcg, my_blank_count, rcg_squares_list[x]);
                if( my_answer[0]){
                    return my_answer;
                }
            }
        }
        return [false, [], [], []];
    }
    function update_area(original_squares, eligible_squares, values){
        let removal = false;
        let move_log_entry = {};
        let squares_affected = [];
        for(let value of values){
            squares_affected.push([]);
        }
        for (let square of eligible_squares){
        //  if not in first thing and is blank
            if (!original_squares.includes(square) && blank_squares.includes(square)){
                for (let i = 0; i < values.length; i++){
                    let index_of_option = game_list[square].indexOf(values[i]);
        //          remove val from blank if it exists
                    if (index_of_option !== -1) {
                        console.log("Removing ", values[i], " from square ", square)
                        game_list[square].splice(index_of_option, 1);
                        result = game_list[square].join(' ');
                        squares[square].innerText = result;
                        squares_affected[i].push(square);
                        removal = true;
                    }
                }
            }

        }
        if(removal){
            move_log_entry["index"] = '-';
            move_log_entry["new_values"] = values;
            move_log_entry["old_options"] = [];
            move_log_entry["squares_affected"] = squares_affected;
            move_log.push(move_log_entry);
        }
        return removal;
    }
    function convert_group_to_square(group_num){
        return 9 * Math.floor(group_num) + (group_num % 3) * 3;     
    }
    function undo_move() {
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
    function update_game(index, new_value) {
        let move_log_entry = {};
        let squares_affected = [];
        move_log_entry["index"] = index;
        move_log_entry["new_values"] = [new_value];
        move_log_entry["old_options"] = game_list[index];
        squares[index].style.fontSize = "5vw";
        squares[index].innerText = new_value;
        game_list[index] = new_value;
        // console.log("changing blank at ", sq_index, " to ", new_value)
        let index_in_blanksquares = blank_squares.indexOf(index);
        //FIXME - Maybe have some assert statement here later
        blank_squares.splice(index_in_blanksquares, 1);
        for (let blank of blank_squares){
            if (get_col(index) == get_col(blank) || get_row(index) == get_row(blank) || get_group(index) == get_group(blank)){
                let index_of_option = game_list[blank].indexOf(new_value);
                if (index_of_option !== -1) {
                    game_list[blank].splice(index_of_option, 1);
                    result = game_list[blank].join(' ');
                    squares[blank].innerText = result;
                    squares_affected.push(blank);
                }
            }
        }
        move_log_entry["squares_affected"] = [squares_affected];
        move_log.push(move_log_entry);
    }
    //takes a list of blanks from a association and returns if they have a subset that helps
    function is_set_pattern(list_of_els, list_sqs_added, list_sqs_remain, num_blank_sqs, rcg_sqs){
        // console.log("list_of_els:", list_of_els, "list_sqs_added:", list_sqs_added, "list_sqs_remain:", list_sqs_remain, "num_blank_sqs:", num_blank_sqs)
        // console.log("list", list_sqs_added);
        // console.log("len", list_sqs_added.length);
        // for (let item of list_sqs_added){
        //     console.log(item)
        // }
        if(list_of_els.length == num_blank_sqs){
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
            let my_answer = is_set_pattern(new_els_list, new_sqs_added, new_remain_list, num_blank_sqs, rcg_sqs);
            if (my_answer[0] == true){
                return my_answer;
            }
        }
        return [false, [], [], rcg_sqs];
    }
    function combine_lists(list1, list2){
        let resultant_list = [];
        for (let el of all_options){
            if(list1.includes(el) || list2.includes(el)){
                resultant_list.push(el)
            }
        }
        return resultant_list;
    }
});

// function look_for_pattern(){
//     // for each of the row/col/group
//     for (let row_col_group = 0; row_col_group < 9; row_col_group++){
//         rcg_squares_list = [get_squares_in_col(row_col_group), get_squares_in_row(row_col_group * 9), get_squares_in_group(convert_group_to_square(row_col_group))];
//         rcg_nums_list = [get_nums_in_col(row_col_group), get_nums_in_row(row_col_group * 9), get_nums_in_group(convert_group_to_square(row_col_group))];
//         // for row, col, and group
//         for (let x = 0; x < rcg_squares_list.length; x++){
//             // for each square in rcg
//             for (let i = 0; i < rcg_squares_list[x].length; i++){
//                 if(blank_squares.includes(rcg_squares_list[x][i])){
//                     // console.log(rcg_squares_list[x], " i:", i)
//                     let sim = [rcg_squares_list[x][i]];
//                     let sim_missing = [rcg_squares_list[x][i]];
//                     // for each other square in rcg
//                     for (let j = i + 1; j < rcg_squares_list[x].length; j++){
//                         // console.log("Comparing ", game_list[rcg_squares_list[x][i]] ," and ", game_list[rcg_squares_list[x][j]]);
//                         // if they are both blanks and the same nums
//                         if(blank_squares.includes(rcg_squares_list[x][j])){
//                                                 // if(game_list[rcg_squares_list[x][i]].length === game_list[rcg_squares_list[x][j]].length && game_list[rcg_squares_list[x][i]].every((value, index) => value === game_list[rcg_squares_list[x][j]][index])){
//                             if(game_list[rcg_squares_list[x][i]].join(' ') == game_list[rcg_squares_list[x][j]].join(' ') && i != j){
//                         //     add them to sim
//                                 // console.log("WOAHHHH");
//                                 // console.log(rcg_squares_list[x][i], rcg_squares_list[x][j]);
//                                 sim.push(rcg_squares_list[x][j]);
//                             }

//                         }
//                     }
//                     // console.log("!!!", rcg_squares_list[x][i], sim.length);
//                     if(sim.length == game_list[rcg_squares_list[x][i]].length){
//                         // console.log("I am so cool!!!!!!!!!!!")
//                         if (update_area(sim, rcg_squares_list[x], game_list[rcg_squares_list[x][i]])){
//                             return true;
//                         }
//                     }
//                     // if(sim_missing.length == missing_needed_nums.length){
//                     //     console.log("I am so cool222!!!!!!!!!!!")
//                     //     let new_area = [];
//                     //     // for (let sq of rcg_squares_list[x]){
//                     //     //     if(sim_missing.includes)
//                     //     //     //if like 3 nums are missing 
//                     //     // }
//                     //     if (update_area(sim, rcg_squares_list[x], game_list[rcg_squares_list[x][i]])){
//                     //         return true;
//                     //     }
//                     // }
//                 }
//             }
//         }
//     }
//     return false;
// }