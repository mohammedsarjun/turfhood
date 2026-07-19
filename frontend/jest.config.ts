import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const customJestConfig: Config = {
  testEnvironment: 'jest-environment-jsdom',

  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};

async function resolveJestConfig(): Promise<Config> {
  const nextConfig = await createJestConfig(customJestConfig)();

  // jose ships as ESM-only; next/jest's default transformIgnorePatterns would skip
  // transforming it (leaving its `export` syntax unparsed), so carve out an exception.
  const transformIgnorePatterns = (nextConfig.transformIgnorePatterns ?? []).map((pattern) =>
    pattern.includes('geist') ? pattern.replace('(?!(geist|', '(?!(geist|jose|') : pattern,
  );

  return { ...nextConfig, transformIgnorePatterns };
}

export default resolveJestConfig;
