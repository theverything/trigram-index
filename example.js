const fs = require('fs');
const TrigramIndex = require('./build').default;

function timerStart() {
  const startTime = process.hrtime();

  return function timerEnd() {
    const [sec, nano] = process.hrtime(startTime);
    return Math.round(sec * 1000 + nano / 1000000);
  };
}

const data = fs.readFileSync('/usr/share/dict/words');
const inputPhrases = data.toString().split('\n');

const indexStart = timerStart();
const index = new TrigramIndex(inputPhrases);
const indexEnd = indexStart();

process.stdout.write(
  `Index took ${indexEnd}ms / Phrases indexed ${inputPhrases.length} / Index count ${index.size()}\n`,
);
process.stdout.write(`Type \\exit to quit.\n\n`);
process.stdout.write(`Search Term: `);

process.stdin.on('data', d => {
  const q = d.toString().trim();

  if (q.toLowerCase() === '\\exit') {
    process.stdout.write('Exiting...\n');
    process.exit(0);
  }

  const searchStart = timerStart();
  const results = index.search(q);
  const searchEnd = searchStart();

  process.stdout.write(`\nTook ${searchEnd}ms / Results ${results.length}\n\n`);
  process.stdout.write(`Top 10\n------\n`);
  process.stdout.write(
    results
      .map(r => `phrase: ${r.match} / score: ${r.score}`)
      .slice(0, 10)
      .join('\n'),
  );

  process.stdout.write(`\n\nSearch Term: `);
});
