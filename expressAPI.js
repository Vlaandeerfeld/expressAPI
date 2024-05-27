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

		console.log("Team Ident: " + teamIdent);

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
			console.log(data);                       
			res.send(data);
		});

	async function getLeagueName(leagueId){
		return pool.getConnection()
		.then(conn => { 
			if(leagueId === 'ALL'){
				conn.end();
				return conn.query("Select LeagueId, AbbrLeague from league Group By LeagueId")
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
		leagueId = 'NHL';
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
		gameType = 'REGULAR SEASON';
	}

	const pool = mariadb.createPool({
		host: '192.168.2.15', 
		user:'MrDefity', 
		password: 'FrankNBeanz',
		database: databaseHeader,
		connectionLimit: 5,
		acquireTimeout: 600000
	});

	let startDate;
	let endDate;
	let season;

	if(req.header('season') !== 'ALL' && req.header('season') != undefined){
		startDate = req.header('season').slice(0, 4) + '-07-01';
		endDate = req.header('season').slice(5) + '-06-30';
		season = req.header('season');
	}
	else{
		season = '2034/2035';
		startDate = 'ALL';
		endDate = 'ALL';
	}

	console.log(teamId);
	console.log(season);
	console.log(leagueId);

	const league = await getLeagueStats(leagueId);

	console.log(league);

	const promise0 = league.map(async info => {
		return await getPlayersTeam(teamId, season, info.LeagueId)
		.then(async data => {
			return data.map(info => {
				return {
					TeamId: info.TeamId,
					teamName: info.Abbr,
				}
			});
		});
	})

	const playerTeam = await Promise.all(promise0);

	const flattenplayerTeam = [].concat.apply([], playerTeam);

	const promise2 = flattenplayerTeam.map(async info => {
		return await getPlayersBio(season, info.TeamId)
		.then(async data => {
			const promise2a = await data.filter(async data2 => {
				data2.Goalie != 20 && data2.PlayerId != undefined
			});
			return promise2a
		})
	});
		
	const playerBios = await Promise.all(promise2)

	const flattenPlayerBios = [].concat.apply([], playerBios);
	
	const promise3 = flattenPlayerBios.map(async info => {
		return await getPlayersStats(season, info.PlayerId)
			.then(async data => {
				const promise1 =  await data.filter(async data2 => {
					data2.PlayerId != undefined
				});
				return promise1;
			})
			.then(response => {return Promise.resolve(response)})
		});

		const playerStats = await Promise.all(promise3);

		const flattenPlayerStats = [].concat.apply([], playerStats);

		const playerStatsFiltered = flattenPlayerStats.filter(element => {
			return element !== undefined
		});

		const playerBiosTeam = flattenPlayerBios.map(info => {
			return {
				...flattenplayerTeam.find((element) => element.TeamId === info.TeamId),
				...info,
			}
		});

		const playerStatsBiosTeams = playerBiosTeam.map(info => {
			return {
				...playerStatsFiltered.find((element) => element.PlayerId === info.PlayerId),
				...info,
			}
		});

		const playerStatsBiosTeamsSimplify = playerStatsBiosTeams.filter(element => {
			return element.GP != undefined;
		});

		const reply = playerStatsBiosTeamsSimplify.map(data => {
			return{
				playerId: data.PlayerId,
				GP: data.GP,
				teamName: data.Abbr,
				Points: Number(data.Points),
				FOPer: String(data.FOPer),
				PlusMinus: data.PlusMinus,
				fights: data.Fights,
				fightsWon: data.Fights_Won,
				firstName: data.First_Name,
				lastName: data.Last_Name,
				season: data.Season,
				teamId: data.TeamId,
				leagueId: data.LeagueId,
				Goals: data.G,
				Assists: data.A,
				PIM: data.PIM,
				PPG: data.PPG,
				PPA: data.PPA,
				SHG: data.SHG,
				SHA: data.SHA,
				GR: data.GR,
				GWG: data.GWG,
				SOG: data.SOG,
				HIT: data.HIT,
				GvA: data.GvA,
				TkA: data.TkA,
				SB: data.SB,
				TOI: data.TOI,
				PPTOI: data.PPTOI,
				SHTOI: data.SHTOI,
				teamName: data.teamName
			}
		});

		res.send(reply);
				
		async function getPlayersBio(season, teamId){
			return pool.getConnection()
				.then(conn => {
					if(teamId === 'ALL' && season === 'ALL'){
						conn.end();
						return conn.query("Select PlayerId, TeamId, First_Name, Last_Name, G as Goalie from players Group By PlayerId")
					}
					else if(season === 'ALL'){
						conn.end();
						return conn.query("Select PlayerId, TeamId, First_Name, Last_Name, G as Goalie from players where TeamId = ? Group By PlayerId", [teamId])
					}
					else if(teamId === 'ALL'){
						conn.end();
						return conn.query("Select PlayerId, TeamId, First_Name, Last_Name, G as Goalie from players where Season = ? Group By PlayerId", [season])
					}
					else{
						conn.end();
						return conn.query("Select PlayerId, TeamId, First_Name, Last_Name, G as Goalie from players where Season = ? AND TeamId = ? Group By PlayerId", [season, teamId])
					}
			});
		}
		async function getPlayersTeam(teamId, season, leagueId){
			return pool.getConnection()
				.then(conn => {
					if(teamId === 'ALL' && season === 'ALL'){
						conn.end();
						return conn.query("Select Abbr, TeamId from teams Where LeagueId = ? Group By TeamId", [leagueId])
					}
					else if(teamId === 'ALL'){
						conn.end();
						return conn.query("Select Abbr, TeamId from teams where Season = ? AND LeagueId = ? Group By TeamId", [season, leagueId])
					}
					else if(season === 'ALL'){
						conn.end();
						return conn.query("Select Abbr, TeamId from teams where TeamId = ? AND LeagueId = ? Group By TeamId", [teamId, leagueId])
					}
					else if(leagueId === 'ALL'){
						conn.end();
						return conn.query("Select Abbr, TeamId from teams where TeamId = ? Group By TeamId", [teamId])
					}
					else{
						conn.end();
						return conn.query("Select Abbr, TeamId from teams where LeagueId = ? AND teamId = ? Group By TeamId", [leagueId, teamId])
					}
				});
		}

	async function getPlayersStats(season, playerId){
		return pool.getConnection()
			.then(conn => { 
				if(season === 'ALL'){
					conn.end();
					return conn.query("Select PlayerId, Season, TeamId, LeagueId, GP, G, A, G + A as Points, PIM, PlusMinus, PPG, PPA, SHG, SHA, GR, GWG, SOG, FOW / FO as FOPer, HIT, GvA, TkA, SB, TOI, PPTOI, SHTOI, Fights, Fights_Won from player_career_rs WHERE PlayerId = ? ORDER BY G + A DESC", [playerId])
				}
				else{
					conn.end();
					return conn.query("Select PlayerId, Season, TeamId, LeagueId, GP, G, A, G + A as Points, PIM, PlusMinus, PPG, PPA, SHG, SHA, GR, GWG, SOG, FOW / FO as FOPer, HIT, GvA, TkA, SB, TOI, PPTOI, SHTOI, Fights, Fights_Won from player_career_rs WHERE Season = ? AND PlayerId = ? ORDER BY G + A DESC", [season.slice(0,4), playerId])
				}
			})
	}

	async function getLeagueStats(leagueABBR){
		return pool.getConnection()
			.then(conn => { 
				if(leagueABBR === 'ALL'){
					conn.end();
					return conn.query("Select LeagueId from league GROUP BY LeagueId")
				}
				else{
					conn.end();
					return conn.query("Select LeagueId from league Where AbbrLeague = ? GROUP BY LeagueId", [leagueABBR])
				}
			})
	}
})

app.get(`/fhmplayergame`, async function (req, res) {

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
		leagueId = 'NHL';
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
		gameType = 'Regular Season';
	}

	const pool = mariadb.createPool({
		host: '192.168.2.15', 
		user:'MrDefity', 
		password: 'FrankNBeanz',
		database: databaseHeader,
		connectionLimit: 5,
		acquireTimeout: 600000
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

	console.log(teamId);
	console.log(season);
	console.log(leagueId);

	const promise1 = await getPlayersTeam(teamId, season, leagueId)
		.then(async data => {
			return data.map(info => {
				return ({
					TeamId: info.TeamId,
					teamName: info.Abbr,
				});
			});
		});

	const playerTeam = await Promise.all(promise1)

	console.log(playerTeam);

	const promise2 = playerTeam.map(async info => {
		if(info != undefined){
		return await getPlayersBio(season, info.TeamId)
		.then(async data => {
			const promise2a = await data.map(async data2 => {
				if(data2.G != 20 && data2.PlayerId != undefined){
					return ({
						playerId: data2.PlayerId,
						TeamId: data2.TeamId,
						firstName: data2.First_Name,
						lastName: data2.Last_Name,
					});
				}
				else{
					return ({
						playerId: undefined,
						TeamId: undefined,
						firstName: undefined,
						lastName: undefined,
					});
				}
			})
			return promise2a
		})
		.then(response => {return Promise.all(response)})
	}
	});

		const playerBios = await Promise.all(promise2)
		console.log(playerBios);

		const promise3 = playerBios.map(async info => {
			console.log("there" + info);
			    const promise3a = info.map(async info2 => {
				console.log("cheer " + info2.playerId);
				if(info2.playerId != undefined){
					const promise3b = await getPlayersStats(startDate, endDate, info2.playerId)
						.then(async data => {
							console.log("asdasd" + data[0].PlayerId);
							if(data[0].PlayerId != undefined){
								return ({
									playerId: data[0].PlayerId,
									GP: Number(data[0]['count(PlayerId)']),
									Goals: data[0]['sum(Goals)'],
									Assists: data[0]['sum(Assists)'],
									Points: data[0]['sum(Goals + Assists)'],
									PlusMinus: data[0]['sum(PlusMinus)'], 
									PIM: data[0]['sum(PIM)'],  
									SOG: data[0]['sum(SOG)'], 
									FOPer: data[0]['avg(FOPer)'],
								})
							}
						});
					const resultsb = await Promise.resolve(promise3b)
					console.log("resultsb: " + resultsb.playerId);
					return resultsb;

				}
			});
			const resultsa = await Promise.all(promise3a)
			console.log("resultsa: " + resultsa[0]);
			return resultsa;
		});

		const playerStats = await Promise.all(promise3);

		console.log("playerStats: " + playerStats[0]);
		console.log("playerBios: " + playerBios[0]);

		const playerBiosTeam = playerBios[0].map(info => ({
			...info,
			...playerTeam.find((element) => {
				if(element != undefined){
					return element.TeamId === info.TeamId
				}
			}),
		}));

		

		playerBiosTeam.forEach(info => {
			console.log("playerBiosTeam: " + info);
		})
		const playerStatsBiosTeams = playerBiosTeam.map(info => ({
			...info,
			...playerStats[0].find((element) => {
				console.log("element: " + element + "info: " + info.playerId);
				if(element != undefined){
					return element.playerId === info.playerId
				}
			}),
		}));
		console.log("playerStatsBiosTeams: " + playerStatsBiosTeams)

		const playerStatsBiosTeamsSimplify = playerStatsBiosTeams.filter(element => {
			console.log(element);
			return element.playerId != undefined;
		 });

		console.log(playerStatsBiosTeamsSimplify)
		res.send(playerStatsBiosTeamsSimplify);

		async function getPlayersStats(startDate, endDate, playerId){
			return pool.getConnection()
    			.then(conn => { 
					if(startDate === 'ALL'){
						conn.end();
    					return conn.query("Select PlayerId, count(PlayerId), sum(Goals), sum(Assists), sum(Goals + Assists), sum(PlusMinus), sum(PIM), sum(SOG), avg(FOPer) from player_stats WHERE PlayerId = ? GROUP BY PlayerId ORDER BY sum(Goals) DESC", [playerId])
					}
					else{
						conn.end();
    					return conn.query("Select PlayerId, count(PlayerId), sum(Goals), sum(Assists), sum(Goals + Assists), sum(PlusMinus), sum(PIM), sum(SOG), avg(FOPer) from player_stats WHERE Dates >= ? AND Dates <= ? AND PlayerId = ? GROUP BY PlayerId ORDER BY sum(Goals) DESC", [startDate, endDate, playerId])
					}
				})
		}
				
		async function getPlayersBio(season, teamId){
			return pool.getConnection()
				.then(conn => {
					if(teamId === 'ALL' && season === 'ALL'){
						conn.end();
						return conn.query("Select PlayerId, TeamId, First_Name, Last_Name, G from players Group By PlayerId")
					}
					else if(season === 'ALL'){
						conn.end();
						return conn.query("Select PlayerId, TeamId, First_Name, Last_Name, G from players where TeamId = ? Group By PlayerId", [teamId])
					}
					else if(teamId === 'ALL'){
						conn.end();
						return conn.query("Select PlayerId, TeamId, First_Name, Last_Name, G from players where Season = ? Group By PlayerId", [season])
					}
					else{
						conn.end();
						return conn.query("Select PlayerId, TeamId, First_Name, Last_Name, G from players where Season = ? AND TeamId = ? Group By PlayerId", [season, teamId])
					}
			});
		}
		async function getPlayersTeam(teamId, season, leagueId){
			return pool.getConnection()
				.then(conn => {
					if(teamId === 'ALL' && season === 'ALL'){
						conn.end();
						return conn.query("Select Abbr, TeamId from teams where LeagueId = ? Group By TeamId", [leagueId])
					}
					else if(teamId === 'ALL'){
						conn.end();
						return conn.query("Select Abbr, TeamId from teams where Season = ? AND LeagueId = ? Group By TeamId", [season, leagueId])
					}
					else if(season === 'ALL'){
						conn.end();
						return conn.query("Select Abbr, TeamId from teams where TeamId = ? AND LeagueId = ? Group By TeamId", [teamId, leagueId])
					}
					else{
						conn.end();
						return conn.query("Select Abbr, TeamId from teams where TeamId = ? AND LeagueId = ? Group by TeamId", [teamId, leagueId])
					}
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
			console.log(data);
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

app.listen(port, '192.168.2.12', () => {
    console.log(`Example app listening on port ${port}`)
  })