/**
 * Home Page
 * Landing page with major navigation and top courses
 */

import { getMajors, getCourses } from '../api.js';
import { dataStore, setMajors } from '../state.js';
import { renderCourseGrid } from '../components/courseCard.js';
import { renderLoading } from '../components/loading.js';
import { escapeHtml, showToast } from '../components/header.js';
import { router } from '../router.js';

/**
 * Render the home page
 * @param {HTMLElement} container
 */
async function renderHomePage(container) {
  // Show loading
  container.innerHTML = renderLoading();

  try {
    // Fetch data
    let majors = dataStore.get('majors');
    if (!majors || majors.length === 0) {
      majors = await getMajors();
      setMajors(majors);
    }

    // Get top rated courses
    const topCourses = await getCourses({ sort: 'top_rated', limit: 6 });

    // Render page
    container.innerHTML = `
      <div class="home-page">
        <!-- Hero Section -->
        <div class="page-header text-center">
          <h1 class="page-header__title">KNOU 강의평가</h1>
          <p class="page-header__subtitle">
            한국방송통신대학교 강의 후기를 확인하고 공유하세요
          </p>
        </div>

        <!-- Quick Search -->
        <div class="filter-bar mb-6">
          <div class="search-box">
            <span class="search-box__icon">🔍</span>
            <input
              type="text"
              class="search-box__input"
              id="home-search"
              placeholder="강의명으로 검색..."
            >
          </div>
        </div>

        <!-- Major Navigation -->
        <section class="mb-6">
          <h2 class="page-header__title" style="font-size: var(--font-size-xl); margin-bottom: var(--spacing-4);">
            학과별 강의 찾기
          </h2>
          <div class="major-list">
            ${majors.map(major => `
              <a href="#/courses?major_id=${major.id}" class="major-item">
                ${escapeHtml(major.name)}
              </a>
            `).join('')}
          </div>
        </section>

        <!-- Top Rated Courses -->
        <section>
          <div class="flex justify-between items-center mb-4">
            <h2 class="page-header__title" style="font-size: var(--font-size-xl);">
              평점 높은 강의
            </h2>
            <a href="#/courses" class="btn btn--ghost">전체 보기 →</a>
          </div>
          ${renderCourseGrid(topCourses)}
        </section>
      </div>
    `;

    // Bind search handler
    const searchInput = document.getElementById('home-search');
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const query = searchInput.value.trim();
          if (query) {
            router.navigate(`/courses?q=${encodeURIComponent(query)}`);
          }
        }
      });
    }

  } catch (error) {
    console.error('Error loading home page:', error);
    showToast('데이터를 불러오는데 실패했습니다.', 'error');
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">⚠️</div>
        <div class="empty-state__title">데이터를 불러올 수 없습니다</div>
        <div class="empty-state__description">잠시 후 다시 시도해 주세요.</div>
      </div>
    `;
  }
}

export { renderHomePage };
