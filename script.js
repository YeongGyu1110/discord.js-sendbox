const { Client, GatewayIntentBits } = require('discord.js');
const { Guilds, GuildMessages, MessageContent } = GatewayIntentBits;
const client = new Client({ intents: [Guilds, GuildMessages, MessageContent] });

const fs = require('fs');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class User {
    constructor(name, id) {
        this.name = name;
        this.id = id;
        this.money = 0;
        this.level = 1;
    }

    sayName() {
        return this.name;
    }
}

const folderName = 'database';
const userDataFileName = 'userData.json';
const roomFileName = 'roomData.json';

const DATA = {};
/*
folder 파라미터 기본값 지정. 
saveData 호출 시 세 번째 아규먼트를 안주면 folderName 변수 값을 이름으로 하는 폴더 생성,
그리고 그 폴더에 fileName을 이름으로 하는 json 파일 생성하기
*/
DATA.saveData = function(fileName, data, folder = folderName) {
    if (!fs.existsSync(folder)) fs.mkdirSync(folder);
    fs.writeFileSync(`${folder}/${fileName}`, JSON.stringify(data, null, 2));
};
DATA.loadData = function(fileName, folder = folderName) {
    if (!fs.existsSync(`${folder}/${fileName}`)) return null;
    return JSON.parse(fs.readFileSync(`${folder}/${fileName}`, 'utf-8'));
};
DATA.copyData = function(target) {
    return JSON.parse(JSON.stringify(target));
};
DATA.getUserData = function(userId, username) {
    if (!userData[userId]) userData[userId] = new User(username, userId);
    return userData[userId];
};
DATA.migration = function(target) {

    let isUpdated = false;

    const schema = new User();

    /*
    {
        '1': {...},
        '2': {...},
        '3': {...}
    } 

    1, 2, 3 차례대로 객체를 하나씩 돌기
    */
    for (const id in target) {
        // 이번 유저 객체의 name과 id값으로 최신이지만, 기존 값과 동기화가 안된 유저 객체 하나 만들기.
        const userInstance = new User(target[id].name, target[id].id);

        // 스키마의 각 프로퍼티를 하나씩 돌기
        for (const property in schema) {
            // 만약 스키마의 이번 프로퍼티가 유저객체에선 없는 프로퍼티라면 
            if (target[id][property] === undefined) {
                // 스키마의 이번 프로퍼티를 복사해서 유저 인스턴스 프로퍼티에 집어넣기
                userInstance[property] = DATA.copyData(schema[property]);
                isUpdated = true;
            } else {
                // 만약 타겟에 있는 프로퍼티라면
                // 그대로 유저 인스턴스에 그 값 넣기
                userInstance[property] = target[id][property];
            }
        }

        /*
        'n': {
            name: "name"
            id: "id",
            ...
        }

        이번 유저 객체의 프로퍼티를 한번씩 돌기
        */
        for (const property in target[id]) {
            // 만약 유저 객체에는 있지만, 스키마에는 없는 프로퍼티라면
            // ==> 걍 쓸모없는 프로퍼티가 있다면?
            if (schema[property] === undefined) {
                // 어차피 덮어씌워 당해 날아갈 프로퍼틴데, 걍 냅두기

                isUpdated = true;
            }
        }

        // 결국에 최신버전에서 생성된 객체(심지어 이전 값들의 동기화까지 완료된 객체)를 갖고 구버전 객체 위에 덮어씌워 구버전 객체를 날려버린다
        target[id] = userInstance;
    }
    // 업데이트 여부 리턴하기
    return isUpdated;
}

let userData = (() => {
    // 일단 그 파일 읽어서 data 변수에 저장,
    let data = DATA.loadData(userDataFileName);
    
    // 만약 loadData가 null을 반환하고 data에 할당했다면, 빈 객체 반환하고 IIFE 종료하기
    if (data === null) return {};

    /*
    일단 마이그레이션 시켜보기

    "마이그레이션 함수는 data 객체 자체를 변경시킨다."
    따라서 값 할당이 없어도 메소드의 반환값이 true라면 data 객체가 수정된 상태다.
    */ 
    if (DATA.migration(data)) {
        // 만약 true라면 data 객체가 수정되었다는 뜻이니, 파일에 저장하기
        DATA.saveData(userDataFileName, data);
        console.log(`마이그레이션 완료!`);
    } else {
        // 마이그레이션(프로퍼티 추가/삭제)은 없었더라도, 
        // 봇 재시작 시 JSON을 읽어오면서 클래스 메소드를 잃어버린 상태이기 때문에
        // DATA.migration 내부의 `target[id] = userInstance;` 를 거쳐야 메소드 사용이 가능합니다.
        // 따라서 isUpdated가 false여도 클래스 인스턴스로의 변환은 성공적으로 끝난 상태입니다.

        // 제미나이 왈: 
        // 만약 유저 객체에 메소드가 있었어도 저장하고 불러오면 메소드는 싹다날아감,
        // 하지만 마이그레이션은 메소드를 다 갖고 있는 객체가 기존 객체를 덮어씌우는 방법이라서 메모리 상의 유저 객체에는 무조건 변화가 있다는 소리
        // 
    }
    
    // 다타 객체 반환하기
    return data;
})();

/*
nullish 병합 연산자 사용해보기. 
Data.loadData가 null 또는 undefined라면 [] 반환하기.
Data.loadData가 null 또는 undefined둘 다 아니라면 loadData의 반환값을 room에 저장하기
*/
let room = DATA.loadData(roomFileName) ?? [];

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    message.send = (content) => message.channel.send(content);
    const msg = message.content.toLocaleLowerCase().trim();

    if (msg == "on") {
        // indexOf는 찾는 값이 배열에 없는 경우 -1을 반환함
        if (room.indexOf(message.channel.id) == -1) {
            room.push(message.channel.id);
            DATA.saveData(roomFileName, room);
            message.send(`활성화되었습니다.\n대상 이름: ${message.channel.name}\n대상 id: ${message.channel.id}`);            
        } else {
            message.send(`이미 활성화되었습니다.\n대상 이름: ${message.channel.name}\n대상 id: ${message.channel.id}`);
        }
    }
    // if (!room.includes(message.channel.id)) return;
    // if (msg == "off") {
    if (msg == "off" && room.includes(message.channel.id)) {
        room.splice(room.indexOf(message.channel.id), 1);
        DATA.saveData(roomFileName, room);
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
    if (msg == "delay") {
        message.send('기다리세요.');
        // max와 min 사이의 정수 구하기 공식: Math.floor(Math.random() * (max - min + 1)) + min
        await delay(Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000);
        message.send('다 되었어요!');
    }

    DATA.saveData(userDataFileName, userData);
});


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

// 봇 객체에서 name 프로퍼티에다가 is ready! 붙여서 출력하기
client.once('clientReady', () => console.log(bot.name + ' is ready!'));
client.login(bot.token);