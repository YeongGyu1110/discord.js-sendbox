const { Client, GatewayIntentBits } = require('discord.js');
const { Guilds, GuildMessages, MessageContent } = GatewayIntentBits;
const client = new Client({ intents: [Guilds, GuildMessages, MessageContent] });


/*
"봇이름": {
    "name": "봇 이름",
    "token": "봇 토큰값"
}
즉시 실행 함수로 JSON에서 봇 객체를 가져와 bot 상수에 저장한다.
*/
const bot = (() => {
    const bot = require('./token.json');

    // 작동시킬 봇을 변경하려면 요놈을 수정
    // 어차피 끝나면 가비지 컬렉터 대상이 되니 보기라도 좋게 변수 하나 더 만들기
    const targetBot = bot.textBased;

    return targetBot;
})();

const fs = require('fs');

const admin = {
    id: null,
    name: null,
    money: 0,
    level: 1
};

const fileName = './userDataBase/userData.json';

const DATA = {};
DATA.saveData = function(fileName, data) {
    fs.writeFileSync(`${fileName}`, JSON.stringify(data, null, 2));
};
DATA.loadData = function(fileName) {
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
    } else {
        // 이 유저는 객체가 이미 있다는 뜻.
    }
    return userData[userId];
};
DATA.migration = function(target, schema) {

    // 아규먼트로 전달 받은 target 파라미터는 모든 유저의 데이터다.
    // 아규먼트로 전달 받은 schema 파라미터는 그냥 admin 객체이다.
    
    let isUpdated = false;

    for (const id in target) {
        for (const prop in schema) {
            if (target[id][prop] === undefined) {
                target[id][prop] = DATA.copyData(schema[prop]);
                isUpdated = true;
            }
        }
    }
    
    // 전체 유저 데이터 하나하나 둘러본다.
    for (const id in target) {
        // 유저가 가진 프로퍼티를 하나하나 둘러본다.
        for (const prop in target[id]) {
            /*
                만약 유저의 프로퍼티 값이 undefined가 아니고, (값이 있고)
                admin 객체의 프로퍼티가 undefined라면 (admin 객체에는 없는 값이라면)

                유저 객체에서 그 프로퍼터를 삭제한다.
                그리고 업데이트 된거 있다고 알린다.
            */ 
            if (schema[prop] === undefined && target[id] !== undefined) {
                delete target[id][prop];
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
    userData = DATA.loadData(fileName);

    // 마이그레이션 함수의 boolean형 return 값을 조건문에 사용하기.
    if (DATA.migration(userData, admin)) {
        DATA.saveData(fileName, userData);
        console.log(`마이그레이션 완료!`);
    }
}

let room = [];

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    message.send = (content) => message.channel.send(content);
    const msg = message.content.toLocaleLowerCase().trim();

    if (msg == "on") {
        // indexOf는 찾는 값이 배열에 없는 경우 -1을 반환함
        if (room.indexOf(message.channel.id) == -1) {
            room.push(message.channel.id);
            message.send(`활성화되었습니다.\n대상 이름: ${message.channel.name}\n대상 id: ${message.channel.id}`);            
        } else {
            message.send(`이미 활성화되었습니다.\n대상 이름: ${message.channel.name}\n대상 id: ${message.channel.id}`);
        }
    }
    // if (!room.includes(message.channel.id)) return;
    if (msg == "off") {
        room.splice(room.indexOf(message.channel.id), 1);
        message.send(`비활성화되었습니다.\n대상 이름: ${message.channel.name}\n대상 id: ${message.channel.id}`);
    }

    const userId = message.author.id;
    const userName = message.author.username;
    
    // DATA.getUserData가 작동되지 않는 한 undefined임.
    var user = userData[userId];

    if (msg == "login") message.send(`${!!user}`);
    if (msg == 'create') {
        if (user === undefined) {
            user = DATA.getUserData(userId, userName);
            message.send(`유저 객체를 생성했습니다.\n생성 대상: ${user.name}`);
        } else {
            message.send(`유저 객체가 이미 있습니다.\n대상: ${user.name}`);
        }
        
    }

    // 유저 객체가 undefined라면 즉시 함수 종료하기
    if (user === undefined) return;

    if (msg == "hello") message.send(`hello.`);

    DATA.saveData(fileName, userData);
});

// 봇 객체에서 name 프로퍼티에다가 is ready! 붙여서 출력하기
client.once('clientReady', () => console.log(bot.name + ' is ready!'));
client.login(bot.token);