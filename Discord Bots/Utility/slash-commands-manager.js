//
// Documentation: https://github.com/MeguminSama/discord-slash-commands
//
const fs = require('fs-extra');
const { DiscordInteractions } = require('slash-commands');

const token = fs.readFileSync("./appdata/token.txt", "utf-8");
const applicationId = "746222677555019859";
const guildId = "318007876524441611";
const publicKey = "38b9f0e8f26f74322664b22bfb47d401f7b9ad0bdcbe272dcb1eb34896fb0dd5";
const config = fs.readJsonSync('./appdata/commandConfig.json');

const interaction = new DiscordInteractions({
    applicationId: applicationId,
    authToken: token,
    publicKey: publicKey,
});
//
interaction.getApplicationCommands(guildId)
    .then(commandList => {
        commandList.forEach(command => {
            interaction.deleteApplicationCommand(command.id, guildId)
                .then(console.log)
                .catch(console.error);
        });
    })
    .catch(console.error);