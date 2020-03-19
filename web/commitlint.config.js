module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['build', 'ci', 'chore', 'feat', 'fix', 'docs', 'style', 'refactor', 'test', 'revert', 'perf', 'milestone'],
    ],
  },
};
