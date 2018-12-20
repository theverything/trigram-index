function toTrigrams(phrase) {
  const tokens = phrase.toLowerCase().split(/\s+/);
  const trigrams = [];

  tokens.forEach(t => {
    const rawData = ` ${t} `;

    for (let i = rawData.length - 3; i >= 0; i -= 1) {
      trigrams.push(rawData.slice(i, i + 3));
    }
  });

  return trigrams;
}

function addToIndex(index, phrase, i) {
  const trigrams = toTrigrams(phrase);

  trigrams.forEach(t => {
    if (!index.has(t)) {
      index.set(t, new Set([i]));
    } else {
      index.get(t).add(i);
    }
  });
}

export default class TrigramIndex {
  constructor(inputPhrases) {
    this.index = new Map();
    this.phrases = inputPhrases;

    this.phrases.forEach((phrase, i) => addToIndex(this.index, phrase, i));
  }

  add(phrase) {
    addToIndex(this.index, phrase, this.phrases.push(phrase) - 1);
  }

  size() {
    return this.index.size;
  }

  search(phrase, minScore = 0) {
    const trigrams = toTrigrams(phrase);
    const intersection = {};

    // count intersections between phrase and matches
    trigrams.forEach(t => {
      if (this.index.has(t)) {
        this.index.get(t).forEach(i => {
          if (intersection[i]) {
            intersection[i] += 1;
          } else {
            intersection[i] = 1;
          }
        });
      }
    });

    const results = Object.keys(intersection)
      .map(i => {
        const match = this.phrases[i];
        const m = match.toLowerCase();
        const p = phrase.toLowerCase();

        // exact match
        if (m === p) return { match, score: 1 };

        const intersectionSize = intersection[i];
        // modified Sørensen–Dice coefficient (using trigrams rather than bigrams)
        // https://en.wikipedia.org/wiki/S%C3%B8rensen%E2%80%93Dice_coefficient
        const score = Math.min((2 * intersectionSize) / (m.length + p.length), 1);

        return { match, score };
      })
      .sort((a, b) => b.score - a.score);

    return minScore ? results.filter(p => p.score >= minScore) : results;
  }
}
