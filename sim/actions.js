Felt.registerAction('Attack', {
  tagline: '?n1: Attack ?n2',
  where: [
    '(dislikes ?c1 ?c2)',
    '?c1 "name" ?n1',
    '?c2 "name" ?n2'
  ],
  event: (vars) => ({
    actor: vars.c1,
    target: vars.c2,
    effects: [
      {type: 'addAttitude', charge: 'negative', source: vars.c2, target: vars.c1}
    ],
    text: "🔪 Out of nowhere, " + vars.n1 + " attacked " + vars.n2 + "!"
  })
});

Felt.registerAction('SpreadRumor', {
  tagline: '?n1: Spreads Rumor',
  where: [
    '?c1 "name" ?n1',
  ],
  event: (vars) => ({
    text: "💬 " + vars.n1 + " spreads a rumor that..."
  })
});

Felt.registerAction('AskForHelp', {
  tagline: '?n1: Asks For Help From ?n2',
  where: [
    '?c1 "name" ?n1',
    '?c2 "name" ?n2',
    '(not= ?c1 ?c2)'
  ],
  event: (vars) => ({
    actor: vars.c1,
    target: vars.c2,
    text: "❗ " + vars.n1 + " asks for help from " + vars.n2 + ", saying that they need..."
  })
});
