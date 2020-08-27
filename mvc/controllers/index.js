const mongoose = require("mongoose");
const Hero = mongoose.model('Hero');

const data = require("../../Default_Heroes");
const heroData = data.heroes;

const getIndex = function(req, res, next) {
  res.render('index', { title: 'Heroes' });
}

const getHeroesIndex = function (req, res) {
	Hero.find((err, heroes)=>{
		if(err) {return res.send( {error: err} );}
		res.render('heroes', { title: 'Hall of Heroes', heroes: heroes });
	});

}

const getHeroesForm = function (req, res) {
	res.render('create-hero', { title: 'Create a Hero' });
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
		res.render("update-hero", { title: "Update Hero", hero: hero });
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

		hero.save((err, updatedHero) => {
			if(err) {return res.send( {error: err} );}
			res.redirect("/heroes");
		})
	});
}

const reset = function({ params }, res){
	console.log(params.specialKey);
	if(params.specialKey == 1914){
		Hero.deleteMany({}, (err, info) => {
			if(err) {return res.send( {error: err} );}

			Hero.insertMany(heroData, (err, info) => {
				if(err) {return res.send( {error: err} );}
				res.redirect("/heroes");
			});
		});		
	} else {
		console.log("Incorrect Password");
		return;
	}
}


module.exports = {
	getIndex,
	getHeroesIndex,
	getHeroesForm,
	createNewHero,
	deleteHero,
	getUpdateForm,
	updateHero,
	reset
};