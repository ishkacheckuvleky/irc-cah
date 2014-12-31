var pg = require('pg');
var fs = require('fs');
var sprintf = require('util').format;

if(process.argv.length != 2) {
	console.error("Usage: node importCards.js connectionString")
}
var connString = process.argv[2];
var blackQueryString = 'select black_cards.text, black_cards.pick, black_cards.draw, card_set.name from black_cards join card_set_black_card on black_cards.id = card_set_black_card.black_card_id join card_set on card_set.id = card_set_black_card.card_set_id';
var whiteQueryString = 'select white_cards.text, card_set.name from white_cards join card_set_white_card on white_cards.id = card_set_white_card.white_card_id join card_set on card_set.id = card_set_white_card.card_set_id';

var blackCards = {};
var whiteCards = {};
pg.connect(connString, function(err, client, done) {
	if(err) {
		throw err;
	}

	client.query(blackQueryString, function(err, result) {
		if(err) {
			throw err;
		}
		var replaceBlank = /____/g;
		result.rows.forEach(function(row, i, a) {
			var card = {
				type: "Question",
				keep: "Yes",
				draw: row.draw,
				pick: row.pick,
				value: row.text.replace(replaceBlank, '%s')
			};
			if(!blackCards.hasOwnProperty(row.name)) {
				blackCards[row.name] = [];
			}
			blackCards[row.name].push(card);
		});
		writeDeck(blackCards, "q");
	});

	client.query(whiteQueryString, function(err, result) {
		done();
		if(err) {
			throw err;
		}
		result.rows.forEach(function(row, i, a) {
			var card = {
				type: "Answer",
				keep: "Yes",
				draw: 0,
				pick: 1,
				value: row.text
			};
			if(!whiteCards.hasOwnProperty(row.name)) {
				whiteCards[row.name] = [];
			}
			whiteCards[row.name].push(card);
		});
		writeDeck(whiteCards, "a");
		client.end();
	});
	done();
});

function writeDeck(decks, type) {
	for(deckName in decks) {
		var deck = sanitizeDeckName(deckName);
		var deckAsJSON = JSON.stringify(decks[deckName], null, 2);
		fs.writeFileSync(sprintf("%s_%s.json", deck, type), deckAsJSON);
	}
}

function sanitizeDeckName(deckName) {
	return deckName
		.replace('[C] ', '')
		.replace('&amp;', '')
		.replace('&quot;', '')
		.replace(/[^a-zA-Z0-9_-]/g, '', null, true)
}
