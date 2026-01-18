/**
 * Trending Searches Component (실시간 검색어)
 * Displays trending course searches - placeholder until API is implemented
 */

import { escapeHtml } from './header.js';

/**
 * Get current time formatted as HH:MM
 * @returns {string}
 */
function getCurrentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} 기준`;
}

/**
 * Placeholder trending data - will be replaced with API data
 * @returns {Array}
 */
function getPlaceholderTrending() {
  return [
    { rank: 1, name: '컴퓨터과학개론', change: 'up', changeAmount: 2 },
    { rank: 2, name: '경영학원론', change: 'same', changeAmount: 0 },
    { rank: 3, name: '심리학개론', change: 'up', changeAmount: 5 },
    { rank: 4, name: '행정학개론', change: 'down', changeAmount: 1 },
    { rank: 5, name: '생활법률', change: 'new', changeAmount: 0 },
    { rank: 6, name: '한국사의이해', change: 'up', changeAmount: 3 },
    { rank: 7, name: '글쓰기', change: 'down', changeAmount: 2 },
    { rank: 8, name: '세계의역사', change: 'same', changeAmount: 0 },
    { rank: 9, name: '인간과사회', change: 'up', changeAmount: 1 },
    { rank: 10, name: '통계학개론', change: 'new', changeAmount: 0 },
  ];
}

/**
 * Render change indicator
 * @param {Object} item
 * @returns {string}
 */
function renderChangeIndicator(item) {
  if (item.change === 'up') {
    return `<span class="trending-item__change trending-item__change--up">&#9650; ${item.changeAmount}</span>`;
  } else if (item.change === 'down') {
    return `<span class="trending-item__change trending-item__change--down">&#9660; ${item.changeAmount}</span>`;
  } else if (item.change === 'new') {
    return `<span class="trending-item__change trending-item__change--new">NEW</span>`;
  }
  return `<span class="trending-item__change">-</span>`;
}

/**
 * Render trending searches component
 * @param {Array} trendingData - Optional trending data (uses placeholder if not provided)
 * @returns {string} HTML string
 */
function renderTrendingSearches(trendingData = null) {
  const data = trendingData || getPlaceholderTrending();

  return `
    <div class="trending-box">
      <div class="trending-box__header">
        <div class="trending-box__title">
          <span class="trending-box__title-icon">&#9679;</span>
          실시간 검색어
        </div>
        <span class="trending-box__time">${getCurrentTime()}</span>
      </div>
      <div class="trending-list">
        ${data.map(item => `
          <a href="#/courses?q=${encodeURIComponent(item.name)}" class="trending-item">
            <span class="trending-item__rank ${item.rank <= 3 ? 'trending-item__rank--top' : ''}">${item.rank}</span>
            <span class="trending-item__name">${escapeHtml(item.name)}</span>
            ${renderChangeIndicator(item)}
          </a>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Render quick stats widget
 * @param {Object} stats
 * @returns {string} HTML string
 */
function renderStatsWidget(stats = {}) {
  const {
    totalCourses = '339+',
    totalReviews = '5,000+',
    totalMajors = '24',
  } = stats;

  return `
    <div class="stats-widget">
      <div class="stats-widget__title">KNOU 꿀과목 통계</div>
      <div class="stats-widget__grid">
        <div class="stats-widget__item">
          <div class="stats-widget__value">${totalCourses}</div>
          <div class="stats-widget__label">등록 강의</div>
        </div>
        <div class="stats-widget__item">
          <div class="stats-widget__value">${totalReviews}</div>
          <div class="stats-widget__label">누적 후기</div>
        </div>
        <div class="stats-widget__item">
          <div class="stats-widget__value">${totalMajors}</div>
          <div class="stats-widget__label">학과</div>
        </div>
      </div>
    </div>
  `;
}

export { renderTrendingSearches, renderStatsWidget };
