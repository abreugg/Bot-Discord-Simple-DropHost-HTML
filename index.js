const Discord = require("discord.js");
const { exec } = require('child_process');

const client = new Discord.Client({
    intents: [1, 512, 32768, 2, 128]
});
const config = require("./config.json");

function executeCommand(command, message) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Erro ao executar o comando: ${command}`);
                console.error(stderr);
                reject(error);
            } else {
                console.log(`Comando executado com sucesso: ${command}`);
                console.log(stdout);
                if(stdout){
                    message.channel.send(stdout.replace(/\/var\/www\/html\//g, "https://"));
                }
                resolve();
            }
        });
    });
}

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.channel.type === Discord.ChannelType.DM) return;
    if (message.channel.id == config.canal && message.attachments) {
        for (const file of message.attachments.values()) {
            if (file.contentType !== 'application/zip') return message.reply('O arquivo deve estar em formato ZIP');
            
            try {
                await executeCommand(`curl -o /var/www/html/${config.domain}/${message.author.username}/${file.name} '${file.url}'`, message);
                console.log(`Download do arquivo ${file.name} concluído`);
                
                await executeCommand(`unzip -o /var/www/html/${config.domain}/${message.author.username}/${file.name} -d /var/www/html/${config.domain}/${message.author.username}`, message);
                console.log(`Descompactação do arquivo ${file.name} concluída`);
                
                await executeCommand(`rm /var/www/html/${config.domain}/${message.author.username}/${file.name}`, message);
                console.log(`Remoção do arquivo ${file.name} concluída`);

                message.channel.send(`${file.name} upado com sucesso!\nURL: https://${config.domain}/${message.author.username}`);
            } catch (error) {
                console.error(`Erro ao processar o arquivo ${file.name}: ${error}`);
                message.channel.send(`Ocorreu um erro ao processar o arquivo ${file.name}.`);
            }
        }
    }
});



client.on("ready", () => {
    console.log(`bot on -> ${client.user.username}!`)
})

client.login(config.token)