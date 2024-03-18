import express from 'express';
import cors from 'cors';
const app = express()
const port = 3000
import fetch from 'node-fetch';
import mariadb from 'mariadb';

app.use(cors())

const pool = mariadb.createPool({
	host: '10.0.0.142', 
	user:'MrDefity', 
	password: 'FrankNBeanz',
	database: 'nhl',
	connectionLimit: 5
});

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

	console.log(JSON.stringify(req.headers));

		let startDate = req.header('season').slice(0, 4) + '-07-01';
		let endDate = req.header('season').slice(4) + '-05-01';
		let season = req.header('season').slice(0, 4) + '/' + req.header('season').slice(4);

		const promise1 = await getPlayersStats(startDate, endDate)
			.then(async info => {
				return info.map(async data => {
					return ({
						playerId: data.Player_Id,
						GP: Number(data['count(Player_Id)']),
						Goals: data['sum(Goals)'],
						Assists: data['sum(Assists)'],
						Points: data['sum(Goals + Assists)'],
					});
				});
			});

		const playerStats = await Promise.all(promise1)

		const promise2 = playerStats.map(async info => {
			console.log(info);
			return await getPlayersBio(season, info.playerId)
				.then(data => {
					console.log(data);
					return ({
						playerId: data[0].Player_Id,
						teamId: data[0].Team_Id,
						firstName: data[0].First_Name,
						lastName: data[0].Last_Name,
					});
				});
		});

		const playerBios = await Promise.all(promise2);
		
		const promise3 = playerBios.map(async info => {
			return await getPlayersTeam(info.teamId)
				.then(data => {
					return ({
						playerId: info.playerId,
						teamName: data[0].Name,
					})
				})
		})

		const playerTeams = await Promise.all(promise3);

		const playerStatsBios = playerStats.map(info => ({
			...info,
			...playerBios.find((element) => {
				return element.playerId === info.playerId
			}),
		}));

		const playerStatsBiosTeams = playerStatsBios.map(info => ({
			...info,
			...playerTeams.find((element) => {
				return element.playerId === info.playerId
			}),
		}));

		console.log(playerStatsBiosTeams);
		res.send(playerStatsBiosTeams);
			
		async function getPlayersStats(startDate, endDate){
			return pool.getConnection()
    			.then(conn => { 
					conn.end();
    				return conn.query("Select Player_Id, count(Player_Id), sum(Goals), sum(Assists), sum(Goals + Assists) from player_stats WHERE Dates >= ? AND Dates <= ? AND Player_Id != -1 AND League_Id = 0 GROUP BY Player_Id ORDER BY sum(Goals) DESC LIMIT 10", [startDate, endDate])
				})
			}
				
		async function getPlayersBio(season, playerId){
			return pool.getConnection()
				.then(conn => {
					conn.end();
					return conn.query("Select Player_Id, Team_Id, First_Name, Last_Name from players where Season = ? AND Player_Id = ?", [season, playerId])
				});
		}
		async function getPlayersTeam(team){
			console.log(team);
			return pool.getConnection()
				.then(conn => {
					conn.end();
					return conn.query("Select Name from teams where Team_Id = ?", [team])
				});
		}	
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

app.get(`/fhmteams`, async function (req, res) {

    await getTeamName()
		.then(data => {
			res.send(data);
		});

	async function getTeamName(){
		return pool.getConnection()
		.then(conn => { 
			conn.end();
			return conn.query("Select Name from teams where League_Id = 0")
		})
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