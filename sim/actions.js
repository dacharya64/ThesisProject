Felt.registerAction('PartyAttacked', {
  tagline: 'The party is attacked by...',
  where: [
    '(dislikes ?c1 ?c2)',
    '?c1 "name" ?n1',
    '?c2 "name" ?n2'
  ],
  event: (vars) => ({
    actor: vars.c1,
    target: vars.c2,
    effects: [
    ],
    text: "The party is attacked by someone."
  })
});

Felt.registerAction('OverhearRumor', {
  tagline: 'The party hears a rumor from ?t1 about ?s1',
  where: [
    '?r1 "type" "rumor"',
    '?r1 "state" "untold"',
    '?r1 "rumorText" ?rt1', 
    '?r1 "teller" ?t1',
    '?r1 "snippet" ?s1'
  ],
  event: (vars) => ({
    effects: [
      {type: 'tellRumor', rumor: vars.r1, newState: 'told'},
    ],
    text: `The party hears a rumor from ${vars.t1}: "${vars.rt1}"`
  })
});

Felt.registerAction('HearComplaintsAbout', {
  tagline: 'The party hears complaints about someone',
  where: [
   '?c1 "name" ?n1'
  ],
  event: (vars) => ({
    text: "You hear a complaint that someone..."
  })
});

Felt.registerAction('SomeoneDoesBadThing', {
  tagline: 'The party sees someone doing a bad thing...',
  where: [
   '?c1 "name" ?n1'
  ],
  event: (vars) => ({
    text: "The party sees someone doing a bad thing..."
  })
});

Felt.registerAction('FindOutSomeoneWasBehind', {
  tagline: 'The party investigates something and learns that someone is behind it',
  where: [
   '?c1 "name" ?n1'
  ],
  event: (vars) => ({
    text: "The party realizes that someone was behind their investigation of..."
  })
});
