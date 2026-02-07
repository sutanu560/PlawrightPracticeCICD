import { Page } from '@playwright/test';

/**
 * Base page with common behavior for all page objects
 */
export abstract class BasePage {
  constructor(protected readonly page: Page, protected readonly path: string) {}

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  get url(): string {
    return this.path;
  }
}
