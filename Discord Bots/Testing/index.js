const Discord = require('discord.js');
const fs = require('fs');
const bot = new Discord.Client();

const token = fs.readFileSync('./appdata/token.txt', 'utf-8');
bot.login(token);

const prefix = '/';
var pianoMessage;
var pianoConnection;
var pianoChannel;

bot.on('ready', () => { console.log('Bot is online'); })
    //bot.on('message', msg => {if(msg.content === "HELLO"){msg.reply('HELLO!')};})

bot.on('message', message => {
    let args = message.content.substring(prefix.length).split(" ");
    if (message.content.substring(0, 1) === prefix) {
        switch (args[0]) {
            case 'piano':
                if (!message.member.voice.channel) {
                    message.reply(`join a voice channel first!`);
                    return;
                }
                message.reply(`here's your piano:\nCareful, I may be loud!`).then(msg => {
                    pianoMessage = msg;
                    msg.react('🇦');
                    msg.react('🇧');
                    msg.react('🇨');
                    msg.react('🇩');
                    msg.react('🇪');
                    msg.react('🇫');
                    msg.react('🇬');
                });
                message.member.voice.channel.join().then(connection => {
                    pianoConnection = connection;
                    pianoChannel = message.member.voice.channel;
                }).catch(console.error('Connection failed to attach'));
                break;

            case 'unpiano':
                if (!pianoChannel) {
                    pianoChannel.leave();
                }
                pianoChannel = null;
                pianoConnection = null;
                pianoMessage = null;
                message.reply('unpianoed');
                break;

        }
    }
})

bot.on('messageReactionAdd', (reaction, user) => {
    if (user.id == bot.user.id) { return; }
    if (!pianoMessage) { return; }
    if (reaction.message.id != pianoMessage.id) { return; }
    var note;
    switch (reaction.emoji.name) {
        case '🇦':
            note = 'A';
            break;
        case '🇧':
            note = 'B';
            break;
        case '🇨':
            note = 'C';
            break;
        case '🇩':
            note = 'D';
            break;
        case '🇪':
            note = 'E';
            break;
        case '🇫':
            note = 'F';
            break;
        case '🇬':
            note = 'G';
            break;
        default:
            reaction.users.remove(user.id).catch(console.error('Failed to remove reaction'));
            return;
    }
    reaction.users.remove(user.id).catch(console.error('Failed to remove reaction'));
    console.log(`${user.username} played ${note}`);

    //Play:
    const dispatcher = pianoConnection.play(`./appdata/notes/${note}.wav`);
    //
    return;
});