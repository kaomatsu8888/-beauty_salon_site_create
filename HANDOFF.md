# 引き継ぎ資料（Opus 5 → 次セッション）

最終更新: 2026-10-03 / 作成: Claude Opus 5

> このファイルは開発の引き継ぎ用。店舗へ納品する前に削除してよい。

---

## 1. いま何ができているか

架空の美容院「hair salon 凪」の営業デモサイトが動く状態で
GitHub に push 済み。セクション 1〜8（ファーストビュー、初めての方へ、
メニュー、スタイリスト、ギャラリー、店舗情報、FAQ、予約導線）は
すべて実装・描画確認済み。

- 作業ディレクトリ: `/Users/kaorumatsunaga/beauty-salon-site`
- リモート: `git@github.com:kaomatsu8888/-beauty_salon_site_create.git`
- ブランチ: `main`（push 済み、コミット `03aae53`）
- 公開予定 URL: `https://kaomatsu8888.github.io/-beauty_salon_site_create/`

**元の `claude-code-exp` リポジトリからは切り離してある。**
`claude-code-exp` には他プロジェクトが同居しており、そこに紐づけて
push すると美容院用リポジトリに無関係なファイルが上がるため。

---

## 2. 残っている作業（優先順）

### 2-1. `getBusinessStatus()` が未実装（最優先）

`js/hours.js` に `TODO(human)` が 1 箇所だけ残っている。

```js
function getBusinessStatus(now, hours) {
  const today = getDayHours(now, hours);   // 今日の営業時間 or null（定休）
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const next = findNextOpenDay(now, hours);
  const nextText = next ? `次の営業は${WEEKDAY_LABELS[...]}曜 ${next.hours.open}から` : '';

  // TODO(human): ここで状態を判定して { state, label, detail } を返す
  return null;
}
```

- **これはユーザー本人に書いてもらう前提で空けてある。**
  学習目的の意図的な空欄なので、勝手に埋めないこと。
  ユーザーが「埋めておいて」と言った場合のみ実装する。
- 返り値の契約: `{ state, label, detail }`
  - `state` → CSS クラス `is-${state}` になる。`'open'` のときだけ
    アクセント色（セージグリーン）が付く。それ以外はグレー表示
  - `label` → 「営業中」などの短い表示
  - `detail` → 「19:00まで」などの補足。空文字可
- `null` を返している間は `js/app.js` の `applyBusinessStatus()` が
  バッジを `hidden` にする。**壊れた表示にはならないが、
  要件の「現在営業中／本日は終了しました」はまだ出ていない。**
  営業情報の誤表示は実害（閉店後の来店）になるため、
  不明なら何も出さない方針にしてある。
- 使える補助関数: `toMinutes('HH:MM')`, `toHHMM(分)`,
  `hours.lastOrderMinutes`（受付終了を閉店の何分前にするか）

### 2-2. FAQ セクションと PC 幅の目視確認が未完了

実装は済んでいるが、スクリーンショットでの確認が取れていない。
確認が必要なのは次の 2 点だけ。

- FAQ アコーディオン（`<details>`/`<summary>`）の開閉マークの位置
- 幅 1280px でのヒーロー 2 カラム、スタイリスト 3 カラム、
  固定バーが消えていること（`@media (min-width: 900px)` で `display: none`）

確認手順は本書 4 章に書いた。

### 2-3. GitHub Pages がまだ有効になっていない

`gh` CLI が未認証のため、コマンドから有効化できなかった。
ブラウザで次の操作が必要（ユーザー本人の作業）。

1. リポジトリの **Settings** → **Pages**
2. **Source** = `Deploy from a branch`
3. **Branch** = `main` / `/ (root)` → **Save**
4. 1〜2 分後に公開 URL が開けるようになる

---

## 3. アーキテクチャ

### データの流れ

```
js/data.js  … 店舗情報の唯一の出どころ
     ↓
js/render.js … data-bind / data-render 属性を見て DOM に流し込む
     ↓          JSON-LD（HairSalon）もここで生成して <head> に挿入
index.html   … 骨組みだけ。店舗テキストを持たない
     ↓
js/app.js    … 描画後のふるまい（営業状態・固定バー・スクロール演出）
js/hours.js  … 営業時間の判定ロジック（app.js から呼ばれる）
```

読み込み順は `data.js → hours.js → render.js → app.js`。
`app.js` の `DOMContentLoaded` が全体の起動点。

### バインド属性の一覧（`render.js` の `bindSimpleValues()`）

| 属性 | 動作 |
|---|---|
| `data-bind="path"` | `textContent` に入れる |
| `data-bind-html="path"` | `innerHTML` に入れる（`<br>` や `.nowrap` を含む値用） |
| `data-bind-src` / `data-bind-alt` / `data-bind-href` | 対応する属性に入れる |
| `data-bind-tel="path"` | ハイフンを除いて `tel:` リンクにする |
| `data-render="キー"` | `RENDERERS` の関数でセクションごと描画する |

`path` は `salon.links.reserve` のようなドット記法。
`status.` で始まるパスだけは時刻依存のため `app.js` 側で処理する。

### 派生値

`render.js` の `VIEW` が `SITE_DATA` のコピーに派生値を足している。
現在は `salon.addressFull` のみ（郵便番号・市区町村・番地を
それぞれ `.nowrap` で包み、番地の途中で改行されないようにしている）。
`addressFull` は HTML を含むので、**必ず `data-bind-html` で受けること**。

---

## 4. 表示確認のやり方（ハマりどころあり）

### 重要: ヘッドレス Chrome の `--window-size=375` は効かない

macOS には最小ウィンドウ幅があり、`--window-size=375,...` を指定しても
実際のレイアウト幅はそれより広くなる。スクリーンショットだけが 375px で
切り取られるため、**サイトが壊れているように見えるが実際は正常**という
誤判定が起きる。実際この罠に一度かかった。

正確に 375px を見るには、**iframe を固定幅にする**。

```bash
cd /Users/kaorumatsunaga/beauty-salon-site
python3 -m http.server 8079 &

cat > ./_shot.html <<'HTML'
<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
html,body{margin:0;background:#999}
.clip{width:375px;height:1500px;overflow:hidden;position:relative}
iframe{width:375px;height:12000px;border:0;position:absolute;top:-8250px;background:#fff}
</style></head><body><div class="clip"><iframe src="index.html"></iframe></div></body></html>
HTML

"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --no-sandbox --user-data-dir=/tmp/cp1 \
  --window-size=383,1508 --virtual-time-budget=4500 \
  --screenshot=/tmp/shot.png http://127.0.0.1:8079/_shot.html
```

`top:` の値を変えると縦位置を選べる（FAQ は `-8250px` 付近）。
PC 幅を見るときは `.clip` と `iframe` の `width` を `1280px` にする。

**注意点**
- 1 回の実行に数分かかることがある。`run_in_background: true` で回す
- `pkill -f "Google Chrome.*headless"` は他の実行中キャプチャも
  巻き添えで止める。実際に 2 件を落として撮り直した
- 画像が縦に長いと読むとき縮小されて潰れる。
  `sips -c 高さ 幅 --cropOffset Y 0 元.png --out 切片.png` で分割する。
  `--cropOffset` は**画像中心からの相対値**なので、
  `i*高さ + 高さ/2 - 全体高さ/2` を渡す

### 横スクロールの有無を数値で確かめる

目視より確実。iframe 内の `document.documentElement.scrollWidth` と
各要素の `getBoundingClientRect().right` を出力して調べた。
前回の実測値は `scrollWidth: 375`（横スクロールなし）。
376 を超えていたのはヘッダーの `.site-nav` 内の `li`/`a` のみで、
これは `overflow-x: auto` による意図的な横スクロールナビ。

---

## 5. 決定済みの事項と、その理由

勝手に変えないこと。変えるならユーザーに確認する。

| 項目 | 決定 | 理由 |
|---|---|---|
| 店名 | hair salon 凪（なぎ） | 実在店と被りにくい。福岡＝海のイメージと合う |
| アクセント色 | `#6E7F6A` セージグリーン 1 色 | ナチュラル路線に合う。白文字とのコントラスト約 4.6:1 で AA 達成 |
| 本文色 | `#2E2A26` on `#FBFAF7` | コントラスト約 12.5:1 |
| 見出し | Zen Old Mincho（Google Fonts 1 種のみ） | 明朝で上品さを出す。読み込みを増やさない |
| 本文 | Hiragino Sans 優先（OS 標準） | Web フォント読み込みを本文に使わず表示を速くする |
| 画像 | 外部サイトを使わず SVG プレースホルダを同梱 | 要件（外部画像禁止）。差し替え前提でファイル名を固定 |
| ヒーロー比率 | スマホ 4:3 / 600px〜 16:9 / 900px〜 4:5 | 5:6 だと画像だけで初回表示が埋まり、予約ボタンが折り返し線の下に落ちた |
| アニメーション | 8px フェードイン 0.4s のみ | 落ち着いた店の印象と `prefers-reduced-motion` 対応の両立 |
| 角丸 | 4px | 12px 以上は量産サイト感が出る |
| 固定バー | 120px スクロール後に出現 | 開いた瞬間から出すと画面が窮屈に見える |

### 日本語の改行対策（要件に明記されていた項目）

3 段構えで対応している。

1. `body` に `line-break: strict; word-break: normal; overflow-wrap: break-word`
2. 本文ブロックに `word-break: auto-phrase; text-wrap: pretty`
   （Chrome 系のみ対応。未対応ブラウザでは無視されるだけ）
3. 絶対に切らせたくない箇所は `.nowrap`（`display: inline-block`）で包む
   - `display: inline-block` は「入らなければ塊ごと次行へ送る」挙動。
     `white-space: nowrap` と違い、はみ出しは起こさない
   - キャッチコピー（`data.js` の `salon.catch` 内）と
     住所（`render.js` の `VIEW` で生成）で使っている

---

## 6. 要件チェックリストの現状

| 要件 | 状態 |
|---|---|
| HTML/CSS/バニラ JS のみ、ビルド不要 | 済 |
| GitHub Pages でそのまま公開できる構成 | 済（Pages 有効化はユーザー作業） |
| 店舗情報を 1 ファイルに集約 | 済（`js/data.js`） |
| 画像を `images/` にまとめ、外部画像を使わない | 済 |
| 必要セクション 1〜8 | 済 |
| モバイルファースト（375px 最適、PC 崩れなし） | 375px 済 / PC 幅は未目視 |
| 画面下部に固定予約バー | 済 |
| トップから予約まで 3 タップ以内 | 済（固定バー → メニュー選択 → 送信） |
| 営業時間から営業中／終了を自動表示 | **未**（`TODO(human)`） |
| タップ領域 44px 以上 | 済（CSS に `min-height` 指定） |
| 本文 16px 以上 | 済 |
| コントラスト WCAG AA 以上 | 済（計算値は 5 章） |
| 日本語の改行が不自然にならない | 済（5 章の 3 段構え） |
| アニメ控えめ・`prefers-reduced-motion` 対応 | 済 |
| 画像の遅延読み込み | 済（ヒーロー以外 `loading="lazy"` ＋ `aspect-ratio`） |
| テンプレ感・AI 感を避ける | 済（アクセント 1 色、余白とタイポで構成） |
| title / meta description / OGP | 済（`index.html` の `<head>` に静的記述） |
| 構造化データ HairSalon | 済（`render.js` が `data.js` から生成） |
| 実在の店名・ロゴ・予約サイトロゴを使わない | 済 |
| README に書き換え手順 | 済 |

---

## 7. ユーザーについて

- 日本語で回答すること
- エンジニア学習中、起業志望。このサイトは個人で Web 制作の
  営業をするためのデモ
- **学習スタイルで進めている。** 設計判断を含む 20 行以上の実装では、
  `TODO(human)` を 1 箇所だけ置いて 2〜10 行をユーザー本人に
  書いてもらう。コードの前後に短い解説（`★ Insight`）を添える
- 実装前に方針を提案し、確認を取ってから書く進め方を希望している
