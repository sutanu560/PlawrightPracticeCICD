import { test, expect } from '../src/fixtures/test';

test.describe('TodoMVC', () => {
  test.beforeEach(async ({ todoPage }) => {
    await todoPage.goto();
  });

  test('should add a single todo', async ({ todoPage }) => {
    await todoPage.addTodo('Buy milk');
    await expect(todoPage.getTodoItem('Buy milk')).toBeVisible();
    await expect(await todoPage.getTodoCountText()).toContain('1 item left');
  });

  test('should add multiple todos', async ({ todoPage }) => {
    await todoPage.addTodos('Task one', 'Task two', 'Task three');
    const items = todoPage.getTodoItems();
    await expect(items).toHaveCount(3);
    await expect(await todoPage.getTodoCountText()).toContain('3 items left');
  });

  test('should complete a todo', async ({ todoPage }) => {
    await todoPage.addTodos('Active task', 'Another task');
    await todoPage.toggleTodo('Active task');
    await todoPage.filterBy('active');
    await expect(todoPage.getTodoItems()).toHaveCount(1);
    await expect(todoPage.getTodoItem('Another task')).toBeVisible();
  });

  test('should filter completed todos', async ({ todoPage }) => {
    await todoPage.addTodos('Done task', 'Pending task');
    await todoPage.toggleTodo('Done task');
    await todoPage.filterBy('completed');
    await expect(todoPage.getTodoItems()).toHaveCount(1);
    await expect(todoPage.getTodoItem('Done task')).toBeVisible();
  });

  test('should remove a todo', async ({ todoPage }) => {
    await todoPage.addTodos('To remove', 'To keep');
    await todoPage.removeTodo('To remove');
    await expect(todoPage.getTodoItem('To remove')).not.toBeVisible();
    await expect(todoPage.getTodoItem('To keep')).toBeVisible();
  });

  test('should clear completed todos', async ({ todoPage }) => {
    await todoPage.addTodos('Complete me', 'Stay active');
    await todoPage.toggleTodo('Complete me');
    await todoPage.clearCompletedTodos();
    await expect(todoPage.getTodoItems()).toHaveCount(1);
    await expect(todoPage.getTodoItem('Stay active')).toBeVisible();
  });
});
