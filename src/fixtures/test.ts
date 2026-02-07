import { test as base } from '@playwright/test';
import { TodoPage } from '../pages/TodoPage';

/**
 * Custom fixtures extending Playwright's base test.
 * Injects page objects so tests use: test('...', async ({ todoPage }) => { ... })
 */
type Fixtures = {
  todoPage: TodoPage;
};

export const test = base.extend<Fixtures>({
  todoPage: async ({ page }, use) => {
    await use(new TodoPage(page));
  },
});

export { expect } from '@playwright/test';
