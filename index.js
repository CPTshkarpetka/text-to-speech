var admin = require("firebase-admin");

var serviceAccount = require("D:\\text-to-speech\\text-to-speech-node-firebase-adminsdk-q1jir-005d5e50c1.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

var TelegramBot = require('node-telegram-bot-api');
var gTTs = require('gtts');

require('dotenv').config();
const token = process.env.TOKEN;

var bot = new TelegramBot(token, { polling: true});
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
        var data ={
            lang: "en"
        }
        db.collection("users").doc(msg.chat.username).set(data); 

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
    db.collection("users").doc(msg.chat.username).update({lang: "en"});
    bot.sendMessage(userID, "Language was set to english")
})

bot.onText(/ukrainian/, (msg) => {
    userID = msg.chat.id;
    db.collection("users").doc(msg.chat.username).update({lang: "ru"});
    bot.sendMessage(userID, "Мова була змінена на українську")
})

bot.onText(/\/tospeech (.+)/, (msg, match) => {
    userID = msg.chat.id;
    db.collection("users").doc(msg.chat.username).get().then(doc => {language = doc.data().lang});
    setTimeout(() => {
        var gtts = new gTTs(match[1], language);
        gtts.save(`#${msg.from.username}.mp3`);}, 550)  
    setTimeout(() => {
        bot.sendVoice(userID, `#${msg.from.username}.mp3`, { reply_to_message_id: msg.message_id});
    }, 1000);
    setTimeout(()=>{
        fs.unlinkSync(`#${msg.from.username}.mp3`);
    }, 2000);
});

bot.onText(/\/tospeech\s*$/, (msg) => {
    userID = msg.chat.id;
    db.collection("users").doc(msg.chat.username).get().then(doc => {language = doc.data().lang});
    setTimeout(() =>{
        if (langauge == "ru") {
            bot.sendMessage(userID, "Напишіть ваш текст, який потрібно озвучити одразу після /tospeech", {
                reply_markup: {
                    force_reply:true,
                    input_field_placeholder: "/tospeech ваш текст"
                }
            });
        }
        if (langauge == "en") {
            bot.sendMessage(userID, "Write your text to voice directly after /tospeech", {
                reply_markup: {
                    force_reply:true,
                    input_field_placeholder: "/tospeech your text"
                }
            });
        }
    },550)
    
})




