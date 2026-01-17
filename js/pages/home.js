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

    // Fetch top rated and recently reviewed courses in parallel
    const [topCourses, latestCourses] = await Promise.all([
      getCourses({ sort: 'top_rated', limit: 6 }),
      getCourses({ sort: 'latest', limit: 6 }),
    ]);

    // Render page
    container.innerHTML = `
      <div class="home-page">
        <!-- Hero Section -->
        <div class="hero-section">
          <h1 class="hero-section__title">KNOU 꿀과목</h1>
          <p class="hero-section__subtitle">
            한국방송통신대학교 강의 후기를 확인하고 공유하세요
          </p>

          <!-- Quick Search -->
          <div class="hero-section__search">
            <div class="search-box search-box--large">
              <span class="search-box__icon">🔍</span>
              <input
                type="text"
                class="search-box__input"
                id="home-search"
                placeholder="강의명으로 검색..."
              >
            </div>
          </div>
        </div>

        <!-- Course Sections Grid -->
        <div class="home-sections">
          <!-- Top Rated Courses -->
          <section class="home-section">
            <div class="home-section__header">
              <h2 class="home-section__title">
                <span class="home-section__icon">⭐</span>
                평점 높은 강의
              </h2>
              <a href="#/courses?sort=top_rated" class="btn btn--ghost btn--sm">더보기 →</a>
            </div>
            ${renderCourseGrid(topCourses)}
          </section>

          <!-- Recently Reviewed Courses -->
          <section class="home-section">
            <div class="home-section__header">
              <h2 class="home-section__title">
                <span class="home-section__icon">🕐</span>
                최근 후기 강의
              </h2>
              <a href="#/courses?sort=latest" class="btn btn--ghost btn--sm">더보기 →</a>
            </div>
            ${renderCourseGrid(latestCourses)}
          </section>
        </div>

        <!-- Major Navigation -->
        <section class="home-section home-section--majors">
          <div class="home-section__header">
            <h2 class="home-section__title">
              <span class="home-section__icon">📚</span>
              학과별 강의 찾기
            </h2>
          </div>
          <div class="major-list">
            ${majors.map(major => `
              <a href="#/courses?major_id=${major.id}" class="major-item">
                ${escapeHtml(major.name)}
              </a>
            `).join('')}
          </div>
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
