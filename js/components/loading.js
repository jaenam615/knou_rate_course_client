/**
 * Loading Component
 * Displays loading spinner and empty states
 */

/**
 * Render loading spinner
 * @returns {string} HTML string
 */
function renderLoading() {
  return `
    <div class="loading">
      <div class="loading__spinner"></div>
    </div>
  `;
}

/**
 * Render empty state
 * @param {Object} options
 * @param {string} options.icon
 * @param {string} options.title
 * @param {string} options.description
 * @returns {string} HTML string
 */
function renderEmptyState({ icon = '📭', title = '데이터가 없습니다', description = '' }) {
  return `
    <div class="empty-state">
      <div class="empty-state__icon">${icon}</div>
      <div class="empty-state__title">${title}</div>
      ${description ? `<div class="empty-state__description">${description}</div>` : ''}
    </div>
  `;
}

/**
 * Render error state
 * @param {string} message
 * @returns {string} HTML string
 */
function renderError(message) {
  return `
    <div class="empty-state">
      <div class="empty-state__icon">⚠️</div>
      <div class="empty-state__title">오류가 발생했습니다</div>
      <div class="empty-state__description">${message}</div>
    </div>
  `;
}

export { renderLoading, renderEmptyState, renderError };
