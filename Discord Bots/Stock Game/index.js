const Discord = require('discord.js');
const bot = new Discord.Client();

const token = 'no lol';
bot.login(token);
bot.on('ready', ()=>{
    console.log('Bot is ready');
    bot.user.setActivity('Stock Game: Discord Edition', {type: 'PLAYING'});
    setup();
})

const prefix=["/","!",".",","];
const authorised=["318005585951850517","270479237129961472","459317455659991041"];
//               [CCheukKa,             Toby,                Yan,                Boki,                Emerson]
const registered=["318005585951850517","270479237129961472","459317455659991041","600219942654181376","594536525279133714"];
const needsauthorisation=['reset','p','progress','end','cls'];

//Declaration
{
var day=0;
var centraltend=500;
var stockprice = [];
var money=[];
var holdings=[];
var streak=0;
var change=0;
var multiplier=2;
var changefactor=5;
var streakfactor=3;
var actionfactor=1;
var action=0;
var actionlinger = 0.2;
var bouncefactor=2; //bounce after actions
var bouncebase=6;
var actionpast;
var subscribed=[];
var intervalID=0;
var cycleduration=1800000;
}

function setup(){
    day = 0;
    stockprice=[];
    stockprice[0] = centraltend;
    streak = 0;
    change = 0;
    registered.forEach(id => {
        money[id] = 5000;
        holdings[id] = 1;
    })
}

bot.on('message', message=>{
    if(!prefix.includes(message.content.substring(0,1))){return;}
        let pid=message.member.id.valueOf();
        let name=message.member.displayName.valueOf();
        let args = message.content.substring(1).split(" ");
        if(needsauthorisation.includes(args[0]) && !authorised.includes(pid)){
            message.reply("you are not authorised to perform this action.");
            return;
        }

        switch(args[0]){
            case 'cls':{
                message.channel.bulkDelete(100);
                break;
            }
            case 'test':{
                broadcast("This message is only sent to subscribed channels.");
                break;
            }
            case 'sub': case 'subscribe':{
                if(subscribed.includes(message.channel)){
                    message.channel.send("This channel is already subscribed.");
                }else{
                subscribed.push(message.channel);
                message.channel.send("This channel is now subscribed.");
                }
                break;
            }
            case 'log':{
                subscribed.forEach(element => {
                    console.log(element);
                });
                break;
            }
            case 'debug':{
                message.channel.send("day:"+day+"\ncentraltend:"+centraltend+"\ncycleduration:"+cycleduration+"\nchange:"+change+"\nstreak:"+streak+"\nmultiplier:"+multiplier+"\nchangefactor:"+changefactor+"\nstreakfactor:"+streakfactor+"\nactionfactor:"+actionfactor+"\naction(0):"+action+"\naction(-1):"+actionpast+"\nactionlinger:"+actionlinger+"\nbouncefactor:"+bouncefactor+"\nbouncebase:"+bouncebase+"\n\nstockprice[-3]\n | "+stockprice[day-3]+"\n | "+stockprice[day-2]+"\n | "+stockprice[day-1]+"\n | "+stockprice[day]+"\nstockprice[0]");
                break;
            }
            case 'id':{
                message.reply("your discord ID is:\n"+pid);
                break;
            }
            case 'channelid':{
                message.channel.send("The channel ID is:\n"+message.channel.id.valueOf());
                break;
            }
            case 'register':{
                if(registered.includes(pid)){
                    message.reply("you are already a registered player!");
                    break;
                }
                message.reply("Registered! You can play upon next reset.");
                console.log("------------Register request: "+name+" | "+pid+"------------------");
                break;
            }
            case 'help':{
                message.channel.send("Here are the available commands:\n/register :if you haven't already\n/inventory(/inv)\n/buy <amount>\n/sell <amount>\n/progress :to start new day\n/stock :to check stockprice");
                break;
            }
            case 'reset':{
                clearTimeout(intervalID);
                broadcast("Game is resetting...");
                setup();
                broadcast("Done");
                broadcast("Day " + day + " | Stockprice: $" + stockprice[day]);
                intervalID = setTimeout(() => {progress()}, cycleduration);
                break;
            }
            case 'end':{
                clearTimeout(intervalID);
                broadcast("Game ended");
                break;
            }
            case 'st': case 'stock':{
                message.channel.send("Day " + day + " | Stockprice: $" + stockprice[day]);
                break;
            }
            case 'p': case 'progress':{
                clearTimeout(intervalID);
                broadcast("Time is manually progressed by "+name);
                progress();
                break;
            }
            case 'i': case 'inv': case 'inventory':{
                message.reply("\n | You have $"+money[pid]+"\n | Stock-in-hand: "+holdings[pid]+"\nYou can buy at most "+Math.floor(money[pid]/stockprice[day])+" stock\nYou can get $"+stockprice[day]*holdings[pid]+" if you sell all of your stock");
                break;
            }
            case 'b': case 'buy':{
                if(args[1] === "all"){
                    buy(Math.floor(money[pid]/stockprice[day]), pid);
                    break;
                }
                args[1] = Math.round(args[1]);
                if(args[1]<0){
                    args[1] *= -1;
                    sell(args[1], pid);
                    break;
                }
                if(!(args[1]>=0)){
                    message.reply("second argument is invalid.");
                    break;
                }
                buy(args[1], pid);
                break;
            }
            case 's': case 'sell':{
                if(args[1] === "all"){
                    sell(holdings[pid], pid);
                    break;
                }
                args[1] = Math.round(args[1]);
                if(args[1]<0){
                    args[1] *= -1;
                    buy(args[1], pid);
                    break;
                }
                if(!(args[1]>=0)){
                    message.reply("second argument is invalid.");
                    break;
                }
                sell(args[1], pid);
                break;
            }
            default: return;

        }

    function progress(){
        day++
        change = Math.round(Math.random()*(2*changefactor*multiplier+1) - changefactor*multiplier);
        
        if((streak > streakfactor*multiplier && change < 0 )|(streak < streakfactor*multiplier && change > 0)){
            streak += action + bouncebase * change / Math.abs(change) + Math.round(change * bouncefactor); //bounce after actions
        }else{
            streak += change + action;
        }
        streak += Math.round(action*actionlinger);
        stockprice[day] = stockprice[day-1] + change + streak + action;
        actionpast = action;
        action = 0;
    
        broadcast("Day " + day + " | Stockprice: $" + stockprice[day]);
        intervalID = setTimeout(() => {progress()}, cycleduration);
    }
    
    function buy(amount = 0, pid){
        if(amount == 0){
            message.reply("congratulations! You successfully achieved nothing! What a failure.");
            return;
        }
        if(money[pid] < (amount*stockprice[day])){
            message.reply("You don't have enough money, you fucking broke bitch!");
            return;
        }
        money[pid] -= amount * stockprice[day];
        holdings[pid] += amount;
        action += Math.round(actionfactor*amount)
        message.reply("you bought " + amount + " stock with $" + amount*stockprice[day]);
        console.log(name+" -$"+amount*stockprice[day]+" +%"+amount+" | $"+money[pid]+" %"+holdings[pid]);
    }
    
    function sell(amount = 0, pid){
        if(amount == 0){
            message.reply("congratulations! You successfully achieved nothing! What a failure.");
            return;
        }
        if(holdings[pid] < amount){
            message.reply("You don't have enough stock-in-hand, you fucking dingus!");
            return;
        }
        money[pid] += amount * stockprice[day];
        holdings[pid] -= amount;
        action -= Math.round(actionfactor*amount)
        message.reply("you sold " + amount + " stock for $" + amount*stockprice[day]);
        console.log(name+" +$"+amount*stockprice[day]+" -%"+amount+" | $"+money[pid]+" %"+holdings[pid]);
    }

    function broadcast(content){
        subscribed.forEach(channel => {
            channel.send(content);
        });
    }
})