// ============================================================
// MGD PLUMBING — interactions
// ============================================================

// ---------- Sticky header shadow ----------
const header = document.getElementById('header');
const toTop = document.getElementById('toTop');

function onScroll() {
  const scrolled = window.scrollY > 10;
  header.classList.toggle('is-scrolled', scrolled);
  toTop.classList.toggle('is-visible', window.scrollY > 600);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---------- Mobile nav ----------
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const mobileQuery = window.matchMedia('(max-width: 768px)');

function closeMenu() {
  nav.classList.remove('is-open');
  navToggle.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  nav.querySelectorAll('.nav__dropdown.is-open').forEach((d) => d.classList.remove('is-open'));
}

navToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  navToggle.classList.toggle('is-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});

nav.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (!link || !mobileQuery.matches) return;

  // First tap on a dropdown parent ("Services") expands its submenu;
  // a second tap follows the link and closes the menu.
  const dropdown = link.closest('.nav__dropdown');
  const isParentLink = dropdown && link.parentElement === dropdown;
  if (isParentLink && !dropdown.classList.contains('is-open')) {
    e.preventDefault();
    dropdown.classList.add('is-open');
    return;
  }
  closeMenu();
});

// Reset menu state if the viewport grows past the mobile breakpoint
mobileQuery.addEventListener('change', (mq) => {
  if (!mq.matches) closeMenu();
});

// ---------- Scroll reveal ----------
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// ---------- Animated counters ----------
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);
document.querySelectorAll('[data-count]').forEach((el) => counterObserver.observe(el));

// ---------- Active nav link on scroll ----------
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__link[href^="#"]');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);
sections.forEach((section) => sectionObserver.observe(section));

// ---------- Quote form ----------
// NOTE: hook this up to your form backend (Formspree, WPForms endpoint,
// or your own server) — currently it only shows a confirmation message.
const form = document.getElementById('quoteForm');
const formSuccess = document.getElementById('formSuccess');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  formSuccess.hidden = false;
  form.reset();
  formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

// ---------- Studio watermark (Welsch Marketing) ----------
// Self-healing overlay: re-created if deleted, hidden, or restyled.
(function () {
  const TILE =
    "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='480'%20height='320'%3E%3Cg%20fill='%23718096'%20fill-opacity='0.15'%20font-family='Arial,sans-serif'%20font-size='22'%20font-weight='700'%3E%3Ctext%20x='40'%20y='120'%20transform='rotate(-24%20240%20160)'%3EBUILT%20BY%20WELSCH%20MARKETING%3C/text%3E%3Ctext%20x='150'%20y='260'%20transform='rotate(-24%20240%20160)'%3EBUILT%20BY%20WELSCH%20MARKETING%3C/text%3E%3C/g%3E%3C/svg%3E";

  function build() {
    const el = document.createElement('div');
    el.setAttribute('data-wm', '');
    el.style.cssText =
      'position:fixed;top:0;right:0;bottom:0;left:0;z-index:2147483647;' +
      'pointer-events:none;background-image:url("' + TILE + '");background-repeat:repeat;';
    return el;
  }

  function ensure() {
    const el = document.querySelector('div[data-wm]');
    if (el) {
      const cs = getComputedStyle(el);
      const intact =
        el.parentElement === document.body &&
        cs.position === 'fixed' &&
        cs.display !== 'none' &&
        cs.visibility === 'visible' &&
        parseFloat(cs.opacity) > 0.9 &&
        cs.backgroundImage !== 'none' &&
        cs.pointerEvents === 'none';
      if (intact) return;
      el.remove();
    }
    document.body.appendChild(build());
  }

  ensure();
  new MutationObserver(ensure).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
  });
  setInterval(ensure, 2000);
})();
