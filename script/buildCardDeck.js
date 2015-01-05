var fs = require('fs');
var sprintf = require('util').format;
var argv = require('minimist')(process.argv.slice(2));

function getPickAndDraw(question) {
	var pick = 1;
	var draw = 0;
	var matches = question.match(/%s/g);
	if(matches) {
		pick = matches.length;
	}
	if(pick > 2) {
		draw = pick - 1;
	}
	return {
		draw: draw,
		pick: pick
	};
}

function usage() {
	console.log("Usage: buildCardDeck.js --type Question|Answer --name deckName");
}

function main() {
	var requiredArguments = [
		"type",
		"name"
	];
	requiredArguments.forEach(function(arg, i, a) {
		if(!argv.hasOwnProperty(arg)) {
			usage();
			process.exit(1);
		}
	});
	var deckType = argv.type;
	if(deckType != 'Answer' && deckType != 'Question') {
		usage();
		process.exit(1);
	}

	var cards = [];
	var targetFile = sprintf("config/cards/%s_%s.json", argv.name, argv.type[0].toLowerCase());
	var buffer = '';
	
	process.stdin.on('readable', function() {
		var chunk = process.stdin.read();
		if(chunk !== null) {
			buffer += chunk;
			var lines;
			if(lines = buffer.split('\n')) {
				var lastNewline = buffer.lastIndexOf('\n');
				buffer = buffer.substr(lastNewline + 1);
				lines.forEach(function(line, i, a) {
					if(line == '') {
						return;
					}
					var pickAndDraw = getPickAndDraw(line);
					var newCard = {
						type: deckType,
						keep: "Yes",
						draw: pickAndDraw.draw,
						pick: pickAndDraw.pick,
						value: line
					};
					cards.push(newCard);
				});
			}
		}
	});
	
	process.stdin.on('end', function() {
		var cardsJSON = JSON.stringify(cards, null, 2);
		fs.writeFile(targetFile, cardsJSON, function(err) {
			if(err) {
				throw err;
			}
			process.exit(0);
		});
	});
	
	process.stdin.resume();
}

main();
