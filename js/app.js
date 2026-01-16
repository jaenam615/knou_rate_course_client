/**
 * Main Application Entry Point
 * Initializes the app, sets up routing, and handles authentication state
 */

import { router } from './router.js';
import { authStore, setUser, clearAuth } from './state.js';
import { getCurrentUser, getAuthToken } from './api.js';
import { renderHeader } from './components/header.js';

// Pages
import { renderHomePage } from './pages/home.js';
import { renderCoursesPage } from './pages/courses.js';
import { renderCourseDetailPage } from './pages/courseDetail.js';
import {
  renderLoginPage,
  renderSignupPage,
  renderVerifyEmailSentPage,
  renderVerifyEmailPage,
} from './pages/auth.js';

/**
 * Initialize the application
 */
async function initApp() {
  // Get DOM containers
  const headerContainer = document.getElementById('header');
  const mainContainer = document.getElementById('main-content');

  // Check authentication state
  await checkAuthState();

  // Render header
  renderHeader(headerContainer);

  // Set up routes
  setupRoutes(mainContainer);

  // Listen for auth changes to re-render header
  authStore.subscribe(() => {
    renderHeader(headerContainer);
  });
}

/**
 * Check if user is authenticated
 */
async function checkAuthState() {
  const token = getAuthToken();

  if (!token) {
    clearAuth();
    return;
  }

  try {
    const user = await getCurrentUser();
    setUser(user);
  } catch (error) {
    console.error('Auth check failed:', error);
    clearAuth();
  }
}

/**
 * Set up application routes
 * @param {HTMLElement} container
 */
function setupRoutes(container) {
  // Home page
  router.on('/', () => {
    renderHomePage(container);
  });

  // Courses list
  router.on('/courses', (params, query) => {
    renderCoursesPage(container, query);
  });

  // Course detail
  router.on('/courses/:id', (params) => {
    renderCourseDetailPage(container, params);
  });

  // Auth pages
  router.on('/login', () => {
    // Redirect if already logged in
    if (authStore.get('isAuthenticated')) {
      router.navigate('/');
      return;
    }
    renderLoginPage(container);
  });

  router.on('/signup', () => {
    // Redirect if already logged in
    if (authStore.get('isAuthenticated')) {
      router.navigate('/');
      return;
    }
    renderSignupPage(container);
  });

  router.on('/verify-email-sent', () => {
    renderVerifyEmailSentPage(container);
  });

  router.on('/verify-email', (params, query) => {
    renderVerifyEmailPage(container, query);
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
