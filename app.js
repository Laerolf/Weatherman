const builder = require("botbuilder");
const restify = require("restify");

//Een restify-server opzetten om connectie te maken
const server = restify.createServer();
server.listen(4848, function (){
    console.log("%s listening to %s", server.name, server.url);
});

//Een connectie opzetten voor de chatbot
const connector = new builder.ChatConnector();

//Luisteren op het adres "/api/messages" voor berichten van gebruikers
server.post("/api/messages",connector.listen());

//De bot zelf aanmaken en een herhalen wat de gebruiker zegt
const bot = new builder.UniversalBot(connector, function (session){
    session.send("You said: %s", session.message.text);
});

/*bot.recognizer(new builder.RegExpRecognizer("GreetingIntent", {en_us: /^(hello|hi)/i}));
bot.recognizer(new builder.RegExpRecognizer("FarewellIntent", {en_us: /^(bye|goodday|see you)/i}));*/

/*bot.dialog('EndDialog', function (session) {
    session.endConversation("Bye! See you soon!");
}).triggerAction({ matches: 'FarewellIntent' });*/
