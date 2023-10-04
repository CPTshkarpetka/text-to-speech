require('dotenv').config();
var admin = require("firebase-admin");

var serviceAccount = {
"type": "service_account",
"project_id": "text-to-speech-node",
"private_key_id": process.env.PRIVATE_KEY_ID,
"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDIeBPDAUtR1Wrz\nGu5eG0M7cQFCD6H9R7EQqJkhL9GmH4yZN7eeEq0/by1GEmmvs5i524VWXACVJ+ze\nvMfCOnXZ0lLb4Y9xHOvBirTl9+vX2fpzGKASSgE7mIhhQWfzgd/xRyY7kwC+duIO\njX9R7i4DBtGU8yIms1lOEWRVkKLP2FNkfsAys4NgfVzovhF4q0EXtSWsiC8w7bH+\ndlbwHdHe8x2Hx4I8yZi8R/JjUJ9sEvzLTGQoyTPuBeXbpwBqXbybAAzpYTyKE+dF\nqK2tfcPAt3Z4Vwf505aBWF6NtNePGRlnsIXttMRIUrw9duQgmmcxYuFblFyLJQbM\nZWi4YEUTAgMBAAECggEAH0uXki7Gilzt2EvRAIHzCfmHP7/fAwJJIxee6C5l5TAx\nq82l7Zhu0WNSxwii1RoNcp5Rf3zXXnGgKdmAudKUiU+rPcZFtVvVdh5oRSph+A2A\naq1id9hzvtD+IWiriLkys6Du2AgH6rP2cF0ojirHphNPbphSMYZ4H5bZef4dXKLb\nAEHPhf/ItzZUl/yobCRAaUpriWGVjGid2Yo5137vXvcsozc5PahaORF3am48VKNP\nVN+WaO0WoCmp7Bxn/7VB9heDTpbSBe/nSa9KFcvMBkABq6/ZHpSI8MKRCQ4mVbWJ\nYILII3K/btrizXSX2jV9yZUKa+btR3ZntswCS5LPSQKBgQDrxMKabFdFZLfjYMKM\n8/0R53Z6Df/TG7Z1Z3T3rvL6g3TW0Jc2CZyF8X+eMUuD3uczOQ3Uso8AJxaTHDqJ\nNTlxIX2G76DhnuK73bcZQCiuy/44I5o9+V8X/S/On/5YE1R1f8ymaSIvbGg5TU58\nlwybJtzLE6rmgc6LNkJe7sB2VQKBgQDZq+AVqlpfY0+tEYwPOF8Z2yyb3EJGXSzF\nYZTd/3cWKkLosrz8IevLRMwrj++rdMIyAit2JthaOseJQFQqoy6ctln6TN8KtEuv\n7sw6S7SrnLhx2+St0PjSjse1C69BwfupVZuLFoDxpolCcqmipOtatvRiRi09ui0X\niyJV1wIlxwKBgQDD31jJkH7EoROA7Q9UqROzvzeX2W+TRK/GRChR6d/lrjbwjKVD\neKK4SNV8aHnTWel8jcbm0V2qg87mcwpSmYxaZ7dw1j4zk5vM9js62Cm0ZreSjkmD\neVy+glMod5WIOK7vWzh7fFaxTYAdMxOkwJzxfUzrzjAqhudAkth7JCFzbQKBgE+h\n+ZDziaxsALIoQT0wOlqTPHao1fY4EDEFyhiNZVvOijvnaAw1vLXYrXkiZ2QqiwEQ\nmiXXgD9CUc18o04V9O+QJsrTZKXd3/K1QjHxkF9YLoI5GCge02j0o0swwyUjepYw\no3729KVzb7PHjxfZjeDaHf31/ocenXCHjkApMLfxAoGBAIEyeHlviovNu2T3zgl5\nKmiwd+6/X8mrfdiPbTG980ZAet8LnXWKbS1xz2Ru81j8QU2HzuDRRoyFTvM1LKXd\n0lrtAZeFWHXWD+9bDJ05m+4QPtGz9K4lYdSynIrWCRx90XftJ/8pujQV+KOpA3Vm\nE29PeVtA4Tp8O7qNZcMHkFh3\n-----END PRIVATE KEY-----\n",
"client_email": "firebase-adminsdk-q1jir@text-to-speech-node.iam.gserviceaccount.com",
"client_id": process.env.CLIENT_ID,
"auth_uri": "https://accounts.google.com/o/oauth2/auth",
"token_uri": "https://oauth2.googleapis.com/token",
"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
"client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-q1jir%40text-to-speech-node.iam.gserviceaccount.com",
"universe_domain": "googleapis.com"
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

var TelegramBot = require('node-telegram-bot-api');
var gTTs = require('gtts');

const token = process.env.TOKEN;

var bot = new TelegramBot(token, { webHook:{
    host:"0.0.0.0",
    port: process.env.PORT || 5000,
    https: process.env.URL
}});

//bot.setWebHook(process.env.URL);

var userID;
const fs = require('fs');

var language = "";

bot.setMyCommands([
    { command: '/tospeech', description: "Converting text to speech" },
    { command: '/language', description: "Changing language of speech " }
])

bot.onText(/\/start/, (msg) => {
    userID = msg.chat.id;
    bot.sendMessage(userID,
`*Welcome to this bot\\. Here you can make your text a voice message witch /tospeech \\*your text\\*
Now 2 languages are available\: english and ukrainian\\. To switch between them use /language*`,
    { parse_mode: "MarkdownV2" });  
    db.collection("users").doc(msg.from.username).set({lang: "en"}); 

})

bot.onText(/\/language/, (msg) => {
    userID = msg.chat.id;
    bot.sendMessage(userID, "Changing language in proggres...", {
        "reply_markup": {
            "keyboard": [["english", "ukrainian"]],
            one_time_keyboard: true
        }
    })
});

bot.onText(/english/, (msg) => {
    userID = msg.chat.id;
    db.collection("users").doc(msg.from.username).update({lang: "en"});
    bot.sendMessage(userID, "Language was set to english")
})

bot.onText(/ukrainian/, (msg) => {
    userID = msg.chat.id;
    db.collection("users").doc(msg.from.username).update({lang: "ru"});
    bot.sendMessage(userID, "Мова була змінена на українську")
})

bot.onText(/\/tospeech (.+)/, (msg, match) => {
    userID = msg.chat.id;
    db.collection("users").doc(msg.from.username).get().then(doc => {language = doc.data().lang});
    setTimeout(() => {
        var gtts = new gTTs(match[1], language);
        gtts.save(`#${msg.from.username}.mp3`);
        setTimeout(() => {
            bot.sendVoice(userID, `#${msg.from.username}.mp3`, { reply_to_message_id: msg.message_id});
            setTimeout(()=>{
                fs.unlinkSync(`#${msg.from.username}.mp3`);
            }, 10);
        }, 1000);
    }, 550)  
});

bot.onText(/\/tospeech\s*$/, (msg) => {
    userID = msg.chat.id;
    db.collection("users").doc(msg.from.username).get().then(doc => {language = doc.data().lang});
    setTimeout(() =>{
        if (language == "ru") {
            bot.sendMessage(userID, "Напишіть ваш текст, який потрібно озвучити одразу після /tospeech", {
                reply_markup: {
                    force_reply:true,
                    input_field_placeholder: "/tospeech ваш текст"
                }
            });
        }
        if (language == "en") {
            bot.sendMessage(userID, "Write your text to voice directly after /tospeech", {
                reply_markup: {
                    force_reply:true,
                    input_field_placeholder: "/tospeech your text"
                }
            });
        }
    },550)
})




