/**
 * 描画後のふるまい（営業中表示・スクロール演出・アンカー移動）をまとめる。
 *
 * 【制約】prefers-reduced-motion が有効な環境では演出を一切行わない
 */

/**
 * 営業状態を 3 か所に反映する。
 *
 * 【注意】getBusinessStatus が null を返す場合（判定未実装・データ不備）は
 *         要素ごと非表示にする。中途半端な文言を出すと誤案内になるため
 */
function applyBusinessStatus() {
  const status = getBusinessStatus(new Date(), SITE_DATA.hours);

  document.querySelectorAll('[data-bind="status.badge"]').forEach((el) => {
    if (!status) {
      el.hidden = true;
      return;
    }
    el.hidden = false;
    el.textContent = status.label;
    el.className = `site-header__status is-${status.state}`;
  });

  document.querySelectorAll('[data-bind-html="status.full"]').forEach((el) => {
    if (!status) {
      el.hidden = true;
      return;
    }
    el.hidden = false;
    el.className = `statusline is-${status.state}`;
    el.innerHTML = `<span class="statusline__dot" aria-hidden="true"></span><span class="statusline__label">${status.label}</span>${
      status.detail ? `<span class="statusline__detail">${status.detail}</span>` : ''
    }`;
  });
}

/**
 * スクロールに合わせた淡いフェードイン。
 *
 * 【意図】「作り込まれている」印象を薄く足すだけが目的なので、
 *         移動量 8px / 0.4s に抑え、1 要素 1 回だけ発火させる
 */
function setupReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll('.section, .hero__body, .hero__media');

  if (prefersReduced || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  targets.forEach((el) => el.classList.add('reveal'));
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -10% 0px' }
  );
  targets.forEach((el) => observer.observe(el));
}

/**
 * ページ内リンクの移動先がヘッダーに隠れないようにする。
 *
 * 【制約】scroll-margin-top を CSS で指定しているが、ヘッダー高さは
 *         画面幅で変わるため、実測値を CSS 変数に書き戻している
 */
function syncHeaderHeight() {
  const header = document.getElementById('siteHeader');
  if (!header) return;
  const update = () =>
    document.documentElement.style.setProperty('--header-h', `${header.offsetHeight}px`);
  update();
  window.addEventListener('resize', update);
}

/**
 * 固定バーは最初のスクロールまで隠しておく。
 *
 * 【意図】ファーストビューには大きな予約ボタンがあるため、
 *         開いた瞬間に下部バーまで出すと画面が窮屈に見える
 */
function setupActionBar() {
  const bar = document.getElementById('actionbar');
  if (!bar) return;
  const toggle = () => bar.classList.toggle('is-visible', window.scrollY > 120);
  toggle();
  window.addEventListener('scroll', toggle, { passive: true });
}

document.addEventListener('DOMContentLoaded', () => {
  bindSimpleValues();
  renderSections();
  injectStructuredData();
  applyBusinessStatus();
  syncHeaderHeight();
  setupActionBar();
  setupReveal();

  /* 日付が変わる・開店時刻をまたぐケースに備えて 1 分ごとに再判定する */
  setInterval(applyBusinessStatus, 60 * 1000);
});
