#!/usr/bin/node
/*global console,setTimeout, require */
var
    fs = require('fs'),
    chalk = require('chalk'),
    ballots = JSON.parse(fs.readFileSync(process.argv[2], 'UTF-8'));

(function () {
	var

		ballotMethods = {
			removeCandidate: function (candidate) {
				var
					choices = this.choices,
					idx = choices.indexOf(candidate);
				if (idx === -1) {
					return;
				}
				choices.splice(idx, 1);
			},
			getFirstChoice: function () {
				return this.choices[0];
			}
		},
		getFirstChoiceVotecount = function (ballotObjects) {
			var votes = {};

			ballotObjects.forEach(function (ballotObject) {
				var firstChoice = ballotObject.getFirstChoice();
				if (!firstChoice) {
					return;
				}
				votes[firstChoice] = votes[firstChoice] || 0;
				votes[firstChoice]++;
			});
			return votes;
		},
		getCandidateOfLeastChoices = function (ballotObjects, votes) {
			var
				candidates = getCandidates(ballotObjects),
				candidateWLeastVotes = '',
				leastVotes = Infinity;
			candidates.forEach(function (candidate) {
				var voteCount = votes[candidate] || 0;
				if (voteCount < leastVotes) {
					leastVotes = voteCount;
					candidateWLeastVotes = candidate;
				}
			});
			return candidateWLeastVotes;
		},
		getCandidates = function (ballotObjects) {
			var candidates = ballotObjects.reduce(function (prev, cur) {
				cur.choices.forEach(function (choice) {
					if (prev.indexOf(choice) === -1) {
						prev.push(choice);
					}
				});
				return prev;
			}, []);

			return candidates
		},
		getCandidateCount = function (ballotObjects) {
			var candidates = ballotObjects.reduce(function (prev, cur) {
				cur.choices.forEach(function (choice) {
					if (prev.indexOf(choice) === -1) {
						prev.push(choice);
					}
				});
				return prev;
			}, []);
			return getCandidates(ballotObjects).length;
		},
		purgeCandidate = function (ballotObjects, candidate) {
			ballotObjects.forEach(function (ballotObject) {
				ballotObject.removeCandidate(candidate);
			});
		};


	ballotObjects = ballots.map(function (ballot) {
		var ballotObject = Object.create(ballotMethods);
		ballotObject.choices = ballot.choices;
		return ballotObject;
	});


	(function do_process() {
		var
			votes,
			puniestCandidate;

		while (getCandidateCount(ballotObjects) > 1) {
			votes = getFirstChoiceVotecount(ballotObjects);
			//console.log(votes);
			puniestCandidate = getCandidateOfLeastChoices(ballotObjects, votes);
			console.log(chalk.gray(JSON.stringify(votes)));
			console.log(chalk.blue('purging ' + puniestCandidate + ', having ' + (votes[puniestCandidate] ? 'only ' + votes[puniestCandidate] : 'no') + ' first votes'));
			purgeCandidate(ballotObjects, puniestCandidate);
		}
		votes = getFirstChoiceVotecount(ballotObjects);
		var winner = Object.getOwnPropertyNames(votes)[0];
		console.log(chalk.green('the winner shall be: ' +  winner + ' with now ' + votes[winner] + ' votes'));
	}());

}());
