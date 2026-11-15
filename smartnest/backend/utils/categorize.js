const KEYWORDS = {
  Plumbing: ['leak', 'pipe', 'drain', 'water', 'tap', 'flush', 'toilet', 'faucet', 'shower', 'sink', 'sewage', 'plumb'],
  Electrical: ['light', 'power', 'switch', 'socket', 'circuit', 'bulb', 'wire', 'electricity', 'outlet', 'breaker', 'fan', 'electric'],
  Cleaning: ['trash', 'garbage', 'dirty', 'sweep', 'mop', 'pest', 'insect', 'rodent', 'clean', 'smell', 'odor', 'stain', 'dust'],
};

/**
 * Categorize a complaint based on title + description keywords.
 * @param {string} title
 * @param {string} description
 * @returns {'Plumbing'|'Electrical'|'Cleaning'|'General'}
 */
function categorize(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  for (const [category, keywords] of Object.entries(KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) {
      return category;
    }
  }
  return 'General';
}

module.exports = { categorize };
