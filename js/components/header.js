/**
 * Header Component
 * Navigation header with logo, nav links, and auth status
 */

import { authStore } from '../state.js';
import { logout } from '../api.js';
import { router } from '../router.js';

/**
 * Render the header component
 * @param {HTMLElement} container
 */
function renderHeader(container) {
  const { user, isAuthenticated } = authStore.getState();

  const html = `
    <div class="header">
      <div class="header__inner">
        <a href="#/" class="header__logo">KNOU 강의평가</a>

        <nav class="header__nav">
          <a href="#/" class="header__nav-link">홈</a>
          <a href="#/courses" class="header__nav-link">전체 강의</a>
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

export { renderHeader, showToast, escapeHtml };
