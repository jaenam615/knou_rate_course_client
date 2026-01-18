/**
 * Home Page
 * Landing page with major navigation, top courses, and trending searches
 */

import { getMajors, getCourses, getTrendingSearches } from '../api.js';
import { dataStore, setMajors } from '../state.js';
import { renderCourseGrid, renderCourseTable } from '../components/courseCard.js';
import { renderLoading } from '../components/loading.js';
import { escapeHtml, showToast } from '../components/header.js';
import { renderTrendingSearches, renderStatsWidget } from '../components/trendingSearches.js';
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
      const majorsData = await getMajors();
      // Handle case where API returns object with majors array
      majors = Array.isArray(majorsData) ? majorsData : (majorsData?.majors || majorsData?.data || []);
      setMajors(majors);
    }

    // Fetch top rated, recently reviewed courses, and trending searches in parallel
    const [topCourses, latestCourses, trendingData] = await Promise.all([
      getCourses({ sort: 'top_rated', limit: 10 }),
      getCourses({ sort: 'latest', limit: 6 }),
      getTrendingSearches(10).catch(() => null), // Fallback to null if API fails
    ]);

    // Render page
    container.innerHTML = `
      <div class="home-page">
        <!-- Hero Section -->
        <div class="hero-section">
          <h1 class="hero-section__title">KNOU 꿀과목</h1>
          <p class="hero-section__subtitle">
            한국방송통신대학교 강의 평점을 확인하고 공유하세요
          </p>

          <!-- Quick Search -->
          <div class="hero-section__search">
            <div class="search-box search-box--large">
              <span class="search-box__icon">&#128269;</span>
              <input
                type="text"
                class="search-box__input"
                id="home-search"
                placeholder="강의명, 교수님, 학과로 검색..."
              >
            </div>
          </div>
        </div>

        <!-- Main Layout with Sidebar -->
        <div class="home-layout">
          <!-- Main Content -->
          <div class="home-main">
            <div class="home-sections">
              <!-- Top Rated Courses (Table View) -->
              <section class="home-section">
                <div class="home-section__header">
                  <h2 class="home-section__title">
                    <span class="home-section__icon">&#11088;</span>
                    평점 높은 강의
                  </h2>
                  <a href="#/courses?sort=top_rated" class="btn btn--ghost btn--sm">더보기 &#8594;</a>
                </div>
                ${renderCourseTable(topCourses)}
              </section>

              <!-- Recently Reviewed Courses -->
              <section class="home-section">
                <div class="home-section__header">
                  <h2 class="home-section__title">
                    <span class="home-section__icon">&#128337;</span>
                    최근 후기 강의
                  </h2>
                  <a href="#/courses?sort=latest" class="btn btn--ghost btn--sm">더보기 &#8594;</a>
                </div>
                ${renderCourseGrid(latestCourses)}
              </section>
            </div>
          </div>

          <!-- Sidebar -->
          <aside class="home-sidebar">
            <!-- Trending Searches -->
            ${renderTrendingSearches(trendingData)}

            <!-- Stats Widget -->
            ${renderStatsWidget()}
          </aside>
        </div>

        <!-- Major Navigation -->
        <section class="home-section home-section--majors">
          <div class="home-section__header">
            <h2 class="home-section__title">
              <span class="home-section__icon">&#128218;</span>
              학과별 강의 찾기
            </h2>
            <a href="#/courses" class="btn btn--ghost btn--sm">전체보기 &#8594;</a>
          </div>
          <div class="major-list">
            ${(majors || []).map(major => `
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
        <div class="empty-state__icon">&#9888;&#65039;</div>
        <div class="empty-state__title">데이터를 불러올 수 없습니다</div>
        <div class="empty-state__description">잠시 후 다시 시도해 주세요.</div>
      </div>
    `;
  }
}

export { renderHomePage };
