const Discord = require('discord.js');
const bot = new Discord.Client();

const token = 'NzA0MTcyODM0MzkzNTU1MDI0.XqqZng.K5tSceXVyhtPspc9iDbV70ruqxk';
bot.login(token);
bot.on('ready', ()=>{
    console.log('Bot is ready');
    bot.user.setActivity('Chess', {type: 'PLAYING'});
})

{
var prefix = ["/",".",",","!"];
var grid = [""];
var empty = [""];
var boardInitialised = false;
var style1="．";
var style2="一";
var style3="一";
var x1,y1,x2,y2;
var piece = [0];
var closeAxes=false;
var illegalReason="";
var movementRulesEnabled=true;

var redpalace = [66,67,68,75,76,77,84,85,86];
var blackpalace = [3,4,5,12,13,14,21,22,23];

for (let i = 0; i < 90; i++) {
    piece[i] = 0;
    
}

empty =[style1,style1,style1,style1,style1,style1,style1,style1,style1,
        style1,style1,style1,style1,style1,style1,style1,style1,style1,
        style1,style1,style1,style1,style1,style1,style1,style1,style1,
        style1,style1,style1,style1,style1,style1,style1,style1,style1,
        style2,style2,style2,style2,style2,style2,style2,style2,style2,
        style3,style3,style3,style3,style3,style3,style3,style3,style3,
        style1,style1,style1,style1,style1,style1,style1,style1,style1,
        style1,style1,style1,style1,style1,style1,style1,style1,style1,
        style1,style1,style1,style1,style1,style1,style1,style1,style1,
        style1,style1,style1,style1,style1,style1,style1,style1,style1
      ];
}

bot.on('message', message=>{
    if(message.member.id.valueOf() === bot.user.id.valueOf()){return;}
    if(!prefix.includes(message.content.substring(0,1))){return;}
    let args=message.content.substring(1).split(" ");

    switch(args[0]){
        case 'empty':{
            grid=empty;
            boardInitialised=true;
            message.channel.send("Emptied");
            break;
        }
        case 'setup':{
            
            piece= [ 1, 2, 3, 4, 5, 4, 3, 2, 1,
                     0, 0, 0, 0, 0, 0, 0, 0, 0,
                     0, 6, 0, 0, 0, 0, 0, 6, 0,
                     7, 0, 7, 0, 7, 0, 7, 0, 7,
                     0, 0, 0, 0, 0, 0, 0, 0, 0,
                     0, 0, 0, 0, 0, 0, 0, 0, 0,
                    -7, 0,-7, 0,-7, 0,-7, 0,-7,
                     0,-6, 0, 0, 0, 0, 0,-6, 0,
                     0, 0, 0, 0, 0, 0, 0, 0, 0,
                    -1,-2,-3,-4,-5,-4,-3,-2,-1
            ]
            
            boardInitialised = true;
            break;
        }
        case 'style':{
            switch(args[1]){
                case '0':{
                    style1="十";
                    style2="丄";
                    style3="丅";
                    break;
                }
                case '1':{
                    style1="．";
                    style2="一";
                    style3="一";
                    break;
                }
                case '2':{
                    style1="　";
                    style2="一";
                    style3="一";
                    break;
                }
                default:{
                    message.reply(args[1] + " is an invalid style ID.");
                    return;
                }
            }
            empty =[style1,style1,style1,style1,style1,style1,style1,style1,style1,
                    style1,style1,style1,style1,style1,style1,style1,style1,style1,
                    style1,style1,style1,style1,style1,style1,style1,style1,style1,
                    style1,style1,style1,style1,style1,style1,style1,style1,style1,
                    style2,style2,style2,style2,style2,style2,style2,style2,style2,
                    style3,style3,style3,style3,style3,style3,style3,style3,style3,
                    style1,style1,style1,style1,style1,style1,style1,style1,style1,
                    style1,style1,style1,style1,style1,style1,style1,style1,style1,
                    style1,style1,style1,style1,style1,style1,style1,style1,style1,
                    style1,style1,style1,style1,style1,style1,style1,style1,style1
              ];
            message.channel.send("Style "+args[1]+" applied.");
            message.channel.send(construct());
            break;
        }
        case 'closeaxes':{
            switch(args[1]){
                case 'true':{
                    closeAxes=true;
                    break;
                }
                case 'false':{
                    closeAxes=false;
                    break;
                }
                default:{
                    message.reply("please input true/false for second argument.");
                    return;
                }
            }
            message.channel.send("CloseAxes is now "+closeAxes);
            message.channel.send(construct());
            break;
        }
        case 'movementrulesenabled':{
            switch(args[1]){
                case 'true':{
                    movementRulesEnabled=true;
                    break;
                }
                case 'false':{
                    movementRulesEnabled=false;
                    break;
                }
                default:{
                    message.reply("please input true/false for second argument.");
                    return;
                }
            }
            message.channel.send("MovementRulesEnabled is now "+closeAxes);
            break;
        }
        case 'raw':{
            message.channel.send(piece);
            break;
        }
        case 'board':{
            message.channel.send(construct());
            break;
        }
        case 'add':{
            if( !(args[1]>=-7 && args[1]<=7)  ){
                message.reply("Invalid piece ID: "+args[1]);
                break;
            }
            piece[coordsToIndex(args[2])]= args[1] * 2 / 2;
            message.channel.send(args[1]+" added to "+args[2]);
            message.channel.send(construct());
            break;
        }
        case 'move':{
            {
            if(args.length < 3){
                message.reply("please enter all the required arguments.");
                return;
            }

            switch(args[1].substring(0,1)){
                case 'a': x1=0; break;
                case 'b': x1=1; break;
                case 'c': x1=2; break;
                case 'd': x1=3; break;
                case 'e': x1=4; break;
                case 'f': x1=5; break;
                case 'g': x1=6; break;
                case 'h': x1=7; break;
                case 'i': x1=8; break;
                default:{
                    message.reply("x1:"+args[1].substring(0,1)+" is an invalid column");
                    return;
                }
            }
            if(!(args[1].substring(1,2) >= 0 && args[1].substring(1,2) <= 9)){
                message.reply("y1:"+args[1].substring(1,2)+" is an invalid row");
                return;
            }else{
                y1 = 9 - (Math.round(args[1].substring(1,2)));
            }
            switch(args[2].substring(0,1)){
                case 'a': x2=0; break;
                case 'b': x2=1; break;
                case 'c': x2=2; break;
                case 'd': x2=3; break;
                case 'e': x2=4; break;
                case 'f': x2=5; break;
                case 'g': x2=6; break;
                case 'h': x2=7; break;
                case 'i': x2=8; break;
                default:{
                    message.reply("x2:"+args[2].substring(0,1)+" is an invalid column");
                    return;
                }
            }
            if(!(args[2].substring(1,2) >= 0 && args[2].substring(1,2) <= 9)){
                message.reply("y2:"+args[2].substring(1,2)+" is an invalid row");
                return;
            }else{
                y2 = 9 - (Math.round(args[2].substring(1,2)));
            }
            }//parse
            {
                if(move( x1+9*y1 , x2+9*y2, piece[x1+9*y1], piece[x2+9*y2])){
                    piece[x2+9*y2] = piece[x1+9*y1];
                    piece[x1+9*y1] = 0;
                    message.channel.send(construct());
                }else{
                    message.reply("you cannot make that move!\nReason: "+illegalReason);
                }
                break;
            }//move
        }
        case 'chesshelp':{
            message.channel.send("Hello, I am a chess bot.\nHere are my available commands:\n**/empty** :clear the board\n**/setup** :setup the board for play\n**/move <coords1> <coords2>** :move a piece from coords1 to coords2, eg. a1\n**/board** :show the board\n**/add <piece ID> <coords>** :add a piece onto the board\n**/style [0/1/2]** :to toggle between styles\n**/closeaxes [true/flase]** :to toggle closeaxes\n**/movementrulesenabled [true/false]** :to toggle bot intervention for illegal moves\n\nI am still a young bot and I don't yet have rules for the horse and checks implemented. Please try to break the game to help debug.");
            break;
        }
    }
    return;

//---------FUCNTION DECLARATION---------------------------

    function construct(){
        if(!boardInitialised){
            return "Board is not yet initialised!";
        }
        for (let i = 0; i < 90; i++) {
            switch(piece[i]){
                case 0:{
                    grid[i] = empty[i];
                    break;
                }
                case 1:{
                    grid[i] = "車";
                    break;
                }
                case 2:{
                    grid[i]="馬";
                    break;
                }
                case 3:{
                    grid[i]="象";
                    break;
                }
                case 4:{
                    grid[i]="士";
                    break;
                }
                case 5:{
                    grid[i]="將";
                    break;
                }
                case 6:{
                    grid[i]="砲";
                    break;
                }
                case 7:{
                    grid[i]="卒";
                    break;
                }
                case -1:{
                    grid[i]="俥";
                    break;
                }
                case -2:{
                    grid[i]="傌";
                    break;
                }
                case -3:{
                    grid[i]="相";
                    break;
                }
                case -4:{
                    grid[i]="仕";
                    break;
                }
                case -5:{
                    grid[i]="帥";
                    break;
                }
                case -6:{
                    grid[i]="炮";
                    break;
                }
                case -7:{
                    grid[i]="兵";
                    break;
                }
                default:{
                    console.log("Invalid: piece["+i+"]="+piece[i]);
                    message.channel.send("Invalid: piece["+i+"]="+piece[i]);
                }
            }
        }
        let board="";

        if(!closeAxes){
            board += "```\n   ________________\n";
            for (let i = 0; i <= 9; i++) {
                board+= " "+(9-i) +"|";

                for (let j = 0; j <= 8; j++) {
                    board+= grid[i*9 + j];
                }

                board += "|\n";
            }
            board += "   ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\n   ａｂｃｄｅｆｇｈｉ\n```";
        }else{
            board += "```\n   ________________\n";
            for (let i = 0; i <= 9; i++) {
                board+= " "+(9-i)+"|";

                for (let j = 0; j <= 8; j++) {
                    board+= grid[i*9 + j];
                }

                board += "|\n";
            }
            board += "   ａｂｃｄｅｆｇｈｉ\n```";
        }

        return board;
    }

    function move(i1, i2, p1, p2){
        if(p1 == 0){
            illegalReason= "Moving air is an invalid action"
            return false;
        }//p1 has nothing
        if(i1 == i2){
            illegalReason = "Players are highly encouraged to move when it is their turn"
            return false;
        }//same space
        if((p2 != 0)&&( p1/Math.abs(p1) == p2/Math.abs(p2) )){
                illegalReason= "Friendly capture is not an encouraged behaviour"
                return false;
        }//friendly capture
        
        if(!movementRulesEnabled){return true;}

        switch(Math.abs(p1)){
            case 1:{//car
                if( x1!=x2 && y1!=y2 ){//not straight line
                    illegalReason = "Cars can only move in straight lines"
                    return false;
                }
                let a=[i1, i2];
                if(x1 != x2){//horizontal
                    for (let i = Math.min(a)+1; i < Math.max(a); i++) {//obstacle
                        if(piece[i] != 0){
                            illegalReason = "Obstacle found at "+ indexToCoords(i);
                            return false;
                        }
                    }
                }else{//vertical
                    for (let i = Math.min(a)+1; i < Math.max(a); i+=9) {//obstacle
                        if(piece[i] != 0){
                            illegalReason = "Obstacle found at "+ indexToCoords(i);
                            return false;
                        }
                    }
                }
                return true;
            }
            case 2:{//horse

            }
            case 3:{//elephant
                if( (p1 > 0 && y2 > 4) | (p1 < 0 && y2 < 5) ){//cross river
                    illegalReason = "Elephants cannot cross the river";
                    return false;
                }
                if( Math.abs(i1 - i2) != 20 && Math.abs(i1 - i2) != 16 ){//not diagonal
                    illegalReason = "Elephants can only move two steps along a diagonal";
                    return false;
                }
                let a = [i1, i2];
                if(Math.abs(i1-i2) == 16){//down left
                    if( (Math.min(a) + 8)%9 == 0 | (Math.min(a) + 8)%9 == 8 ){//out of board
                        illegalReason = "Elephants can only move two steps along a diagonal";
                        return false;
                    }
                    if(Math.min(a) != 0){
                        illegalReason = "Obstacle found at "+indexToCoords(Math.min(a)+8);
                        return false;
                    }
                }
                if(Math.abs(i1-i2) == 16){//down right
                    if( (Math.min(a) + 10)%9 == 0 | (Math.min(a) + 10)%9 == 8 ){//out of board
                        illegalReason = "Elephants can only move two steps along a diagonal";
                        return false;
                    }
                    if(Math.min(a) != 0){
                        illegalReason = "Obstacle found at "+indexToCoords(Math.min(a)+10);
                        return false;
                    }
                }
                return true;
            }
            case 4:{//servant
                if( (p1 > 0 && !blackpalace.includes(i2)) | (p1 < 0 && !redpalace.includes(i2)) ){//out of palace
                    illegalReason = "Servants cannot escape the palace";
                    return false;
                }
                if( Math.abs(i1 - i2) != 10 && Math.abs(i1 - i2) != 8 ){
                    illegalReason = "Servants can only move one step along a diagonal";
                    return false;
                }
                return true;
            }
            case 5:{//king
                if( (p1 > 0 && !blackpalace.includes(i2)) | (p1 < 0 && !redpalace.includes(i2)) ){//out of palace
                    illegalReason = "Kings cannot escape the palace";
                    return false;
                }
                if(Math.abs(i1 - i2) != 1 && Math.abs(i1 - i2) != 9){
                    illegalReason = "Kings can only move one step at a time";
                    return false;
                }
                return true;
            }
            case 6:{//cannon
                if( x1!=x2 && y1!=y2 ){//not straight line
                    illegalReason = "Cannons can only move in straight lines"
                    return false;
                }
                let a=[i1, i2];
                if(p2 == 0){//no capture
                    if(x1 != x2){//horizontal
                        for (let i = Math.min(a)+1; i < Math.max(a); i++) {//obstacle
                            if(piece[i] != 0){
                                illegalReason = "Obstacle found at "+ indexToCoords(i);
                                return false;
                            }
                        }
                    }else{//vertical
                        for (let i = Math.min(a)+1; i < Math.max(a); i+=9) {//obstacle
                            if(piece[i] != 0){
                                illegalReason = "Obstacle found at "+ indexToCoords(i);
                                return false;
                            }
                        }
                    }
                    return true;
                }else{//capture
                    var count=0;
                    if(x1 != x2){//horizontal
                        for (let i = Math.min(a)+1; i < Math.max(a); i++) {//obstacle
                            if(piece[i] != 0){
                                count++;
                            }
                        }
                    }else{//vertical
                        for (let i = Math.min(a)+1; i < Math.max(a); i+=9) {//obstacle
                            if(piece[i] != 0){
                                count++;
                            }
                        }
                    }
                    switch(count){
                        case 1: return true;
                        case 0: illegalReason = "Cannons must jump over another piece to capture"; return false;
                        default: illegalReason = "Cannons cannot jump over "+count+" pieces"; return false;
                    }
                }
            }
            case 7:{//pawn
                if( p1 > 0 && i2 == i1 + 9){return true;}
                if( p1 < 0 && i2 == i1 - 9){return true;}
                if( p1 > 0 && y2 < y1){//cannot move back
                    illegalReason = "Pawns cannot move backwards";
                    return false;
                }
                if( p1 < 0 && y2 > y1){//cannot move back
                    illegalReason = "Pawns cannot move backwards";
                    return false;
                }
                if(y1 != y2 | Math.abs(x1-x2) > 1){
                    illegalReason = "Pawns can only move one step at a time"
                    return false;
                }
                if(p1 * (y1-4.5) < 0 ){
                    illegalReason = "Pawns can only move sideways when they have crossed the central river";
                    return false;
                }
                return true;
            }
            default:{
                illegalReason = "Unknown piece ID";
                return false;
            }
        }
    }

    function indexToCoords(i){
        let coordx, coordy;
        switch(i%9){
            case 0: coordx = "a"; break;
            case 1: coordx = "b"; break;
            case 2: coordx = "c"; break;
            case 3: coordx = "d"; break;
            case 4: coordx = "e"; break;
            case 5: coordx = "f"; break;
            case 6: coordx = "g"; break;
            case 7: coordx = "h"; break;
            case 8: coordx = "i"; break;
        }
        coordy = Math.floor(i/9);
        return coordx+coordy;
    }

    
    function coordsToIndex(c){
        switch(c.substring(0,1)){
            case 'a': x=0; break;
            case 'b': x=1; break;
            case 'c': x=2; break;
            case 'd': x=3; break;
            case 'e': x=4; break;
            case 'f': x=5; break;
            case 'g': x=6; break;
            case 'h': x=7; break;
            case 'i': x=8; break;
        }
        return (9-(c.substring(1,2)))*9 + x;
    }
    

})


/*
0: empty :-0
1: 車 俥 :-1
2: 馬 傌 :-2
3: 象 相 :-3
4: 士 仕 :-4
5: 將 帥 :-5
6: 砲 炮 :-6
7: 卒 兵 :-7
*/

/*
    board += "```\n"
    board += "┌─┬─┬─┬─┬─┬─┬─┬─┐\n"
    board += "├─┼─┼─┼─┼─┼─┼─┼─┤\n"
    board += "├─┼─┼─┼─┼─┼─┼─┼─┤\n"
    board += "├─┼─┼─┼─┼─┼─┼─┼─┤\n"
    board += "├─┴─┴─┴─┴─┴─┴─┴─┤\n"
    board += "├─┬─┬─┬─┬─┬─┬─┬─┤\n"
    board += "├─┼─┼─┼─┼─┼─┼─┼─┤\n"
    board += "├─┼─┼─┼─┼─┼─┼─┼─┤\n"
    board += "├─┼─┼─┼─┼─┼─┼─┼─┤\n"
    board += "└─┴─┴─┴─┴─┴─┴─┴─┘\n"
    board += "```\n"
*/

/*
    board += "```\n"
    board += "   ________________\n"
    board += "9 ┃車馬象士將士象馬車┃\n"
    board += "8 ┃十十十十十十十十十┃\n"
    board += "7 ┃十砲十十十十十砲十┃\n"
    board += "6 ┃卒十卒十卒十卒十卒┃\n"
    board += "5 ┃丄丄丄丄丄丄丄丄丄┃\n"
    board += "4 ┃丅丅丅丅丅丅丅丅丅┃\n"
    board += "3 ┃兵十兵十兵十兵十兵┃\n"
    board += "2 ┃十炮十十十十十炮十┃\n"
    board += "1 ┃十十十十十十十十十┃\n"
    board += "0 ┃俥傌相仕帥仕相傌俥┃\n"
    board += "   ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\n"
    board += "   ａｂｃｄｅｆｇｈｉ\n"
    board += "```\n"
*/