const builder = require("botbuilder");
const restify = require("restify");
const weather = require("weather-js");

//Een restify-server opzetten om connectie te maken
const server = restify.createServer();
server.listen(4848, function () {
    console.log("%s listening to %s", server.name, server.url);
});

//Een connectie opzetten voor de chatbot
const connector = new builder.ChatConnector();

//Luisteren op het adres "/api/messages" voor berichten van gebruikers
server.post("/api/messages", connector.listen());

//De bot zelf aanmaken en een herhalen wat de gebruiker zegt
const bot = new builder.UniversalBot(connector);

bot.name = "The Weatherman";

bot.recognizer(new builder.RegExpRecognizer("FarewellIntent", {eng: /(bye|goodbye|farewell)/i}));
bot.recognizer(new builder.RegExpRecognizer("GreetingIntent", {eng: /(hello|hi)/i}));
bot.recognizer(new builder.RegExpRecognizer("WeatherIntent", {eng: /(weather)/i}));

bot.dialog("/", function (session) {
    session.beginDialog("noClue");
});

bot.dialog("noClue", function (session) {
    session.send("I don't know what you are talking about, so I'll just repeat you.");
    session.endDialog("You said: %s", session.message.text);
});

bot.dialog('sayGoodbye', function (session) {

    let name = "stranger";

    if (session.userData.name !== undefined) {
        name = session.userData.name;
    }

    session.endDialog("Bye %s! See you soon!", name);

}).triggerAction({matches: 'FarewellIntent'});

bot.dialog("sayHello", function (session) {

    if (session.userData.name !== undefined) {
        session.beginDialog("sayHelloAgain");
    }

    else {
        session.beginDialog("handshake");
    }

}).triggerAction({matches: 'GreetingIntent'});

bot.dialog('handshake',
    [
        function (session) {
            session.send("Hello! Nice meeting you.");
            session.send("I'm the Weatherman, a chatbot who can tell you more about the weather.");
            builder.Prompts.text(session, "Who are you if I may ask?")
        },
        function (session, result) {
            session.userData.name = result.response;
            session.endDialog("Hello %s!", session.userData.name);
        }

    ]);

bot.dialog("sayHelloAgain", function (session) {
    session.send("Hello %s!", session.userData.name);
    session.send("We met already in our conversation.");
    session.send("You don't remember that?");
    session.endDialog("Silly you!");
});

bot.dialog('WeatherDialog', [
    function (session) {
        session.send("Let me tell you what weather it is today.");
        builder.Prompts.text(session, "But first, could you tell me where you live?");
    },
    function (session, result) {

        const place = result.response;

        session.send("%s, eh? Nice!", place);

        weather.find({search: place, degreeType: 'C'}, function (err, result) {
            if (err) console.log(err);

            let weather = JSON.stringify(result[0].current.skytext);
            weather = weather.substr(1, weather.length - 2).toLowerCase();

            let message = "Currently it is " + weather + " in " + place + ".";

            session.endDialog(message);
        });
    }
]).triggerAction({matches: 'WeatherIntent'});