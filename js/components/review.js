/**
 * Review Component
 * Displays individual review and review form
 */

import { escapeHtml } from './header.js';
import { dataStore, authStore } from '../state.js';

/**
 * Format date for display
 * @param {string} dateString
 * @returns {string}
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get rating label
 * @param {number} rating
 * @param {string} type - 'rating', 'difficulty', 'workload'
 * @returns {string}
 */
function getRatingLabel(rating, type) {
  const labels = {
    rating: ['', '매우 나쁨', '나쁨', '보통', '좋음', '매우 좋음'],
    difficulty: ['', '매우 쉬움', '쉬움', '보통', '어려움', '매우 어려움'],
    workload: ['', '매우 적음', '적음', '보통', '많음', '매우 많음'],
  };
  return labels[type]?.[rating] || '';
}

/**
 * Render a single review
 * @param {Object} review
 * @returns {string} HTML string
 */
function renderReview(review) {
  const {
    id,
    rating_overall,
    difficulty,
    workload,
    text,
    created_at,
    tags = [],
  } = review;

  const evalTags = tags.filter(t => t.type === 'EVAL_METHOD');
  const freeformTags = tags.filter(t => t.type === 'FREEFORM');

  return `
    <div class="review" data-review-id="${id}">
      <div class="review__header">
        <div class="review__meta">
          ${formatDate(created_at)}
        </div>
      </div>

      <div class="review__ratings">
        <div class="review__rating-item">
          <span class="review__rating-value">${rating_overall}</span>
          <span class="review__rating-label">평점</span>
        </div>
        <div class="review__rating-item">
          <span class="review__rating-value">${6 - difficulty}</span>
          <span class="review__rating-label">쉬움</span>
        </div>
        <div class="review__rating-item">
          <span class="review__rating-value">${6 - workload}</span>
          <span class="review__rating-label">여유</span>
        </div>
      </div>

      <div class="review__text">
        ${escapeHtml(text)}
      </div>

      ${tags.length > 0 ? `
        <div class="review__tags tags">
          ${evalTags.map(tag => `
            <span class="tag tag--eval">${escapeHtml(tag.name)}</span>
          `).join('')}
          ${freeformTags.map(tag => `
            <span class="tag tag--freeform">${escapeHtml(tag.name)}</span>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Render review list
 * @param {Array} reviews
 * @returns {string} HTML string
 */
function renderReviewList(reviews) {
  if (!reviews || reviews.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-state__icon">📝</div>
        <div class="empty-state__title">아직 후기가 없습니다</div>
        <div class="empty-state__description">첫 번째 후기를 작성해 보세요!</div>
      </div>
    `;
  }

  return reviews.map(review => renderReview(review)).join('');
}

/**
 * Render review form
 * @param {number} courseId
 * @returns {string} HTML string
 */
function renderReviewForm(courseId) {
  const { isAuthenticated } = authStore.getState();
  const tags = dataStore.get('tags') || [];

  const evalMethodTags = tags.filter(t => t.type === 'EVAL_METHOD');
  const freeformTags = tags.filter(t => t.type === 'FREEFORM');

  if (!isAuthenticated) {
    return `
      <div class="review-form">
        <div class="empty-state">
          <div class="empty-state__title">후기를 작성하려면 로그인이 필요합니다</div>
          <div class="empty-state__description">
            <a href="#/login" class="btn btn--primary mt-4">로그인</a>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="review-form" id="review-form" data-course-id="${courseId}">
      <h3 class="review-form__title">후기 작성</h3>

      <div class="review-form__row">
        <div class="form-group">
          <label class="form-label">전체 평점</label>
          <div class="rating-input" id="rating-overall">
            ${[1, 2, 3, 4, 5].map(n => `
              <button type="button" class="rating-input__btn" data-value="${n}">${n}</button>
            `).join('')}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">난이도</label>
          <div class="rating-input" id="rating-difficulty">
            ${[1, 2, 3, 4, 5].map(n => `
              <button type="button" class="rating-input__btn" data-value="${n}">${n}</button>
            `).join('')}
          </div>
          <div class="form-help">1: 매우 쉬움 ~ 5: 매우 어려움</div>
        </div>

        <div class="form-group">
          <label class="form-label">과제량</label>
          <div class="rating-input" id="rating-workload">
            ${[1, 2, 3, 4, 5].map(n => `
              <button type="button" class="rating-input__btn" data-value="${n}">${n}</button>
            `).join('')}
          </div>
          <div class="form-help">1: 매우 적음 ~ 5: 매우 많음</div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">평가 방식 (선택)</label>
        <div class="tag-selector" id="review-eval-tags">
          ${evalMethodTags.map(tag => `
            <span class="tag-selector__item" data-tag-id="${tag.id}">
              ${escapeHtml(tag.name)}
            </span>
          `).join('')}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">강의 특징 (선택)</label>
        <div class="tag-selector" id="review-freeform-tags">
          ${freeformTags.map(tag => `
            <span class="tag-selector__item" data-tag-id="${tag.id}">
              ${escapeHtml(tag.name)}
            </span>
          `).join('')}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">후기 내용</label>
        <textarea
          class="form-textarea"
          id="review-text"
          placeholder="강의에 대한 솔직한 후기를 작성해 주세요. (최소 10자)"
          required
          minlength="10"
          maxlength="2000"
        ></textarea>
        <div class="form-help">10자 이상 2000자 이하로 작성해 주세요.</div>
      </div>

      <div class="form-group">
        <button type="submit" class="btn btn--primary btn--lg" id="review-submit">
          후기 등록
        </button>
      </div>

      <div id="review-error" class="form-error" style="display: none;"></div>
    </div>
  `;
}

/**
 * Get selected rating value from rating input
 * @param {string} inputId
 * @returns {number|null}
 */
function getSelectedRating(inputId) {
  const selected = document.querySelector(`#${inputId} .rating-input__btn--selected`);
  return selected ? parseInt(selected.dataset.value) : null;
}

/**
 * Get selected tag IDs
 * @returns {number[]}
 */
function getSelectedTagIds() {
  const evalTags = document.querySelectorAll('#review-eval-tags .tag-selector__item--selected');
  const freeformTags = document.querySelectorAll('#review-freeform-tags .tag-selector__item--selected');

  const tagIds = [
    ...Array.from(evalTags).map(item => parseInt(item.dataset.tagId)),
    ...Array.from(freeformTags).map(item => parseInt(item.dataset.tagId)),
  ];

  return tagIds;
}

/**
 * Bind review form event handlers
 * @param {Function} onSubmit - Callback when form is submitted
 */
function bindReviewFormEvents(onSubmit) {
  // Rating inputs
  const ratingInputs = document.querySelectorAll('.rating-input');
  ratingInputs.forEach(input => {
    const buttons = input.querySelectorAll('.rating-input__btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Deselect all buttons in this input
        buttons.forEach(b => b.classList.remove('rating-input__btn--selected'));
        // Select clicked button
        btn.classList.add('rating-input__btn--selected');
      });
    });
  });

  // Tag selectors
  const tagItems = document.querySelectorAll('.review-form .tag-selector__item');
  tagItems.forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('tag-selector__item--selected');
    });
  });

  // Form submission
  const submitBtn = document.getElementById('review-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      const form = document.getElementById('review-form');
      const courseId = parseInt(form.dataset.courseId);

      const rating_overall = getSelectedRating('rating-overall');
      const difficulty = getSelectedRating('rating-difficulty');
      const workload = getSelectedRating('rating-workload');
      const text = document.getElementById('review-text').value.trim();
      const tag_ids = getSelectedTagIds();

      // Validation
      const errorEl = document.getElementById('review-error');
      errorEl.style.display = 'none';

      if (!rating_overall) {
        showFormError('전체 평점을 선택해 주세요.');
        return;
      }
      if (!difficulty) {
        showFormError('난이도를 선택해 주세요.');
        return;
      }
      if (!workload) {
        showFormError('과제량을 선택해 주세요.');
        return;
      }
      if (text.length < 10) {
        showFormError('후기 내용을 10자 이상 작성해 주세요.');
        return;
      }

      const reviewData = {
        rating_overall,
        difficulty,
        workload,
        text,
        tag_ids,
      };

      if (onSubmit) {
        onSubmit(courseId, reviewData);
      }
    });
  }
}

/**
 * Show form error message
 * @param {string} message
 */
function showFormError(message) {
  const errorEl = document.getElementById('review-error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }
}

/**
 * Clear form error message
 */
function clearFormError() {
  const errorEl = document.getElementById('review-error');
  if (errorEl) {
    errorEl.style.display = 'none';
  }
}

/**
 * Reset review form
 */
function resetReviewForm() {
  // Reset rating inputs
  const ratingButtons = document.querySelectorAll('.rating-input__btn--selected');
  ratingButtons.forEach(btn => btn.classList.remove('rating-input__btn--selected'));

  // Reset tag selectors
  const tagItems = document.querySelectorAll('.review-form .tag-selector__item--selected');
  tagItems.forEach(item => item.classList.remove('tag-selector__item--selected'));

  // Reset textarea
  const textArea = document.getElementById('review-text');
  if (textArea) textArea.value = '';

  // Clear error
  clearFormError();
}

export {
  renderReview,
  renderReviewList,
  renderReviewForm,
  bindReviewFormEvents,
  showFormError,
  clearFormError,
  resetReviewForm,
};
