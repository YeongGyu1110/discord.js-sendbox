const { Client, GatewayIntentBits } = require('discord.js');
const { Guilds, GuildMessages, MessageContent } = GatewayIntentBits;
const client = new Client({ intents: [Guilds, GuildMessages, MessageContent] });
const kiwiMode = false;
const { token } = require(kiwiMode ? './token_kiwi.js' : './token.js');


const fs = require('fs');
// 파일 이름만 덜렁 있으면 작업 폴더 바로 아래에 생성됨.
// 경로 달면 해당하는 경로에 파일 생김
const fileName = './userDataBase/userData.json';
let userData = {};
if (fs.existsSync(fileName)) {
    userData = loadUserData();
}
function saveUserData(userData) {

    fs.writeFileSync(`${fileName}`, JSON.stringify(userData, null, 2));
}
function loadUserData() {
    return JSON.parse(fs.readFileSync(fileName, 'utf-8'));
}
function getUserData(userId, username) {
    if (!userData[userId]) {
        userData[userId] = {
            id: userId,
            name: username,
            money: 0
        };
        saveUserData(userData);
    } else {
        console.log(`유저에 대한 값이 이미 있습니다!`);
    }
    return userData[userId];
}

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    const msg = message.content.toLocaleLowerCase().trim();
    message.send = (content) => message.channel.send(content);
    const userId = message.author.id;

    // 로그인 여부 보여주기
    if (msg == "login") message.send(`${!!userData[message.author.id]}`);
    if (msg == 'create') {
        getUserData(message.author.id, message.author.username);
        message.send(`작업 완료`);
    }

    if (!userData[userId]) return; // 유저 데이터에 userHash에 대한 값이 없다면 즉시 종료
    // 즉 이 아래는 유저 데이터가 있어야 작동하는 코드.

    var user = userData[userId];
    if (msg == "hello") message.send(`hello.`);

    saveUserData(userData);
});

client.once('clientReady', () => console.log(kiwiMode ? 'KIWI KIWI' : 'default mode on!'));
client.login(token);