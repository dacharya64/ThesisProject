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
  tagline: 'The party hears a rumor about...',
  where: [
    '?r1 "type" "rumor"',
    '?r1 "state" "untold"',
    '?r1 "rumorText" ?t1', 
    '?r1 "teller" ?s1'
  ],
  event: (vars) => ({
    effects: [
      {type: 'tellRumor', rumor: vars.r1, newState: 'told'},
    ],
    text: `You hear a rumor from ${vars.s1} that ${vars.t1}`
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
