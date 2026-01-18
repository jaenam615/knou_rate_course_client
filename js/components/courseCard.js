/**
 * Course Card Component
 * Displays course summary information in a card format
 */

import { escapeHtml } from './header.js';

/**
 * Render a single course card
 * @param {Object} course
 * @returns {string} HTML string
 */
function renderCourseCard(course) {
  const {
    id,
    course_code,
    name,
    credits,
    major_name,
    avg_rating,
    avg_difficulty,
    avg_workload,
    review_count,
  } = course;

  const ratingDisplay = avg_rating ? avg_rating.toFixed(1) : '-';
  // Invert difficulty/workload: lower value = harder/more work = show lower score
  // This makes high scores = easy/less work (more intuitive)
  const difficultyDisplay = avg_difficulty ? (6 - avg_difficulty).toFixed(1) : '-';
  const workloadDisplay = avg_workload ? (6 - avg_workload).toFixed(1) : '-';

  return `
    <a href="#/courses/${id}" class="course-card card card--clickable">
      <div class="course-card__code">${escapeHtml(course_code)} · ${credits}학점</div>
      <div class="course-card__name">${escapeHtml(name)}</div>
      <div class="course-card__major">${escapeHtml(major_name)}</div>

      <div class="course-card__stats">
        <div class="course-card__stat">
          <span class="course-card__stat-value">${ratingDisplay}</span>
          <span class="course-card__stat-label">평점</span>
        </div>
        <div class="course-card__stat">
          <span class="course-card__stat-value">${difficultyDisplay}</span>
          <span class="course-card__stat-label">쉬움</span>
        </div>
        <div class="course-card__stat">
          <span class="course-card__stat-value">${workloadDisplay}</span>
          <span class="course-card__stat-label">여유</span>
        </div>
      </div>

      <div class="course-card__reviews">
        후기 ${review_count}개
      </div>
    </a>
  `;
}

/**
 * Render a grid of course cards
 * @param {Array} courses
 * @returns {string} HTML string
 */
function renderCourseGrid(courses) {
  // Handle case where API returns object with courses array
  const courseList = Array.isArray(courses) ? courses : (courses?.courses || courses?.data || []);

  if (!courseList || courseList.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-state__icon">&#128218;</div>
        <div class="empty-state__title">강의를 찾을 수 없습니다</div>
        <div class="empty-state__description">검색어나 필터를 변경해 보세요.</div>
      </div>
    `;
  }

  return `
    <div class="course-grid">
      ${courseList.map(course => renderCourseCard(course)).join('')}
    </div>
  `;
}

/**
 * Render star rating
 * @param {number} rating - Rating value (1-5)
 * @param {boolean} showValue - Whether to show numeric value
 * @returns {string} HTML string
 */
function renderStars(rating, showValue = true) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  let stars = '';

  for (let i = 0; i < fullStars; i++) {
    stars += '<span class="rating__star rating__star--filled">★</span>';
  }

  if (hasHalf) {
    stars += '<span class="rating__star rating__star--filled">★</span>';
  }

  for (let i = 0; i < emptyStars; i++) {
    stars += '<span class="rating__star">★</span>';
  }

  return `
    <div class="rating">
      ${stars}
      ${showValue ? `<span class="rating__value">${rating.toFixed(1)}</span>` : ''}
    </div>
  `;
}

/**
 * Render a table-style course list (for top courses)
 * @param {Array} courses
 * @returns {string} HTML string
 */
function renderCourseTable(courses) {
  // Handle case where API returns object with courses array
  const courseList = Array.isArray(courses) ? courses : (courses?.courses || courses?.data || []);

  if (!courseList || courseList.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-state__icon">&#128218;</div>
        <div class="empty-state__title">강의를 찾을 수 없습니다</div>
      </div>
    `;
  }

  return `
    <div class="course-table">
      <div class="course-table__header">
        <span class="course-table__col course-table__col--name">강의명</span>
        <span class="course-table__col course-table__col--major">학과</span>
        <span class="course-table__col course-table__col--rating">평점</span>
        <span class="course-table__col course-table__col--reviews">후기</span>
      </div>
      ${courseList.map((course, index) => {
        const ratingDisplay = course.avg_rating ? course.avg_rating.toFixed(1) : '-';
        return `
          <a href="#/courses/${course.id}" class="course-table__row">
            <span class="course-table__col course-table__col--name">
              <span class="course-table__rank">${index + 1}</span>
              <span class="course-table__name-text">${escapeHtml(course.name)}</span>
            </span>
            <span class="course-table__col course-table__col--major">${escapeHtml(course.major_name)}</span>
            <span class="course-table__col course-table__col--rating">
              <span class="course-table__rating-star">&#9733;</span>
              ${ratingDisplay}
            </span>
            <span class="course-table__col course-table__col--reviews">${course.review_count}</span>
          </a>
        `;
      }).join('')}
    </div>
  `;
}

export { renderCourseCard, renderCourseGrid, renderStars, renderCourseTable };
