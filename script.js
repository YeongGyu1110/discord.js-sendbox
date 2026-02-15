const kiwiMode = true;

const { Client, GatewayIntentBits } = require('discord.js');
const { Guilds, GuildMessages, MessageContent } = GatewayIntentBits;
const client = new Client({ intents: [Guilds, GuildMessages, MessageContent] });
const { token } = require(kiwiMode ? './token_kiwi.js' : './token.js');

client.login(token);

let userData = {};

function getUserData(message) {
    const sender = message.author.id;
    if (!userData[sender]) {
        userData[sender] = {
            id: sender,
            name: message.author.username
        };
    }
    return userData[sender];
}

// 그래서 async가 뭔데
client.on("messageCreate", async (message) => {

    // 메시지 작자가 bot이라면 message.author.bot이 true가 되는데 그렇다면 이 익명 함수 전체를 끝내버리기.
    if (message.author.bot) return;

    // 메모리 영역에 저장되는 유저 객체 생성
    let user = getUserData(message);

    // 메시지 전체 소문자 변경, 앞 뒤 공백 제거
    const msg = message.content.toLocaleLowerCase().trim();
    // message.channel.send에서 .channel 제거해서 message.send으로 간략하게 하기
    message.send = (content) => message.channel.send(content);

});

client.once('clientReady', () => console.log(kiwiMode ? 'KIWI KIWI' : 'default mode on!'));