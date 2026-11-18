import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.spec.ts"],
    fileParallelism: false,
    env: {
      NODE_ENV: "test",
      DB_PATH: ":memory:",
      JWT_SECRET: "test-jwt-secret",
      JWT_EXPIRES_IN: "8h",
      COOKIE_NAME: "4tb_token",
      DEFAULT_ADMIN_USER: "delegado",
      DEFAULT_ADMIN_PASS: "senha-teste",
    },
  },
});
