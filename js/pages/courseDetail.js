/**
 * Course Detail Page
 * Shows course information and reviews
 */

import { getCourseDetail, getTags, createReview } from '../api.js';
import { dataStore, setTags, setCurrentCourse } from '../state.js';
import { renderReviewList, renderReviewForm, renderRatingBar, bindReviewFormEvents, resetReviewForm } from '../components/review.js';
import { renderLoading, renderError } from '../components/loading.js';
import { showToast, escapeHtml } from '../components/header.js';

/**
 * Render the course detail page
 * @param {HTMLElement} container
 * @param {Object} params - Route parameters
 */
async function renderCourseDetailPage(container, params) {
  const courseId = parseInt(params.id);

  if (!courseId || isNaN(courseId)) {
    container.innerHTML = renderError('유효하지 않은 강의 ID입니다.');
    return;
  }

  // Show loading
  container.innerHTML = renderLoading();

  try {
    // Load tags if not cached
    let tags = dataStore.get('tags');
    if (!tags || tags.length === 0) {
      tags = await getTags();
      setTags(tags);
    }

    // Fetch course detail
    const course = await getCourseDetail(courseId);
    setCurrentCourse(course);

    // Render page
    renderPage(container, course);

    // Bind review form events
    bindReviewFormEvents(handleReviewSubmit);

  } catch (error) {
    console.error('Error loading course detail:', error);

    if (error.status === 404) {
      container.innerHTML = renderError('강의를 찾을 수 없습니다.');
    } else {
      showToast('데이터를 불러오는데 실패했습니다.', 'error');
      container.innerHTML = renderError('데이터를 불러올 수 없습니다.');
    }
  }
}

/**
 * Render the page content
 * @param {HTMLElement} container
 * @param {Object} course
 */
function renderPage(container, course) {
  const {
    id,
    course_code,
    name,
    major,
    avg_rating,
    avg_difficulty,
    avg_workload,
    review_count,
    reviews = [],
  } = course;

  const ratingDisplay = avg_rating ? avg_rating.toFixed(1) : '-';

  container.innerHTML = `
    <div class="course-detail-page">
      <!-- Breadcrumb -->
      <nav class="page-header__breadcrumb mb-4">
        <a href="#/">홈</a>
        <span>›</span>
        <a href="#/courses">전체 강의</a>
        ${major ? `
          <span>›</span>
          <a href="#/courses?major_id=${major.id}">${escapeHtml(major.name)}</a>
        ` : ''}
        <span>›</span>
        <span>${escapeHtml(name)}</span>
      </nav>

      <div class="course-detail">
        <!-- Main Content -->
        <div class="course-detail__main">
          <!-- Course Info Card -->
          <div class="course-info mb-6">
            <div class="course-info__header">
              <div>
                <div class="course-info__code">${escapeHtml(course_code)}</div>
                <h1 class="course-info__title">${escapeHtml(name)}</h1>
                ${major ? `<div class="course-card__major">${escapeHtml(major.name)}</div>` : ''}
              </div>
              <div class="course-info__rating-big">
                <div class="course-info__rating-big-value">${ratingDisplay}</div>
                <div class="course-info__rating-big-label">평점</div>
                <div class="course-info__rating-big-count">${review_count}개의 후기</div>
              </div>
            </div>

            <div class="course-info__bars">
              ${avg_difficulty ? renderRatingBar(avg_difficulty, 'difficulty') : ''}
              ${avg_workload ? renderRatingBar(avg_workload, 'workload') : ''}
            </div>
          </div>

          <!-- Reviews Section -->
          <section>
            <h2 class="page-header__title mb-4" style="font-size: var(--font-size-xl);">
              수강 후기 (${review_count}개)
            </h2>
            <div id="reviews-container">
              ${renderReviewList(reviews)}
            </div>
          </section>
        </div>

        <!-- Sidebar -->
        <div class="course-detail__sidebar">
          ${renderReviewForm(id)}
        </div>
      </div>
    </div>
  `;
}

/**
 * Handle review form submission
 * @param {number} courseId
 * @param {Object} reviewData
 */
async function handleReviewSubmit(courseId, reviewData) {
  const submitBtn = document.getElementById('review-submit');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = '등록 중...';
  }

  try {
    await createReview(courseId, reviewData);

    showToast('후기가 등록되었습니다.', 'success');

    // Reset form
    resetReviewForm();

    // Reload course detail to show new review
    const container = document.getElementById('main-content');
    await renderCourseDetailPage(container, { id: courseId });

  } catch (error) {
    console.error('Error creating review:', error);

    let errorMessage = '후기 등록에 실패했습니다.';

    if (error.status === 401) {
      errorMessage = '로그인이 필요합니다.';
    } else if (error.status === 403) {
      errorMessage = '이메일 인증이 필요합니다.';
    } else if (error.status === 409) {
      errorMessage = '이미 해당 학기에 후기를 작성하셨습니다.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    showToast(errorMessage, 'error');

    // Show error in form
    const errorEl = document.getElementById('review-error');
    if (errorEl) {
      errorEl.textContent = errorMessage;
      errorEl.style.display = 'block';
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = '후기 등록';
    }
  }
}

export { renderCourseDetailPage };
