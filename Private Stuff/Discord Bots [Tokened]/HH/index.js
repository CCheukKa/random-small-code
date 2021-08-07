const Discord = require('discord.js');
const bot = new Discord.Client();

const token = 'NzAyMTEyMzI5NTk2MTQxNjYz.Xp7TDw.hNFm6Z8F3-jLUXvO-OLGqBMHXlk';
bot.login(token);

const h = ["h","H"];
const dot = '.';
const slash = '/';
const question = "?";


bot.on('ready', () => {console.log('Bot is online');})
//bot.on('message', msg => {if(msg.content === "HELLO"){msg.reply('HELLO!')};})

bot.on('message', message=>{

    if(message.member.id.valueOf() === "702112329596141663"){return}

    let args = message.content.substring(1).split(" ");

    if(args[0] === "fuck"){
        message.reply("fuck you too");
    }

    if(message.content.substring(0,1) === dot && (args[0] === "" | args[0] === ".")){
        message.channel.send(".\n..\n...\n....\n.....\n......");
    }

    if((h.includes(message.content.substring(0,1)) && !(message.content.substring(1,2))) | ( h.includes(message.content.substring(0,1)) && h.includes(message.content.substring(1,2)))){

        var text= "";

        for (let index = 0; index < (Math.random()^3)*30+20 ; index++) {
            if(Math.random()<0.5){
                text = text + "h";
            }else{
                text = text + "H";
            }
            
        }

        message.channel.send(text);

    }

    if(message.content.substring(0,1) === slash){
        switch(args[0]){
            case 'id':
                message.reply("Your discord ID is: " + message.member.id.valueOf());
                break;

        }
    }

    if(message.content.substring(0,1) === question){
        for (let index = 0; index < (Math.random()^3)*20+8; index++) {
            if(Math.random()*5 < 3){
                text = text + "?";
            }else{
                text = text + "!"
            }
        }
        message.channel.send(text);
    }

});