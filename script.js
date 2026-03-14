const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const { Guilds, GuildMessages, MessageContent } = GatewayIntentBits;
const client = new Client({ intents: [Guilds, GuildMessages, MessageContent] });
const kiwiMode = true;
const { token } = require(kiwiMode ? './token_kiwi.js' : './token.js');

const DATA = {};

DATA.saveData = function(userData) {
    fs.writeFileSync(`${fileName}`, JSON.stringify(userData, null, 2));
}
DATA.loadData = function() {
    return JSON.parse(fs.readFileSync(fileName, 'utf-8'));
}
DATA.copyUserData = function(target) {
    return JSON.parse(JSON.stringify(target));
}
DATA.getUserData = function(userId, username) {
    if (!userData[userId]) {
        userData[userId] = DATA.copyUserData(defualUserData);
        userData[userId].name = username;
        userData[userId].id = userId;
        DATA.saveData(userData);
    } else {
        console.log(`유저에 대한 값이 이미 있습니다!`);
    }
    return userData[userId];
}

let userData = {};

const fileName = './userDataBase/userData.json';

if (fs.existsSync(fileName)) {
    userData = DATA.loadData();
}

const defualUserData = {
    money: 0,
    level: 1
}

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    const msg = message.content.toLocaleLowerCase().trim();
    message.send = (content) => message.channel.send(content);
    const userId = message.author.id;
    

    if (msg == "login") message.send(`${!!userData[message.author.id]}`);
    if (msg == 'create') {
        DATA.getUserData(message.author.id, message.author.username);
        message.send(`작업 완료`);
    }

    if (!userData[userId]) return;

    var user = userData[userId];
    if (msg == "hello") message.send(`hello.`);

    DATA.saveData(userData);
});

client.once('clientReady', () => console.log(kiwiMode ? 'KIWI KIWI' : 'default mode on!'));
client.login(token);