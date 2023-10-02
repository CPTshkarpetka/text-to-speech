require('dotenv').config();
var admin = require("firebase-admin");

var serviceAccount = {
"type": "service_account",
"project_id": "text-to-speech-node",
"private_key_id": process.env.PRIVATE_KEY_ID,
"private_key": process.env.PRIVATE_KEY,
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




