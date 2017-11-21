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
const bot = new builder.UniversalBot(connector, function (session) {
    bot.recognizer(new builder.RegExpRecognizer("FarewellIntent", {eng: /(bye|goodbye|farewell)/i}));
    bot.recognizer(new builder.RegExpRecognizer("GreetingIntent", {eng: /(hello|hi)/i}));
    bot.recognizer(new builder.RegExpRecognizer("WeatherIntent", {eng: /(weather)/i}));
    session.send("You said: %s", session.message.text);
});

bot.name = "The Weatherman";

bot.dialog('EndDialog', function (session) {
    session.endDialog("Bye! See you soon!");
}).triggerAction({matches: 'FarewellIntent'});

bot.dialog('HelloDialog', function (session) {
    session.endDialog("Hello! How are you?");
}).triggerAction({matches: 'GreetingIntent'});


bot.dialog('WeatherDialog', [
    function (session) {
        session.send("Let me tell you what weather it is today.");
        builder.Prompts.text(session, "But first, could you tell me where you live?");
    },
    function (session, result) {
        session.send("Thank you.");
        let place = result.response;
        console.log("PLACE", place);

        weather.find({search: place, degreeType: 'C'}, function (err, result) {
            if (err) console.log(err);

            console.log("WEATHER", JSON.stringify(result[0].current.skytext));

            let weather = JSON.stringify(result[0].current.skytext);
            weather = weather.substr(1,weather.length-2).toLowerCase();

            let message = "Currently it is " + weather + " in " + place + ".";

            session.endDialog(message);
        });
    }
]).triggerAction({matches: 'WeatherIntent'});