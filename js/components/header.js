/**
 * Header Component
 * Navigation header with logo, nav links, and auth status
 */

import { authStore, dataStore } from '../state.js';
import { logout, getMajors } from '../api.js';
import { router } from '../router.js';

/**
 * Group majors by department
 * @param {Array} majors
 * @returns {Object} grouped majors by department
 */
function groupMajorsByDepartment(majors) {
  return majors.reduce((acc, major) => {
    const dept = major.department || '기타';
    if (!acc[dept]) {
      acc[dept] = [];
    }
    acc[dept].push(major);
    return acc;
  }, {});
}

/**
 * Render the header component
 * @param {HTMLElement} container
 */
function renderHeader(container) {
  const { user, isAuthenticated } = authStore.getState();
  const majors = dataStore.get('majors') || [];
  const groupedMajors = groupMajorsByDepartment(majors);

  const html = `
    <div class="header">
      <div class="header__inner">
        <a href="#/" class="header__logo">KNOU 꿀과목</a>

        <nav class="header__nav">
          <a href="#/" class="header__nav-link">홈</a>
          <div class="header__dropdown">
            <button class="header__nav-link header__dropdown-trigger" id="major-dropdown-btn">
              학과별 강의 <span class="header__dropdown-arrow">▼</span>
            </button>
            <div class="header__dropdown-menu" id="major-dropdown-menu">
              ${Object.entries(groupedMajors).map(([dept, deptMajors]) => `
                <div class="header__dropdown-group">
                  <div class="header__dropdown-group-title">${escapeHtml(dept)}</div>
                  ${deptMajors.map(major => `
                    <a href="#/courses?major_id=${major.id}" class="header__dropdown-item">
                      ${escapeHtml(major.name)}
                    </a>
                  `).join('')}
                </div>
              `).join('')}
              <div class="header__dropdown-footer">
                <a href="#/courses" class="header__dropdown-item header__dropdown-item--all">
                  전체 강의 보기
                </a>
              </div>
            </div>
          </div>
        </nav>

        <div class="header__user">
          ${isAuthenticated ? `
            <span class="header__user-email">${escapeHtml(user.email)}</span>
            <button class="btn btn--ghost" id="logout-btn">로그아웃</button>
          ` : `
            <a href="#/login" class="btn btn--ghost">로그인</a>
            <a href="#/signup" class="btn btn--primary">회원가입</a>
          `}
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Update active nav link
  updateActiveNavLink();

  // Bind logout handler
  if (isAuthenticated) {
    const logoutBtn = container.querySelector('#logout-btn');
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Bind dropdown handler
  bindDropdownEvents();
}

/**
 * Bind dropdown event handlers
 */
function bindDropdownEvents() {
  const dropdownBtn = document.getElementById('major-dropdown-btn');
  const dropdownMenu = document.getElementById('major-dropdown-menu');

  if (dropdownBtn && dropdownMenu) {
    dropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('header__dropdown-menu--open');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!dropdownMenu.contains(e.target) && e.target !== dropdownBtn) {
        dropdownMenu.classList.remove('header__dropdown-menu--open');
      }
    });

    // Close dropdown when clicking a link
    dropdownMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        dropdownMenu.classList.remove('header__dropdown-menu--open');
      });
    });
  }
}

/**
 * Update the active navigation link based on current route
 */
function updateActiveNavLink() {
  const path = router.getCurrentPath();
  const navLinks = document.querySelectorAll('.header__nav-link');

  navLinks.forEach(link => {
    link.classList.remove('header__nav-link--active');
    const linkPath = link.getAttribute('href').slice(1); // Remove #

    if (path === linkPath || (linkPath !== '/' && path.startsWith(linkPath))) {
      link.classList.add('header__nav-link--active');
    }
  });
}

/**
 * Handle logout
 */
function handleLogout() {
  logout();
  authStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });
  router.navigate('/');
  showToast('로그아웃 되었습니다.', 'success');
}

/**
 * Show toast notification
 * @param {string} message
 * @param {string} type - success, error, warning
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Subscribe to auth changes to re-render header
authStore.subscribe(() => {
  const headerContainer = document.getElementById('header');
  if (headerContainer) {
    renderHeader(headerContainer);
  }
});

// Subscribe to data changes to re-render header when majors are loaded
dataStore.subscribe((state, prevState) => {
  if (state.majors !== prevState.majors) {
    const headerContainer = document.getElementById('header');
    if (headerContainer) {
      renderHeader(headerContainer);
    }
  }
});

export { renderHeader, showToast, escapeHtml };
