const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const { Guilds, GuildMessages, MessageContent } = GatewayIntentBits;
const client = new Client({ intents: [Guilds, GuildMessages, MessageContent] });
const kiwiMode = true;
const { token } = require(kiwiMode ? './token_kiwi.js' : './token.js');

const DATA = {};

const admin = {
    id: null,
    name: null,
    money: 0
}

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
        userData[userId] = DATA.copyUserData(admin);
        userData[userId].name = username;
        userData[userId].id = userId;
        DATA.saveData(userData);
    } else {
        // 이 유저는 객체가 이미 있다는 뜻.
    }
    return userData[userId];
}

let userData = {};

const fileName = './userDataBase/userData.json';

if (fs.existsSync(fileName)) {
    // 로드된 json 값들을 모두 userData에 저장하기.
    userData = DATA.loadData();

    // 업데이트되었는지.
    let isUpdated = false;

    // 각 유저 객체를 하나하나 돌면서.
    for (const userId in userData) {
        // admin 객체의 각 프로퍼티를 확인하며 돈다.
        for (const property in admin) {
            // 만약 유저 객체 중 undefined와 완전히 일치하는 값이 발견되면
            if (userData[userId][property] === undefined) {
                // 즉시 그 undefined 값을 admin에 해당하는 값으로 채운다
                userData[userId][property] = DATA.copyUserData[admin][property];
                // 그리고는 유저 객체에 바뀐 값이 있다고 말하기.
                isUpdated = true;
            }
        }
    }

    // 반복문에서 빠져나온 후 isUpdated 변수가 true로 되어있으면 유저 값이 바꼈다는 소리니, 유저 값들 JSON에 저장하기.
    if (isUpdated) DATA.saveData(userData);
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