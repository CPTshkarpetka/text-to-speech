require('dotenv').config();
process.env["NTBA_FIX_350"] = 1;
var admin = require("firebase-admin");

var serviceAccount = {
    "type": "service_account",
    "project_id": "text-to-speech-node",
    "private_key_id": process.env.PRIVATE_KEY_ID,
    "private_key": `-----BEGIN PRIVATE KEY-----\n${process.env.KEY_ONE}\n${process.env.KEY_TWO}\n${process.env.KEY_THREE}\n${process.env.KEY_FOUR}\ndlbwHdHe8x2Hx4I8yZi8R/JjUJ9sEvzLTGQoyTPuBeXbpwBqXbybAAzpYTyKE+dF\nqK2tfcPAt3Z4Vwf505aBWF6NtNePGRlnsIXttMRIUrw9duQgmmcxYuFblFyLJQbM\nZWi4YEUTAgMBAAECggEAH0uXki7Gilzt2EvRAIHzCfmHP7/fAwJJIxee6C5l5TAx\nq82l7Zhu0WNSxwii1RoNcp5Rf3zXXnGgKdmAudKUiU+rPcZFtVvVdh5oRSph+A2A\naq1id9hzvtD+IWiriLkys6Du2AgH6rP2cF0ojirHphNPbphSMYZ4H5bZef4dXKLb\nAEHPhf/ItzZUl/yobCRAaUpriWGVjGid2Yo5137vXvcsozc5PahaORF3am48VKNP\nVN+WaO0WoCmp7Bxn/7VB9heDTpbSBe/nSa9KFcvMBkABq6/ZHpSI8MKRCQ4mVbWJ\nYILII3K/btrizXSX2jV9yZUKa+btR3ZntswCS5LPSQKBgQDrxMKabFdFZLfjYMKM\n8/0R53Z6Df/TG7Z1Z3T3rvL6g3TW0Jc2CZyF8X+eMUuD3uczOQ3Uso8AJxaTHDqJ\nNTlxIX2G76DhnuK73bcZQCiuy/44I5o9+V8X/S/On/5YE1R1f8ymaSIvbGg5TU58\nlwybJtzLE6rmgc6LNkJe7sB2VQKBgQDZq+AVqlpfY0+tEYwPOF8Z2yyb3EJGXSzF\nYZTd/3cWKkLosrz8IevLRMwrj++rdMIyAit2JthaOseJQFQqoy6ctln6TN8KtEuv\n7sw6S7SrnLhx2+St0PjSjse1C69BwfupVZuLFoDxpolCcqmipOtatvRiRi09ui0X\niyJV1wIlxwKBgQDD31jJkH7EoROA7Q9UqROzvzeX2W+TRK/GRChR6d/lrjbwjKVD\neKK4SNV8aHnTWel8jcbm0V2qg87mcwpSmYxaZ7dw1j4zk5vM9js62Cm0ZreSjkmD\neVy+glMod5WIOK7vWzh7fFaxTYAdMxOkwJzxfUzrzjAqhudAkth7JCFzbQKBgE+h\n+ZDziaxsALIoQT0wOlqTPHao1fY4EDEFyhiNZVvOijvnaAw1vLXYrXkiZ2QqiwEQ\nmiXXgD9CUc18o04V9O+QJsrTZKXd3/K1QjHxkF9YLoI5GCge02j0o0swwyUjepYw\no3729KVzb7PHjxfZjeDaHf31/ocenXCHjkApMLfxAoGBAIEyeHlviovNu2T3zgl5\nKmiwd+6/X8mrfdiPbTG980ZAet8LnXWKbS1xz2Ru81j8QU2HzuDRRoyFTvM1LKXd\n0lrtAZeFWHXWD+9bDJ05m+4QPtGz9K4lYdSynIrWCRx90XftJ/8pujQV+KOpA3Vm\nE29PeVtA4Tp8O7qNZcMHkFh3\n-----END PRIVATE KEY-----\n`,
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
const textToSpeech = require('@google-cloud/text-to-speech');
const client = new textToSpeech.TextToSpeechClient();

const token = process.env.TOKEN;

var bot = new TelegramBot(token, { webHook:{
    host:"0.0.0.0",
    port: process.env.PORT || 5000
}});

bot.setWebHook(process.env.URL);

const fs = require('fs');
const util = require('util');

var userID;
var language;

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
    db.collection("users").doc(msg.from.username).set({ lang: "uk-UA" });
})

bot.onText(/\/language/, async (msg) => {
    userID = msg.chat.id;
    var deleteMessage = await bot.sendMessage(userID, "What language do you want to choose?", {
        "reply_markup": {
            "inline_keyboard": [[{ text: "english", callback_data: "english" }, { text: "ukrainian", callback_data: "ukrainian" }]]
        }
    })
    setTimeout(async () => {
        try {
            await bot.deleteMessage(userID, deleteMessage.message_id);
        }
        catch (err) { }
    }, 10000)
});

bot.on('callback_query', (msg) => {
    userID = msg.message.chat.id;
    if (msg.data == "english") {
        db.collection("users").doc(msg.from.username).update({ lang: "en-US" });
        bot.sendMessage(userID, "Language was set to english");
        bot.deleteMessage(userID, msg.message.message_id);
    } else if (msg.data == "ukrainian") {
        db.collection("users").doc(msg.from.username).update({ lang: "uk-UA" });
        bot.sendMessage(userID, "Мова була змінена на українську");
        bot.deleteMessage(userID, msg.message.message_id);
    }
})

bot.onText(/\/tospeech (.+)/, (msg, match) => {
    userID = msg.chat.id;
    var text = match.input.replace(/(\r\n|\n|\r|\/tospeech)/gm, " ").replace(/\s{2,}/, "");
    db.collection("users").doc(msg.from.username).get().then(doc => { language = doc.data().lang });
    setTimeout(async () => {
        const request = {
            input: { text: text },
            voice: { languageCode: language, ssmlGender: 'FEMALE' },
            audioConfig: { audioEncoding: 'MP3' }
        }
        const [response] = await client.synthesizeSpeech(request);
        const writeFile = util.promisify(fs.writeFile);
        await writeFile(`#${msg.from.username}.mp3`, response.audioContent, 'binary');
        setTimeout(() => {
            bot.sendVoice(userID, `#${msg.from.username}.mp3`, { reply_to_message_id: msg.message_id });
            setTimeout(() => {
                fs.unlinkSync(`#${msg.from.username}.mp3`);
            }, 10);
        }, 1000);
    }, 550)
});

bot.onText(/\/tospeech\s*$/, async msg => {
    userID = msg.chat.id;
    db.collection("users").doc(msg.from.username).get().then(doc => { language = doc.data().lang });
    setTimeout(async () => {
        if (language == "uk-UA") {
            var message_to_reply = await bot.sendMessage(userID, "Введіть ваш текст у відповідь на це повідомлення", {
                reply_markup: {
                    force_reply: true,
                    input_field_placeholder: "ваш текст"
                }
            })
            bot.onReplyToMessage(userID, message_to_reply.message_id, async (msg) => {
                var text = msg.text.replace(/(\r\n|\n|\r)/gm, "").replace(/\s{2,}/, "");
                const request = {
                    input: { text: text },
                    voice: { languageCode: language, ssmlGender: 'FEMALE' },
                    audioConfig: { audioEncoding: 'MP3' }
                }
                const [response] = await client.synthesizeSpeech(request);
                const writeFile = util.promisify(fs.writeFile);
                await writeFile(`#${msg.from.username}.mp3`, response.audioContent, 'binary');
                setTimeout(() => {
                    bot.sendVoice(userID, `#${msg.from.username}.mp3`, { reply_to_message_id: msg.message_id });
                    setTimeout(() => {
                        fs.unlinkSync(`#${msg.from.username}.mp3`);
                    }, 10);
                }, 1000);
            });
        } else if (language == "en-US") {
            var message_to_reply = await bot.sendMessage(userID, "Write your text in reply for this message", {
                reply_markup: {
                    force_reply: true,
                    input_field_placeholder: "your text"
                }
            })
            bot.onReplyToMessage(userID, message_to_reply.message_id, async (msg) => {
                var text = msg.text.replace(/(\r\n|\n|\r)/gm, "").replace(/\s{2,}/, "");
                const request = {
                    input: { text: text },
                    voice: { languageCode: language, ssmlGender: 'FEMALE' },
                    audioConfig: { audioEncoding: 'MP3' }
                }
                const [response] = await client.synthesizeSpeech(request);
                const writeFile = util.promisify(fs.writeFile);
                await writeFile(`#${msg.from.username}.mp3`, response.audioContent, 'binary');
                setTimeout(() => {
                    bot.sendVoice(userID, `#${msg.from.username}.mp3`, { reply_to_message_id: msg.message_id });
                    setTimeout(() => {
                        fs.unlinkSync(`#${msg.from.username}.mp3`);
                    }, 10);
                }, 1000);
            });
        }
    }, 550)
})



