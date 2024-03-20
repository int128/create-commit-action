import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: `node_modules/@octokit/graphql-schema/schema.graphql`,
  documents: ['src/**/*.ts'],
  generates: {
    'src/generated/graphql-types.ts': {
      plugins: ['typescript'],
    },
    'src/generated/graphql.ts': {
      preset: 'import-types',
      plugins: ['typescript-operations'],
      presetConfig: {
        typesPath: './graphql-types.js',
      },
    },
  },
}

export default config
