import express from 'express';
import cors from 'cors';
const app = express()
const port = 3000
import fetch from 'node-fetch';
import mariadb from 'mariadb';

app.use(cors())

app.get(`/nhlplayer`, async function (req, res) {
    getPlayer(req.header('playerid'))
		.then(response => response)
		.then(data => res.send(data));

	async function getPlayer(playerId){
		let url = 'https://api-web.nhle.com/v1/player/' + playerId + '/landing';
		return fetch(url)
			.then(response => response.json())
			.then(data => {
				return [data["playerSlug"], data["featuredStats"], data["seasonTotals"]];
		}, error => console.log(error));
	}    
})

app.get(`/fhmplayer`, async function (req, res) {

	const pool = mariadb.createPool({
		host: '10.0.0.142', 
		user:'MrDefity', 
		password: 'FrankNBeanz',
		database: 'nhl',
		connectionLimit: 5
    });

	let startDate = req.header('season').slice(0, 4) + '-07-01';
	let endDate = req.header('season').slice(4) + '-05-01';
	let players = ['there'];
	pool.getConnection()
    	.then(conn => { 
			let players = ['hello'];
    		conn.query("Select Player_Id, count(Player_Id), sum(Goals), sum(Assists), sum(Goals + Assists) from player_stats WHERE Dates >= ? AND Dates <= ? AND Player_Id != -1 AND League_Id = 0 GROUP BY Player_Id ORDER BY sum(Goals) DESC LIMIT 10", ([startDate, endDate]))
        		.then((rows) => {
					for(let x in rows){
						conn.query("Select Player_Id, Team_Id, First_Name, Last_Name from players where season = ? AND Player_Id = ?", [req.header('season').slice(0, 4) + '/' + req.header('season').slice(4), rows[x]['Player_Id']])
							.then((rows1) => {
										conn.query('Select Name from teams where Team_Id = ?', rows1[0]['Team_Id'])
											.then(rows2 => {
												rows[x]['count(Player_Id)'] = Number(rows[x]['count(Player_Id)']);
												for (let z in rows2){
													if(rows1[0]['Team_Id'] = rows2[z]['Name']){
														rows1[0]['Team_Id'] = rows2[z]['Name'];
													} 
												}
												let playerToPush = {
													...rows1[0],
													...rows[x]
												};
												players.push(playerToPush);
//												console.log(players);
												conn.end()
													.then(error => {
														console.log(error);
													});
											});
							})
							conn.end()
								.then(error => {
								console.log(error);
							});
					}
					console.log(players)
    			})
				.then(() =>{
					console.log(players);
				})
				conn.end()
				.then(error => {
					console.log(error);
				});	
			console.log(players);
			res.send(players);		
		}).catch(err => {
    		console.log(err);
   		})
		.finally(() =>{
			console.log(players);
		});   
})
		

app.get(`/nhlteams`, async function (req, res) {
    getTeamABV(req.header('team'))
		.then(response => response)
		.then(data => {
			res.send(data);
		});

	async function getTeamABV(team){
		let url = 'https://api.nhle.com/stats/rest/en/team';
		return fetch(url)
			.then(response => response.json())
			.then(data => {
				for (let x in data['data']){
					if (data['data'][x]['fullName'] == team){
						console.log(data['data'][x]['triCode']);
						return data['data'][x]['triCode']
					}
				}
			}, error => console.log(error));
	}    
})

app.get(`/nhlteamstats`, async function (req, res) {
	console.log(req.header('teamabv'));
	console.log(req.header('season'));
    getTeamStats(req.header('teamabv'), req.header('season'))
		.then(response => response)
		.then(data => {
			console.log(data);
			res.send(data);
		});

	async function getStandingsEnd(season){

		let seasonEnd;
		return fetch ('https://api-web.nhle.com/v1/standings-season')
			.then(response => response.json())
			.then(data => {
				for (let x in data['seasons']){
					if (data['seasons'][x]['id'] == season){
						seasonEnd = data['seasons'][x]['standingsEnd'];
						console.log(seasonEnd);
						return seasonEnd;
					}
				}
			});
	}

	async function getTeamStats(teamABV, season){

		let teamStats = [];
		return getStandingsEnd(season)
			.then(response => {		
				let url = 'https://api-web.nhle.com/v1/standings/' + response;	
				console.log(url);
				return fetch(url)
					.then(response => response.json())
					.then(data => {
						console.log(data['standings']);
						for (let x = 0; x < data['standings'].length; x++){
							if (data['standings'][x]['teamAbbrev']['default'] == teamABV){
								teamStats.push(data['standings'][x]['gamesPlayed'], data['standings'][x]['goalFor'], data['standings'][x]['goalAgainst'], data['standings'][x]['regulationPlusOtWins'], data['standings'][x]['losses'], data['standings'][x]['otLosses'], data['standings'][x]['points'], data['standings'][x]['regulationPlusOtWinPctg'], data['standings'][x]['goalsForPctg'], data['standings'][x]['leagueSequence'], data['standings'][x]['teamName']['default']);
								break;
							}
						}
						return teamStats
					}, error => console.log(error));
			});
		}
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })