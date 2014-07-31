#!/usr/bin/node
/*global console,setTimeout, require */
var
    fs = require('fs'),
    crypto = require('crypto'),
    fName = process.argv[2],
    ballots = JSON.parse(fs.readFileSync(fName, 'UTF-8')),
    salt = process.argv[3];

if (!salt) {
	console.log('nope. want salt.');
	process.exit(1);
};

ballots.forEach(function (ballot) {
	var md5 = crypto.createHash('md5');
	md5.update(salt);
	md5.update(ballot.name);
	ballot.hash = md5.digest('hex');
	delete ballot.name;
});

fs.writeFileSync('anon-' + fName, JSON.stringify(ballots), 'utf-8');
console.log('Es ist vollbracht');
