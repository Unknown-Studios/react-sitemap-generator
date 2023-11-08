/**
 * @type {import('@commitlint/types').UserConfig}
 */
const config = {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    parserOpts: {
      headerPattern: /^(:\w*:)? ?(\w*)(?:\((\w*)\))?!?: (.*)/,
      headerCorrespondence: ['emoji', 'type', 'scope', 'subject'],
    },
  },
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
        'upgrade',
        'downgrade',
      ],
    ],
  },
}

module.exports = config
