import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",

  roots: ["<rootDir>/tests"],

  testMatch: ["**/*.test.ts"],

  moduleFileExtensions: ["ts", "js", "json"],

  collectCoverage: true,

  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/server.ts",
  ],

  coverageDirectory: "coverage",

  clearMocks: true,
};

export default config;