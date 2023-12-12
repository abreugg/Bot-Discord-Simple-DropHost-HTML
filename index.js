const Discord = require("discord.js");
const { exec } = require('child_process');

const client = new Discord.Client({
    intents: [1, 512, 32768, 2, 128]
});
const config = require("./config.json");

function executeCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Erro ao executar o comando: ${command}`);
                console.error(stderr);
                reject(error);
            } else {
                console.log(`Comando executado com sucesso: ${command}`);
                console.log(stdout);
                resolve();
            }
        });
    });
}

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.channel.type === Discord.ChannelType.DM) return;
    if (message.channel.id == config.canal && message.attachments) {
        message.attachments.map(async file => {
            if (file.contentType !== 'application/zip') return message.reply('O arquivo deve esta em formato ZIP')
            var urlFile = file.url.split('?')[0]
            await executeCommand(`wget -P /var/www/html/${config.domain}/${message.author.username} ${urlFile}`);
            await executeCommand(`unzip -o /var/www/html/${config.domain}/${message.author.username}/${file.name} -d /var/www/html/${config.domain}/${message.author.username}`);
            await executeCommand(`rm /var/www/html/${config.domain}/${message.author.username}/${file.name}`);
            message.channel.send(`${file.name} upado com sucesso!\nURL: https://${config.domain}/${message.author.username}`)
        })
    }

});


client.on("ready", () => {
    console.log(`bot on -> ${client.user.username}!`)
})

client.login(config.token)