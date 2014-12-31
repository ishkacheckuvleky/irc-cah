var fs = require('fs'),
    JaySchema = require('jayschema'),
    _ = require('underscore');

/**
 * Load and validate a card file
 * @param identifier Identifier of the card file
 * @param filename Filename of the card file
 */
function loadCardFile(identifier, filename) {
    console.log('Loading ' + identifier + ': ' + filename);
    if (fs.existsSync(filename)) {
        var data = require(filename);
        validator.validate(data, schema, function (errors) {
            if (errors) {
                console.error(identifier + ': Validation error');
                console.error(errors);
            } else {
                console.log(identifier + ': Validation OK!');
                config.cards = _.union(config.cards, data);
            }
        });
    } else {
        console.error('File does not exist');
    }
}

var config = _.extend(
    require(__dirname + '/../config/env/all.js'),
    require(__dirname + '/../config/env/' + process.env.NODE_ENV + '.json') || {},
    { cards: [] }
);

var cardFiles = {};

config.cardFiles.foreach(deck, i, a) {
  cardFiles[deck + "_a"] = __dirname + '/../config/cards' + deck + "_a.json";
  cardFiles[deck + "_q"] = __dirname + '/../config/cards' + deck + "_q.json";
};

var validator = new JaySchema();
var schema = {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "title": "Card Schema",
    "type": "array",
    "items": {
        "title": "Single card",
        "type": "object",
        "properties": {
            "type": {
                "description": "Type of the card (question or answer",
                "type": "string"
            },
            "value": {
                "description": "The text value of the card",
                "type": "string"
            },
            "keep": {
                "type": "string"
            },
            "draw": {
                "description": "Amount of cards that should be drawn from the deck when this card is in play",
                "type": "integer"
            },
            "pick": {
                "description": "Amount of cards that should be picked from the hand when this card is in play",
                "type": "integer"
            },
            "source": {
                "description": "Source of the card (e.g. expansion, community etc)",
                "type": "string"
            }
        },
        "required": ["value", "type", "pick", "draw"]
    }
};


console.log('Loading card data...');
for (var i in cardFiles) {
    if (cardFiles.hasOwnProperty(i)) {
        loadCardFile(i, cardFiles[i]);
    }
}

module.exports = config;
