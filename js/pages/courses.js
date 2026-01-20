/**
 * Courses Page
 * Course listing with filters and search
 */

import { getMajors, getCourses, getTags } from '../api.js';
import { dataStore, filterStore, setMajors, setTags, setCourses, setFilters } from '../state.js';
import { renderCourseList } from '../components/courseCard.js';
import { renderFilterBar, bindFilterBarEvents } from '../components/filterBar.js';
import { renderLoading } from '../components/loading.js';
import { showToast, escapeHtml } from '../components/header.js';

// Pagination state
let currentOffset = 0;
const LIMIT = 20;

/**
 * Render the courses page
 * @param {HTMLElement} container
 * @param {Object} query - URL query parameters
 */
async function renderCoursesPage(container, query = {}) {
  // Show loading
  container.innerHTML = renderLoading();

  try {
    // Initialize filters from query params
    if (query.major_id) {
      setFilters({ majorId: parseInt(query.major_id) });
    }
    if (query.q) {
      setFilters({ search: query.q });
    }
    if (query.sort) {
      setFilters({ sort: query.sort });
    }

    // Fetch initial data
    await loadInitialData();

    // Reset pagination
    currentOffset = 0;

    // Render page structure
    renderPageStructure(container);

    // Bind event handlers
    bindFilterBarEvents(handleFilterChange);
    bindPaginationEvents();

    // Load courses
    await loadCourses();

  } catch (error) {
    console.error('Error loading courses page:', error);
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

/**
 * Load initial data (majors, tags)
 */
async function loadInitialData() {
  const promises = [];

  // Load majors if not cached
  let majors = dataStore.get('majors');
  if (!majors || majors.length === 0) {
    promises.push(
      getMajors().then(data => {
        setMajors(data);
      })
    );
  }

  // Load tags if not cached
  let tags = dataStore.get('tags');
  if (!tags || tags.length === 0) {
    promises.push(
      getTags().then(data => {
        setTags(data);
      })
    );
  }

  await Promise.all(promises);
}

/**
 * Render page structure
 * @param {HTMLElement} container
 */
function renderPageStructure(container) {
  const filters = filterStore.getState();
  const majors = dataStore.get('majors') || [];

  // Get current major name if filtered
  let pageTitle = '전체 강의';
  let pageSubtitle = '한국방송통신대학교의 모든 강의를 검색하고 평점을 확인하세요';
  if (filters.majorId) {
    const major = majors.find(m => m.id === filters.majorId);
    if (major) {
      pageTitle = major.name;
      pageSubtitle = `${major.name} 학과의 강의 목록입니다`;
    }
  }

  container.innerHTML = `
    <div class="courses-page">
      <!-- Page Header with gradient background -->
      <div class="courses-page__header">
        ${filters.majorId ? `
          <nav class="page-header__breadcrumb">
            <a href="#/">홈</a>
            <span>›</span>
            <a href="#/courses">전체 강의</a>
            <span>›</span>
            <span>${escapeHtml(pageTitle)}</span>
          </nav>
        ` : `
          <nav class="page-header__breadcrumb">
            <a href="#/">홈</a>
            <span>›</span>
            <span>전체 강의</span>
          </nav>
        `}
        <h1 class="courses-page__title">${escapeHtml(pageTitle)}</h1>
        <p class="courses-page__subtitle">${pageSubtitle}</p>
      </div>

      <!-- Filter Section -->
      <div class="courses-page__filters">
        ${renderFilterBar(handleFilterChange)}
      </div>

      <!-- Course List -->
      <div class="courses-page__content">
        <div id="courses-container">
          ${renderLoading()}
        </div>

        <div id="pagination-container"></div>
      </div>
    </div>
  `;
}

/**
 * Load courses with current filters
 */
async function loadCourses() {
  const coursesContainer = document.getElementById('courses-container');
  if (!coursesContainer) return;

  coursesContainer.innerHTML = renderLoading();

  try {
    const filters = filterStore.getState();

    const params = {
      limit: LIMIT,
      offset: currentOffset,
      sort: filters.sort || 'top_rated',
    };

    if (filters.majorId) {
      params.major_id = filters.majorId;
    }

    if (filters.search) {
      params.q = filters.search;
    }

    const courses = await getCourses(params);
    setCourses(courses);

    coursesContainer.innerHTML = renderCourseList(courses);

    // Update pagination
    renderPagination(courses.length);

  } catch (error) {
    console.error('Error loading courses:', error);
    if (error.status === 401) {
      coursesContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">🔒</div>
          <div class="empty-state__title">로그인이 필요합니다</div>
          <div class="empty-state__description">강의 데이터를 보려면 로그인해주세요.</div>
          <a href="#/login" class="btn btn--primary mt-4">로그인하기</a>
        </div>
      `;
    } else {
      coursesContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">⚠️</div>
          <div class="empty-state__title">강의를 불러올 수 없습니다</div>
          <div class="empty-state__description">잠시 후 다시 시도해 주세요.</div>
        </div>
      `;
    }
  }
}

/**
 * Handle filter change
 * @param {Object} filters
 */
async function handleFilterChange(filters) {
  currentOffset = 0;
  await loadCourses();
}

/**
 * Render pagination controls
 * @param {number} resultCount
 */
function renderPagination(resultCount) {
  const paginationContainer = document.getElementById('pagination-container');
  if (!paginationContainer) return;

  const currentPage = Math.floor(currentOffset / LIMIT) + 1;
  const hasMore = resultCount === LIMIT;
  const hasPrev = currentOffset > 0;

  if (!hasMore && !hasPrev) {
    paginationContainer.innerHTML = '';
    return;
  }

  paginationContainer.innerHTML = `
    <div class="pagination">
      <button
        class="pagination__btn"
        id="pagination-prev"
        ${!hasPrev ? 'disabled' : ''}
      >
        ← 이전
      </button>
      <span class="pagination__btn pagination__btn--active">${currentPage}</span>
      <button
        class="pagination__btn"
        id="pagination-next"
        ${!hasMore ? 'disabled' : ''}
      >
        다음 →
      </button>
    </div>
  `;

  bindPaginationEvents();
}

/**
 * Bind pagination event handlers
 */
function bindPaginationEvents() {
  const prevBtn = document.getElementById('pagination-prev');
  const nextBtn = document.getElementById('pagination-next');

  if (prevBtn) {
    prevBtn.addEventListener('click', async () => {
      if (currentOffset >= LIMIT) {
        currentOffset -= LIMIT;
        await loadCourses();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', async () => {
      currentOffset += LIMIT;
      await loadCourses();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

export { renderCoursesPage };
