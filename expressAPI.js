import express from 'express';
import cors from 'cors';
const app = express()
const port = 3000
import fetch from 'node-fetch';
import mariadb from 'mariadb';

app.use(cors())

app.get(`/fhmteam`, async function (req, res) {

	let databaseHeader;
	let leagueId;
	let teamId;
	let gameType;

	if (req.header('database') != null) {
		databaseHeader = req.header('database');
	}
	else{
		databaseHeader = 'NHL';
	}
	if (req.header('league') != null) {
		leagueId = req.header('league');
	}
	else{
		leagueId = 'ALL';
	}
	if (req.header('team') != null) {
		teamId = req.header('team');
	}
	else{
		teamId = 'ALL';
	}
	if (req.header('gametype') != null) {
		gameType = req.header('gametype');
	}
	else{
		gameType = 'ALL';
	}

	const pool = mariadb.createPool({
		host: '192.168.2.15', 
		user:'MrDefity', 
		password: 'FrankNBeanz',
		database: databaseHeader,
		connectionLimit: 5,
		acquireTimeout: 6000
	});

	let startDate;
	let endDate;
	let season;

	if(req.header('season') !== 'ALL'){
		startDate = req.header('season').slice(0, 4) + '-07-01';
		endDate = req.header('season').slice(5) + '-06-30';
		season = req.header('season');
	}
	else{
		season = 'ALL';
		startDate = 'ALL';
		endDate = 'ALL';
	}

		const promise2 = await getTeamIdent(season, teamId, leagueId)
				.then(async data => {
					return data.map(async info => {
						return({
							teamId: info.TeamId,
							leagueId: info.LeagueId,
							city: info.Team_City,
							teamName: info.Team_Name,
							teamAbbr: info.Abbr,
							parent1: info.Parent1,
							parent2: info.Parent2,
							parent3: info.Parent3,
							parent4: info.Parent4,
							parent5: info.Parent5,
							parent6: info.Parent6,
							parent7: info.Parent7,
							parent8: info.Parent8,
							primaryColour: info.Primary_Colour,
							secondaryColour: info.Secondary_Colour,
							textColour: info.Text_Colour,
							ConferenceId: info.ConferenceId,
							DivisionId: info.DivisionId
						});
					});
				});

		const teamIdent = await Promise.all(promise2);

		console.log(teamIdent);

		const promise1 = teamIdent.map(async info => {
			return await getTeamStats(season, info.teamId)
				.then(async data => {
					return ({
						teamId: data[0]['TeamId'],
						GP: data[0]['GP'],
						Wins: data[0]['Wins'],
						Losses: data[0]['Losses'],
						Ties: data[0]['Ties'],
						OTL: data[0]['OTL'],
						ShootoutWins: data[0]['Shootout_Wins'],
						ShootoutLosses: data[0]['Shootout_Losses'],
						Points: data[0]['Points'],
						GF: data[0]['Goals_For'],
						GA: data[0]['Goals_Against'],
						PCT: data[0]['PCT'],
						Shots: data[0]['S'],
						SA: data[0]['SA'],
						FOPer: data[0]['FOPer'],
						SB: data[0]['SB'],
						Hits: data[0]['H'],
						TkA: data[0]['TkA'],
						GvA: data[0]['GvA'],
						InD: data[0]['InD'],
						PIMG: data[0]['PIMG'],
						PPCh: data[0]['PPCh'],
						PPG: data[0]['PPG'],
						SHGA: data[0]['SHGA'],
						SHCh: data[0]['SHCh'],
						PPGA: data[0]['PPGA'],
						SHG: data[0]['SHG'],
						AttTotalHome: data[0]['ATT_Total_Home'],
						AttTotalAway: data[0]['ATT_Total_Away'],
						AttAvgHome: data[0]['ATT_Avg_Home'],
						AttAvgAway: data[0]['ATT_Avg_Away'],
						SelloutsHome: data[0]['Sellouts_Home'],
						SelloutsAway: data[0]['Sellouts_Away'],
						CapacityUsePer: data[0]['CapacityUsePer']
					});
			});
	});

	const teamStats = await Promise.all(promise1)
		const teamStatsIdent = teamStats.map(info => ({
			...info,
			...teamIdent.find((element) => {
				return element.teamId === info.teamId
			}),
		}));

		console.log(teamStatsIdent)
		res.send(teamStatsIdent);

		async function getTeamStats(season, teamId){
			return pool.getConnection()
    			.then(conn => { 
					if(season === 'ALL' && teamId === 'ALL'){
						conn.end();
    					return conn.query("Select * from team_stats")
					}
					else if(season === 'ALL'){
						conn.end();
    					return conn.query("Select * from team_stats WHERE TeamId = ?", [teamId])
					}
					else{
						conn.end();
    					return conn.query("Select * from team_stats WHERE TeamId = ? AND Season = ?", [teamId, season])
					}
				})
		}
				
		async function getTeamIdent(season, teamId, leagueId){
			return pool.getConnection()
				.then(conn => {
					if(season === 'ALL' && teamId === 'ALL' && leagueId === 'ALL'){
						conn.end();
						return conn.query("Select * from teams")
					}
					else if(season === 'ALL' && leagueId === 'ALL'){
						conn.end();
						return conn.query("Select * from teams where TeamId = ?", [teamId])
					}
					else if(teamId === 'ALL' && leagueId === 'ALL'){
						conn.end();
						return conn.query("Select * from teams where Season = ?", [season])
					}
					else if(teamId === 'ALL' && season === 'ALL'){
						conn.end();
						return conn.query("Select * from teams where LeagueId = ?", [leagueId])
					}
					else if(teamId === 'ALL'){
						conn.end();
						return conn.query("Select * from teams where LeagueId = ? AND Season = ?", [leagueId, season])
					}
					else if(leagueId === 'ALL'){
						conn.end();
						return conn.query("Select * from teams where TeamId = ? AND Season = ?", [teamId, season])
					}
					else{
						conn.end();
						return conn.query("Select * from teams where TeamId = ? AND Season = ? AND LeagueId = ?", [teamId, season, leagueId])
					}
			});
		}

		pool.end();
})

app.get(`/fhmleague`, async function (req, res) {

	let databaseHeader;
	let leagueId;

	if (req.header('database') != null) {
		databaseHeader = req.header('database');
	}
	else{
		databaseHeader = 'NHL';
	}
	if (req.header('league') != null) {
		leagueId = req.header('league');
	}
	else{
		leagueId = 'ALL';
	}

	const pool = mariadb.createPool({
		host: '192.168.2.15', 
		user:'MrDefity', 
		password: 'FrankNBeanz',
		database: databaseHeader,
		connectionLimit: 5,
		acquireTimeout: 6000
	});

    await getLeagueName(leagueId)
		.then(data => {
			res.send(data);
		});

	async function getLeagueName(leagueId){
		return pool.getConnection()
		.then(conn => { 
			if(leagueId === 'ALL'){
				conn.end();
				return conn.query("Select * from league Group By LeagueId")
			}
			else{
				conn.end();
				return conn.query("Select * from league where LeagueId = ? Group By LeagueId", [leagueId])
			}
		})
	}
	pool.end();
})

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

	let databaseHeader;
	let leagueId;
	let teamId;
	let gameType;

	if (req.header('database') != null) {
		databaseHeader = req.header('database');
	}
	else{
		databaseHeader = 'NHL';
	}
	if (req.header('league') != null) {
		leagueId = req.header('league');
	}
	else{
		leagueId = 'ALL';
	}
	if (req.header('team') != null) {
		teamId = req.header('team');
	}
	else{
		teamId = 'ALL';
	}
	if (req.header('gametype') != null) {
		gameType = req.header('gametype');
	}
	else{
		gameType = 'ALL';
	}

	const pool = mariadb.createPool({
		host: '192.168.2.15', 
		user:'MrDefity', 
		password: 'FrankNBeanz',
		database: databaseHeader,
		connectionLimit: 5,
		acquireTimeout: 6000
	});

	let startDate;
	let endDate;
	let season;

	if(req.header('season') !== 'ALL'){
		startDate = req.header('season').slice(0, 4) + '-07-01';
		endDate = req.header('season').slice(5) + '-06-30';
		season = req.header('season');
	}
	else{
		season = 'ALL';
		startDate = 'ALL';
		endDate = 'ALL';
	}

		const promise1 = await getPlayersStats(startDate, endDate, leagueId, teamId, gameType)
			.then(async info => {
				return info.map(async data => {
					return ({
						playerId: data.PlayerId,
						GP: Number(data['count(PlayerId)']),
						Goals: data['sum(Goals)'],
						Assists: data['sum(Assists)'],
						Points: data['sum(Goals + Assists)'],
					});
				});
			});

		const playerStats = await Promise.all(promise1)

		const promise2 = playerStats.map(async info => {
			return await getPlayersBio(season, info.playerId)
				.then(async data => {
					console.log(data);
					return ({
						playerId: data[0].PlayerId,
						teamId: data[0].TeamId,
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
						teamName: data[0].Abbr,
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

		res.send(playerStatsBiosTeams);

		async function getPlayersStats(startDate, endDate, leagueId, teamId, gameType){
			return pool.getConnection()
    			.then(conn => { 
					if(leagueId === 'ALL' && teamId === 'ALL' && gameType === 'ALL' && startDate === 'ALL'){
						conn.end();
    					return conn.query("Select PlayerId, count(PlayerId), sum(Goals), sum(Assists), sum(Goals + Assists) from player_stats WHERE PlayerId != -1 GROUP BY PlayerId ORDER BY sum(Goals) DESC limit 10")
					}
					else if(leagueId === 'ALL' && teamId === 'ALL' && gameType === 'ALL'){
						conn.end();
    					return conn.query("Select PlayerId, count(PlayerId), sum(Goals), sum(Assists), sum(Goals + Assists) from player_stats WHERE Dates >= ? AND Dates <= ? AND PlayerId != -1 GROUP BY PlayerId ORDER BY sum(Goals) DESC limit 10", [startDate, endDate])
					}
					else if(leagueId === 'ALL' && teamId === 'ALL' && startDate === 'ALL'){
						conn.end();
    					return conn.query("Select PlayerId, count(PlayerId), sum(Goals), sum(Assists), sum(Goals + Assists) from player_stats WHERE PlayerId != -1 AND Game_Type = ? GROUP BY PlayerId ORDER BY sum(Goals) DESC limit 10", [gameType])
					}
					else if(leagueId === 'ALL' && teamId === 'ALL'){
						conn.end();
    					return conn.query("Select PlayerId, count(PlayerId), sum(Goals), sum(Assists), sum(Goals + Assists) from player_stats WHERE Dates >= ? AND Dates <= ? AND PlayerId != -1 AND Game_Type = ? GROUP BY PlayerId ORDER BY sum(Goals) DESC limit 10", [startDate, endDate, gameType])
					}
					else if(teamId === 'ALL' && gameType === 'ALL' && startDate === 'ALL'){
						conn.end();
    					return conn.query("Select PlayerId, count(PlayerId), sum(Goals), sum(Assists), sum(Goals + Assists) from player_stats WHERE PlayerId != -1 AND LeagueId = ? GROUP BY PlayerId ORDER BY sum(Goals) DESC limit 10", [leagueId])
					}
					else if(teamId === 'ALL' && gameType === 'ALL'){
						conn.end();
    					return conn.query("Select PlayerId, count(PlayerId), sum(Goals), sum(Assists), sum(Goals + Assists) from player_stats WHERE Dates >= ? AND Dates <= ? AND PlayerId != -1 AND LeagueId = ? GROUP BY PlayerId ORDER BY sum(Goals) DESC limit 10", [startDate, endDate, leagueId])
					}
					else if(teamId === 'ALL' && startDate === 'ALL'){
						conn.end();
    					return conn.query("Select PlayerId, count(PlayerId), sum(Goals), sum(Assists), sum(Goals + Assists) from player_stats WHERE PlayerId != -1 AND Game_Type = ? AND LeagueId = ? GROUP BY PlayerId ORDER BY sum(Goals) DESC limit 10", [(gameType), leagueId])
					}
					else if(teamId === 'ALL'){
						conn.end();
    					return conn.query("Select PlayerId, count(PlayerId), sum(Goals), sum(Assists), sum(Goals + Assists) from player_stats WHERE Dates >= ? AND Dates <= ? AND PlayerId != -1 AND Game_Type = ? GROUP BY PlayerId ORDER BY sum(Goals) DESC limit 10", [startDate, endDate, gameType])
					}
					else if(gameType === 'ALL' && startDate === 'ALL'){
						conn.end();
    					return conn.query("Select PlayerId, count(PlayerId), sum(Goals), sum(Assists), sum(Goals + Assists) from player_stats WHERE PlayerId != -1 AND TeamId = ? AND LeagueId = ? GROUP BY PlayerId ORDER BY sum(Goals) DESC limit 10", [teamId, leagueId])
					}
					else if(gameType === 'ALL'){
						conn.end();
    					return conn.query("Select PlayerId, count(PlayerId), sum(Goals), sum(Assists), sum(Goals + Assists) from player_stats WHERE Dates >= ? AND Dates <= ? AND PlayerId != -1 AND TeamId = ? AND LeagueId = ? GROUP BY PlayerId ORDER BY sum(Goals) DESC limit 10", [startDate, endDate, teamId, leagueId])
					}
					else if(startDate === 'ALL'){
						conn.end();
    					return conn.query("Select PlayerId, count(PlayerId), sum(Goals), sum(Assists), sum(Goals + Assists) from player_stats WHERE PlayerId != -1 AND TeamId = ? AND LeagueId = ? AND Game_Type = ? GROUP BY PlayerId ORDER BY sum(Goals) DESC limit 10", [teamId, leagueId, gameType])
					}
					else {
						conn.end();
    					return conn.query("Select PlayerId, count(PlayerId), sum(Goals), sum(Assists), sum(Goals + Assists) from player_stats WHERE Dates >= ? AND Dates <= ? AND PlayerId != -1 AND TeamId = ? AND LeagueId = ? AND Game_Type = ? GROUP BY PlayerId ORDER BY sum(Goals) DESC limit 10", [startDate, endDate, teamId, leagueId, gameType])
					}
				})
		}
				
		async function getPlayersBio(season, playerId){
			return pool.getConnection()
				.then(conn => {
					if(season === 'ALL'){
						conn.end();
						return conn.query("Select PlayerId, TeamId, First_Name, Last_Name from players where PlayerId = ?", [playerId])
					}
					else{
						conn.end();
						return conn.query("Select PlayerId, TeamId, First_Name, Last_Name from players where Season = ? AND PlayerId = ?", [season, playerId])
					}
			});
		}
		async function getPlayersTeam(team){
			return pool.getConnection()
				.then(conn => {
					conn.end();
					return conn.query("Select Abbr from teams where TeamId = ?", [team])
				});
		}
		pool.end();
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

	let databaseHeader;
	let leagueId;

	if (req.header('database') != null) {
		databaseHeader = req.header('database');
	}
	else{
		databaseHeader = 'NHL';
	}
	if (req.header('league') != null) {
		leagueId = req.header('league');
	}
	else{
		leagueId = 'ALL';
	}

	const pool = mariadb.createPool({
		host: '192.168.2.15', 
		user:'MrDefity', 
		password: 'FrankNBeanz',
		database: databaseHeader,
		connectionLimit: 5,
		acquireTimeout: 6000
	});

    await getTeamName(leagueId)
		.then(data => {
			res.send(data);
		});

	async function getTeamName(leagueId){
		return pool.getConnection()
		.then(conn => { 
			if (leagueId === 'ALL'){
				conn.end();
				return conn.query("Select * from teams")
			}
			else {
				return conn.query("Select * from teams where LeagueId = ?", [leagueId])
			}
		})
	}
	pool.end();
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

