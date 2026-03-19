const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const { Guilds, GuildMessages, MessageContent } = GatewayIntentBits;
const client = new Client({ intents: [Guilds, GuildMessages, MessageContent] });
const kiwiMode = false;
const { token } = require(kiwiMode ? './token_kiwi.js' : './token.js');

const admin = {
    id: null,
    name: null,
    money: 0,
    level: 1
};

const fileName = './userDataBase/userData.json';

const DATA = {};
DATA.saveData = function(userData) {
    fs.writeFileSync(`${fileName}`, JSON.stringify(userData, null, 2));
};
DATA.loadData = function() {
    return JSON.parse(fs.readFileSync(fileName, 'utf-8'));
};
DATA.copyData = function(target) {
    return JSON.parse(JSON.stringify(target));
};
DATA.getUserData = function(userId, username) {
    if (!userData[userId]) {
        userData[userId] = DATA.copyData(admin);
        userData[userId].name = username;
        userData[userId].id = userId;
        DATA.saveData(userData);
    } else {
        // 이 유저는 객체가 이미 있다는 뜻.
    }
    return userData[userId];
};
DATA.migration = function(target, schema) {
    let isUpdated = false;

    for (const id in target) {
        for (const prop in schema) {
            if (target[id][prop] === undefined) {
                target[id][prop] = DATA.copyData(schema[prop]);
                isUpdated = true;
            }
        }
    }
    // 업데이트 여부 리턴하기
    return isUpdated;
}

let userData = {};

if (fs.existsSync(fileName)) {
    // 로드된 json 값들을 모두 userData에 저장하기.
    userData = DATA.loadData();

    // 마이그레이션 함수의 boolean형 return 값을 조건문에 사용하기.
    if (DATA.migration(userData, admin)) {
        DATA.saveData(userData);
        console.log(`마이그레이션 완료!`);
    }
}

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    message.send = (content) => message.channel.send(content);
    const msg = message.content.toLocaleLowerCase().trim();

    const userId = message.author.id;
    const userName = message.author.username;
    
    // DATA.getUserData가 작동되지 않는 한 undefined임.
    var user = userData[userId];

    if (msg == "login") message.send(`${!!user}`);
    if (msg == 'create') {
        user = DATA.getUserData(userId, userName);
        message.send(`작업 완료`);
    }

    // 유저 객체가 undefined라면 즉시 함수 종료하기
    if (user === undefined) return;

    if (msg == "hello") message.send(`hello.`);

    DATA.saveData(userData);
});

client.once('clientReady', () => console.log(kiwiMode ? 'KIWI KIWI' : 'default mode on!'));
client.login(token);