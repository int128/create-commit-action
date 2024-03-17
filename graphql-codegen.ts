import type { CodegenConfig } from '@graphql-codegen/cli'
import { schema } from '@octokit/graphql-schema'

const config: CodegenConfig = {
  schema: schema.idl,
  documents: ['src/**/*.ts'],
  generates: {
    'src/generated/graphql-types.ts': {
      plugins: ['typescript'],
    },
    'src/generated/graphql.ts': {
      preset: 'import-types',
      plugins: ['typescript-operations'],
      presetConfig: {
        typesPath: './graphql-types',
      },
    },
  },
}

export default config
