/**
 * Auth Pages
 * Login, Signup, and Email Verification pages
 */

import { login, signup, verifyEmail, resendVerification, getCurrentUser } from '../api.js';
import { authStore, setUser } from '../state.js';
import { showToast } from '../components/header.js';
import { router } from '../router.js';

/**
 * Render the login page
 * @param {HTMLElement} container
 */
function renderLoginPage(container) {
  container.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <h1 class="auth-card__title">로그인</h1>

        <form id="login-form">
          <div class="form-group">
            <label class="form-label" for="login-email">이메일</label>
            <input
              type="email"
              id="login-email"
              class="form-input"
              placeholder="student@knou.ac.kr"
              required
            >
          </div>

          <div class="form-group">
            <label class="form-label" for="login-password">비밀번호</label>
            <input
              type="password"
              id="login-password"
              class="form-input"
              placeholder="비밀번호를 입력하세요"
              required
            >
          </div>

          <div id="login-error" class="form-error" style="display: none;"></div>

          <div class="form-group">
            <button type="submit" class="btn btn--primary btn--lg" style="width: 100%;">
              로그인
            </button>
          </div>
        </form>

        <div class="auth-card__footer">
          계정이 없으신가요? <a href="#/signup">회원가입</a>
        </div>
      </div>
    </div>
  `;

  // Bind form submission
  const form = document.getElementById('login-form');
  form.addEventListener('submit', handleLogin);
}

/**
 * Handle login form submission
 * @param {Event} e
 */
async function handleLogin(e) {
  e.preventDefault();

  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const errorEl = document.getElementById('login-error');
  const submitBtn = e.target.querySelector('button[type="submit"]');

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // Clear previous error
  errorEl.style.display = 'none';

  // Disable button
  submitBtn.disabled = true;
  submitBtn.textContent = '로그인 중...';

  try {
    await login(email, password);

    // Get user info
    const user = await getCurrentUser();
    setUser(user);

    showToast('로그인 되었습니다.', 'success');
    router.navigate('/');

  } catch (error) {
    console.error('Login error:', error);

    let errorMessage = '로그인에 실패했습니다.';

    if (error.status === 401) {
      errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
    } else if (error.status === 403) {
      errorMessage = '이메일 인증이 필요합니다. 인증 메일을 확인해 주세요.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    errorEl.textContent = errorMessage;
    errorEl.style.display = 'block';

  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '로그인';
  }
}

/**
 * Render the signup page
 * @param {HTMLElement} container
 */
function renderSignupPage(container) {
  container.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <h1 class="auth-card__title">회원가입</h1>

        <form id="signup-form">
          <div class="form-group">
            <label class="form-label" for="signup-email">이메일</label>
            <input
              type="email"
              id="signup-email"
              class="form-input"
              placeholder="student@knou.ac.kr"
              required
            >
            <div class="form-help">@knou.ac.kr 이메일만 가입 가능합니다.</div>
          </div>

          <div class="form-group">
            <label class="form-label" for="signup-password">비밀번호</label>
            <input
              type="password"
              id="signup-password"
              class="form-input"
              placeholder="8자 이상 입력하세요"
              minlength="8"
              required
            >
            <div class="form-help">8자 이상 입력해 주세요.</div>
          </div>

          <div class="form-group">
            <label class="form-label" for="signup-password-confirm">비밀번호 확인</label>
            <input
              type="password"
              id="signup-password-confirm"
              class="form-input"
              placeholder="비밀번호를 다시 입력하세요"
              required
            >
          </div>

          <div id="signup-error" class="form-error" style="display: none;"></div>

          <div class="form-group">
            <button type="submit" class="btn btn--primary btn--lg" style="width: 100%;">
              회원가입
            </button>
          </div>
        </form>

        <div class="auth-card__footer">
          이미 계정이 있으신가요? <a href="#/login">로그인</a>
        </div>
      </div>
    </div>
  `;

  // Bind form submission
  const form = document.getElementById('signup-form');
  form.addEventListener('submit', handleSignup);
}

/**
 * Handle signup form submission
 * @param {Event} e
 */
async function handleSignup(e) {
  e.preventDefault();

  const emailInput = document.getElementById('signup-email');
  const passwordInput = document.getElementById('signup-password');
  const passwordConfirmInput = document.getElementById('signup-password-confirm');
  const errorEl = document.getElementById('signup-error');
  const submitBtn = e.target.querySelector('button[type="submit"]');

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;

  // Clear previous error
  errorEl.style.display = 'none';

  // Validate email domain
  if (!email.endsWith('@knou.ac.kr')) {
    errorEl.textContent = '@knou.ac.kr 이메일만 가입 가능합니다.';
    errorEl.style.display = 'block';
    return;
  }

  // Validate password match
  if (password !== passwordConfirm) {
    errorEl.textContent = '비밀번호가 일치하지 않습니다.';
    errorEl.style.display = 'block';
    return;
  }

  // Validate password length
  if (password.length < 8) {
    errorEl.textContent = '비밀번호는 8자 이상이어야 합니다.';
    errorEl.style.display = 'block';
    return;
  }

  // Disable button
  submitBtn.disabled = true;
  submitBtn.textContent = '가입 중...';

  try {
    await signup(email, password);

    showToast('회원가입이 완료되었습니다. 이메일을 확인해 주세요.', 'success');
    router.navigate('/verify-email-sent');

  } catch (error) {
    console.error('Signup error:', error);

    let errorMessage = '회원가입에 실패했습니다.';

    if (error.status === 400) {
      errorMessage = '@knou.ac.kr 이메일만 가입 가능합니다.';
    } else if (error.status === 409) {
      errorMessage = '이미 가입된 이메일입니다.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    errorEl.textContent = errorMessage;
    errorEl.style.display = 'block';

  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '회원가입';
  }
}

/**
 * Render the verification email sent page
 * @param {HTMLElement} container
 */
function renderVerifyEmailSentPage(container) {
  container.innerHTML = `
    <div class="auth-container">
      <div class="auth-card text-center">
        <div style="font-size: 3rem; margin-bottom: var(--spacing-4);">📧</div>
        <h1 class="auth-card__title">인증 메일을 확인해 주세요</h1>

        <p style="color: var(--color-gray-600); margin-bottom: var(--spacing-6);">
          입력하신 이메일로 인증 메일을 발송했습니다.<br>
          메일함을 확인하고 인증 링크를 클릭해 주세요.
        </p>

        <div id="resend-section">
          <p style="color: var(--color-gray-500); font-size: var(--font-size-sm); margin-bottom: var(--spacing-4);">
            메일을 받지 못하셨나요?
          </p>

          <div class="form-group">
            <input
              type="email"
              id="resend-email"
              class="form-input"
              placeholder="이메일 주소"
              style="text-align: center;"
            >
          </div>

          <button class="btn btn--secondary" id="resend-btn">
            인증 메일 다시 보내기
          </button>

          <div id="resend-message" style="margin-top: var(--spacing-4); display: none;"></div>
        </div>

        <div class="auth-card__footer">
          <a href="#/login">로그인 페이지로 이동</a>
        </div>
      </div>
    </div>
  `;

  // Bind resend button
  const resendBtn = document.getElementById('resend-btn');
  resendBtn.addEventListener('click', handleResendVerification);
}

/**
 * Handle resend verification email
 */
async function handleResendVerification() {
  const emailInput = document.getElementById('resend-email');
  const messageEl = document.getElementById('resend-message');
  const resendBtn = document.getElementById('resend-btn');

  const email = emailInput.value.trim();

  if (!email) {
    messageEl.textContent = '이메일 주소를 입력해 주세요.';
    messageEl.style.color = 'var(--color-error)';
    messageEl.style.display = 'block';
    return;
  }

  resendBtn.disabled = true;
  resendBtn.textContent = '전송 중...';

  try {
    await resendVerification(email);

    messageEl.textContent = '인증 메일을 다시 발송했습니다.';
    messageEl.style.color = 'var(--color-success)';
    messageEl.style.display = 'block';

  } catch (error) {
    console.error('Resend verification error:', error);

    messageEl.textContent = error.message || '메일 발송에 실패했습니다.';
    messageEl.style.color = 'var(--color-error)';
    messageEl.style.display = 'block';

  } finally {
    resendBtn.disabled = false;
    resendBtn.textContent = '인증 메일 다시 보내기';
  }
}

/**
 * Render the email verification page
 * @param {HTMLElement} container
 * @param {Object} query - URL query parameters
 */
async function renderVerifyEmailPage(container, query) {
  const token = query.token;

  if (!token) {
    container.innerHTML = `
      <div class="auth-container">
        <div class="auth-card text-center">
          <div style="font-size: 3rem; margin-bottom: var(--spacing-4);">⚠️</div>
          <h1 class="auth-card__title">유효하지 않은 링크</h1>
          <p style="color: var(--color-gray-600);">
            인증 토큰이 없습니다. 이메일의 인증 링크를 다시 확인해 주세요.
          </p>
          <div class="auth-card__footer">
            <a href="#/login">로그인 페이지로 이동</a>
          </div>
        </div>
      </div>
    `;
    return;
  }

  // Show loading
  container.innerHTML = `
    <div class="auth-container">
      <div class="auth-card text-center">
        <div class="loading">
          <div class="loading__spinner"></div>
        </div>
        <p style="margin-top: var(--spacing-4); color: var(--color-gray-600);">
          이메일 인증 중...
        </p>
      </div>
    </div>
  `;

  try {
    await verifyEmail(token);

    container.innerHTML = `
      <div class="auth-container">
        <div class="auth-card text-center">
          <div style="font-size: 3rem; margin-bottom: var(--spacing-4);">✅</div>
          <h1 class="auth-card__title">이메일 인증 완료</h1>
          <p style="color: var(--color-gray-600); margin-bottom: var(--spacing-4);">
            이메일 인증이 완료되었습니다.<br>
            이제 로그인할 수 있습니다.
          </p>
          <a href="#/login" class="btn btn--primary btn--lg">로그인</a>
        </div>
      </div>
    `;

  } catch (error) {
    console.error('Email verification error:', error);

    let errorMessage = '인증에 실패했습니다.';
    if (error.message) {
      errorMessage = error.message;
    }

    container.innerHTML = `
      <div class="auth-container">
        <div class="auth-card text-center">
          <div style="font-size: 3rem; margin-bottom: var(--spacing-4);">❌</div>
          <h1 class="auth-card__title">인증 실패</h1>
          <p style="color: var(--color-gray-600);">
            ${errorMessage}<br>
            토큰이 만료되었거나 유효하지 않습니다.
          </p>
          <div class="auth-card__footer">
            <a href="#/verify-email-sent">인증 메일 다시 받기</a>
          </div>
        </div>
      </div>
    `;
  }
}

export {
  renderLoginPage,
  renderSignupPage,
  renderVerifyEmailSentPage,
  renderVerifyEmailPage,
};
