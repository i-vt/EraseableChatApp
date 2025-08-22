document.addEventListener("DOMContentLoaded", () => {
  const codeInput = document.querySelector('#reg-code');
  const passwordInput = document.querySelector('#reg-password');
  const passwordWarning = document.querySelector('#password-warning');
  const autoRegisterCheckbox = document.getElementById('autoRegisterCheckbox');
  const form = document.querySelector('form');

  const toggleStateKey = 'autoRegisterEnabled';
  autoRegisterCheckbox.checked = localStorage.getItem(toggleStateKey) === 'true';

  let autoSubmitTimer = null;
  let activeTooltip = null;

  /** ---------------- Utilities ---------------- **/

  const showTooltip = (message) => {
    if (activeTooltip) {
      activeTooltip.remove();
      activeTooltip = null;
    }
    const tooltip = document.createElement('div');
    tooltip.textContent = message;
    Object.assign(tooltip.style, {
      background: 'var(--accent, #ffd166)',
      color: 'black',
      position: 'fixed',
      top: '10px',
      right: '10px',
      padding: '8px 12px',
      borderRadius: '6px',
      zIndex: 1000,
      fontSize: '14px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    });
    document.body.appendChild(tooltip);
    activeTooltip = tooltip;

    setTimeout(() => {
      tooltip.remove();
      if (activeTooltip === tooltip) activeTooltip = null;
    }, 3000);
  };

  const generatePassword = (length = 20) => {
    // Letters and digits only to satisfy the validation rule.
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  };

  const listInvalidChars = (value) => {
    // Return a de-duplicated, space-separated list of invalid characters
    const invalid = value.replace(/[A-Za-z0-9]/g, '');
    const uniq = Array.from(new Set(Array.from(invalid)));
    return uniq.map(ch => (ch === ' ' ? '␠' : ch)).join(' ');
  };

  const isPasswordValid = (value) => /^[A-Za-z0-9]+$/.test(value) && value.length >= 8 && value.length <= 64;

  /** ------------- Live validation ------------- **/

  const validatePassword = () => {
    const value = passwordInput.value;
    // Clear when empty
    if (!value) {
      passwordInput.setCustomValidity('');
      passwordWarning.hidden = true;
      passwordWarning.textContent = '';
      passwordInput.classList.remove('has-error');
      return true;
    }

    const invalidList = listInvalidChars(value);
    if (invalidList) {
      const msg = `Password has invalid character(s): ${invalidList}. Use only letters and numbers.`;
      passwordInput.setCustomValidity(msg);
      passwordWarning.textContent = msg;
      passwordWarning.hidden = false;
      passwordInput.classList.add('has-error');
      return false;
    }

    if (value.length < 8) {
      const msg = 'Password must be at least 8 characters.';
      passwordInput.setCustomValidity(msg);
      passwordWarning.textContent = msg;
      passwordWarning.hidden = false;
      passwordInput.classList.add('has-error');
      return false;
    }

    passwordInput.setCustomValidity('');
    passwordWarning.hidden = true;
    passwordWarning.textContent = '';
    passwordInput.classList.remove('has-error');
    return true;
  };

  passwordInput.addEventListener('input', validatePassword);

  /** ------------- Auto-Register toggle ------------- **/

  const scheduleAutoSubmit = () => {
    if (autoSubmitTimer) clearTimeout(autoSubmitTimer);

    // Run validation before scheduling
    validatePassword();

    // Only schedule if the form is valid
    if (!form.checkValidity()) {
      showTooltip('Cannot auto-register: fix validation errors first.');
      return;
    }

    showTooltip('Auto-registering in 2 seconds...');
    autoSubmitTimer = setTimeout(() => {
      if (autoRegisterCheckbox.checked && form.checkValidity()) {
        form.submit();
      }
    }, 2000);
  };

  autoRegisterCheckbox.addEventListener('change', () => {
    localStorage.setItem(toggleStateKey, autoRegisterCheckbox.checked);

    if (autoRegisterCheckbox.checked) {
      // NEW: if current password is invalid or empty, replace it with a compliant one
      if (!isPasswordValid(passwordInput.value)) {
        const newPassword = generatePassword(20);
        passwordInput.value = newPassword;
        validatePassword(); // clears any prior warnings
        // Copy to clipboard best-effort
        navigator.clipboard?.writeText(newPassword).catch(() => {});
        showTooltip('Your password had invalid characters. Generated a new one.');
      }
      scheduleAutoSubmit();
    } else {
      if (autoSubmitTimer) {
        clearTimeout(autoSubmitTimer);
        autoSubmitTimer = null;
        showTooltip('Auto-register canceled.');
      }
    }
  });

  /** ------------- Paste behavior for code ------------- **/

  codeInput.addEventListener('paste', () => {
    setTimeout(() => {
      if (!autoRegisterCheckbox.checked) return;
      const pasted = codeInput.value.trim();
      if (pasted.length === 11) {
        const newPassword = generatePassword(20);
        passwordInput.value = newPassword;
        validatePassword();
        // Copy to clipboard best-effort
        navigator.clipboard?.writeText(newPassword).catch(() => {});
        scheduleAutoSubmit();
      }
    }, 50);
  });

  /** ------------- Form submission guard ------------- **/

  form.addEventListener('submit', (e) => {
    // Run our validation first
    const ok = validatePassword();
    if (!ok || !form.checkValidity()) {
      e.preventDefault();
      // Let the browser show native messages too
      form.reportValidity();
      passwordInput.focus({ preventScroll: false });
      showTooltip('Please fix the issues before submitting.');
    }
  });
});
