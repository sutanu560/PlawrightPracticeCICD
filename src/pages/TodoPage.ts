import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { APP, TODOMVC } from '../utils/constants';

export class TodoPage extends BasePage {
  private readonly newTodoInput: Locator;
  private readonly todoList: Locator;
  private readonly todoCount: Locator;
  private readonly filterAll: Locator;
  private readonly filterActive: Locator;
  private readonly filterCompleted: Locator;
  private readonly toggleAll: Locator;
  private readonly clearCompleted: Locator;

  constructor(page: Page) {
    super(page, APP.TODOMVC_PATH);
    this.newTodoInput = page.getByPlaceholder('What needs to be done?');
    // Demo app uses semantic list/listitem, not data-testid
    this.todoList = page.getByRole('list').first();
    this.todoCount = page.getByText(/\d+ item(s)? left/);
    this.filterAll = page.getByRole('link', { name: 'All' });
    this.filterActive = page.getByRole('link', { name: 'Active' });
    this.filterCompleted = page.getByRole('link', { name: 'Completed' });
    this.toggleAll = page.getByLabel(/mark all as complete/i);
    this.clearCompleted = page.getByRole('button', { name: 'Clear completed' });
  }

  async goto(): Promise<void> {
    await this.page.goto(APP.TODOMVC_PATH);
  }

  async addTodo(title: string): Promise<void> {
    await this.newTodoInput.fill(title);
    await this.newTodoInput.press('Enter');
  }

  async addTodos(...titles: string[]): Promise<void> {
    for (const title of titles) {
      await this.addTodo(title);
    }
  }

  getTodoItem(title: string): Locator {
    return this.todoList.getByRole('listitem').filter({ hasText: title });
  }

  async toggleTodo(title: string): Promise<void> {
    await this.getTodoItem(title).getByRole('checkbox').click();
  }

  async removeTodo(title: string): Promise<void> {
    const item = this.getTodoItem(title);
    await item.hover();
    await item.getByRole('button').click();
  }

  async filterBy(filter: 'all' | 'active' | 'completed'): Promise<void> {
    switch (filter) {
      case TODOMVC.FILTERS.ALL:
        await this.filterAll.click();
        break;
      case TODOMVC.FILTERS.ACTIVE:
        await this.filterActive.click();
        break;
      case TODOMVC.FILTERS.COMPLETED:
        await this.filterCompleted.click();
        break;
    }
  }

  async toggleAllTodos(): Promise<void> {
    await this.toggleAll.click();
  }

  async clearCompletedTodos(): Promise<void> {
    await this.clearCompleted.click();
  }

  async getTodoCountText(): Promise<string> {
    return (await this.todoCount.first().textContent()) ?? '';
  }

  getTodoItems(): Locator {
    return this.todoList.getByRole('listitem');
  }

  async getVisibleTodoTitles(): Promise<string[]> {
    return this.getTodoItems().allTextContents();
  }
}
