const Discord = require("discord.js");
const bot = new Discord.Client();

const token = "NzAyMDExMjk5NTE2OTA3NjAy.Xp50-A.A1fB4mQIdZOkYAxX8vXQDaekpB8";
bot.login(token);

const prefix = "/";

var shouldPing = false;
var pingChannel, pingUser;
const whitelistedChannles = ["746223521453047868"];

bot.on("ready", () => {
    console.log("Bot is online");
});
//bot.on('message', msg => {if(msg.content === "HELLO"){msg.reply('HELLO!')};})

bot.on("message", (message) => {
    console.log(message.content);
    let args = message.content.substring(prefix.length).split(" ");
    if (message.content.substring(0, 1) === prefix) {
        switch (args[0]) {
            case "cls":
                message.channel.bulkDelete(99).catch();
                break;
            case "ping":
                if (!whitelistedChannles.includes(message.channel.id)) { return; }
                pingChannel = message.channel;
                pingUser = args[1];
                shouldPing = true;
                setInterval(function() {
                    if (!shouldPing) {
                        return;
                    }
                    pingChannel.send(
                        "My life is pain and thus I must ping.\n" + pingUser
                    );
                }, 3000);
                break;
            case "pingstop":
                if (!whitelistedChannles.includes(message.channel.id)) { return; }
                shouldPing = false;
                break;
            case 'test':
                message.reply(message.member.time);
                break;
            default:
                return;
        }
    }
});