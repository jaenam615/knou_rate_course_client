/**
 * API Client Module
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = '/api/v1';

/**
 * Get the stored auth token
 * @returns {string|null}
 */
function getAuthToken() {
  return localStorage.getItem('auth_token');
}

/**
 * Set the auth token in storage
 * @param {string} token
 */
function setAuthToken(token) {
  localStorage.setItem('auth_token', token);
}

/**
 * Remove the auth token from storage
 */
function clearAuthToken() {
  localStorage.removeItem('auth_token');
}

/**
 * Make an API request
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>}
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle non-JSON responses
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    if (!response.ok) {
      throw new ApiError('Request failed', response.status);
    }
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.detail || 'Request failed', response.status, data);
  }

  return data;
}

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// =============================================================================
// Auth API
// =============================================================================

/**
 * Sign up a new user
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>}
 */
async function signup(email, password) {
  return apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Verify email with token
 * @param {string} token
 * @returns {Promise<Object>}
 */
async function verifyEmail(token) {
  return apiRequest('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

/**
 * Login user
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>}
 */
async function login(email, password) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.access_token) {
    setAuthToken(data.access_token);
  }
  return data;
}

/**
 * Resend verification email
 * @param {string} email
 * @returns {Promise<Object>}
 */
async function resendVerification(email) {
  return apiRequest('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/**
 * Get current user info
 * @returns {Promise<Object>}
 */
async function getCurrentUser() {
  return apiRequest('/auth/me');
}

/**
 * Logout user (client-side only)
 */
function logout() {
  clearAuthToken();
}

// =============================================================================
// Majors API
// =============================================================================

/**
 * Get all majors
 * @returns {Promise<Array>}
 */
async function getMajors() {
  return apiRequest('/majors');
}

// =============================================================================
// Courses API
// =============================================================================

/**
 * Get courses with optional filters
 * @param {Object} params - Query parameters
 * @param {number} [params.major_id] - Filter by major ID
 * @param {string} [params.q] - Search query
 * @param {string} [params.sort] - Sort option: top_rated, most_reviewed, latest
 * @param {number} [params.limit] - Results per page
 * @param {number} [params.offset] - Pagination offset
 * @returns {Promise<Array>}
 */
async function getCourses(params = {}) {
  const queryParams = new URLSearchParams();

  if (params.major_id) queryParams.append('major_id', params.major_id);
  if (params.q) queryParams.append('q', params.q);
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.offset) queryParams.append('offset', params.offset);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/courses?${queryString}` : '/courses';

  return apiRequest(endpoint);
}

/**
 * Get course detail by ID
 * @param {number} courseId
 * @returns {Promise<Object>}
 */
async function getCourseDetail(courseId) {
  return apiRequest(`/courses/${courseId}`);
}

// =============================================================================
// Reviews API
// =============================================================================

/**
 * Create a review for a course
 * @param {number} courseId
 * @param {Object} reviewData
 * @param {number} reviewData.year
 * @param {number} reviewData.semester
 * @param {number} reviewData.rating_overall
 * @param {number} reviewData.difficulty
 * @param {number} reviewData.workload
 * @param {string} reviewData.text
 * @param {number[]} [reviewData.tag_ids]
 * @returns {Promise<Object>}
 */
async function createReview(courseId, reviewData) {
  return apiRequest(`/courses/${courseId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(reviewData),
  });
}

// =============================================================================
// Tags API
// =============================================================================

/**
 * Get all tags
 * @returns {Promise<Array>}
 */
async function getTags() {
  return apiRequest('/tags');
}

// =============================================================================
// Export
// =============================================================================

export {
  // Error class
  ApiError,
  // Token management
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  // Auth
  signup,
  verifyEmail,
  login,
  resendVerification,
  getCurrentUser,
  logout,
  // Majors
  getMajors,
  // Courses
  getCourses,
  getCourseDetail,
  // Reviews
  createReview,
  // Tags
  getTags,
};
