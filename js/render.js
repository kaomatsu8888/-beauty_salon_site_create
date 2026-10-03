/**
 * data.js の内容を DOM に描画する。
 *
 * 【意図】HTML に店舗テキストを持たせないことで、data.js の差し替えだけで
 *         別店舗のサイトになる状態を保つ
 * 【制約】ビルドツールを使わない前提のため、テンプレートは文字列生成で組む。
 *         挿入する値は data.js（自分で書いた固定データ）由来に限り、
 *         外部入力を流し込まないこと
 */

/**
 * 'salon.links.reserve' のようなドット記法で値を取り出す。
 */
function pick(path, root) {
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), root);
}

/**
 * HTML に埋める文字列をエスケープする。
 *
 * 【注意】data.js 内で意図的に <br> や <span> を使っている値は
 *         data-bind-html 側で扱う。こちらは通さない
 */
function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * 税込価格の表示形式を揃える。
 */
function yen(price) {
  return `¥${price.toLocaleString('ja-JP')}`;
}

/* data.js に無い派生値を足した描画用オブジェクト */
const VIEW = (() => {
  const view = JSON.parse(JSON.stringify(SITE_DATA));
  const salon = SITE_DATA.salon;

  /**
   * 【意図】住所をそのまま流すと「姪浜駅南3-12-／5 ナギビル2F」のように
   *         番地の途中で改行されることがある。郵便番号・市区町村・番地を
   *         それぞれ改行禁止の塊にして、意味の切れ目でだけ折り返させる
   * 【注意】HTML を含むため、これを表示する要素は data-bind-html で受けること
   */
  const parts = [
    `〒${salon.postalCode}`,
    `${salon.addressRegion}${salon.addressLocality}`,
    salon.streetAddress,
  ];
  view.salon.addressFull = parts
    .map((part) => `<span class="nowrap">${esc(part)}</span>`)
    .join(' ');

  return view;
})();

/* --- 単純な値の差し込み --------------------------------------------------- */

function bindSimpleValues() {
  document.querySelectorAll('[data-bind]').forEach((el) => {
    const path = el.dataset.bind;
    if (path.startsWith('status.')) return; // 営業状態は時刻依存のため別処理
    const value = pick(path, VIEW);
    if (value != null) el.textContent = value;
  });

  document.querySelectorAll('[data-bind-html]').forEach((el) => {
    const path = el.dataset.bindHtml;
    if (path.startsWith('status.')) return;
    const value = pick(path, VIEW);
    if (value != null) el.innerHTML = value;
  });

  document.querySelectorAll('[data-bind-src]').forEach((el) => {
    el.setAttribute('src', pick(el.dataset.bindSrc, VIEW));
  });

  document.querySelectorAll('[data-bind-alt]').forEach((el) => {
    el.setAttribute('alt', pick(el.dataset.bindAlt, VIEW));
  });

  document.querySelectorAll('[data-bind-href]').forEach((el) => {
    el.setAttribute('href', pick(el.dataset.bindHref, VIEW));
  });

  /* 電話番号はハイフンを除いた tel: リンクにする */
  document.querySelectorAll('[data-bind-tel]').forEach((el) => {
    const tel = pick(el.dataset.bindTel, VIEW);
    el.setAttribute('href', `tel:${String(tel).replace(/[^0-9+]/g, '')}`);
  });
}

/* --- セクションごとの描画 ------------------------------------------------- */

function renderFirstTime(target) {
  target.innerHTML = VIEW.firstTime.items
    .map(
      (item) => `
      <div class="facts__item">
        <dt class="facts__label">${esc(item.label)}</dt>
        <dd class="facts__value">${esc(item.value)}${
        item.note ? `<span class="facts__note">${esc(item.note)}</span>` : ''
      }</dd>
      </div>`
    )
    .join('');
}

function renderMenu(target) {
  target.innerHTML = VIEW.menu.categories
    .map(
      (category) => `
      <div class="menu-group">
        <h3 class="menu-group__title">${esc(category.name)}</h3>
        <table class="menu-table">
          <caption class="visually-hidden">${esc(category.name)}の料金表</caption>
          <thead>
            <tr><th scope="col">メニュー</th><th scope="col">時間</th><th scope="col">料金（税込）</th></tr>
          </thead>
          <tbody>
            ${category.items
              .map(
                (item) => `
              <tr>
                <th scope="row" class="menu-table__name">${esc(item.name)}${
                  item.desc ? `<span class="menu-table__desc">${esc(item.desc)}</span>` : ''
                }</th>
                <td class="menu-table__time">${esc(item.duration)}</td>
                <td class="menu-table__price">${yen(item.price)}</td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>`
    )
    .join('');
}

function renderStaff(target) {
  target.innerHTML = VIEW.staff.members
    .map(
      (member) => `
      <li class="staff__item">
        <div class="staff__photo">
          <img src="${esc(member.image)}" alt="${esc(member.imageAlt)}" width="480" height="600" loading="lazy" decoding="async">
        </div>
        <div class="staff__body">
          <p class="staff__role">${esc(member.role)}<span class="staff__career">${esc(member.career)}</span></p>
          <h3 class="staff__name">${esc(member.name)}<span class="staff__name-en">${esc(member.nameEn)}</span></h3>
          <p class="staff__message">${esc(member.message)}</p>
          <ul class="tags">${member.good.map((g) => `<li class="tags__item">${esc(g)}</li>`).join('')}</ul>
        </div>
      </li>`
    )
    .join('');
}

function renderGallery(target) {
  target.innerHTML = VIEW.gallery.items
    .map(
      (item) => `
      <li class="gallery__item">
        <img src="${esc(item.image)}" alt="${esc(item.alt)}" width="480" height="600" loading="lazy" decoding="async">
        <p class="gallery__caption">${esc(item.caption)}</p>
      </li>`
    )
    .join('');
}

/**
 * 地図。埋め込み src が未設定ならプレースホルダ枠を出す。
 *
 * 【意図】営業デモ時点では実際の地図を入れず、枠だけ見せれば十分なため
 */
function renderMap(target) {
  const src = VIEW.salon.mapEmbedSrc;
  if (src) {
    target.innerHTML = `<iframe src="${esc(src)}" title="${esc(
      VIEW.salon.name
    )}の地図" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`;
    return;
  }
  target.innerHTML = `
    <div class="map__placeholder">
      <p class="map__placeholder-title">地図の埋め込み枠</p>
      <p class="map__placeholder-text">${esc(VIEW.salon.address)}</p>
      <p class="map__placeholder-note">data.js の <code>mapEmbedSrc</code> に Google マップの埋め込み URL を入れると、ここに地図が表示されます。</p>
    </div>`;
}

function renderHours(target) {
  target.innerHTML = `
    <caption class="visually-hidden">営業時間</caption>
    <tbody>
      ${buildHoursRows(VIEW.hours)
        .map(
          (row) => `
        <tr${row.closed ? ' class="is-closed"' : ''}>
          <th scope="row">${esc(row.days)}</th>
          <td>${esc(row.text)}</td>
        </tr>`
        )
        .join('')}
    </tbody>`;
}

function renderRoutes(target) {
  target.innerHTML = `
    <ul class="routes">
      ${VIEW.access.routes
        .map(
          (route) => `
        <li class="routes__item">
          <span class="routes__label">${esc(route.label)}</span>
          <span class="routes__value">${esc(route.value)}</span>
        </li>`
        )
        .join('')}
    </ul>
    <p class="routes__landmark">${esc(VIEW.access.landmark)}</p>`;
}

/**
 * FAQ アコーディオン。
 *
 * 【意図】details/summary を使うことで、JS なしでも開閉できアクセシビリティも確保できる。
 *         開閉アニメーションだけを app.js 側で補う
 */
function renderFaq(target) {
  target.innerHTML = VIEW.faq.items
    .map(
      (item) => `
      <details class="faq__item">
        <summary class="faq__q"><span class="faq__q-text">${esc(item.q)}</span></summary>
        <div class="faq__a"><p>${esc(item.a)}</p></div>
      </details>`
    )
    .join('');
}

function renderReserve(target) {
  const links = VIEW.salon.links;
  const hrefOf = (type) => {
    if (type === 'tel') return `tel:${String(VIEW.salon.tel).replace(/[^0-9+]/g, '')}`;
    if (type === 'line') return links.line;
    return links.reserve;
  };
  const captionOf = (type) => (type === 'tel' ? VIEW.salon.tel : '');

  target.innerHTML = VIEW.reserve.buttons
    .map(
      (button) => `
      <li class="reserve__item">
        <a class="btn btn--block ${button.type === 'reserve' ? 'btn--primary' : 'btn--outline'}" href="${esc(
        hrefOf(button.type)
      )}">
          <span class="btn__label">${esc(button.label)}</span>
          <span class="btn__note">${esc(captionOf(button.type) || button.note)}</span>
        </a>
      </li>`
    )
    .join('');
}

const RENDERERS = {
  firstTime: renderFirstTime,
  menu: renderMenu,
  staff: renderStaff,
  gallery: renderGallery,
  map: renderMap,
  hours: renderHours,
  routes: renderRoutes,
  faq: renderFaq,
  reserve: renderReserve,
};

function renderSections() {
  document.querySelectorAll('[data-render]').forEach((el) => {
    const renderer = RENDERERS[el.dataset.render];
    if (renderer) renderer(el);
  });
}

/**
 * 構造化データ（HairSalon）を data.js から生成して挿入する。
 *
 * 【意図】店舗情報を二重管理にしないため、JSON-LD も data.js 由来にする
 * 【注意】openingHoursSpecification は不定休（第3水曜）を表現できないため、
 *         定休日は weekly の null からのみ生成している
 */
function injectStructuredData() {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const salon = SITE_DATA.salon;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    name: salon.name,
    alternateName: salon.nameEn,
    description: salon.description,
    url: SITE_DATA.seo.siteUrl,
    image: SITE_DATA.seo.siteUrl + SITE_DATA.images.og,
    telephone: salon.tel,
    priceRange: salon.priceRange,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'JP',
      postalCode: salon.postalCode,
      addressRegion: salon.addressRegion,
      addressLocality: salon.addressLocality,
      streetAddress: salon.streetAddress,
    },
    geo: { '@type': 'GeoCoordinates', latitude: salon.geo.lat, longitude: salon.geo.lng },
    openingHoursSpecification: SITE_DATA.hours.weekly
      .map((dayHours, index) =>
        dayHours
          ? {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: `https://schema.org/${dayNames[index]}`,
              opens: dayHours.open,
              closes: dayHours.close,
            }
          : null
      )
      .filter(Boolean),
    makesOffer: SITE_DATA.menu.categories.flatMap((category) =>
      category.items.map((item) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: item.name, category: category.name },
        price: item.price,
        priceCurrency: 'JPY',
      }))
    ),
    employee: SITE_DATA.staff.members.map((member) => ({
      '@type': 'Person',
      name: member.name,
      jobTitle: member.role,
    })),
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}
