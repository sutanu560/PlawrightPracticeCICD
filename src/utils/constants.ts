/**
 * Application and test constants
 */
export const APP = {
  BASE_URL: process.env.BASE_URL || 'https://demo.playwright.dev',
  TODOMVC_PATH: '/todomvc',
} as const;

export const TODOMVC = {
  FILTERS: {
    ALL: 'all',
    ACTIVE: 'active',
    COMPLETED: 'completed',
  },
} as const;
