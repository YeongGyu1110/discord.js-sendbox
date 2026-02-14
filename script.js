const { Client, GatewayIntentBits } = require('discord.js');
const { Guilds, GuildMessages, MessageContent } = GatewayIntentBits;
const client = new Client({ intents: [Guilds, GuildMessages, MessageContent] });
const { token } = require('./token.js');

client.login(token);

// 그래서 async가 뭔데
client.on("messageCreate", async (message) => {

    // 메시지 작자가 bot이라면 message.author.bot이 true가 되는데 그렇다면 이 익명 함수 전체를 끝내버리기.
    if (message.author.bot) return;

    // 메시지 전체 소문자 변경, 앞 뒤 공백 제거
    const msg = message.content.toLocaleLowerCase().trim();
    // message.channel.send에서 .channel 제거해서 message.send으로 간략하게 하기
    message.send = (content) => message.channel.send();

});

client.once('clientReady', () => console.log('hello, world!'));