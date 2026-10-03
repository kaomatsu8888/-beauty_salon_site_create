/**
 * 営業時間データから「現在営業中か」を判定する。
 *
 * 【意図】営業中表示をヘッダー・ファーストビュー・予約セクションの3か所で使うため、
 *         判定を 1 関数に集約して呼び出し側では結果だけを使う形にする
 * 【制約】data.js の hours.weekly は 0=日曜 … 6=土曜 の 7 要素。休業日は null
 * 【注意】閲覧者の端末時刻で判定する。サーバー時刻ではないので、
 *         端末の時計がずれていれば表示もずれる（デモ用途では許容）
 */
const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

/**
 * 'HH:MM' を 0時からの分数に変換する。
 */
function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/**
 * 分数を 'HH:MM' に戻す。
 */
function toHHMM(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * その日付が「第 n 何曜日」かを返す（1〜5）。
 *
 * 【意図】「第3水曜定休」のような不定休を日付リストの手入力なしで扱うため
 */
function nthWeekdayOfMonth(date) {
  return Math.floor((date.getDate() - 1) / 7) + 1;
}

/**
 * 不定休ルールに当てはまる日かどうか。
 */
function isIrregularClosed(date, hours) {
  const rules = hours.irregularClosed || [];
  return rules.some(
    (rule) => rule.weekday === date.getDay() && rule.nth === nthWeekdayOfMonth(date)
  );
}

/**
 * その日の営業時間を返す。休業日は null。
 */
function getDayHours(date, hours) {
  if (isIrregularClosed(date, hours)) return null;
  return hours.weekly[date.getDay()] || null;
}

/**
 * 次に営業する日を最大 14 日先まで探す。
 *
 * 【注意】全曜日が null のデータだと無限に探すことになるため、上限を設けている
 */
function findNextOpenDay(now, hours) {
  for (let i = 1; i <= 14; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const dayHours = getDayHours(d, hours);
    if (dayHours) return { date: d, hours: dayHours };
  }
  return null;
}

/**
 * 現在の営業状態を判定する。
 *
 * @param {Date} now 判定の基準時刻
 * @param {object} hours data.js の hours オブジェクト
 * @returns {{state: string, label: string, detail: string}}
 *          state は CSS のクラス名に使う識別子
 *          label は「営業中」などの短い表示
 *          detail は「19:00まで」などの補足（空文字可）
 */
function getBusinessStatus(now, hours) {
  const today = getDayHours(now, hours);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const next = findNextOpenDay(now, hours);
  const nextText = next
    ? `次の営業は${WEEKDAY_LABELS[next.date.getDay()]}曜 ${next.hours.open}から`
    : '';

  // TODO(human): ここで状態を判定して { state, label, detail } を返す
  return null;
}

/**
 * 営業時間テーブル用に「同じ時間帯の曜日」をまとめた行データを作る。
 *
 * 【意図】7 行そのまま並べるとスマホで縦に長くなるため、
 *         連続する同一時間帯を「月〜木 9:30-19:00」の形に圧縮する
 */
function buildHoursRows(hours) {
  const rows = [];
  hours.weekly.forEach((dayHours, index) => {
    const text = dayHours ? `${dayHours.open} - ${dayHours.close}` : '定休日';
    const last = rows[rows.length - 1];
    if (last && last.text === text && last.endIndex === index - 1) {
      last.endIndex = index;
      return;
    }
    rows.push({ startIndex: index, endIndex: index, text, closed: !dayHours });
  });
  return rows.map((row) => ({
    days:
      row.startIndex === row.endIndex
        ? `${WEEKDAY_LABELS[row.startIndex]}曜`
        : `${WEEKDAY_LABELS[row.startIndex]}〜${WEEKDAY_LABELS[row.endIndex]}曜`,
    text: row.text,
    closed: row.closed,
  }));
}
