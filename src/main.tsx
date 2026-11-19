import './index.css';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  BUDGET_CATEGORIES,
  DAY_PLANS,
  FOOD_CATEGORIES,
  IMAGES,
  PACKING_ITEMS,
  RESTAURANTS,
  TRANSIT_COMPARISONS,
  TRIP_META,
  type FoodCategory,
  type PackingItem,
} from './data/tripData';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend
);

type SectionId = 'overview' | 'transit' | 'itinerary' | 'food' | 'prep';
type TransitGroup = 'airport' | 'suburban';
type FareMode = 'family' | 'adult';

interface CustomPackingItem extends PackingItem {
  isCustom?: boolean;
}

interface AppState {
  activeSection: SectionId;
  activeDay: number;
  activeFoodCategory: FoodCategory;
  transitGroup: TransitGroup;
  fareMode: FareMode;
  jpyToTwd: number;
  budgetJpy: Record<string, number>;
  checkedIds: Record<string, boolean>;
  customPackingItems: CustomPackingItem[];
}

const STORAGE_KEYS = {
  rate: 'kyoto_trip_2026_fx_rate',
  budget: 'kyoto_trip_2026_budget_jpy',
  checklist: 'kyoto_trip_2026_checklist_checked',
  customItems: 'kyoto_trip_2026_checklist_custom',
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatNum(n: number): string {
  return Math.round(n).toLocaleString('zh-TW');
}

function loadSavedJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota or private mode restrictions
  }
}

function buildDefaultBudget(): Record<string, number> {
  const map: Record<string, number> = {};
  for (const item of BUDGET_CATEGORIES) {
    map[item.id] = item.defaultJpy;
  }
  return map;
}

const savedRateRaw = Number(window.localStorage.getItem(STORAGE_KEYS.rate));
const initialRate =
  Number.isFinite(savedRateRaw) && savedRateRaw > 0.05 && savedRateRaw < 1
    ? savedRateRaw
    : 0.215;

const state: AppState = {
  activeSection: 'overview',
  activeDay: 1,
  activeFoodCategory: '全部',
  transitGroup: 'airport',
  fareMode: 'family',
  jpyToTwd: initialRate,
  budgetJpy: { ...buildDefaultBudget(), ...loadSavedJson<Record<string, number>>(STORAGE_KEYS.budget, {}) },
  checkedIds: loadSavedJson<Record<string, boolean>>(STORAGE_KEYS.checklist, {}),
  customPackingItems: loadSavedJson<CustomPackingItem[]>(STORAGE_KEYS.customItems, []),
};

let transitChartInstance: Chart | null = null;
let budgetChartInstance: Chart | null = null;

function renderImageWithFallback(src: string, alt: string, fallbackTitle: string, className: string): string {
  const safeAlt = escapeHtml(alt);
  const safeFallback = escapeHtml(fallbackTitle);
  return `
    <div class="relative overflow-hidden bg-limestone ${className}">
      <img
        src="${src}"
        alt="${safeAlt}"
        referrerpolicy="no-referrer"
        class="w-full h-full object-cover transition-transform duration-500 ease-out"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
      />
      <div
        style="display:none;"
        class="absolute inset-0 flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-limestone via-parchment to-washi border border-border-washi"
      >
        <span class="font-serif text-base font-medium text-ink">${safeFallback}</span>
        <span class="text-xs text-muted mt-1">冬日京都旅誌 · 2026</span>
      </div>
    </div>
  `;
}

// ============================================================================
// 01. OVERVIEW SECTION
// ============================================================================
function renderOverview(): void {
  const container = document.getElementById('section-overview');
  if (!container) return;

  const dayCardsHtml = DAY_PLANS.map((plan) => {
    const dayIndex = String(plan.day).padStart(2, '0');
    return `
      <button
        type="button"
        data-jump-day="${plan.day}"
        class="group text-left p-5 sm:p-6 bg-washi border border-border-washi hover:border-vermilion/60 transition-colors flex flex-col justify-between gap-4 cursor-pointer"
      >
        <div class="space-y-2.5">
          <div class="flex items-baseline justify-between gap-3 text-xs text-muted tabular-nums">
            <span class="font-mono text-vermilion font-medium">DAY ${dayIndex}</span>
            <span>${escapeHtml(plan.dateLabel)} · ${escapeHtml(plan.weekday)}</span>
          </div>
          <h3 class="font-serif text-lg font-semibold text-ink group-hover:text-vermilion transition-colors leading-snug">
            ${escapeHtml(plan.title)}
          </h3>
          <p class="text-sm text-muted leading-relaxed">
            ${escapeHtml(plan.subtitle)}
          </p>
        </div>
        <div class="pt-3 border-t border-border-washi/80 flex items-center justify-between gap-2 text-xs">
          <span class="text-subtle truncate">${escapeHtml(plan.areaSummary)}</span>
          <span class="text-vermilion font-medium whitespace-nowrap shrink-0">查看時間軸 →</span>
        </div>
      </button>
    `;
  }).join('');

  container.innerHTML = `
    <!-- Editorial Hero Split -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
      <div class="lg:col-span-6 flex flex-col justify-between gap-8 py-1">
        <div class="space-y-5">
          <p class="text-xs sm:text-sm text-muted tracking-wide tabular-nums">
            ${escapeHtml(TRIP_META.dates)} · ${escapeHtml(TRIP_META.duration)} · ${escapeHtml(TRIP_META.party)}
          </p>
          <h1 class="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-tight leading-[1.2] text-ink">
            冬日京都五天四夜：<br />古寺、小鹿、嵐山火車與臨空城
          </h1>
          <p class="text-sm sm:text-base text-muted leading-[1.8] max-w-prose">
            以星野集團 <strong class="font-medium text-ink">OMO3 京都東寺</strong> 為四晚固定據點，串聯近鐵、JR HARUKA 與京都市巴士，為 3 歲與 5 歲寶貝打造適中充實且推車友善的冬日關西行程——從聖誕夜的炭火燒肉弘、奈良公園餵鹿、清水寺晨光、冬季停駛前的嵐山小火車，到回程前暢快採買的臨空城 Outlet。
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-4 pt-2">
          <button
            type="button"
            data-jump-day="1"
            class="px-5 py-2.5 text-sm font-medium text-washi bg-vermilion hover:bg-vermilion-dark rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            開始瀏覽每日時間軸
          </button>
          <button
            type="button"
            data-nav-target="transit"
            class="px-4 py-2.5 text-sm font-medium text-ink border border-border-washi hover:border-ink/40 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            檢視交通比較與費用試算 →
          </button>
        </div>
      </div>

      <div class="lg:col-span-6 flex flex-col">
        <figure class="flex-1 flex flex-col border border-border-washi bg-washi p-2">
          ${renderImageWithFallback(
            IMAGES.hero,
            '京都東山町家與八坂之塔冬日晨景',
            '京都東山冬日晨光',
            'w-full aspect-[16/10] lg:aspect-auto lg:flex-1 lg:min-h-[340px]'
          )}
          <figcaption class="px-2 pt-2.5 pb-1 text-xs text-muted flex items-center justify-between gap-4">
            <span class="font-serif">京都・東山八坂通冬日晨曦</span>
            <span class="font-mono tabular-nums text-subtle">2026.12.25 — 12.29</span>
          </figcaption>
        </figure>
      </div>
    </div>

    <!-- Full-Width Operational Trip Strip -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-border-washi bg-limestone/45 divide-y sm:divide-y-0 sm:divide-x divide-border-washi">
      <div class="p-5 space-y-1.5">
        <p class="text-xs text-subtle">01 · 去回程航班</p>
        <p class="font-serif text-base font-semibold text-ink tabular-nums">CX564 11:15 · CX565 16:15</p>
        <p class="text-xs text-muted">桃園 TPE ⇄ 大阪關西 KIX（國泰航空）</p>
      </div>
      <div class="p-5 space-y-1.5">
        <p class="text-xs text-subtle">02 · 四晚連住據點</p>
        <p class="font-serif text-base font-semibold text-ink">OMO3 京都東寺</p>
        <p class="text-xs text-muted">近鐵東寺站步行 2 分鐘 · 星野集團</p>
      </div>
      <div class="p-5 space-y-1.5">
        <p class="text-xs text-subtle">03 · 移動步調規劃</p>
        <p class="font-serif text-base font-semibold text-ink">大眾運輸為主 · 適中充實</p>
        <p class="text-xs text-muted">全線標註 3 歲與 5 歲推車與休息點</p>
      </div>
      <div class="p-5 space-y-1.5">
        <p class="text-xs text-subtle">04 · 行前必搶預約</p>
        <p class="font-serif text-base font-semibold text-vermilion tabular-nums">燒肉弘 · 小火車 11/28 搶票</p>
        <p class="text-xs text-muted">12/28 為冬季停駛前倒數第二營運日</p>
      </div>
    </div>

    <!-- 5-Day Chapter Directory -->
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border-washi pb-4">
        <div class="space-y-1">
          <p class="text-xs text-vermilion font-medium">01. 五日章節總覽</p>
          <h2 class="font-serif text-2xl sm:text-3xl font-semibold text-ink">點擊任一日直接進入詳細時間軸</h2>
        </div>
        <p class="text-xs sm:text-sm text-muted">每日皆附點對點大眾運輸時間與 Google Maps 導航</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        ${dayCardsHtml}
      </div>
    </div>

    <!-- Curated Visual Highlights (3-Column Magazine Strip) -->
    <div class="space-y-6">
      <div class="border-b border-border-washi pb-4 space-y-1">
        <p class="text-xs text-vermilion font-medium">02. 本趟三大必訪亮點</p>
        <h2 class="font-serif text-2xl sm:text-3xl font-semibold text-ink">從炭火和牛到保津川冬日鐵道</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <article class="border border-border-washi bg-washi flex flex-col">
          ${renderImageWithFallback(IMAGES.yakiniku, '京都炭火和牛燒肉弘', '京の焼肉処 弘', 'w-full aspect-[4/3]')}
          <div class="p-5 flex-1 flex flex-col justify-between gap-4">
            <div class="space-y-2">
              <p class="text-xs text-muted">Day 1 晚餐 · 京都車站八條口</p>
              <h3 class="font-serif text-lg font-semibold text-ink">京の焼肉処 弘 聖誕夜和牛</h3>
              <p class="text-sm text-muted leading-relaxed">
                京都精肉老舖直營，一整頭買入的黑毛和牛入口即化。點上姿切拼盤與熱騰騰海帶湯拌飯，大人小孩都滿足。
              </p>
            </div>
            <button
              type="button"
              data-nav-target="food"
              class="self-start text-xs font-medium text-vermilion hover:text-vermilion-dark cursor-pointer"
            >
              前往美食地圖看預約細節 →
            </button>
          </div>
        </article>

        <article class="border border-border-washi bg-washi flex flex-col">
          ${renderImageWithFallback(IMAGES.nara, '奈良公園冬日杉林與小鹿', '奈良公園與東大寺', 'w-full aspect-[4/3]')}
          <div class="p-5 flex-1 flex flex-col justify-between gap-4">
            <div class="space-y-2">
              <p class="text-xs text-muted">Day 2 一日遊 · 近鐵東寺直達優勢</p>
              <h3 class="font-serif text-lg font-semibold text-ink">奈良公園餵鹿與東大寺大佛</h3>
              <p class="text-sm text-muted leading-relaxed">
                從飯店旁的近鐵東寺站搭車免繞遠路，出近鐵奈良站即達平緩公園草坪，大佛殿無障礙木坡道推車暢行無阻。
              </p>
            </div>
            <button
              type="button"
              data-jump-day="2"
              class="self-start text-xs font-medium text-vermilion hover:text-vermilion-dark cursor-pointer"
            >
              查看 Day 2 奈良時間軸 →
            </button>
          </div>
        </article>

        <article class="border border-border-washi bg-washi flex flex-col">
          ${renderImageWithFallback(IMAGES.arashiyama, '嵐山嵯峨野小火車沿保津川行駛', '嵯峨野嵐山小火車', 'w-full aspect-[4/3]')}
          <div class="p-5 flex-1 flex flex-col justify-between gap-4">
            <div class="space-y-2">
              <p class="text-xs text-muted">Day 4 一日遊 · 順行不折返動線</p>
              <h3 class="font-serif text-lg font-semibold text-ink">嵯峨野小火車與冬日嵐山竹林</h3>
              <p class="text-sm text-muted leading-relaxed">
                先搭 JR 至馬堀站再由龜岡搭復古小火車回嵐山站，下車即接竹林小徑、天龍寺與渡月橋，全程順行最省腳力。
              </p>
            </div>
            <button
              type="button"
              data-jump-day="4"
              class="self-start text-xs font-medium text-vermilion hover:text-vermilion-dark cursor-pointer"
            >
              查看 Day 4 嵐山時間軸 →
            </button>
          </div>
        </article>
      </div>
    </div>
  `;
}

// ============================================================================
// 02. TRANSIT, ACCOMMODATION & CHARTS SECTION
// ============================================================================
function renderTransitSection(): void {
  const container = document.getElementById('section-transit');
  if (!container) return;

  const h = TRIP_META.hotel;
  const ob = TRIP_META.outboundFlight;
  const ib = TRIP_META.inboundFlight;

  container.innerHTML = `
    <!-- Section Title -->
    <div class="border-b border-border-washi pb-5 space-y-2">
      <p class="text-xs text-vermilion font-medium">02. 交通住宿與數據分析</p>
      <h1 class="font-serif text-2xl sm:text-3xl font-semibold text-ink">航班、OMO3 住宿攻略與交通費用試算</h1>
      <p class="text-sm text-muted max-w-2xl leading-relaxed">
        完整統整國泰航空去回程時刻、星野集團 OMO3 京都東寺動線優勢，並透過 Chart.js 互動圖表比較各區段交通時間與兩大兩小實際花費。
      </p>
    </div>

    <!-- Flight & Hotel Two-Column Architectural Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Flights -->
      <div class="lg:col-span-6 border border-border-washi bg-washi p-6 space-y-6">
        <div class="flex items-baseline justify-between border-b border-border-washi pb-3">
          <h2 class="font-serif text-xl font-semibold text-ink">確認航班資訊</h2>
          <span class="text-xs text-muted">國泰航空 · 桃園 ⇄ 關西</span>
        </div>

        <div class="space-y-5">
          <!-- Outbound -->
          <div class="p-4 bg-limestone/60 border border-border-washi/80 space-y-2.5">
            <div class="flex items-center justify-between text-xs text-muted tabular-nums">
              <span class="font-medium text-vermilion">去程 · ${escapeHtml(ob.date)}</span>
              <span class="font-mono font-medium text-ink">${escapeHtml(ob.code)}</span>
            </div>
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="font-mono text-2xl font-semibold text-ink tabular-nums">${escapeHtml(ob.depTime)}</p>
                <p class="text-xs text-muted mt-0.5">${escapeHtml(ob.depAirport)}</p>
              </div>
              <div class="flex-1 text-center px-2">
                <p class="text-[11px] text-subtle">${escapeHtml(ob.duration)}</p>
                <div class="h-px bg-border-washi my-1"></div>
                <p class="text-[11px] text-subtle">直飛 →</p>
              </div>
              <div class="text-right">
                <p class="font-mono text-2xl font-semibold text-ink tabular-nums">${escapeHtml(ob.arrTime)}</p>
                <p class="text-xs text-muted mt-0.5">${escapeHtml(ob.arrAirport)}</p>
              </div>
            </div>
          </div>

          <!-- Inbound -->
          <div class="p-4 bg-limestone/60 border border-border-washi/80 space-y-2.5">
            <div class="flex items-center justify-between text-xs text-muted tabular-nums">
              <span class="font-medium text-indigo-kyoto">回程 · ${escapeHtml(ib.date)}</span>
              <span class="font-mono font-medium text-ink">${escapeHtml(ib.code)}</span>
            </div>
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="font-mono text-2xl font-semibold text-ink tabular-nums">${escapeHtml(ib.depTime)}</p>
                <p class="text-xs text-muted mt-0.5">${escapeHtml(ib.depAirport)}</p>
              </div>
              <div class="flex-1 text-center px-2">
                <p class="text-[11px] text-subtle">${escapeHtml(ib.duration)}</p>
                <div class="h-px bg-border-washi my-1"></div>
                <p class="text-[11px] text-subtle">直飛 →</p>
              </div>
              <div class="text-right">
                <p class="font-mono text-2xl font-semibold text-ink tabular-nums">${escapeHtml(ib.arrTime)}</p>
                <p class="text-xs text-muted mt-0.5">${escapeHtml(ib.arrAirport)}</p>
              </div>
            </div>
          </div>
        </div>

        <p class="text-xs text-muted leading-relaxed">
          親子搭機貼士：3 歲與 5 歲皆為獨立佔位兒童票，請提前於國泰航空官網預訂兒童餐（CHML）並預選四連座；折疊推車辦理登機時可申請機邊托運（Gate Check）。
        </p>
      </div>

      <!-- Accommodation -->
      <div class="lg:col-span-6 border border-border-washi bg-washi p-6 flex flex-col justify-between gap-6">
        <div class="space-y-4">
          <div class="flex items-baseline justify-between border-b border-border-washi pb-3">
            <h2 class="font-serif text-xl font-semibold text-ink">四晚住宿據點</h2>
            <span class="text-xs text-muted">Day 1 — Day 4 連住免換飯店</span>
          </div>

          <div class="space-y-1">
            <h3 class="font-serif text-lg font-semibold text-ink">${escapeHtml(h.name)}</h3>
            <p class="text-xs text-subtle">${escapeHtml(h.jpName)}</p>
          </div>

          <dl class="divide-y divide-border-washi/70 text-sm">
            <div class="py-2.5 flex flex-col sm:flex-row sm:gap-4">
              <dt class="text-xs text-subtle sm:w-24 shrink-0">住宿期間</dt>
              <dd class="text-ink tabular-nums">${escapeHtml(h.nights)}</dd>
            </div>
            <div class="py-2.5 flex flex-col sm:flex-row sm:gap-4">
              <dt class="text-xs text-subtle sm:w-24 shrink-0">交通位置</dt>
              <dd class="text-ink">${escapeHtml(h.access)}</dd>
            </div>
            <div class="py-2.5 flex flex-col sm:flex-row sm:gap-4">
              <dt class="text-xs text-subtle sm:w-24 shrink-0">飯店地址</dt>
              <dd class="text-muted text-xs sm:text-sm">${escapeHtml(h.address)}</dd>
            </div>
          </dl>

          <ul class="space-y-2 pt-1 text-xs sm:text-sm text-muted leading-relaxed">
            ${h.highlights
              .map(
                (item, idx) =>
                  `<li class="flex items-start gap-2.5"><span class="font-mono text-xs text-vermilion mt-0.5">0${idx + 1}</span><span>${escapeHtml(item)}</span></li>`
              )
              .join('')}
          </ul>
        </div>

        <div class="pt-4 border-t border-border-washi flex flex-wrap items-center gap-4 text-xs font-medium">
          <a
            href="${h.mapUrl}"
            target="_blank"
            rel="noopener noreferrer"
            class="text-vermilion hover:text-vermilion-dark transition-colors"
          >
            開啟飯店 Google Maps ↗
          </a>
          <span class="text-border-washi" aria-hidden="true">|</span>
          <a
            href="${h.fromKyotoStationUrl}"
            target="_blank"
            rel="noopener noreferrer"
            class="text-ink hover:text-vermilion transition-colors"
          >
            京都車站 → 飯店轉乘路線 ↗
          </a>
        </div>
      </div>
    </div>

    <!-- Chart.js Interactive Transit Comparison -->
    <div class="border border-border-washi bg-washi p-6 sm:p-8 space-y-6">
      <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-border-washi pb-5">
        <div class="space-y-1">
          <p class="text-xs text-vermilion font-medium">Chart.js 互動交通分析</p>
          <h2 class="font-serif text-xl sm:text-2xl font-semibold text-ink">交通時間與費用比較圖</h2>
          <p class="text-xs sm:text-sm text-muted">
            滑鼠懸停或點擊長條可檢視 3 歲與 5 歲免費規則及親子推薦理由。
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <!-- Route Group Switcher -->
          <div class="inline-flex p-1 bg-limestone border border-border-washi rounded-md text-xs font-medium">
            <button
              type="button"
              data-transit-group="airport"
              class="transit-group-btn px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              關西機場 ⇄ 京都
            </button>
            <button
              type="button"
              data-transit-group="suburban"
              class="transit-group-btn px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              近郊移動（奈良・嵐山）
            </button>
          </div>

          <!-- Fare Mode Switcher -->
          <div class="inline-flex p-1 bg-limestone border border-border-washi rounded-md text-xs font-medium">
            <button
              type="button"
              data-fare-mode="family"
              class="fare-mode-btn px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              2大2小家庭總計
            </button>
            <button
              type="button"
              data-fare-mode="adult"
              class="fare-mode-btn px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              單人成人票價
            </button>
          </div>
        </div>
      </div>

      <!-- Chart Canvas -->
      <div class="relative w-full h-[320px] sm:h-[360px]">
        <canvas id="transit-comparison-chart" aria-label="交通方案時間與費用比較圖"></canvas>
      </div>

      <!-- Companion Structured Data Table -->
      <div class="overflow-x-auto border-t border-border-washi pt-5">
        <table class="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr class="border-b border-border-washi text-subtle">
              <th class="py-2.5 pr-4 font-medium">交通方案</th>
              <th class="py-2.5 px-3 font-medium text-right whitespace-nowrap">預估耗時</th>
              <th class="py-2.5 px-3 font-medium text-right whitespace-nowrap" id="transit-table-fare-header">單趟家庭總價</th>
              <th class="py-2.5 pl-4 font-medium">3 歲與 5 歲兒童規則與建議</th>
            </tr>
          </thead>
          <tbody id="transit-table-body" class="divide-y divide-border-washi/70"></tbody>
        </table>
      </div>
    </div>

    <!-- Interactive Family Budget & JPY/TWD Live Calculator -->
    <div id="budget-calculator-anchor" class="border border-border-washi bg-washi p-6 sm:p-8 space-y-6 scroll-mt-24">
      <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-border-washi pb-5">
        <div class="space-y-1">
          <p class="text-xs text-vermilion font-medium">即時旅費試算 · 自動儲存</p>
          <h2 class="font-serif text-xl sm:text-2xl font-semibold text-ink">五日當地花費與日圓／台幣即時換算</h2>
          <p class="text-xs sm:text-sm text-muted">
            不含機票與四晚住宿之日本當地預估花費（2 大 2 小），可直接修改匯率或各項日圓預算，圖表與台幣總計將同步更新。
          </p>
        </div>

        <!-- Exchange Rate Controls -->
        <div class="flex flex-wrap items-center gap-2.5 text-xs">
          <label for="fx-rate-input" class="text-muted font-medium whitespace-nowrap">1 日圓 (JPY) =</label>
          <input
            id="fx-rate-input"
            type="number"
            step="0.001"
            min="0.1"
            max="0.5"
            value="${state.jpyToTwd}"
            class="w-24 px-2.5 py-1.5 bg-washi border border-border-washi rounded font-mono text-ink text-right tabular-nums focus:border-vermilion"
          />
          <span class="text-muted">台幣 (TWD)</span>
          <div class="inline-flex items-center gap-1 ml-1">
            <button type="button" data-fx-preset="0.205" class="fx-preset-btn px-2 py-1 border border-border-washi rounded text-muted hover:text-ink hover:border-ink/40 font-mono tabular-nums cursor-pointer">0.205</button>
            <button type="button" data-fx-preset="0.215" class="fx-preset-btn px-2 py-1 border border-border-washi rounded text-muted hover:text-ink hover:border-ink/40 font-mono tabular-nums cursor-pointer">0.215</button>
            <button type="button" data-fx-preset="0.225" class="fx-preset-btn px-2 py-1 border border-border-washi rounded text-muted hover:text-ink hover:border-ink/40 font-mono tabular-nums cursor-pointer">0.225</button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Editable Line Items -->
        <div class="lg:col-span-7 space-y-4">
          <div id="budget-rows-container" class="divide-y divide-border-washi border-y border-border-washi"></div>

          <!-- Totals Summary Bar -->
          <div class="p-4 sm:p-5 bg-limestone/70 border border-border-washi flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p class="text-xs text-subtle">五日當地總預算預估（2 大 2 小）</p>
              <p class="text-xs text-muted mt-0.5">可依實際購物需求隨時調整左側各分類日圓金額</p>
            </div>
            <div class="flex items-baseline gap-5 sm:text-right">
              <div>
                <p class="text-[11px] text-subtle">日圓合計</p>
                <p id="budget-total-jpy" class="font-mono text-lg sm:text-xl font-semibold text-ink tabular-nums">¥0</p>
              </div>
              <div>
                <p class="text-[11px] text-vermilion">換算台幣約</p>
                <p id="budget-total-twd" class="font-mono text-xl sm:text-2xl font-semibold text-vermilion tabular-nums">NT$ 0</p>
              </div>
            </div>
          </div>

          <div class="flex justify-end">
            <button
              type="button"
              id="reset-budget-btn"
              class="text-xs text-muted hover:text-vermilion underline underline-offset-4 cursor-pointer"
            >
              恢復預設建議預算與匯率
            </button>
          </div>
        </div>

        <!-- Doughnut Chart -->
        <div class="lg:col-span-5 border border-border-washi bg-limestone/35 p-5 flex flex-col items-center gap-4">
          <div class="w-full flex items-baseline justify-between">
            <h3 class="font-serif text-base font-semibold text-ink">旅費結構占比</h3>
            <span class="text-xs text-muted font-mono tabular-nums" id="budget-rate-badge">匯率 0.215</span>
          </div>
          <div class="relative w-full max-w-[290px] h-[270px]">
            <canvas id="budget-doughnut-chart" aria-label="五日旅費類別占比圖"></canvas>
          </div>
          <p class="text-xs text-muted text-center leading-relaxed">
            善用日本「未滿 6 歲免費搭乘大眾運輸」規則，當地交通僅需計算 2 位成人票價（嵐山小火車若另加購兒童座僅增 ¥880）。
          </p>
        </div>
      </div>
    </div>
  `;

  updateTransitControlsUI();
  renderTransitTable();
  renderBudgetRows();
  bindTransitSectionEvents();
  initOrUpdateTransitChart();
  initOrUpdateBudgetChart();
}

function getFilteredTransitOptions() {
  return TRANSIT_COMPARISONS.filter((o) => o.group === state.transitGroup);
}

function updateTransitControlsUI(): void {
  document.querySelectorAll<HTMLButtonElement>('.transit-group-btn').forEach((btn) => {
    const active = btn.dataset.transitGroup === state.transitGroup;
    btn.className = `transit-group-btn px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
      active ? 'bg-washi text-ink shadow-xs' : 'text-muted hover:text-ink'
    }`;
  });
  document.querySelectorAll<HTMLButtonElement>('.fare-mode-btn').forEach((btn) => {
    const active = btn.dataset.fareMode === state.fareMode;
    btn.className = `fare-mode-btn px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
      active ? 'bg-washi text-ink shadow-xs' : 'text-muted hover:text-ink'
    }`;
  });
}

function renderTransitTable(): void {
  const tbody = document.getElementById('transit-table-body');
  const fareHeader = document.getElementById('transit-table-fare-header');
  if (!tbody) return;
  if (fareHeader) {
    fareHeader.textContent = state.fareMode === 'family' ? '單趟家庭總價 (2大2小)' : '單趟成人票價';
  }

  const options = getFilteredTransitOptions();
  tbody.innerHTML = options
    .map((opt) => {
      const fare = state.fareMode === 'family' ? opt.familyFareJpy : opt.adultFareJpy;
      const twd = Math.round(fare * state.jpyToTwd);
      return `
        <tr class="${opt.recommended ? 'bg-vermilion-tint/45' : ''}">
          <td class="py-3 pr-4 align-top">
            <div class="font-medium text-ink">${escapeHtml(opt.label)}</div>
            ${opt.recommended ? '<div class="text-[11px] text-vermilion font-medium mt-0.5">本行程採納方案</div>' : ''}
          </td>
          <td class="py-3 px-3 text-right align-top font-mono tabular-nums text-ink whitespace-nowrap">
            ${opt.durationMin} 分鐘
          </td>
          <td class="py-3 px-3 text-right align-top font-mono tabular-nums whitespace-nowrap">
            <div class="text-ink font-medium">¥${formatNum(fare)}</div>
            <div class="text-[11px] text-subtle">約 NT$ ${formatNum(twd)}</div>
          </td>
          <td class="py-3 pl-4 align-top text-xs text-muted leading-relaxed">
            <div class="text-ink">${escapeHtml(opt.childRule)}</div>
            <div class="mt-0.5">${escapeHtml(opt.note)}</div>
          </td>
        </tr>
      `;
    })
    .join('');
}

function initOrUpdateTransitChart(): void {
  const canvas = document.getElementById('transit-comparison-chart') as HTMLCanvasElement | null;
  if (!canvas) return;

  const options = getFilteredTransitOptions();
  const labels = options.map((o) => o.shortLabel);
  const durations = options.map((o) => o.durationMin);
  const fares = options.map((o) => (state.fareMode === 'family' ? o.familyFareJpy : o.adultFareJpy));
  const fareLabel = state.fareMode === 'family' ? '家庭單趟車資（日圓）' : '成人單趟車資（日圓）';

  if (transitChartInstance) {
    transitChartInstance.destroy();
    transitChartInstance = null;
  }

  transitChartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: '預估耗時（分鐘）',
          data: durations,
          backgroundColor: '#2B4C7E',
          borderRadius: 3,
          yAxisID: 'yDuration',
          maxBarThickness: 42,
        },
        {
          label: fareLabel,
          data: fares,
          backgroundColor: '#9E2A2B',
          borderRadius: 3,
          yAxisID: 'yFare',
          maxBarThickness: 42,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            color: '#1C1917',
            font: { family: '"Noto Sans TC", sans-serif', size: 12 },
            boxWidth: 12,
            boxHeight: 12,
          },
        },
        tooltip: {
          backgroundColor: '#1C1917',
          titleColor: '#FBF9F5',
          bodyColor: '#F3EFE6',
          padding: 12,
          cornerRadius: 4,
          titleFont: { family: '"Noto Serif TC", serif', size: 13 },
          bodyFont: { family: '"Noto Sans TC", sans-serif', size: 12 },
          callbacks: {
            title: (items) => {
              const idx = items[0]?.dataIndex ?? 0;
              return options[idx]?.label ?? '';
            },
            label: (ctx) => {
              const val = Number(ctx.parsed.y ?? 0);
              if (ctx.dataset.yAxisID === 'yDuration') {
                return ` 預估耗時：${val} 分鐘`;
              }
              const twd = Math.round(val * state.jpyToTwd);
              return ` ${fareLabel}：¥${formatNum(val)}（約 NT$ ${formatNum(twd)}）`;
            },
            afterBody: (items) => {
              const idx = items[0]?.dataIndex ?? 0;
              const opt = options[idx];
              if (!opt) return [];
              return ['', `幼兒規則：${opt.childRule}`, `備註：${opt.note}`];
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#1C1917',
            font: { family: '"Noto Sans TC", sans-serif', size: 12 },
          },
        },
        yDuration: {
          type: 'linear',
          position: 'left',
          beginAtZero: true,
          title: {
            display: true,
            text: '耗時（分鐘）',
            color: '#2B4C7E',
            font: { family: '"Noto Sans TC", sans-serif', size: 11 },
          },
          grid: { color: '#EAE3D5' },
          ticks: {
            color: '#57534E',
            font: { family: '"JetBrains Mono", monospace', size: 11 },
          },
        },
        yFare: {
          type: 'linear',
          position: 'right',
          beginAtZero: true,
          title: {
            display: true,
            text: '車資（JPY）',
            color: '#9E2A2B',
            font: { family: '"Noto Sans TC", sans-serif', size: 11 },
          },
          grid: { drawOnChartArea: false },
          ticks: {
            color: '#57534E',
            font: { family: '"JetBrains Mono", monospace', size: 11 },
            callback: (v) => `¥${Number(v).toLocaleString()}`,
          },
        },
      },
    },
  });
}

function renderBudgetRows(): void {
  const container = document.getElementById('budget-rows-container');
  if (!container) return;

  container.innerHTML = BUDGET_CATEGORIES.map((cat) => {
    const jpy = state.budgetJpy[cat.id] ?? cat.defaultJpy;
    const twd = Math.round(jpy * state.jpyToTwd);
    return `
      <div class="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="space-y-0.5 pr-2">
          <div class="flex items-center gap-2">
            <span class="inline-block w-2.5 h-2.5 shrink-0" style="background-color:${cat.color};"></span>
            <label for="budget-input-${cat.id}" class="text-sm font-medium text-ink">${escapeHtml(cat.label)}</label>
          </div>
          <p class="text-xs text-muted pl-4.5">${escapeHtml(cat.sublabel)}</p>
        </div>

        <div class="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-4.5 sm:pl-0">
          <div class="flex items-center border border-border-washi rounded bg-washi px-2.5 py-1">
            <span class="font-mono text-xs text-subtle mr-1">¥</span>
            <input
              id="budget-input-${cat.id}"
              data-budget-id="${cat.id}"
              type="number"
              min="0"
              step="500"
              value="${jpy}"
              class="budget-jpy-input w-24 text-right font-mono text-sm text-ink tabular-nums focus:outline-none"
            />
          </div>
          <span
            id="budget-twd-${cat.id}"
            class="w-24 text-right font-mono text-sm font-medium text-vermilion tabular-nums"
          >
            NT$ ${formatNum(twd)}
          </span>
        </div>
      </div>
    `;
  }).join('');

  updateBudgetTotalsUI();
}

function updateBudgetTotalsUI(): void {
  let totalJpy = 0;
  for (const cat of BUDGET_CATEGORIES) {
    const val = Math.max(0, Number(state.budgetJpy[cat.id] ?? 0));
    totalJpy += val;
    const twdEl = document.getElementById(`budget-twd-${cat.id}`);
    if (twdEl) {
      twdEl.textContent = `NT$ ${formatNum(val * state.jpyToTwd)}`;
    }
  }

  const totalJpyEl = document.getElementById('budget-total-jpy');
  const totalTwdEl = document.getElementById('budget-total-twd');
  const rateBadge = document.getElementById('budget-rate-badge');

  if (totalJpyEl) totalJpyEl.textContent = `¥${formatNum(totalJpy)}`;
  if (totalTwdEl) totalTwdEl.textContent = `NT$ ${formatNum(totalJpy * state.jpyToTwd)}`;
  if (rateBadge) rateBadge.textContent = `匯率 ${state.jpyToTwd.toFixed(3)}`;
}

function initOrUpdateBudgetChart(): void {
  const canvas = document.getElementById('budget-doughnut-chart') as HTMLCanvasElement | null;
  if (!canvas) return;

  const dataValues = BUDGET_CATEGORIES.map((c) => Math.max(0, Number(state.budgetJpy[c.id] ?? 0)));
  const total = dataValues.reduce((sum, v) => sum + v, 0);

  if (budgetChartInstance) {
    budgetChartInstance.data.datasets[0].data = dataValues;
    budgetChartInstance.update();
    return;
  }

  budgetChartInstance = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: BUDGET_CATEGORIES.map((c) => c.label),
      datasets: [
        {
          data: dataValues,
          backgroundColor: BUDGET_CATEGORIES.map((c) => c.color),
          borderColor: '#FBF9F5',
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '58%',
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: '#1C1917',
          titleColor: '#FBF9F5',
          bodyColor: '#F3EFE6',
          padding: 10,
          cornerRadius: 4,
          callbacks: {
            label: (ctx) => {
              const val = Number(ctx.parsed ?? 0);
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
              const twd = Math.round(val * state.jpyToTwd);
              return ` ¥${formatNum(val)}（NT$ ${formatNum(twd)} · ${pct}%）`;
            },
          },
        },
      },
    },
  });
}

function bindTransitSectionEvents(): void {
  document.querySelectorAll<HTMLButtonElement>('.transit-group-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = btn.dataset.transitGroup as TransitGroup;
      if (next && next !== state.transitGroup) {
        state.transitGroup = next;
        updateTransitControlsUI();
        renderTransitTable();
        initOrUpdateTransitChart();
      }
    });
  });

  document.querySelectorAll<HTMLButtonElement>('.fare-mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = btn.dataset.fareMode as FareMode;
      if (next && next !== state.fareMode) {
        state.fareMode = next;
        updateTransitControlsUI();
        renderTransitTable();
        initOrUpdateTransitChart();
      }
    });
  });

  const fxInput = document.getElementById('fx-rate-input') as HTMLInputElement | null;
  const applyRate = (newRate: number) => {
    if (!Number.isFinite(newRate) || newRate <= 0.05 || newRate >= 1) return;
    state.jpyToTwd = newRate;
    window.localStorage.setItem(STORAGE_KEYS.rate, String(newRate));
    if (fxInput && Number(fxInput.value) !== newRate) {
      fxInput.value = String(newRate);
    }
    updateBudgetTotalsUI();
    renderTransitTable();
    if (budgetChartInstance) budgetChartInstance.update();
    if (transitChartInstance) transitChartInstance.update();
  };

  fxInput?.addEventListener('input', () => {
    const parsed = parseFloat(fxInput.value);
    if (Number.isFinite(parsed) && parsed > 0.05 && parsed < 1) {
      applyRate(parsed);
    }
  });

  document.querySelectorAll<HTMLButtonElement>('.fx-preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const preset = parseFloat(btn.dataset.fxPreset ?? '');
      if (Number.isFinite(preset)) applyRate(preset);
    });
  });

  document.querySelectorAll<HTMLInputElement>('.budget-jpy-input').forEach((input) => {
    input.addEventListener('input', () => {
      const id = input.dataset.budgetId;
      if (!id) return;
      const val = Math.max(0, Number(input.value) || 0);
      state.budgetJpy[id] = val;
      saveJson(STORAGE_KEYS.budget, state.budgetJpy);
      updateBudgetTotalsUI();
      initOrUpdateBudgetChart();
    });
  });

  const resetBtn = document.getElementById('reset-budget-btn');
  resetBtn?.addEventListener('click', () => {
    state.jpyToTwd = 0.215;
    state.budgetJpy = buildDefaultBudget();
    window.localStorage.setItem(STORAGE_KEYS.rate, String(state.jpyToTwd));
    saveJson(STORAGE_KEYS.budget, state.budgetJpy);
    if (fxInput) fxInput.value = '0.215';
    renderBudgetRows();
    bindBudgetInputListenersOnly();
    renderTransitTable();
    initOrUpdateBudgetChart();
    initOrUpdateTransitChart();
  });
}

function bindBudgetInputListenersOnly(): void {
  document.querySelectorAll<HTMLInputElement>('.budget-jpy-input').forEach((input) => {
    input.addEventListener('input', () => {
      const id = input.dataset.budgetId;
      if (!id) return;
      const val = Math.max(0, Number(input.value) || 0);
      state.budgetJpy[id] = val;
      saveJson(STORAGE_KEYS.budget, state.budgetJpy);
      updateBudgetTotalsUI();
      initOrUpdateBudgetChart();
    });
  });
}

// ============================================================================
// 03. DAILY ITINERARY TIMELINE SECTION
// ============================================================================
function renderItinerarySection(): void {
  const container = document.getElementById('section-itinerary');
  if (!container) return;

  const plan = DAY_PLANS.find((d) => d.day === state.activeDay) ?? DAY_PLANS[0];

  const dayTabsHtml = DAY_PLANS.map((d) => {
    const active = d.day === plan.day;
    return `
      <button
        type="button"
        data-select-day="${d.day}"
        class="px-4 py-2.5 text-xs sm:text-sm font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
          active
            ? 'bg-vermilion text-washi'
            : 'bg-washi text-muted border border-border-washi hover:text-ink hover:border-ink/40'
        }"
      >
        Day ${d.day} · ${escapeHtml(d.dateLabel)}
      </button>
    `;
  }).join('');

  const stopsHtml = plan.stops
    .map((stop, idx) => {
      const isLast = idx === plan.stops.length - 1;
      const nextTransitHtml = stop.nextTransit
        ? `
          <div class="mt-4 ml-0 sm:ml-2 border border-dashed border-border-washi bg-limestone/65 px-4 py-3.5 space-y-2">
            <div class="flex flex-wrap items-baseline justify-between gap-2 text-xs">
              <span class="font-medium text-indigo-kyoto">
                下一段移動 → ${escapeHtml(stop.nextTransit.method)}
              </span>
              <span class="font-mono text-ink tabular-nums">
                預估 ${escapeHtml(stop.nextTransit.duration)}
              </span>
            </div>
            <p class="text-xs sm:text-sm text-ink leading-relaxed">
              ${escapeHtml(stop.nextTransit.routeSummary)}
            </p>
            <div class="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
              <span class="text-muted">${escapeHtml(stop.nextTransit.costNote)}</span>
              <a
                href="${stop.nextTransit.routeMapUrl}"
                target="_blank"
                rel="noopener noreferrer"
                class="font-medium text-vermilion hover:text-vermilion-dark transition-colors whitespace-nowrap shrink-0"
              >
                開啟 Google Maps 路線規劃 ↗
              </a>
            </div>
          </div>
        `
        : '';

      return `
        <li class="relative pl-6 sm:pl-28 pb-8 ${isLast ? 'pb-0' : ''}">
          <!-- Vertical Hairline Rail -->
          ${
            !isLast
              ? '<div aria-hidden="true" class="absolute left-[5px] sm:left-[88px] top-3 bottom-0 w-px bg-border-washi"></div>'
              : ''
          }

          <!-- Architectural Timeline Node (Pure CSS Square, zero SVG) -->
          <div
            aria-hidden="true"
            class="absolute left-0 sm:left-[83px] top-1.5 w-[11px] h-[11px] border-2 border-vermilion ${
              stop.highlightTag ? 'bg-vermilion' : 'bg-washi'
            }"
          ></div>

          <!-- Desktop Monospace Timestamp -->
          <div class="hidden sm:block absolute left-0 top-0.5 w-16 text-right font-mono text-sm font-semibold text-ink tabular-nums">
            ${escapeHtml(stop.time)}
          </div>

          <!-- Stop Content Card -->
          <div class="border border-border-washi bg-washi p-5 sm:p-6 space-y-3.5">
            <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
              <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span class="sm:hidden font-mono font-semibold text-ink tabular-nums">${escapeHtml(stop.time)}</span>
                <span class="sm:hidden text-border-washi" aria-hidden="true">·</span>
                <span>${escapeHtml(stop.area)}</span>
                <span aria-hidden="true">·</span>
                <span class="text-ink font-medium">${escapeHtml(stop.stayDuration)}</span>
                ${
                  stop.highlightTag
                    ? `<span aria-hidden="true">·</span><span class="text-vermilion font-semibold">${escapeHtml(stop.highlightTag)}</span>`
                    : ''
                }
              </div>
              <a
                href="${stop.mapUrl}"
                target="_blank"
                rel="noopener noreferrer"
                class="font-medium text-vermilion hover:text-vermilion-dark transition-colors whitespace-nowrap shrink-0"
              >
                Google Maps 定位 ↗
              </a>
            </div>

            <h3 class="font-serif text-lg sm:text-xl font-semibold text-ink leading-snug">
              ${escapeHtml(stop.title)}
            </h3>

            <p class="text-sm text-muted leading-[1.75]">
              ${escapeHtml(stop.description)}
            </p>

            <div class="p-3.5 bg-limestone/60 border border-border-washi/70 text-xs sm:text-sm text-ink leading-relaxed">
              <span class="font-medium text-vermilion mr-1.5">親子與推車貼士：</span>${escapeHtml(stop.kidTip)}
            </div>
          </div>

          ${nextTransitHtml}
        </li>
      `;
    })
    .join('');

  const prevDay = plan.day > 1 ? plan.day - 1 : null;
  const nextDay = plan.day < DAY_PLANS.length ? plan.day + 1 : null;

  container.innerHTML = `
    <!-- Section Header + Day Switcher -->
    <div class="space-y-5 border-b border-border-washi pb-6">
      <div class="space-y-1.5">
        <p class="text-xs text-vermilion font-medium">03. 每日行程時間軸</p>
        <h1 class="font-serif text-2xl sm:text-3xl font-semibold text-ink">五天四夜點對點路線與建議停留時間</h1>
      </div>

      <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1" role="tablist" aria-label="切換日期">
        ${dayTabsHtml}
      </div>
    </div>

    <!-- Active Day Brief Card -->
    <div class="grid grid-cols-1 ${plan.image ? 'lg:grid-cols-12' : ''} gap-6 items-stretch">
      <div class="${plan.image ? 'lg:col-span-7' : ''} border border-border-washi bg-washi p-6 flex flex-col justify-between gap-5">
        <div class="space-y-3">
          <p class="text-xs text-muted tabular-nums">
            DAY 0${plan.day} · 2026/${escapeHtml(plan.dateLabel)}（${escapeHtml(plan.weekday)}） · ${escapeHtml(plan.areaSummary)}
          </p>
          <h2 class="font-serif text-2xl sm:text-3xl font-semibold text-ink leading-tight">
            ${escapeHtml(plan.title)}
          </h2>
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div class="p-3 bg-limestone/55 border border-border-washi/70 space-y-1">
              <dt class="text-subtle">當日核心交通</dt>
              <dd class="text-ink font-medium">${escapeHtml(plan.transitSummary)}</dd>
            </div>
            <div class="p-3 bg-limestone/55 border border-border-washi/70 space-y-1">
              <dt class="text-subtle">步行強度與氣候</dt>
              <dd class="text-ink font-medium">${escapeHtml(plan.walkingLevel)}</dd>
            </div>
          </dl>
          <p class="text-xs text-muted">${escapeHtml(plan.weatherNote)}</p>
        </div>

        <div class="p-4 bg-vermilion-tint/65 border border-vermilion/25 text-xs sm:text-sm text-ink leading-relaxed">
          <span class="font-semibold text-vermilion mr-1.5">當日關鍵叮嚀：</span>${escapeHtml(plan.keyReminder)}
        </div>
      </div>

      ${
        plan.image
          ? `
        <figure class="lg:col-span-5 border border-border-washi bg-washi p-2 flex flex-col">
          ${renderImageWithFallback(
            plan.image,
            plan.title,
            plan.title,
            'w-full aspect-[4/3] lg:aspect-auto lg:flex-1'
          )}
          <figcaption class="px-2 pt-2.5 pb-1 text-xs text-muted font-serif">
            ${escapeHtml(plan.imageCaption ?? plan.title)}
          </figcaption>
        </figure>
      `
          : ''
      }
    </div>

    <!-- Vertical Timeline -->
    <ol class="pt-2">
      ${stopsHtml}
    </ol>

    <!-- Bottom Day Navigation -->
    <div class="pt-6 border-t border-border-washi flex items-center justify-between gap-4 text-sm">
      ${
        prevDay
          ? `<button type="button" data-select-day="${prevDay}" class="px-4 py-2 border border-border-washi bg-washi hover:border-vermilion text-ink rounded transition-colors cursor-pointer">← 上一天（Day ${prevDay}）</button>`
          : '<span></span>'
      }
      ${
        nextDay
          ? `<button type="button" data-select-day="${nextDay}" class="px-4 py-2 bg-vermilion hover:bg-vermilion-dark text-washi rounded transition-colors cursor-pointer">下一天（Day ${nextDay}） →</button>`
          : `<button type="button" data-nav-target="prep" class="px-4 py-2 bg-vermilion hover:bg-vermilion-dark text-washi rounded transition-colors cursor-pointer">前往行前打包清單 →</button>`
      }
    </div>
  `;

  container.querySelectorAll<HTMLButtonElement>('[data-select-day]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetDay = Number(btn.dataset.selectDay);
      if (targetDay >= 1 && targetDay <= DAY_PLANS.length) {
        state.activeDay = targetDay;
        renderItinerarySection();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  bindInlineNavButtons(container);
}

// ============================================================================
// 04. FOOD MAP SECTION
// ============================================================================
function renderFoodSection(): void {
  const container = document.getElementById('section-food');
  if (!container) return;

  const featured = RESTAURANTS.find((r) => r.featured) ?? RESTAURANTS[0];
  const filtered =
    state.activeFoodCategory === '全部'
      ? RESTAURANTS
      : RESTAURANTS.filter((r) => r.category === state.activeFoodCategory);

  const filterButtonsHtml = FOOD_CATEGORIES.map((cat) => {
    const active = cat === state.activeFoodCategory;
    const count =
      cat === '全部' ? RESTAURANTS.length : RESTAURANTS.filter((r) => r.category === cat).length;
    return `
      <button
        type="button"
        data-food-cat="${escapeHtml(cat)}"
        class="px-3.5 py-2 text-xs sm:text-sm font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
          active
            ? 'bg-vermilion text-washi'
            : 'bg-washi text-muted border border-border-washi hover:text-ink hover:border-ink/40'
        }"
      >
        ${escapeHtml(cat)}（${count}）
      </button>
    `;
  }).join('');

  const cardsHtml =
    filtered.length > 0
      ? filtered
          .map(
            (item) => `
          <article class="border border-border-washi bg-washi p-5 sm:p-6 flex flex-col justify-between gap-4 hover:border-ink/35 transition-colors">
            <div class="space-y-3">
              <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                <span>
                  <strong class="font-medium text-vermilion">${escapeHtml(item.category)}</strong>
                  <span aria-hidden="true"> · </span>
                  ${escapeHtml(item.area)}
                  <span aria-hidden="true"> · </span>
                  ${escapeHtml(item.dayRef)}
                </span>
              </div>

              <div>
                <h3 class="font-serif text-lg sm:text-xl font-semibold text-ink">${escapeHtml(item.name)}</h3>
                <p class="text-xs text-subtle mt-0.5">${escapeHtml(item.jpName)}</p>
              </div>

              <p class="text-sm text-muted leading-relaxed">${escapeHtml(item.description)}</p>

              <dl class="divide-y divide-border-washi/70 text-xs pt-1">
                <div class="py-2 flex flex-col sm:flex-row sm:gap-3">
                  <dt class="text-subtle sm:w-20 shrink-0">推薦必點</dt>
                  <dd class="text-ink font-medium">${escapeHtml(item.mustOrder)}</dd>
                </div>
                <div class="py-2 flex flex-col sm:flex-row sm:gap-3">
                  <dt class="text-subtle sm:w-20 shrink-0">價位預估</dt>
                  <dd class="text-ink font-mono tabular-nums">${escapeHtml(item.priceRangeJpy)}</dd>
                </div>
                <div class="py-2 flex flex-col sm:flex-row sm:gap-3">
                  <dt class="text-subtle sm:w-20 shrink-0">訂位提醒</dt>
                  <dd class="text-muted">${escapeHtml(item.reservation)}</dd>
                </div>
                <div class="py-2 flex flex-col sm:flex-row sm:gap-3">
                  <dt class="text-subtle sm:w-20 shrink-0">親子友善</dt>
                  <dd class="text-ink">${escapeHtml(item.kidNote)}</dd>
                </div>
              </dl>
            </div>

            <div class="pt-3 border-t border-border-washi flex items-center justify-between gap-3">
              <span class="text-xs text-subtle">${escapeHtml(item.area)}</span>
              <a
                href="${item.mapUrl}"
                target="_blank"
                rel="noopener noreferrer"
                class="text-xs sm:text-sm font-medium text-vermilion hover:text-vermilion-dark transition-colors whitespace-nowrap shrink-0"
              >
                開啟 Google Maps 導航 ↗
              </a>
            </div>
          </article>
        `
          )
          .join('')
      : `
        <div class="col-span-full border border-border-washi bg-limestone/40 p-10 text-center space-y-2">
          <p class="font-serif text-lg text-ink">目前此分類尚無餐廳資料</p>
          <p class="text-xs text-muted">請切換回「全部」查看所有京都、奈良與嵐山精選美食。</p>
        </div>
      `;

  container.innerHTML = `
    <!-- Section Title -->
    <div class="border-b border-border-washi pb-5 space-y-2">
      <p class="text-xs text-vermilion font-medium">04. 京都・奈良・嵐山美食地圖</p>
      <h1 class="font-serif text-2xl sm:text-3xl font-semibold text-ink">必吃燒肉弘與親子友善名店清單</h1>
      <p class="text-sm text-muted max-w-2xl leading-relaxed">
        精選沿途順路且適合 3 歲與 5 歲同行享用的京都和牛燒肉、奈良釜飯、東山烏龍麵、嵐山蕎麥麵、老街點心與宇治抹茶名店，每家皆附 Google Maps 一鍵定位。
      </p>
    </div>

    <!-- Must-Eat Editorial Spotlight: Yakiniku Hiro -->
    <article class="grid grid-cols-1 lg:grid-cols-12 border border-border-washi bg-washi items-stretch">
      <div class="lg:col-span-5 p-2 bg-limestone/40">
        ${renderImageWithFallback(
          featured.image ?? IMAGES.yakiniku,
          featured.name,
          featured.name,
          'w-full aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[280px]'
        )}
      </div>
      <div class="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-5">
        <div class="space-y-3">
          <p class="text-xs text-vermilion font-medium">
            本趟指定必吃 · ${escapeHtml(featured.dayRef)} · ${escapeHtml(featured.area)}
          </p>
          <h2 class="font-serif text-2xl sm:text-3xl font-semibold text-ink">${escapeHtml(featured.name)}</h2>
          <p class="text-sm text-muted leading-[1.75]">${escapeHtml(featured.description)}</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div class="p-3.5 bg-limestone/60 border border-border-washi/80 space-y-1">
              <p class="text-subtle">必點招牌</p>
              <p class="text-ink font-medium leading-relaxed">${escapeHtml(featured.mustOrder)}</p>
            </div>
            <div class="p-3.5 bg-limestone/60 border border-border-washi/80 space-y-1">
              <p class="text-subtle">訂位與交通距離</p>
              <p class="text-ink font-medium leading-relaxed">${escapeHtml(featured.reservation)}</p>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border-washi">
          <span class="text-xs font-mono text-muted tabular-nums">${escapeHtml(featured.priceRangeJpy)}</span>
          <a
            href="${featured.mapUrl}"
            target="_blank"
            rel="noopener noreferrer"
            class="px-4 py-2 text-xs sm:text-sm font-medium bg-vermilion hover:bg-vermilion-dark text-washi rounded transition-colors whitespace-nowrap shrink-0"
          >
            開啟燒肉弘 Google Maps ↗
          </a>
        </div>
      </div>
    </article>

    <!-- Category Filter Bar -->
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1" role="group" aria-label="美食分類篩選">
          ${filterButtonsHtml}
        </div>
        <p class="text-xs text-muted tabular-nums shrink-0">
          目前顯示 <strong class="text-ink font-semibold">${filtered.length}</strong> 間推薦店家
        </p>
      </div>

      <!-- Restaurant Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        ${cardsHtml}
      </div>
    </div>
  `;

  container.querySelectorAll<HTMLButtonElement>('[data-food-cat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.foodCat as FoodCategory;
      if (cat && cat !== state.activeFoodCategory) {
        state.activeFoodCategory = cat;
        renderFoodSection();
      }
    });
  });
}

// ============================================================================
// 05. PRE-TRIP PREP & PACKING CHECKLIST SECTION
// ============================================================================
function getAllPackingItems(): CustomPackingItem[] {
  return [...PACKING_ITEMS, ...state.customPackingItems];
}

function renderPrepSection(): void {
  const container = document.getElementById('section-prep');
  if (!container) return;

  const allItems = getAllPackingItems();
  const totalCount = allItems.length;
  const checkedCount = allItems.filter((item) => Boolean(state.checkedIds[item.id])).length;
  const pct = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  const categories = Array.from(new Set(allItems.map((i) => i.category)));

  const groupsHtml = categories
    .map((cat) => {
      const items = allItems.filter((i) => i.category === cat);
      const groupDone = items.filter((i) => Boolean(state.checkedIds[i.id])).length;
      const rowsHtml = items
        .map((item) => {
          const isChecked = Boolean(state.checkedIds[item.id]);
          return `
            <li class="py-3 flex items-start justify-between gap-3">
              <label class="flex items-start gap-3 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  data-pack-id="${escapeHtml(item.id)}"
                  class="washi-checkbox mt-0.5"
                  ${isChecked ? 'checked' : ''}
                />
                <span class="space-y-0.5">
                  <span class="block text-sm ${isChecked ? 'line-through text-subtle' : 'text-ink font-medium'} transition-colors">
                    ${escapeHtml(item.label)}
                  </span>
                  ${
                    item.note
                      ? `<span class="block text-xs text-muted leading-relaxed">${escapeHtml(item.note)}</span>`
                      : ''
                  }
                </span>
              </label>
              ${
                item.isCustom
                  ? `<button type="button" data-delete-pack="${escapeHtml(item.id)}" class="text-xs text-subtle hover:text-vermilion px-1.5 py-0.5 cursor-pointer shrink-0" aria-label="刪除此自訂項目">刪除</button>`
                  : ''
              }
            </li>
          `;
        })
        .join('');

      return `
        <div class="border border-border-washi bg-washi p-5 sm:p-6 space-y-3">
          <div class="flex items-baseline justify-between gap-3 border-b border-border-washi pb-2.5">
            <h3 class="font-serif text-lg font-semibold text-ink">${escapeHtml(cat)}</h3>
            <span class="font-mono text-xs text-muted tabular-nums">${groupDone} / ${items.length}</span>
          </div>
          <ul class="divide-y divide-border-washi/65">
            ${rowsHtml}
          </ul>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <!-- Section Title -->
    <div class="border-b border-border-washi pb-5 space-y-2">
      <p class="text-xs text-vermilion font-medium">05. 行前準備與親子清單</p>
      <h1 class="font-serif text-2xl sm:text-3xl font-semibold text-ink">12 月底冬日京都必備攻略與互動打包清單</h1>
      <p class="text-sm text-muted max-w-2xl leading-relaxed">
        勾選進度與自訂攜帶品項會自動儲存在您的瀏覽器中，方便出發前隨時回來核對，不再遺漏 3 歲與 5 歲幼兒保暖裝備或關鍵搶票日期。
      </p>
    </div>

    <!-- 3 Key Pre-Trip Briefings -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div class="border border-border-washi bg-limestone/45 p-5 space-y-2.5">
        <p class="text-xs font-medium text-vermilion">01 · 關鍵預約時程</p>
        <h2 class="font-serif text-lg font-semibold text-ink">嵐山小火車與燒肉弘</h2>
        <p class="text-xs sm:text-sm text-muted leading-relaxed">
          嵐山小火車（12/28 週一）於乘車前一個月 <strong class="text-ink tabular-nums">2026/11/28 00:00 (JST)</strong> 開放官網售票；燒肉弘八條口店建議 11 月中旬即線上訂妥 12/25 19:00 座席。
        </p>
      </div>
      <div class="border border-border-washi bg-limestone/45 p-5 space-y-2.5">
        <p class="text-xs font-medium text-vermilion">02 · 冬日親子洋蔥穿搭</p>
        <h2 class="font-serif text-lg font-semibold text-ink">室外 2°C–10°C · 室內暖氣強</h2>
        <p class="text-xs sm:text-sm text-muted leading-relaxed">
          京都電車、百貨與餐廳暖氣很足，建議採「透氣發熱衣＋中層刷毛＋防風羽絨」穿法；推車必帶<strong class="text-ink">透明防風雨罩</strong>，在嵐山與臨空城海風中能讓雙寶溫暖小睡。
        </p>
      </div>
      <div class="border border-border-washi bg-limestone/45 p-5 space-y-2.5">
        <p class="text-xs font-medium text-vermilion">03 · 幼兒交通費速查</p>
        <h2 class="font-serif text-lg font-semibold text-ink">3 歲與 5 歲未滿 6 歲規則</h2>
        <p class="text-xs sm:text-sm text-muted leading-relaxed">
          JR、近鐵、京都市巴士與地鐵皆享「1 位大人免費攜帶 1–2 名未滿 6 歲幼兒」優惠；唯搭乘 HARUKA 或嵐山小火車若需獨立座位，才須另購兒童指定席。
        </p>
      </div>
    </div>

    <!-- Interactive Progress & Add Custom Item Panel -->
    <div class="border border-border-washi bg-washi p-5 sm:p-6 space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="space-y-1">
          <h2 class="font-serif text-xl font-semibold text-ink">行前親子打包進度</h2>
          <p class="text-xs text-muted tabular-nums">
            已完成 <strong class="text-ink">${checkedCount}</strong> / ${totalCount} 項（${pct}%）· 變更自動儲存於本機
          </p>
        </div>
        <button
          type="button"
          id="reset-checklist-btn"
          class="self-start sm:self-auto px-3.5 py-1.5 text-xs text-muted border border-border-washi hover:border-vermilion hover:text-vermilion rounded transition-colors cursor-pointer"
        >
          重設勾選進度
        </button>
      </div>

      <!-- Hairline Progress Bar -->
      <div class="w-full h-2 bg-limestone overflow-hidden border border-border-washi/70">
        <div
          class="h-full bg-vermilion transition-all duration-200"
          style="width: ${pct}%;"
          role="progressbar"
          aria-valuenow="${pct}"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>

      <!-- Add Custom Item Form -->
      <form id="add-packing-form" class="pt-2 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <input
          id="custom-pack-input"
          type="text"
          placeholder="新增自訂攜帶項目（例如：小朋友最愛的安撫玩偶、滑雪手套）"
          class="flex-1 px-3.5 py-2 text-sm bg-washi border border-border-washi rounded text-ink placeholder:text-subtle focus:border-vermilion"
        />
        <select
          id="custom-pack-category"
          aria-label="選擇打包分類"
          class="px-3 py-2 text-sm bg-washi border border-border-washi rounded text-ink focus:border-vermilion"
        >
          <option value="證件與交通票券">證件與交通票券</option>
          <option value="出發前關鍵預約">出發前關鍵預約</option>
          <option value="3 歲與 5 歲冬日洋蔥式穿搭">3 歲與 5 歲冬日洋蔥式穿搭</option>
          <option value="親子推車與育兒用品" selected>親子推車與育兒用品</option>
          <option value="大人裝備與電子用品">大人裝備與電子用品</option>
        </select>
        <button
          type="submit"
          class="px-4 py-2 text-sm font-medium bg-vermilion hover:bg-vermilion-dark text-washi rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          新增項目
        </button>
      </form>
      <p id="custom-pack-error" class="hidden text-xs text-vermilion"></p>
    </div>

    <!-- Grouped Checklist Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      ${groupsHtml}
    </div>
  `;

  // Bind checkbox events
  container.querySelectorAll<HTMLInputElement>('[data-pack-id]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const id = checkbox.dataset.packId;
      if (!id) return;
      state.checkedIds[id] = checkbox.checked;
      saveJson(STORAGE_KEYS.checklist, state.checkedIds);
      renderPrepSection();
    });
  });

  // Bind custom item delete events
  container.querySelectorAll<HTMLButtonElement>('[data-delete-pack]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.deletePack;
      if (!id) return;
      state.customPackingItems = state.customPackingItems.filter((item) => item.id !== id);
      delete state.checkedIds[id];
      saveJson(STORAGE_KEYS.customItems, state.customPackingItems);
      saveJson(STORAGE_KEYS.checklist, state.checkedIds);
      renderPrepSection();
    });
  });

  // Bind add custom item form
  const form = document.getElementById('add-packing-form') as HTMLFormElement | null;
  const input = document.getElementById('custom-pack-input') as HTMLInputElement | null;
  const select = document.getElementById('custom-pack-category') as HTMLSelectElement | null;
  const errorEl = document.getElementById('custom-pack-error');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const label = (input?.value ?? '').trim();
    if (!label) {
      if (errorEl) {
        errorEl.textContent = '請先輸入要新增的攜帶項目名稱。';
        errorEl.classList.remove('hidden');
      }
      input?.focus();
      return;
    }
    const category = select?.value || '親子推車與育兒用品';
    state.customPackingItems.push({
      id: `custom-${Date.now()}`,
      category,
      label,
      note: '自訂新增項目',
      isCustom: true,
    });
    saveJson(STORAGE_KEYS.customItems, state.customPackingItems);
    renderPrepSection();
  });

  // Bind reset button
  const resetBtn = document.getElementById('reset-checklist-btn');
  resetBtn?.addEventListener('click', () => {
    state.checkedIds = {};
    saveJson(STORAGE_KEYS.checklist, state.checkedIds);
    renderPrepSection();
  });
}

// ============================================================================
// NAVIGATION & SECTION SWITCHING
// ============================================================================
const ALL_SECTIONS: SectionId[] = ['overview', 'transit', 'itinerary', 'food', 'prep'];

function switchSection(target: SectionId, scrollToElementId?: string): void {
  state.activeSection = target;

  for (const sec of ALL_SECTIONS) {
    const el = document.getElementById(`section-${sec}`);
    if (!el) continue;
    if (sec === target) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  }

  // Update Desktop Nav Styles
  document.querySelectorAll<HTMLButtonElement>('.nav-link').forEach((btn) => {
    const isActive = btn.dataset.navTarget === target;
    btn.className = `nav-link py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
      isActive ? 'border-vermilion text-ink' : 'border-transparent text-muted hover:text-ink'
    }`;
  });

  // Update Mobile Nav Styles
  document.querySelectorAll<HTMLButtonElement>('.nav-link-mobile').forEach((btn) => {
    const isActive = btn.dataset.navTarget === target;
    btn.className = `nav-link-mobile py-1 border-b-2 whitespace-nowrap shrink-0 cursor-pointer ${
      isActive ? 'border-vermilion text-ink' : 'border-transparent text-muted hover:text-ink'
    }`;
  });

  // Ensure Chart.js canvases resize crisply when Transit section becomes visible
  if (target === 'transit') {
    window.requestAnimationFrame(() => {
      initOrUpdateTransitChart();
      if (budgetChartInstance) {
        budgetChartInstance.resize();
        budgetChartInstance.update();
      } else {
        initOrUpdateBudgetChart();
      }
    });
  }

  if (scrollToElementId) {
    window.requestAnimationFrame(() => {
      const anchor = document.getElementById(scrollToElementId);
      if (anchor) {
        anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function bindInlineNavButtons(root: ParentNode): void {
  root.querySelectorAll<HTMLButtonElement>('[data-nav-target]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.navTarget as SectionId;
      if (target && ALL_SECTIONS.includes(target)) {
        switchSection(target);
      }
    });
  });

  root.querySelectorAll<HTMLButtonElement>('[data-jump-day]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const day = Number(btn.dataset.jumpDay);
      if (day >= 1 && day <= DAY_PLANS.length) {
        state.activeDay = day;
        renderItinerarySection();
        switchSection('itinerary');
      }
    });
  });
}

// ============================================================================
// APP BOOTSTRAP
// ============================================================================
function initApp(): void {
  renderOverview();
  renderTransitSection();
  renderItinerarySection();
  renderFoodSection();
  renderPrepSection();

  // Global nav & jump bindings
  bindInlineNavButtons(document);

  // Header primary CTA -> jump straight to live FX & budget calculator
  const headerCta = document.getElementById('header-cta-budget');
  headerCta?.addEventListener('click', () => {
    switchSection('transit', 'budget-calculator-anchor');
  });

  switchSection('overview');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
