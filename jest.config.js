export default {
  preset: 'ts-jest/presets/default-esm',
  // https://kulshekhar.github.io/ts-jest/docs/guides/esm-support
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  clearMocks: true,
}
