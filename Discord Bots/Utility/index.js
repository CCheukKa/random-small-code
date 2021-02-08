//#region	//! Initialisation + Dependencies + Config fetch
const fs = require("fs");
const discord = require("discord.js");
const { setInterval } = require("timers");
var intervalFunction, botConfig;
generateLog('Initialised', '--------------------');
var prefixList;
updateParameters();
//#endregion
//#region	//! Discord
const bot = new discord.Client();
const token = fs.readFileSync("./appdata/token.txt", "utf-8");
bot.login(token);
bot.on("ready", () => {
    generateLog('Ready', 'Bot');
    bot.user.setActivity("over this server", { type: "WATCHING" });
});
//#endregion

bot.on("message", (message) => {
    if (!botConfig.discord.commandPrefix.includes(message.content.substring(0, 1))) { return; }
    let args = message.content.substring(1).split(' ');
    args[0] = args[0].toLowerCase();

    switch (args[0]) { //! General commands
        case 'help':
            message.reply("here are my commands:\n(Prefix: " + prefixList + ")\n allan please add details");
            break;
        case 'myid':
            message.reply("your user ID is:\n" + message.member.id);
            break;
        case 'channelid':
            message.reply("the ID for this channel is:\n" + message.channel.id);
            break;
        case 'guildid':
        case 'serverid':
            message.reply("the ID for this guild is:\n" + message.guild.id);
            break;
        default:
            break;
    }
    if (!botConfig.admin.idList.includes(message.author.id)) { return; }
    switch (args[0]) { //! Admin commands
        case 'updateparameters':
            updateParameters();
            message.reply("updated parameters");
            break;
        case "cls":
            message.channel.bulkDelete(99).catch();
            break;
        default:
            break;
    }
});

bot.on("voiceStateUpdate", (oldMember, newMember) => {
    let oldChannel = oldMember.channel;
    let newChannel = newMember.channel;
    let isExitEvent = !newMember.member.voice.channel;
    if (isExitEvent) { //leave
        newMember.member.voiceIdleTime = -1;
        if (oldChannel.members.size == 1) {
            oldChannel.members.forEach(member => {
                member.voiceIdleTime = botConfig.voice.maxIdleTimeInMinutes;
            })
        }
        return;
    }
    if (!isExitEvent && (oldMember.channel != newMember.channel)) { //join
        if (newChannel.members.size == 2) {
            newChannel.members.forEach(member => {
                member.voiceIdleTime = -1;
            });
            return;
        }
        if (newChannel.members.size == 1) {
            newMember.member.voiceIdleTime = botConfig.voice.maxIdleTimeInMinutes;
        }
    }
});

//#region   // Custom functions
//#region   //! Parameters
function updateParameters() {
    if (intervalFunction) { clearInterval(intervalFunction); }
    botConfig = JSON.parse(fs.readFileSync("./appdata/botConfig.json"));
    intervalFunction = setInterval(() => {
        intervalPerMinute();
    }, 60000); //ANCHOR
    prefixList = '';
    botConfig.discord.commandPrefix.forEach(prefix => {
        prefixList += '`' + prefix + '` ';
    });
    generateLog('Updated', 'Parameters');
    return;
}
//#endregion
//#region   //! Time-based functions
function intervalPerMinute() {
    bot.guilds.cache.forEach(guild => {
        guild.channels.cache.forEach(channel => {
            if (channel.type != 'voice') { return; }
            channel.members.forEach(member => {
                if (member.voiceIdleTime > 0) {
                    member.voiceIdleTime--;
                }
                if (member.voiceIdleTime == 0) {
                    member.voice.kick('Auto-kicked for idling for over ' + botConfig.voice.maxIdleTimeInMinutes + ' minutes');
                    member.send('You are auto-kicked from the voice channel **__' + channel.name + '__** in **__' + guild.name + '__** for idling alone for over ' + botConfig.voice.maxIdleTimeInMinutes + ' minutes.').catch(error => {});
                    generateLog('Kicked', memberToLogFormat(member) + ' from ' + channelToLogFormat(channel) + ' in ' + guildToLogFormat(guild));
                    member.voiceIdleTime = -1;
                }
            });
        });
    });
}
//#endregion
//#region   //! Meta
function getTimeStamp() {
    let d = new Date();
    return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear() + ', ' + d.toLocaleTimeString();
}

function generateLog(action, content) {
    let logMessage = getTimeStamp() + ' => ' + action + ': ' + content;
    console.log(logMessage);
    fs.appendFile('./appdata/log.txt', logMessage + '\n', function(err) { if (err) throw err; })
    return;
}

function memberToLogFormat(member) {
    return member.user.username + '(' + member.user.id + ')';
}

function channelToLogFormat(channel) {
    return channel.name + '(' + channel.id + ')';
}

function guildToLogFormat(guild) {
    return guild.name + '(' + guild.id + ')';
}
//#endregion
//#endregion
//#endregion