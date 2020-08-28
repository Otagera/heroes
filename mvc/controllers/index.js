const mongoose = require("mongoose");
const Hero = mongoose.model('Hero');
const Squad = mongoose.model('Squad');

const data = require("../../Default_Heroes");
const heroData = data.heroes;
const squadData = data.squads;


function getOverall(hero) {
	let {
		strength: str,
		perception: per,
		endurance: end,
		charisma: cha,
		intelligence: int,
		agility: agi,
		luck: luc
	} = hero.stats;
	let arr = [str, per, end, cha, int, agi, luc];
	return arr.reduce((acc, value) => acc + value);
}


const getIndex = function(req, res, next) {
  res.render('index', { title: 'Heroes' });
}

const getHeroesIndex = function (req, res) {
	Hero.find({}, "", { lean: true }, (err, heroes)=>{
		if(err) {return res.send( {error: err} );}

		for(hero of heroes) {
			hero.overall = getOverall(hero);
		}

		res.render('heroes', { title: 'Hall of Heroes', heroes: heroes });
	});

}

const getHeroesForm = function (req, res) {
	Squad.find((err, squads) => {
		if(err) {return res.send( {error: err} );}
		res.render('create-hero', { title: 'Create a Hero', squads: squads });
	});
}

const createNewHero = function({ body }, res){
	let hero = {
		name: body.name,
		description: body.desc,
		stats: {
			strength: body.strength,
			perception: body.perception,
			endurance: body.endurance,
			charisma: body.charisma,
			intelligence: body.intelligence,
			agility: body.agility,
			luck: body.luck,
		}
	}
	body.origin && (hero.origin = body.origin);
	body.squad && (hero.squad = body.squad);

	Hero.create(hero, (err, newHero) => {
		if(err) {return res.send( {error: err} );}
		res.redirect("/heroes");
	});
}

const deleteHero = function ({ params }, res) {
	Hero.findByIdAndRemove(params.heroid, (err, hero) => {
		if(err) {return res.send( {error: err} );}
		res.redirect("/heroes");
	});
}

const getUpdateForm = function ({ params }, res) {
	Hero.findById(params.heroid, (err, hero) => {
		if(err) {return res.send( {error: err} );}
		Squad.find((err, squads) => {
			if(err) {return res.send( {error: err} );}
			res.render("update-hero", { title: "Update Hero", hero: hero, squads: squads });
		});
	});
}

const updateHero = function ({ params, body }, res) {
	Hero.findById(params.heroid, (err, hero) => {
		if(err) {return res.send( {error: err} );}
		hero.name = body.name;
		hero.description = body.desc;
		hero.origin = body.origin;
		hero.origin = body.origin;
		hero.stats.strength = body.strength;
		hero.stats.perception = body.perception;
		hero.stats.endurance = body.endurance;
		hero.stats.charisma = body.charisma;
		hero.stats.intelligence = body.intelligence;
		hero.stats.agility = body.agility;
		hero.stats.luck = body.luck;

		hero.squad = undefined;
		body.squad && (hero.squad = body.squad);

		hero.save((err, updatedHero) => {
			if(err) {return res.send( {error: err} );}
			res.redirect("/heroes");
		})
	});
}

const reset = function({ params }, res){

	if(params.specialKey == 1914){
		let p1 = new Promise((resolve, reject)=>{
			Hero.deleteMany({}, (err, info) => {
				if(err) { reject("Error"); return res.send( {error: err} );}
				resolve("Success");
			});			
		});
		let p2 = new Promise((resolve, reject)=>{
			Squad.deleteMany({}, (err, info)=>{
				if(err) { reject("Error"); return res.send( {error: err} );}
				resolve("Success");

			});
		});

		Promise.all([p1, p2]).then(()=>{
			let p1 = new Promise((resolve, reject) => {
				Hero.insertMany(heroData, (err, info) => {
					if(err) { reject("Error"); return res.send( {error: err} );}
					resolve("Success");
				});
			});

			let p2 = new Promise((resolve, reject) => {
				Squad.insertMany(squadData, (err, info) => {
					if(err) { reject("Error"); return res.send( {error: err} );}
					resolve("Success");
				});
			});
		});

		Promise.all([p1, p2]).then(()=>{
			res.redirect("/heroes");
		});
	} else {
		console.log("Incorrect Password");
		return;
	}
}

const getSquadsIndex = function(req, res){
	//the squad returned here is not a javascript object if you set it up this way
	//Squad.find((err, squads) => {
	//if you want it otherwise you set the other parameters
	Squad.find({}, null, {lean: true}, (err, squads) => {
		if(err) {return res.send( {error: err} );}

		Hero.find({ squad: { $exists: true } }, "name stats squad", { lean: true }, (err, heroes) => {
			if(err) {return res.send( {error: err} );}

			for(let i = 0; i < squads.length; i++){
				squads[i].heroes = [];

				for(let j = 0; j < heroes.length; j++){
					if(heroes[j].squad === squads[i].name){
						heroes[j].overall = getOverall(heroes[j]);
						squads[i].heroes.push(heroes[j]);
						heroes.splice(j, 1);
						j--;
					}
				}
				squads[i].overall = squads[i].heroes.reduce((acc, value) =>  acc + value.overall, 0);
			}
			res.render("squads", { title: "Super Squads", squads: squads });
		});


	});

}

const getSquadForm = function(req, res){
	res.render("create-squad", { title: "Create a Super Squads" });
}

const createSquad = function({ body }, res){
	let squad = { name: body.name };

	squad.hq = body.hq? body.hq: 'Unknown';

	Squad.create(squad, (err, squad) => {
		if(err) {return res.send( {error: err} );}
		res.redirect("/squads");
	});
}

const deleteSquad = function({ params }, res) {
	Squad.findByIdAndRemove(params.squadid, (err, squad) => {
		if(err) {return res.send( {error: err} );}
		Hero.find({squad: {$exists: true}}, "squad", {}, (err, heroes) =>{
			if(err) {return res.send( {error: err} );}
			
			let promises = [];
			for(hero of heroes){
				if(hero.squad === squad.name){
					hero.squad = undefined;

					let promise = new Promise((resolve, reject)=>{
						hero.save((err)=>{
							if(err) { reject("Error"); return res.send( {error: err} );}
							resolve("Success");
						});						
					});
					promises.push(promise);
				}
			}

			Promise.all(promises).then(() => {
				res.redirect("/squads");
			});

		});
	});
}

module.exports = {
	getIndex,
	getHeroesIndex,
	getHeroesForm,
	createNewHero,
	deleteHero,
	getUpdateForm,
	updateHero,
	reset,
	getSquadsIndex,
	getSquadForm,
	createSquad,
	deleteSquad
};