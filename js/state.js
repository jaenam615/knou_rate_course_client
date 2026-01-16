/**
 * Simple State Management
 * Centralized state with subscription support
 */

/**
 * Create a reactive store
 * @param {Object} initialState
 * @returns {Object}
 */
function createStore(initialState) {
  let state = { ...initialState };
  const listeners = new Set();

  return {
    /**
     * Get current state
     * @returns {Object}
     */
    getState() {
      return { ...state };
    },

    /**
     * Get a specific state value
     * @param {string} key
     * @returns {*}
     */
    get(key) {
      return state[key];
    },

    /**
     * Update state
     * @param {Object} updates
     */
    setState(updates) {
      const prevState = state;
      state = { ...state, ...updates };
      this.notify(prevState);
    },

    /**
     * Subscribe to state changes
     * @param {Function} listener
     * @returns {Function} Unsubscribe function
     */
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    /**
     * Notify all listeners of state change
     * @param {Object} prevState
     */
    notify(prevState) {
      listeners.forEach(listener => listener(state, prevState));
    },

    /**
     * Reset state to initial values
     */
    reset() {
      const prevState = state;
      state = { ...initialState };
      this.notify(prevState);
    },
  };
}

// =============================================================================
// Application State
// =============================================================================

// Auth state
const authStore = createStore({
  user: null,
  isAuthenticated: false,
  isLoading: true,
});

// UI state
const uiStore = createStore({
  isLoading: false,
  error: null,
});

// Data caches
const dataStore = createStore({
  majors: [],
  tags: [],
  courses: [],
  currentCourse: null,
});

// Filter state
const filterStore = createStore({
  majorId: null,
  search: '',
  sort: 'top_rated',
  // Tag filters for reviews
  evalMethodTags: [],
  freeformTags: [],
  // Review year/semester filter
  year: null,
  semester: null,
});

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Set loading state
 * @param {boolean} isLoading
 */
function setLoading(isLoading) {
  uiStore.setState({ isLoading });
}

/**
 * Set error state
 * @param {string|null} error
 */
function setError(error) {
  uiStore.setState({ error });
}

/**
 * Clear error state
 */
function clearError() {
  uiStore.setState({ error: null });
}

/**
 * Update auth state
 * @param {Object|null} user
 */
function setUser(user) {
  authStore.setState({
    user,
    isAuthenticated: !!user,
    isLoading: false,
  });
}

/**
 * Clear auth state (logout)
 */
function clearAuth() {
  authStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });
}

/**
 * Update filters
 * @param {Object} filters
 */
function setFilters(filters) {
  filterStore.setState(filters);
}

/**
 * Reset filters to default
 */
function resetFilters() {
  filterStore.reset();
}

/**
 * Cache majors data
 * @param {Array} majors
 */
function setMajors(majors) {
  dataStore.setState({ majors });
}

/**
 * Cache tags data
 * @param {Array} tags
 */
function setTags(tags) {
  dataStore.setState({ tags });
}

/**
 * Cache courses data
 * @param {Array} courses
 */
function setCourses(courses) {
  dataStore.setState({ courses });
}

/**
 * Set current course detail
 * @param {Object|null} course
 */
function setCurrentCourse(course) {
  dataStore.setState({ currentCourse: course });
}

// =============================================================================
// Export
// =============================================================================

export {
  // Stores
  authStore,
  uiStore,
  dataStore,
  filterStore,
  // Store factory
  createStore,
  // Helper functions
  setLoading,
  setError,
  clearError,
  setUser,
  clearAuth,
  setFilters,
  resetFilters,
  setMajors,
  setTags,
  setCourses,
  setCurrentCourse,
};
