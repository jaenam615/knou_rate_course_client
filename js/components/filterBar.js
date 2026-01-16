/**
 * Filter Bar Component
 * Provides search and filter controls for course listing
 */

import { dataStore, filterStore, setFilters } from '../state.js';
import { escapeHtml } from './header.js';

/**
 * Render the filter bar
 * @param {Function} onFilterChange - Callback when filters change
 * @returns {string} HTML string
 */
function renderFilterBar(onFilterChange) {
  const majors = dataStore.get('majors') || [];
  const tags = dataStore.get('tags') || [];
  const filters = filterStore.getState();

  // Separate tags by type
  const evalMethodTags = tags.filter(t => t.type === 'EVAL_METHOD');
  const freeformTags = tags.filter(t => t.type === 'FREEFORM');

  // Generate year options (last 5 years)
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i <= 5; i++) {
    years.push(currentYear - i);
  }

  return `
    <div class="filter-bar">
      <div class="filter-bar__row">
        <!-- Search -->
        <div class="filter-bar__group" style="flex: 2;">
          <label class="filter-bar__label">강의 검색</label>
          <div class="search-box">
            <span class="search-box__icon">🔍</span>
            <input
              type="text"
              class="search-box__input"
              id="filter-search"
              placeholder="강의명으로 검색..."
              value="${escapeHtml(filters.search || '')}"
            >
          </div>
        </div>

        <!-- Major Filter -->
        <div class="filter-bar__group">
          <label class="filter-bar__label">학과</label>
          <select class="form-select" id="filter-major">
            <option value="">전체 학과</option>
            ${majors.map(major => `
              <option value="${major.id}" ${filters.majorId == major.id ? 'selected' : ''}>
                ${escapeHtml(major.name)}
              </option>
            `).join('')}
          </select>
        </div>

        <!-- Sort -->
        <div class="filter-bar__group">
          <label class="filter-bar__label">정렬</label>
          <select class="form-select" id="filter-sort">
            <option value="top_rated" ${filters.sort === 'top_rated' ? 'selected' : ''}>평점 높은순</option>
            <option value="most_reviewed" ${filters.sort === 'most_reviewed' ? 'selected' : ''}>후기 많은순</option>
            <option value="latest" ${filters.sort === 'latest' ? 'selected' : ''}>최신순</option>
          </select>
        </div>
      </div>

      <!-- Tag Filters -->
      <div class="filter-bar__row mt-4">
        <div class="filter-bar__group" style="flex: 1;">
          <label class="filter-bar__label">평가 방식</label>
          <div class="tag-selector" id="eval-tag-selector">
            ${evalMethodTags.map(tag => `
              <span
                class="tag-selector__item ${filters.evalMethodTags?.includes(tag.id) ? 'tag-selector__item--selected' : ''}"
                data-tag-id="${tag.id}"
                data-tag-type="eval"
              >
                ${escapeHtml(tag.name)}
              </span>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="filter-bar__row mt-4">
        <div class="filter-bar__actions">
          <button class="btn btn--primary" id="filter-apply">검색</button>
          <button class="btn btn--secondary" id="filter-reset">초기화</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Bind filter bar event handlers
 * @param {Function} onFilterChange - Callback when filters change
 */
function bindFilterBarEvents(onFilterChange) {
  // Search input - trigger on Enter
  const searchInput = document.getElementById('filter-search');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        applyFilters(onFilterChange);
      }
    });
  }

  // Major select
  const majorSelect = document.getElementById('filter-major');
  if (majorSelect) {
    majorSelect.addEventListener('change', () => {
      applyFilters(onFilterChange);
    });
  }

  // Sort select
  const sortSelect = document.getElementById('filter-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      applyFilters(onFilterChange);
    });
  }

  // Tag selectors
  const tagItems = document.querySelectorAll('.tag-selector__item');
  tagItems.forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('tag-selector__item--selected');
    });
  });

  // Apply button
  const applyBtn = document.getElementById('filter-apply');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      applyFilters(onFilterChange);
    });
  }

  // Reset button
  const resetBtn = document.getElementById('filter-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetFilters(onFilterChange);
    });
  }
}

/**
 * Apply current filter values
 * @param {Function} onFilterChange
 */
function applyFilters(onFilterChange) {
  const searchInput = document.getElementById('filter-search');
  const majorSelect = document.getElementById('filter-major');
  const sortSelect = document.getElementById('filter-sort');

  // Get selected eval method tags
  const evalTagItems = document.querySelectorAll('#eval-tag-selector .tag-selector__item--selected');
  const evalMethodTags = Array.from(evalTagItems).map(item => parseInt(item.dataset.tagId));

  const filters = {
    search: searchInput?.value || '',
    majorId: majorSelect?.value ? parseInt(majorSelect.value) : null,
    sort: sortSelect?.value || 'top_rated',
    evalMethodTags,
  };

  setFilters(filters);

  if (onFilterChange) {
    onFilterChange(filters);
  }
}

/**
 * Reset filters to default
 * @param {Function} onFilterChange
 */
function resetFilters(onFilterChange) {
  // Reset input values
  const searchInput = document.getElementById('filter-search');
  const majorSelect = document.getElementById('filter-major');
  const sortSelect = document.getElementById('filter-sort');

  if (searchInput) searchInput.value = '';
  if (majorSelect) majorSelect.value = '';
  if (sortSelect) sortSelect.value = 'top_rated';

  // Deselect all tags
  const tagItems = document.querySelectorAll('.tag-selector__item--selected');
  tagItems.forEach(item => item.classList.remove('tag-selector__item--selected'));

  const filters = {
    search: '',
    majorId: null,
    sort: 'top_rated',
    evalMethodTags: [],
    freeformTags: [],
  };

  setFilters(filters);

  if (onFilterChange) {
    onFilterChange(filters);
  }
}

export { renderFilterBar, bindFilterBarEvents };
