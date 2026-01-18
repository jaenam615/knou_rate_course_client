/**
 * Simple Hash-based Router
 * Handles client-side routing using hash fragments
 */

class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.beforeHooks = [];

    // Listen for hash changes
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  /**
   * Register a route
   * @param {string} path - Route path pattern (e.g., '/courses/:id')
   * @param {Function} handler - Handler function for the route
   */
  on(path, handler) {
    this.routes.set(path, handler);
    return this;
  }

  /**
   * Register a before navigation hook
   * @param {Function} hook - Hook function (can be async)
   */
  beforeEach(hook) {
    this.beforeHooks.push(hook);
    return this;
  }

  /**
   * Navigate to a path
   * @param {string} path
   */
  navigate(path) {
    window.location.hash = path;
  }

  /**
   * Get current path from hash
   * @returns {string}
   */
  getCurrentPath() {
    return window.location.hash.slice(1) || '/';
  }

  /**
   * Parse path and extract parameters
   * @param {string} pattern - Route pattern
   * @param {string} path - Actual path
   * @returns {Object|null}
   */
  matchRoute(pattern, path) {
    // Remove leading slash for comparison
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);

    // Remove query string from last path part
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1];
      const queryIndex = lastPart.indexOf('?');
      if (queryIndex !== -1) {
        pathParts[pathParts.length - 1] = lastPart.slice(0, queryIndex);
      }
    }

    if (patternParts.length !== pathParts.length) {
      return null;
    }

    const params = {};

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];

      if (patternPart.startsWith(':')) {
        // This is a parameter
        const paramName = patternPart.slice(1);
        params[paramName] = pathPart;
      } else if (patternPart !== pathPart) {
        // Literal parts must match exactly
        return null;
      }
    }

    return params;
  }

  /**
   * Parse query string from path
   * @param {string} path
   * @returns {Object}
   */
  parseQuery(path) {
    const queryIndex = path.indexOf('?');
    if (queryIndex === -1) {
      return {};
    }

    const queryString = path.slice(queryIndex + 1);
    const params = new URLSearchParams(queryString);
    const query = {};

    for (const [key, value] of params) {
      query[key] = value;
    }

    return query;
  }

  /**
   * Handle route change
   */
  async handleRoute() {
    const path = this.getCurrentPath();
    const query = this.parseQuery(path);

    // Run before hooks
    for (const hook of this.beforeHooks) {
      const result = await hook(path);
      if (result === false) {
        return; // Navigation cancelled
      }
    }

    // Find matching route
    for (const [pattern, handler] of this.routes) {
      const params = this.matchRoute(pattern, path);
      if (params !== null) {
        this.currentRoute = { pattern, path, params, query };
        handler(params, query);
        return;
      }
    }

    // No route matched - show 404 or redirect to home
    console.warn(`No route matched for path: ${path}`);
    this.navigate('/');
  }

  /**
   * Get current route info
   * @returns {Object|null}
   */
  getCurrentRoute() {
    return this.currentRoute;
  }
}

// Create singleton instance
const router = new Router();

export { router };
