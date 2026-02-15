const { Client, GatewayIntentBits } = require('discord.js');
const { Guilds, GuildMessages, MessageContent } = GatewayIntentBits;
const client = new Client({ intents: [Guilds, GuildMessages, MessageContent] });
const { token } = require('./token.js');

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



    /*
    증감 연산자 후위형 테스트

    1. count++으로 증가 전의 값 반환하여 보여주기
    2. count +1 하기.
    3. +1 이 완료된 count를 읽어 count 값을 보여준다.

    결론: 후위형 증가 연산자는 값이 변하기 전의 값을 반환후, 값을 증가시킨다.
    */

    let count = 0;

    if (msg == "카운트") {
        message.send(`이전 카운드: ${count++}\n현재 카운트: ${count}`);
    }




});

client.once('clientReady', () => console.log('hello, world!'));