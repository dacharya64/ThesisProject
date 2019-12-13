/// HTML include order for sim JS files:
/// datascript
/// util
/// felt
/// {sim,actions,effects,siftpatterns}

window.Sim = (function(){

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

let allNames = [
  'Aaron', 'Adam', 'Alex', 'Alice', 'Ann',
  'Bella', 'Ben', 'Beth',
  'Cam', 'Cathy', 'Colin',
  'Emily', 'Emma', 'Erin',
  'Fred',
  'Gavin', 'Gillian',
  'Izzy',
  'Jacob', 'James', 'Janey', 'Jason', 'Jordan',
  'Kevin', 'Kurt',
  'Liz',
  'Matt',
  'Nicole', 'Nora',
  'Quinn',
  'Robin',
  'Sarah',
  'Victor', 'Vincent'
];

const allValues = [
  "authority",   // hierarchies are good! they're the only thing between us and ANARCHY. Chesterton's Fence!
  "careerism",   // climbin' the ladder
  "comfort",     // I wanna be comfortable and you should too, because it's important for our health!
  "communalism", // everything for the community, nothing for the self!
  "curiosity",   // I do stuff cause I'm interested in seeing what will happen
  "expression",  // people in general should express themselves
  "frugality",   // I will never pay for Sublime Text
  "impact",      // I want to CHANGE THE WORLD through my SCIENCE
  "progress",    // the system is broken, but we can tear it down and rebuild it better. embrace change!
  "survival"     // I'm just tryna make my way in the big ol' dangerous world
];

const allCurses = [
  "aesthetic commitment", // really strongly values a particular aesthetic that others don't share
  "awkward",              // not good at talking to other human people
  "can't say no",         // i mean
  "chaotic neutral",      // does unexpected things just to do them
  "chip on shoulder",     // WILL fight you
  "conflict aversion",    // will not fight ANYONE even when it's important
  "contrarianism",        // if you say yes i say no. will happily flip discussion positions halfway through
  "distractibility",      // starts too many new things! doesn't finish old ones!
  "hesitance",            // reluctance to commit to any particular course of action. sylvia plath fig tree thing!
  "insecurity",           // can be "too intimidated to talk" or "must prove myself, will talk over everyone!"
  "laziness",             // doesn't ever actually work on anything!
  "misunderstood",        // often misinterpreted, hard to understand sometimes, can't validate to target communities
  "people pleaser",       // care too much about pleasing people. sorry cop
  "perfectionism",        // fear of failure leads to lack of visible progress
  "precarity",            // got nothin to fall back on if anything goes wrong
  "professionalism",      // y'know, d-don't say - swears
  "work ethic"            // works TOO HARD at price of own well-being at times
];

const weightedAllRoles = [
  "undergrad",
  "master's student",
  "master's student",
  "master's student",
  "master's student",
  "PhD student",
  "PhD student",
  "PhD student",
  "PhD student",
  "PhD student",
  "PhD student",
  "postdoc",
  "postdoc",
  "assistant professor",
  "assistant professor",
  "assistant professor",
  "assistant professor",
  "associate professor",
  "full professor",
  "full professor",
  "emeritus professor",
  "venue staff"
];

const allHooks = [
  "secret expert",
  "social media famous"
];

function generateCharacter(db) {
  const takenNames = getAllCharacterNames(db);
  const validNames = allNames.filter((n) => takenNames.indexOf(n) === -1);
  const curse = randNth([randNth(allCurses), null]);
  const hook = randNth([randNth(allHooks), null, null, null, null, null, null, null]);
  const entity = {
    type: 'char',
    name: randNth(validNames),
    values: shuffle(allValues).slice(0, 2),
    curses: shuffle(allCurses).slice(0, randInt(1, 2)),
    role: randNth(weightedAllRoles),
    romanceTarget: 'nobody',
    romanceState: 'single',
  };
  if (hook) entity.hook = hook;
  console.log(entity);
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

/// INIT DB

let schema = {
  //exampleAttr: {':db/cardinality': ':db.cardinality/many'},
  actor:  {':db/valueType': ':db.type/ref'},
  cause:  {':db/valueType': ':db.type/ref'},
  source: {':db/valueType': ':db.type/ref'},
  target: {':db/valueType': ':db.type/ref'},
  projectContributor: {':db/valueType': ':db.type/ref', ':db/cardinality': ':db.cardinality/many'},
  tag:    {':db/cardinality': ':db.cardinality/many'}
};
let gameDB = datascript.empty_db(schema);

for (let i = 0; i < 10; i++){
  gameDB = generateCharacter(gameDB);
}
for (let [char1, char2] of getAllCharacterPairsUndirected(gameDB)) {
  const pair1to2 = [char1, char2];
  const pair2to1 = [char2, char1];
  // TODO generate relationships
}
for (let i = 0; i < 50; i++){
  gameDB = generateAttitude(gameDB);
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
  // Get a list of all character names.
  getAllCharacterNames: function () {
    return getAllCharacterNames(gameDB);
  },
  // Get the ID of the character with the specified name.
  getCharacterIDByName: function(name) {
    return getCharacterIDByName(gameDB, name);
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
