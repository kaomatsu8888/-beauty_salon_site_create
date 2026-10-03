/**
 * サイト内の全テキスト・設定をこの 1 ファイルに集約する。
 *
 * 【意図】他店舗へ使い回すテンプレートにするため、HTML / CSS / 他の JS には
 *         店舗固有の情報を一切書かない。差し替え作業をこのファイルだけに閉じる
 * 【注意】プロパティ名を変更すると render.js の描画が壊れる。
 *         値だけを書き換えること
 */
const SITE_DATA = {
  /* 店舗の基本情報。<title> / OGP / 構造化データもここから生成する */
  salon: {
    name: 'hair salon 凪',
    nameEn: 'hair salon nagi',
    nameReading: 'ヘアサロン ナギ',
    catch: '髪が整うと、<span class="nowrap">一日が静かになる。</span>',
    lead: '福岡市西区・姪浜。スタイリスト3名の小さなサロンです。<br>急がず、丁寧に。あなたの髪のくせや暮らしに合わせて整えます。',
    description: '福岡市西区姪浜のヘアサロン「凪」。スタイリスト3名の落ち着いた小さなサロンで、丁寧なカウンセリングと再現しやすいスタイルをご提案します。駐車場あり・お子さま同伴可。',
    postalCode: '819-0001',
    address: '福岡県福岡市西区姪浜駅南3-12-5 ナギビル2F',
    addressRegion: '福岡県',
    addressLocality: '福岡市西区',
    streetAddress: '姪浜駅南3-12-5 ナギビル2F',
    geo: { lat: 33.5824, lng: 130.3215 },
    tel: '092-000-0000',
    telNote: '受付は営業終了の30分前まで',
    priceRange: '¥4,000〜¥18,000',
    /* 本番では実際の URL に差し替える。# のままでも導線の確認はできる */
    links: {
      reserve: '#dummy-reserve',
      line: '#dummy-line',
      instagram: '#dummy-instagram',
    },
    /* Google マップの埋め込み iframe src。空文字のままならプレースホルダ枠を表示する */
    mapEmbedSrc: '',
    mapLinkUrl: '#dummy-map',
  },

  /* 営業時間。index は 0=日曜 … 6=土曜 */
  hours: {
    weekly: [
      { open: '09:00', close: '18:00' }, // 日
      { open: '09:30', close: '19:00' }, // 月
      null,                              // 火（定休）
      { open: '09:30', close: '19:00' }, // 水
      { open: '09:30', close: '19:00' }, // 木
      { open: '09:30', close: '20:00' }, // 金
      { open: '09:00', close: '19:00' }, // 土
    ],
    /* 「第 n 週の曜日」を追加で休みにする規則。第3水曜なら { nth: 3, weekday: 3 } */
    irregularClosed: [{ nth: 3, weekday: 3 }],
    closedLabel: '毎週火曜・第3水曜',
    lastOrderMinutes: 30,
    note: '祝日は営業しております。年末年始の休業はお知らせをご確認ください。',
  },

  /* 初めての方へ。不安をつぶす情報を 1 枚に集める */
  firstTime: {
    title: '初めての方へ',
    lead: '「どのくらい時間がかかる？」「子どもを連れて行ける？」<br>来店前に気になることを、先にお伝えしておきます。',
    items: [
      { label: '所要時間', value: 'カットのみ約60分、カラー併用で約2時間', note: 'ご希望の仕上がりによって前後します' },
      { label: '駐車場', value: '店舗前に2台（無料）', note: '満車時は近隣コインパーキング代を当店で負担します' },
      { label: 'お子さま', value: 'ご一緒の来店歓迎です', note: 'キッズチェア・絵本をご用意しています' },
      { label: 'カウンセリング', value: '初回は15分ほどお時間をいただきます', note: '髪のくせ・お手入れの手間までうかがいます' },
      { label: 'お支払い', value: '現金・各種クレジットカード・QR決済', note: '' },
      { label: '雰囲気', value: '席は3席のみ。会話が苦手な方も気兼ねなく', note: '「静かに過ごしたい」とお伝えください' },
    ],
  },

  /* メニュー。price は税込の数値。表示は render.js が整形する */
  menu: {
    title: 'メニュー・料金',
    note: '表示はすべて税込価格です。シャンプー・ブロー込み。',
    categories: [
      {
        name: 'カット',
        items: [
          { name: 'カット', price: 4800, duration: '60分', desc: '髪のくせを見ながら、乾かすだけで決まる形に' },
          { name: '前髪カット', price: 1000, duration: '15分', desc: 'カット後1か月以内は無料' },
          { name: 'シャンプー＆ブロー', price: 2800, duration: '30分', desc: '' },
        ],
      },
      {
        name: 'カラー',
        items: [
          { name: 'リタッチカラー', price: 6500, duration: '90分', desc: '根元2cmまでの白髪・伸びた部分を染めます' },
          { name: 'フルカラー', price: 8800, duration: '120分', desc: '' },
          { name: 'ハイライト', price: 12000, duration: '150分', desc: '白髪をぼかしながら立体感を出します' },
          { name: 'カット＋カラー', price: 12800, duration: '150分', desc: 'セットでのご予約がおすすめです' },
        ],
      },
      {
        name: 'パーマ・トリートメント',
        items: [
          { name: 'デジタルパーマ', price: 13200, duration: '150分', desc: '' },
          { name: '縮毛矯正', price: 18000, duration: '180分', desc: '毛先の強さを調整しながらかけます' },
          { name: '髪質改善トリートメント', price: 5500, duration: '45分', desc: '' },
          { name: 'ヘッドスパ', price: 3800, duration: '30分', desc: '施術に追加できます' },
        ],
      },
    ],
  },

  /* スタイリスト紹介 */
  staff: {
    title: 'スタイリスト',
    lead: '3名で、ひとりずつじっくり向き合っています。',
    members: [
      {
        name: '大村 奈津',
        nameEn: 'Natsu Omura',
        role: '店長 / スタイリスト',
        career: '美容師歴16年',
        image: 'images/staff-01.svg',
        imageAlt: 'スタイリスト 大村奈津',
        message: '扱いにくいと思っていたくせ毛が、長所に変わる瞬間がいちばん好きです。朝の5分が楽になる形を一緒に探しましょう。',
        good: ['くせ毛を活かすカット', '大人のショート'],
      },
      {
        name: '古賀 遥',
        nameEn: 'Haruka Koga',
        role: 'スタイリスト',
        career: '美容師歴9年',
        image: 'images/staff-02.svg',
        imageAlt: 'スタイリスト 古賀遥',
        message: '白髪を隠すのではなく、明るさでなじませる提案が得意です。「染めた感」が苦手な方はぜひご相談ください。',
        good: ['白髪ぼかしハイライト', 'ナチュラルカラー'],
      },
      {
        name: '園田 彩',
        nameEn: 'Aya Sonoda',
        role: 'スタイリスト / ヘッドスパ担当',
        career: '美容師歴6年',
        image: 'images/staff-03.svg',
        imageAlt: 'スタイリスト 園田彩',
        message: '頭皮のこわばりは、顔まわりの印象にも出ます。眠っていただいて大丈夫です。',
        good: ['ヘッドスパ', '髪質改善トリートメント'],
      },
    ],
  },

  /* スタイルギャラリー */
  gallery: {
    title: 'スタイルギャラリー',
    lead: '当店で実際にご提案しているスタイルです。',
    items: [
      { image: 'images/gallery-01.svg', alt: '肩にかかるナチュラルなレイヤーボブ', caption: 'ゆるレイヤーボブ' },
      { image: 'images/gallery-02.svg', alt: '白髪をぼかしたハイライトカラー', caption: '白髪ぼかしハイライト' },
      { image: 'images/gallery-03.svg', alt: '大人のショートヘア', caption: '大人ショート' },
      { image: 'images/gallery-04.svg', alt: '柔らかいデジタルパーマのミディアムヘア', caption: '柔らかデジパーミディ' },
      { image: 'images/gallery-05.svg', alt: '艶のあるトリートメント後のロングヘア', caption: '髪質改善ロング' },
      { image: 'images/gallery-06.svg', alt: '前髪ありの軽やかなミディアムヘア', caption: 'シースルーバング' },
    ],
  },

  /* 店舗情報のアクセス説明 */
  access: {
    title: '店舗情報・アクセス',
    routes: [
      { label: '電車', value: 'JR筑肥線・地下鉄空港線「姪浜駅」南口から徒歩5分' },
      { label: 'バス', value: '西鉄バス「姪浜駅南」停から徒歩2分' },
      { label: 'お車', value: '国道202号「愛宕大橋」交差点から約3分。店舗前に無料駐車場2台' },
    ],
    landmark: '1階がパン屋さんの茶色いビルの2階です。入口は建物右手の階段から。',
  },

  /* よくある質問（アコーディオン） */
  faq: {
    title: 'よくある質問',
    items: [
      { q: '予約なしでも受けてもらえますか？', a: '空きがあればご案内できますが、3席のみのため予約をおすすめしています。当日でもお電話いただければ空き状況をお伝えします。' },
      { q: '子どもを連れて行っても大丈夫ですか？', a: 'はい、ご一緒に来店いただけます。キッズチェアと絵本をご用意しています。平日の午前中は比較的ゆったりご案内できます。' },
      { q: 'どのくらいの時間を見ておけばいいですか？', a: 'カットのみで約60分、カラーを併用する場合は約2時間が目安です。お急ぎのご予定がある場合は、ご予約時にお知らせください。' },
      { q: '白髪染めはできますか？', a: 'できます。しっかり染めるリタッチカラーのほか、明るさでなじませる白髪ぼかしハイライトもご用意しています。ご希望の雰囲気にあわせてご提案します。' },
      { q: '指名はできますか？', a: 'はい、ご予約時にスタイリスト名をお伝えください。指名料はいただいておりません。' },
      { q: '駐車場が満車のときはどうすれば？', a: '近隣のコインパーキングをご利用ください。駐車料金は当店で負担しますので、受付で駐車券をお見せください。' },
      { q: 'クレジットカードは使えますか？', a: '各種クレジットカードとQR決済がご利用いただけます。' },
    ],
  },

  /* 予約導線のボタン表記 */
  reserve: {
    title: 'ご予約',
    lead: 'ご希望の方法でご連絡ください。<br>初めての方は、気になることを書き添えていただけると当日がスムーズです。',
    buttons: [
      { type: 'reserve', label: 'ネット予約', note: '24時間受付' },
      { type: 'tel', label: '電話で予約', note: '営業時間内' },
      { type: 'line', label: 'LINEで相談', note: '写真を送れます' },
    ],
  },

  /* ヒーロー画像と OGP 画像 */
  images: {
    hero: 'images/hero.svg',
    heroAlt: '落ち着いた雰囲気のサロン内観',
    og: 'images/og.svg',
  },

  /* GitHub Pages のサブディレクトリ公開を想定し、OGP には絶対 URL を入れる */
  seo: {
    siteUrl: 'https://kaomatsu8888.github.io/-beauty_salon_site_create/',
    titleSuffix: '福岡市西区姪浜の美容室',
  },
};
