/**
 * Home Page
 * Landing page with major navigation, top courses, and trending searches
 */

import { getMajors, getCourses, getTrendingSearches } from '../api.js';
import { dataStore, setMajors, authStore } from '../state.js';
import { renderCourseGrid, renderCourseTable } from '../components/courseCard.js';
import { renderLoading } from '../components/loading.js';
import { escapeHtml, showToast } from '../components/header.js';
import { renderTrendingSearches, renderStatsWidget } from '../components/trendingSearches.js';
import { router } from '../router.js';

/**
 * Render the review prompt box for users who haven't written enough reviews
 * @param {number} reviewCount - Current number of reviews written
 * @returns {string} HTML string
 */
function renderReviewPrompt(reviewCount) {
  const remaining = 3 - reviewCount;
  return `
    <div class="review-prompt">
      <div class="review-prompt__icon">📝</div>
      <div class="review-prompt__content">
        <div class="review-prompt__title">${remaining}개의 리뷰를 더 작성하고 평점을 확인하세요!</div>
        <div class="review-prompt__description">
          다른 학생들의 후기와 평점을 보려면 먼저 ${remaining}개의 리뷰를 작성해 주세요.
        </div>
      </div>
      <a href="#/courses" class="btn btn--primary">강의 둘러보기</a>
    </div>
  `;
}

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

    // Check user's access level
    const { user, isAuthenticated } = authStore.getState();
    const hasFullAccess = user?.has_full_access ?? false;
    const reviewCount = user?.review_count ?? 0;

    // Fetch trending searches (always needed)
    // Only fetch courses if user has full access or is not authenticated
    let topCourses = [];
    let latestCourses = [];
    let trendingData = null;

    if (hasFullAccess || !isAuthenticated) {
      [topCourses, latestCourses, trendingData] = await Promise.all([
        getCourses({ sort: 'top_rated', limit: 10 }),
        getCourses({ sort: 'latest', limit: 6 }),
        getTrendingSearches(10).catch(() => null),
      ]);
    } else {
      trendingData = await getTrendingSearches(10).catch(() => null);
    }

    // Render main content based on access level
    const renderMainContent = () => {
      // Show prompt if authenticated but doesn't have full access
      if (isAuthenticated && !hasFullAccess) {
        return `
          <div class="home-sections">
            ${renderReviewPrompt(reviewCount)}
          </div>
        `;
      }

      // Show course sections for users with full access or non-authenticated users
      return `
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
      `;
    };

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
            ${renderMainContent()}
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
    if (error.status === 401) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">🔒</div>
          <div class="empty-state__title">로그인이 필요합니다</div>
          <div class="empty-state__description">강의 데이터를 보려면 로그인해주세요.</div>
          <a href="#/login" class="btn btn--primary mt-4">로그인하기</a>
        </div>
      `;
    } else {
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
}

export { renderHomePage };
