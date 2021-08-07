const Discord = require("discord.js");
const bot = new Discord.Client();

const token = "NzQ2MjIyNjc3NTU1MDE5ODU5.Xz9MBg.w15Lq_F9NcvEBqcU9C2wgl01nu4";
bot.login(token);

const prefix = "/";

const allow = [];
const whitelistedChannels = ['746223521453047868'];
var shouldPing = false;
var pingChannel, pingUser;

bot.on("ready", () => {
    console.log("Bot is online");
});
//bot.on('message', msg => {if(msg.content === "HELLO"){msg.reply('HELLO!')};})

bot.on("message", (message) => {
    if (!whitelistedChannels.includes(message.channel.id)) { return; }
    let args = message.content.substring(prefix.length).split(" ");
    if (message.content.substring(0, 1) === prefix) {
        if (allow.length > 0 && !allow.includes(args[0])) {
            console.log("Returned: " + args[0]);
            return;
        }

        switch (args[0]) {
            case "cls":
                message.channel.bulkDelete(99).catch(error => { console.error(error) });
                break;
            case "ping":
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
                shouldPing = false;
                break;
            default:
                return;
        }
    }
});