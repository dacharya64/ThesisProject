/// HTML include order for sim JS files:
/// datascript
/// util
/// felt
/// {sim,actions,effects,siftpatterns}

window.Sim = (function(){

/// QUERY RULES

Felt.setQueryRules(`[

[(eventSequence ?e1 ?e2)
 [?e1 "type" "event"] [?e2 "type" "event"]
 [(< ?e1 ?e2)]]

[(likes ?c1 ?c2)
 [?ship "type" "ship"] [?ship "source" ?c1] [?ship "target" ?c2]
 [?ship "charge" ?charge] [(> ?charge 0)]]

[(dislikes ?c1 ?c2)
 [?ship "type" "ship"] [?ship "source" ?c1] [?ship "target" ?c2]
 [?ship "charge" ?charge] [(< ?charge 0)]]

]`);

/// GENERATION FUNCTIONS

function getAllCharacterNames(db) {
  return datascript.q('[:find ?n :where [?c "type" "char"] [?c "name" ?n]]', db).map(vars => vars[0]);
}

function getAllCharacterPairs(db) {
  return datascript.q('[:find ?c1 ?c2 \
                        :where [?c1 "type" "char"] [?c2 "type" "char"] [(not= ?c1 ?c2)]]', db);
}

// Like getAllCharacterPairs, but will only include [1 2] rather than both [1 2] and [2 1].
function getAllCharacterPairsUndirected(db) {
  return datascript.q('[:find ?c1 ?c2 \
                        :where [?c1 "type" "char"] [?c2 "type" "char"] \
                               [(not= ?c1 ?c2)] [(< ?c1 ?c2)]]', db);
}

function getCharacterIDByName(db, name) {
  return datascript.q(`[:find ?c :where [?c "type" "char"] [?c "name" "${name}"]]`, db)[0][0];
}

function getCharacterOccupationByName(db, name) {
  return datascript.q(`[:find ?o :where [?c "type" "char"] [?c "name" "${name}"] [?c "occupation" ?o]]`, db);
}

function getCharacterFactionByName(db, name) {
  return datascript.q(`[:find ?f :where [?c "type" "char"] [?c "name" "${name}"] [?c "faction" ?f]]`, db);
}

function getCharacterStatusByName(db, name) {
  return datascript.q(`[:find ?s :where [?c "type" "char"] [?c "name" "${name}"] [?c "status" ?s]]`, db);
}

function getImpressions(db, source, target) {
  return datascript.q(`[:find ?i \
                        :where [?i "type" "impression"] [?i "source" ${source}] [?i "target" ${target}]]`, db);
}

function getRelationship(db, source, target) {
  return datascript.q(`[:find ?r \
                        :where [?r "type" "ship"] [?r "source" ${source}] [?r "target" ${target}]]`, db)[0][0];
}

function getRumor(db, source) {
  return datascript.q(`[:find ?r \
                        :where [?r "type" "rumor"] [?r "source" ${source}]]`, db);
}

const allNames = [
  'Toblin Stonehill', 'Elmar Barthen', 'Daren Edermath', 'Linene Graywind', 
  'Halia Thorton', 'Qelline Alderleaf', 'Sister Garaele', 'Harbin Wester',
  'Sildar Hallwinter'
];

const allOccupations = [
  "Innkeeper",
  "Trading post owner",
  "Runs trading post",
  "Farmer",
  "Cleric",
  "Townmaster"
];

const allFactions = [
  "Order of the Gauntlet",
  "Zhentarim",
  "Harper",
  "Lords' Alliance"
];

const allStatuses = [
  "alive",
  "dead"
];

function generateCharacter(db, i, castObjects) {
  var char = Object.values(castObjects)[i];
  const entity = {
    type: 'char',
    name: `${char.name}`,
    occupation: `${char.occupation}`,
    faction:  `${char.faction}`,
    status:  `${char.status}`
  };
  return createEntity(db, entity);
}

function generateRumor(db, i, rumors) {
  var rumor = Object.values(rumors)[i];
  const entity = {
    type: 'rumor', 
    teller: `${rumor.teller}`, 
    state: `${rumor.state}`,
    rumorText: `${rumor.rumorText}`,
    snippet: `${rumor.snippet}` 
  }
  return createEntity(db, entity);
}

function generateLocation(db, i, locations) {
  var location = Object.values(locations)[i];
  const entity = {
    type: 'location', 
    name: `${location.name}`, 
    state: `${location.state}`,
    npcs: `${location.NPCs}`
  }
  return createEntity(db, entity);
}

function generateComplaint(db, i, complaints) {
  console.log("generating complaints...")
  var complaint = Object.values(complaints)[i];
  const entity = {
    type: 'complaint', 
    teller: `${complaint.teller}`, 
    state: `${complaint.state}`,
    subject: `${complaint.subject}`,
    snippet: `${complaint.snippet}`
  }
  return createEntity(db, entity);
}

function generateAttitude(db) {
  let charPairs = getAllCharacterPairs(db);
  let charPair = randNth(charPairs);
  return createEntity(db, {
    type: 'attitude',
    charge: randNth(['positive', 'negative']),
    source: charPair[0],
    target: charPair[1]
  });
}

function generateAffection(db, char1, char2) {
  return createEntity(db, {
    level: 5,
    source: char1,
    target: char2,
    type: 'affection',
    realizedLove: false
  });
}

function generateRelationship(db, char1, char2) {
  return createEntity(db, {
    type: 'ship',
    charge: randInt(-5, 5),
    source: char1,
    target: char2
  });
}

/// INIT DB

let schema = {
  //exampleAttr: {':db/cardinality': ':db.cardinality/many'},
  // character traits
  curse:  {':db/cardinality': ':db.cardinality/many'},
  value:  {':db/cardinality': ':db.cardinality/many'},
  // other stuff
  actor:  {':db/valueType': ':db.type/ref'},
  cause:  {':db/valueType': ':db.type/ref'},
  source: {':db/valueType': ':db.type/ref'},
  target: {':db/valueType': ':db.type/ref'},
  projectContributor: {':db/valueType': ':db.type/ref', ':db/cardinality': ':db.cardinality/many'},
  tag:    {':db/cardinality': ':db.cardinality/many'},
};
let gameDB = datascript.empty_db(schema);

const castArray = JSON.parse(json_cast);
const castObjects = Object.values(castArray)[0];
for (let i = 0; i < _.size(castObjects); i++){ 
  gameDB = generateCharacter(gameDB, i, castObjects);
}
// generate relationships
for (let [char1, char2] of getAllCharacterPairsUndirected(gameDB)) {
  const pair1to2 = [char1, char2];
  const pair2to1 = [char2, char1];
  // Set relationship as negative between Player Party and Redbrands
  if (char1 == 11 && char2 == 12) {
    gameDB = createEntity(gameDB, {
    type: 'ship',
    charge: 0,
    source: char1,
    target: char2
    });
    gameDB = createEntity(gameDB, {
      type: 'ship',
      charge: -5,
      source: char2,
      target: char1
    });
  } 
  //Everyone else has a neutral relationship
  else {
    gameDB = createEntity(gameDB, {
    type: 'ship',
    charge: 0,
    source: char1,
    target: char2
  });
  gameDB = createEntity(gameDB, {
    type: 'ship',
    charge: 0,
    source: char2,
    target: char1
  });
  }
}

for (let i = 0; i < 50; i++){
  gameDB = generateAttitude(gameDB);
}

//Add rumors for each of the rumors
const rumors = JSON.parse(json_rumors);
for (let i = 0; i < _.size(rumors); i++){ 
  gameDB = generateRumor(gameDB, i, rumors);
}

//Add complaints
const complaints = JSON.parse(json_complaints);
for (let i = 0; i < _.size(complaints); i++){ 
  gameDB = generateComplaint(gameDB, i, complaints);
}

//Add locations for each of the locations
const locations = JSON.parse(json_locations);
for (let i = 0; i < _.size(locations); i++){ 
  gameDB = generateLocation(gameDB, i, locations);
}

for (let charPair of getAllCharacterPairs(gameDB)) {
  gameDB = generateAffection(gameDB, charPair[0], charPair[1]);
}

/// TIE IT ALL TOGETHER

// Given the DB and a list of action specs, return a random possible action with bindings.
function getRandomAction(db){
  const allPossible = Felt.possibleActions(db);
  return randNth(allPossible);
}

// Like `runRandomAction`, but assigns an equal selection weight to all valid action types.
function getRandomActionByType(db){
  const allPossibleByType = Felt.possibleActionsByType(db);
  const type = randNth(Object.keys(allPossibleByType));
  return randNth(allPossibleByType[type]);
}

/// set up handler infrastructure

let simEventHandlers = [];

function handleSimEvent(simEvent) {
  for (let handler of simEventHandlers) {
    handler(simEvent);
  }
}

/// set up sifting pattern infrastructure

let nuggetsAlreadyFound = [];

function runSiftingPatterns() {
  let newNuggets = []; 
  for (let nugget of Felt.runSiftingPatterns()) {
    const nuggetStr = nugget.pattern.name + '|' + Object.values(nugget.vars).join('|');
    if (nuggetsAlreadyFound.indexOf(nuggetStr) > -1) continue;
    newNuggets.push(nugget);
    nuggetsAlreadyFound.push(nuggetStr);
  }
  return newNuggets;
}


/// return Sim singleton object

return {
  // Return the current simulation state as a DataScript DB.
  getDB: function() {
    return gameDB;
  },
  // Set the player character's name within the simulation.
  setPlayerName: function(playerName) {
    gameDB = updateProperty(gameDB, 1, 'name', playerName);
  },
  // Functions for walking the entity graph.
  getImpressions,
  getRelationship,
  // Get a list of all character names.
  getAllCharacterNames: function () {
    return getAllCharacterNames(gameDB);
  },
  // Get the ID of the character with the specified name.
  getCharacterIDByName: function(name) {
    return getCharacterIDByName(gameDB, name);
  },
  // Get the occupation of the character with the specified name.
  getCharacterOccupationByName: function(name) {
    return getCharacterOccupationByName(gameDB, name);
  },
  // Get the faction of the character with the specified name. 
  getCharacterFactionByName: function(name) {
    return getCharacterFactionByName(gameDB, name);
  },
  // Get the status of the character with the specified name. 
  getCharacterStatusByName: function(name) {
    return getCharacterStatusByName(gameDB, name);
  },
  // Get a list of suggested potential actions, sorted by salience to the current situation.
  getSuggestedActions: function() {
    const allPossible = Felt.possibleActions(gameDB);
    return shuffle(allPossible);
  },
  // Run a single potential action.
  runAction: function(action, bindings) {
    const event = Felt.realizeEvent(action, bindings);
    console.log(event);
    gameDB = Felt.addEvent(gameDB, event);
    return event;
  },
  /*
  // Perform a player-entered diary action.
  runDiaryAction: function(actionName, actionText) {
    console.log('Running diary action of type: ' + actionName);
    let event = {type: 'event', isDiaryEvent: true, eventType: actionName, text: actionText, actor: 1, target: 1};
    console.log(event);
    gameDB = Felt.addEvent(gameDB, event);
    handleSimEvent(event);
  },
  */
  // Perform the specified action with the specified bindings.
  runActionWithBindings: function(action, bindings) {
    console.log('Running action named: ' + action.name + '\nwith bindings: ' + JSON.stringify(bindings));
    let event = Felt.realizeEvent(action, bindings);
    console.log(event);
    gameDB = Felt.addEvent(gameDB, event);
    handleSimEvent(event);
  },
  // Perform a random possible action.
  runRandomAction: function() {
    const possible = getRandomActionByType(gameDB);
    this.runActionWithBindings(possible.action, possible.bindings);
  },
  // Register an event handler function to be called whenever a simulation event takes place.
  // The event handler will receive the event that was just performed as an argument.
  registerEventHandler: function(handler) {
    simEventHandlers.push(handler);
  },
  // Run all registered sifting patterns over the database. Return all new nuggets that are found.
  runSiftingPatterns: runSiftingPatterns
}

})();

/*
/// EXAMPLE USAGE (in a separate file)

// To make a new diary entry...
Sim.runDiaryAction('seeCuteAnimal', 'Today I saw a cute animal.');

// To write a function that'll be called whenever a new event happens...
Sim.registerEventHandler(function(event) {
  // Use this information to do animations, etc.
  // For instance, use the value of event.actor to find the corresponding character sprite
  // and put an appropriate emoji over their head.
  // Can check event.isDiaryEvent to determine whether this event was player-entered or autonomous.

  // To perform story sifting every time a new event takes place...
  let newNuggets = Sim.runSiftingPatterns();
  // Now you can do stuff with newNuggets, e.g. adding decorative buildings to the town
  // based on the story pattern that was just recognized.
  // For instance, to check if the first nugget is an instance of the "sawThreeAnimals" pattern...
  if (nuggets[0] && nuggets[0].pattern.name === 'sawThreeAnimals') {
    // ...your code here...
  }
});

// To make the simulation run actions autonomously...
window.setInterval(function(){
  Sim.runRandomAction();
}, 1000 * 10); // one action every 10 seconds
*/
