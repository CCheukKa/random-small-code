const Discord = require('discord.js');
const bot = new Discord.Client();

const token = 'no lol';
bot.login(token);

const prefix = '/';

let slots = [];
let progress = []; //1=started 2=finished 3=abandoned
var latest = 0;
const allow = [];
var channels = [];
var intervalId = 0;

bot.on('ready', () => { console.log('Bot is online'); })
    //bot.on('message', msg => {if(msg.content === "HELLO"){msg.reply('HELLO!')};})

bot.on('message', message => {



    let args = message.content.substring(prefix.length).split(" ");
    if (message.content.substring(0, 1) === prefix) {
        if (allow.length > 0 && !allow.includes(args[0])) { console.log("Returned: " + args[0]); return; }


        switch (args[0]) {
            case 'cls':
                message.channel.bulkDelete(99);
                break;
            case 'test':
                message.reply(message.member.time);
                break;

        }
    }
})