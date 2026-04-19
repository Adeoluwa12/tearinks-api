const SCORES = {
  LIKE:     1,
  COMMENT:  3,
  REPOST:   5,
  DEEP:     4,
  POWERFUL: 4,
  CALM:     2,
  RAW:      3,
};

const scoreFor = (action) => SCORES[action] ?? 0;

module.exports = { scoreFor, SCORES };
