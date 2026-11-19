export interface TransitLeg {
  method: string;
  routeSummary: string;
  duration: string;
  costNote: string;
  routeMapUrl: string;
}

export interface TimelineStop {
  time: string;
  title: string;
  area: string;
  stayDuration: string;
  description: string;
  kidTip: string;
  mapUrl: string;
  highlightTag?: string;
  nextTransit?: TransitLeg;
}

export interface DayPlan {
  day: number;
  dateLabel: string;
  weekday: string;
  title: string;
  subtitle: string;
  areaSummary: string;
  transitSummary: string;
  walkingLevel: string;
  weatherNote: string;
  image?: string;
  imageCaption?: string;
  keyReminder: string;
  stops: TimelineStop[];
}

export type FoodCategory =
  | '全部'
  | '燒肉和牛'
  | '京料理正餐'
  | '街頭小吃'
  | '抹茶甜點'
  | '咖啡輕食';

export interface RestaurantItem {
  id: string;
  name: string;
  jpName: string;
  category: Exclude<FoodCategory, '全部'>;
  area: string;
  dayRef: string;
  priceRangeJpy: string;
  reservation: string;
  mustOrder: string;
  kidNote: string;
  description: string;
  mapUrl: string;
  featured?: boolean;
  image?: string;
}

export interface TransitOptionData {
  id: string;
  group: 'airport' | 'suburban';
  label: string;
  shortLabel: string;
  durationMin: number;
  adultFareJpy: number;
  familyFareJpy: number;
  childRule: string;
  recommended?: boolean;
  note: string;
}

export interface BudgetCategoryItem {
  id: string;
  label: string;
  sublabel: string;
  defaultJpy: number;
  color: string;
}

export interface PackingItem {
  id: string;
  category: string;
  label: string;
  note: string;
  defaultChecked?: boolean;
}

const gSearch = (q: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

const gDir = (origin: string, destination: string, mode: 'transit' | 'walking' = 'transit') =>
  `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=${mode}`;

export const IMAGES = {
  hero: '/src/assets/images/kyoto_winter_hero_1795075311425.jpg',
  nara: '/src/assets/images/nara_winter_deer_1795075310628.jpg',
  arashiyama: '/src/assets/images/arashiyama_train_bamboo_1795075310426.jpg',
  yakiniku: '/src/assets/images/kyoto_wagyu_yakiniku_1795075311058.jpg',
};

export const TRIP_META = {
  title: '冬日京都五天四夜親子旅誌',
  dates: '2026/12/25（五）— 2026/12/29（二）',
  duration: '五天四夜',
  party: '2 大 2 小（3 歲、5 歲幼兒）',
  pace: '適中充實 · 大眾運輸為主',
  origin: '台灣桃園國際機場（TPE）',
  destination: '日本京都・奈良・嵐山・臨空城',
  outboundFlight: {
    code: 'CX564',
    airline: '國泰航空 Cathay Pacific',
    date: '2026/12/25（五）',
    depTime: '11:15',
    depAirport: '桃園機場 TPE 第一航廈',
    arrTime: '14:50',
    arrAirport: '關西國際機場 KIX 第一航廈',
    duration: '約 2 小時 35 分鐘',
  },
  inboundFlight: {
    code: 'CX565',
    airline: '國泰航空 Cathay Pacific',
    date: '2026/12/29（二）',
    depTime: '16:15',
    depAirport: '關西國際機場 KIX 第一航廈',
    arrTime: '18:30',
    arrAirport: '桃園機場 TPE 第一航廈',
    duration: '約 3 小時 15 分鐘',
  },
  hotel: {
    name: 'OMO3 京都東寺 by 星野集團',
    jpName: 'OMO3 Kyoto Toji by Hoshino Resorts',
    nights: '連住 4 晚（12/25 入住 — 12/29 退房）',
    address: '601-8414 京都市南區西九條藏王町 11-6',
    access: '近鐵京都線「東寺站」步行 2 分鐘 · JR「京都站」八條口步行約 11 分鐘',
    highlights: [
      '鄰近近鐵東寺站，Day 2 前往奈良免轉車或僅於京都站一站銜接，推車移動輕鬆。',
      '周邊步行 8 分鐘即達 AEON Mall KYOTO，補貨尿布、兒童零食、草莓與晚餐超方便。',
      '大廳設有 OMO Food & Drink Station 24 小時自助輕食，夜晚回飯店買熱飲點心不費力。',
    ],
    mapUrl: gSearch('OMO3 Kyoto Toji by Hoshino Resorts'),
    fromKyotoStationUrl: gDir('Kyoto Station', 'OMO3 Kyoto Toji by Hoshino Resorts', 'transit'),
  },
};

export const DAY_PLANS: DayPlan[] = [
  {
    day: 1,
    dateLabel: '12/25',
    weekday: '週五・聖誕夜',
    title: '抵達關西直奔京都，炭火燒肉弘聖誕夜',
    subtitle: '桃園機場出發 → 關西機場 → HARUKA 特急 → OMO3 京都東寺 → 燒肉弘',
    areaSummary: '關西機場 · 京都車站 · 東寺',
    transitSummary: 'JR HARUKA 特急 ＋ 近鐵京都線 1 站',
    walkingLevel: '輕度步行（適應氣溫）',
    weatherNote: '預估 3°C – 9°C · 夜間降溫快，出關即可幫小孩穿好防風羽絨',
    image: IMAGES.yakiniku,
    imageCaption: 'Fig. 01 — 抵達京都的第一個冬夜，以京の焼肉処 弘的頂級和牛為旅程暖胃開場。',
    keyReminder: '燒肉弘京都站八條口店極度熱門，建議提前 30–45 天線上預訂 19:00 座席；抵達京都站後可直接由八條口換乘近鐵 1 站至東寺站，省去拖行李步行 11 分鐘。',
    stops: [
      {
        time: '11:15',
        title: '桃園機場搭乘國泰航空 CX564 出發',
        area: '桃園機場 TPE 第一航廈',
        stayDuration: '航程約 2 小時 35 分鐘',
        description: '建議 09:00 前抵達機場辦理托運與通關，事先線上選位並預訂兒童餐，機上備妥幼兒安撫小物與水壺。',
        kidTip: '起降時讓 3 歲與 5 歲寶貝喝水或吃米餅減緩耳壓不適；折疊推車可申請機邊托運。',
        mapUrl: gSearch('Taiwan Taoyuan International Airport Terminal 1'),
        nextTransit: {
          method: '國際航班 CX564',
          routeSummary: '桃園機場 TPE → 關西國際機場 KIX 第一航廈（預計 14:50 抵達）',
          duration: '約 2 小時 35 分鐘',
          costNote: '已含於機票內',
          routeMapUrl: gSearch('Kansai International Airport Terminal 1'),
        },
      },
      {
        time: '14:50',
        title: '抵達關西國際機場，入境領行李並兌換 HARUKA 車票',
        area: '關西國際機場 KIX',
        stayDuration: '建議預留 70 分鐘',
        description: '入境審查與領取行李後，走過空橋至「關西機場站」JR 綠色窗口或自動取票機領取事先購買的 HARUKA 遊客優惠票（搭 16:14 或 16:44 班次）。',
        kidTip: '先在 KIX 1F 或車站便利商店買溫熱飲料與小飯糰墊胃；未滿 6 歲不佔位免費，大人抱坐或視空位使用。',
        mapUrl: gSearch('Kansai Airport Station JR'),
        nextTransit: {
          method: 'JR 關西機場特急 HARUKA',
          routeSummary: '關西機場站直達 JR 京都站（30 號月台）',
          duration: '約 75 分鐘',
          costNote: '成人遊客優惠票約 ¥2,200–2,700 · 3歲/5歲不佔位免費',
          routeMapUrl: gDir('Kansai Airport Station', 'Kyoto Station', 'transit'),
        },
      },
      {
        time: '17:35',
        title: '入住 OMO3 京都東寺 by 星野集團',
        area: '京都・東寺站周邊',
        stayDuration: '辦理入住與整頓 60 分鐘',
        description: '於京都站八條口直接轉乘近鐵京都線普通／準急列車僅 1 站（2 分鐘）至「東寺站」，出站步行 2 分鐘即達飯店。放下大行李、換上保暖外出衣並讓孩子稍作喘息。',
        kidTip: 'OMO3 房型精巧溫馨，可向櫃檯確認免費兒童備品與加濕空氣清淨機（京都冬季室內非常乾燥）。',
        mapUrl: gSearch('OMO3 Kyoto Toji by Hoshino Resorts'),
        nextTransit: {
          method: '近鐵京都線 ＋ 步行',
          routeSummary: '近鐵東寺站 → 京都站八條口 → 步行 4 分鐘至燒肉弘',
          duration: '約 10 分鐘',
          costNote: '近鐵單程成人 ¥180 · 幼兒免費',
          routeMapUrl: gDir('OMO3 Kyoto Toji by Hoshino Resorts', 'Kyoto Yakiniku Hiro Hachijoguchi', 'transit'),
        },
      },
      {
        time: '19:00',
        title: '必吃晚餐：京の焼肉処 弘（京都站八條口店）',
        area: '京都車站八條口',
        stayDuration: '建議停留 90 分鐘',
        highlightTag: '必吃預約重點',
        description: '京都精肉老舖直營的人氣和牛燒肉名店！主打「一整頭買入」的黑毛和牛，推薦姿切和牛拼盤、厚切牛舌、壺漬牛肋與熱騰騰的石鍋拌飯，肉質鮮甜且性價比極高。',
        kidTip: '有白飯、海帶蛋花湯與不辣的鹽味燒肉，3 歲與 5 歲小朋友非常喜歡；訂位時可備註攜帶兩位幼兒請求卡座或寬敞座位。',
        mapUrl: gSearch('Kyoto Yakiniku Hiro Hachijoguchi'),
        nextTransit: {
          method: '步行穿越京都車站南北自由通路',
          routeSummary: '八條口 → 京都車站中央口大階梯',
          duration: '約 8 分鐘',
          costNote: '免費步行',
          routeMapUrl: gDir('Kyoto Yakiniku Hiro Hachijoguchi', 'Kyoto Station Grand Staircase', 'walking'),
        },
      },
      {
        time: '20:45',
        title: '京都車站大階梯聖誕燈飾與京都塔夜色（彈性散步）',
        area: '京都車站大樓',
        stayDuration: '建議停留 30 分鐘',
        description: '12/25 正逢聖誕夜，京都車站 4F–11F 大階梯有壯觀的冬季光雕 LED 動畫，可搭手扶梯輕鬆欣賞並遠眺京都塔夜景，之後搭近鐵 1 站回東寺站早點休息。',
        kidTip: '若小孩搭機疲累，可於八條口便利商店買草莓與牛奶後直接回 OMO3 休息，保留體力迎接明天奈良行。',
        mapUrl: gSearch('Kyoto Station Building'),
      },
    ],
  },
  {
    day: 2,
    dateLabel: '12/26',
    weekday: '週六',
    title: '古都奈良餵鹿趣，東大寺與老街慢行',
    subtitle: '近鐵東寺出發 → 奈良公園 → 東大寺大佛殿 → 志津香釜飯 → 春日大社參道 → 中谷堂麻糬',
    areaSummary: '奈良公園 · 東大寺 · 商店街',
    transitSummary: '近鐵京都線直通／轉乘近鐵奈良線（免繞去 JR）',
    walkingLevel: '中度步行（公園路徑平緩好推車）',
    weatherNote: '預估 2°C – 10°C · 公園空曠微風冷，建議戴毛帽手套',
    image: IMAGES.nara,
    imageCaption: 'Fig. 02 — 冬日暖陽穿過千年杉林與青苔石燈籠，近鐵奈良出站步行即抵奈良公園。',
    keyReminder: '住 OMO3 東寺去奈良超順！從近鐵「東寺站」搭車比 JR 更省時，且「近鐵奈良站」出站步行 5 分鐘即達奈良公園，對 3 歲與 5 歲幼兒最友善。',
    stops: [
      {
        time: '08:40',
        title: 'OMO3 東寺出發，搭乘近鐵前往奈良',
        area: '近鐵東寺站',
        stayDuration: '車程約 48 分鐘',
        description: '從飯店步行 2 分鐘至近鐵東寺站，搭乘近鐵京都線急行至「大和西大寺站」同月台轉乘近鐵奈良線直達「近鐵奈良站」（或往京都站搭直達近鐵特急約 35 分鐘）。',
        kidTip: '急行列車班次多且免加購特急券；若想保證全家人連號座位，可於近鐵京都站加購特急券（約 35 分鐘直達）。',
        mapUrl: gSearch('Toji Station Kyoto'),
        nextTransit: {
          method: '近鐵京都線 ＋ 近鐵奈良線',
          routeSummary: '近鐵東寺站 → 大和西大寺轉乘 → 近鐵奈良站（2 號出口有電梯）',
          duration: '約 48 分鐘',
          costNote: '成人單程 ¥760 · 3歲/5歲免費',
          routeMapUrl: gDir('Toji Station Kyoto', 'Kintetsu-Nara Station', 'transit'),
        },
      },
      {
        time: '09:40',
        title: '奈良公園初遇小鹿與餵鹿仙貝體驗',
        area: '奈良公園・登大路園地',
        stayDuration: '建議停留 60 分鐘',
        highlightTag: '雙寶最愛體驗',
        description: '出近鐵奈良站往東步行約 5–7 分鐘即進入奈良公園草坪。冬季鹿毛蓬鬆溫順，可買 1–2 份無糖鹿仙貝（¥200／份）讓孩子近距離體驗小鹿鞠躬討食。',
        kidTip: '切記把鹿仙貝收在大人包內「一片一片拿給小孩餵」，餵完攤開雙手示意外示沒了，避免鹿群圍上來嚇到 3 歲小朋友。',
        mapUrl: gSearch('Nara Park'),
        nextTransit: {
          method: '步行（寬敞平緩石板步道）',
          routeSummary: '奈良公園 → 東大寺南大門 → 大佛殿',
          duration: '約 10 分鐘',
          costNote: '免費步行',
          routeMapUrl: gDir('Nara Park', 'Todai-ji Temple Nara', 'walking'),
        },
      },
      {
        time: '10:50',
        title: '世界遺產：東大寺大佛殿（盧舍那佛）',
        area: '奈良・雜司町',
        stayDuration: '建議停留 75 分鐘',
        description: '穿過氣勢磅礴的南大門與金剛力士像，進入世界最大木造古建築之一「大佛殿」。殿內高達 15 公尺的奈良大佛令人屏息，5 歲哥哥還可排隊體驗鑽過「大佛鼻孔柱洞」祈求平安聰明！',
        kidTip: '大佛殿設有完整的無障礙木坡道，嬰兒推車可一路順推入殿參觀，無須扛樓梯（成人門票 ¥800，未就學幼兒免費）。',
        mapUrl: gSearch('Todai-ji Temple Nara'),
        nextTransit: {
          method: '步行沿大佛殿西側林蔭道',
          routeSummary: '東大寺 → 志津香 公園店（或春日荷茶屋）',
          duration: '約 10 分鐘',
          costNote: '免費步行',
          routeMapUrl: gDir('Todai-ji Temple Nara', 'Shizuka Park Branch Nara', 'walking'),
        },
      },
      {
        time: '12:15',
        title: '午餐：志津香 公園店（現煮奈良七種釜飯）',
        area: '奈良公園西側',
        stayDuration: '建議停留 75 分鐘',
        description: '創立逾半世紀的奈良名店，以大和雞、蝦、穴子與季節野菜現點現炊釜飯，米香四溢、鍋巴酥脆且溫熱清淡，冬日吃來格外暖胃。（若候位過長可彈性改至東向商店街烏龍麵或炸豬排）',
        kidTip: '釜飯鍋身滾燙，請由大人盛入小碗放涼再給 3 歲與 5 歲寶貝享用；店內無預約制，建議 12:00 前抵達抽號。',
        mapUrl: gSearch('Shizuka Park Branch Nara'),
        nextTransit: {
          method: '步行經浮雲園地森林參道',
          routeSummary: '志津香公園店 → 春日大社表參道（視體力至本殿前）',
          duration: '約 15 分鐘',
          costNote: '免費步行（碎石路略顛，可收折推車或慢推）',
          routeMapUrl: gDir('Shizuka Park Branch Nara', 'Kasuga Taisha Shrine Nara', 'walking'),
        },
      },
      {
        time: '13:45',
        title: '春日大社表參道與三千盞石燈籠散步',
        area: '奈良・春日野町',
        stayDuration: '建議停留 60 分鐘',
        description: '漫步於古木參天、朱紅迴廊與青苔石燈籠交織的春日大社參道，感受靜謐冬日神域氛圍；可求一只可愛的「白鹿木雕御神籤」當作雙寶專屬旅行紀念品。',
        kidTip: '參道為碎石子路，推車略吃力；若兩位小朋友想午睡或走累了，可於參道入口與二之鳥居拍照後，直接搭奈良循環公車（¥220）5 分鐘回近鐵奈良站！',
        mapUrl: gSearch('Kasuga Taisha Shrine Nara'),
        nextTransit: {
          method: '奈良交通公車 70/97 號 或 步行',
          routeSummary: '春日大社本殿公車站 → 近鐵奈良站・東向商店街',
          duration: '搭公車約 8 分鐘（步行約 20 分鐘）',
          costNote: '公車成人 ¥220 · 幼兒免費',
          routeMapUrl: gDir('Kasuga Taisha Shrine Nara', 'Nakatanidou Nara', 'transit'),
        },
      },
      {
        time: '15:10',
        title: '東向商店街・中谷堂現搗艾草麻糬與大佛布丁',
        area: '近鐵奈良站前商圈',
        stayDuration: '建議停留 50 分鐘',
        description: '逛有遮雨棚不怕吹風的東向商店街與三条通，看中谷堂師傅高速搗麻糬秀，趁熱品嚐軟糯紅豆艾草麻糬，再買人氣「まほろば大佛布丁」在回程前補充甜甜能量。',
        kidTip: '艾草麻糬微黏，請撕成小小一口給 3 歲幼兒細嚼慢嚥；大佛布丁卡士達口味非常受小朋友歡迎。',
        mapUrl: gSearch('Nakatanidou Nara'),
        nextTransit: {
          method: '近鐵奈良線 ＋ 近鐵京都線',
          routeSummary: '近鐵奈良站 → 近鐵京都站（晚餐）或近鐵東寺站',
          duration: '約 48 分鐘',
          costNote: '成人單程 ¥760 · 幼兒免費',
          routeMapUrl: gDir('Kintetsu-Nara Station', 'Kyoto Station', 'transit'),
        },
      },
      {
        time: '17:30',
        title: '京都車站晚餐：名代豬排 かつくら 或 京都拉麵小路',
        area: '京都車站大樓 10F / 11F',
        stayDuration: '建議停留 75 分鐘',
        description: '回到京都車站直接上樓用餐免吹寒風！推薦京都發跡的「名代豬排（Katsukura）」現磨芝麻香與酥脆腰內豬排，白飯、高麗菜絲與味噌湯均可續碗，全家飽足滿意後搭近鐵一站回飯店。',
        kidTip: '京都車站內哺乳室、兒童廁所與電梯齊全，名代豬排提供兒童餐具且座位寬敞。',
        mapUrl: gSearch('Katsukura Kyoto Station'),
      },
    ],
  },
  {
    day: 3,
    dateLabel: '12/27',
    weekday: '週日',
    title: '古韻東山清水寺，祇園與河原町抹茶巡禮',
    subtitle: '清水寺 → 三年坂・二年坂 → 八坂神社 → 花見小路 → 錦市場與四條河原町',
    areaSummary: '東山清水 · 祇園 · 四條河原町',
    transitSummary: '京都市巴士 206 號 ＋ 地鐵烏丸線／近鐵京都線',
    walkingLevel: '中高步行（含緩坡，附推車平緩繞道提示）',
    weatherNote: '預估 2°C – 9°C · 早晨出發人潮較少、冬陽拍照最美',
    image: IMAGES.hero,
    imageCaption: 'Fig. 03 — 晨曦斜照東山町家木造老街與八坂之塔，是京都最經典的冬日風景。',
    keyReminder: '週日清水寺 10:30 後人潮極多，強烈建議 08:20 前由飯店出發！三年坂與二年坂有石階，推車可由平緩的「清水新道（茶碗坂）→ 八坂通」繞行銜接八坂神社。',
    stops: [
      {
        time: '08:20',
        title: 'OMO3 東寺出發，搭公車直達清水寺山腳',
        area: '京都車站公車總站',
        stayDuration: '交通含步行上坡約 35 分鐘',
        description: '由東寺站搭近鐵 1 站至京都站中央口（或直接於東寺道搭乘市巴士 207 號至「清水道」免換車！），再沿松原通緩步上行 10 分鐘抵達清水寺仁王門。',
        kidTip: '從飯店步行 4 分鐘到「東寺道」公車站搭 207 號可一車直達「清水道」，避開京都車站 D2 月台大排長龍人潮！',
        mapUrl: gSearch('Kiyomizu-michi Bus Stop Kyoto'),
        nextTransit: {
          method: '京都市巴士 207 號（東寺道直達）',
          routeSummary: '東寺道公車站 → 清水道 → 步行上坡至清水寺仁王門',
          duration: '車程 20 分鐘 ＋ 步行 10 分鐘',
          costNote: '市巴士單程成人 ¥230 · 未就學幼兒（1大人可帶2名）免費',
          routeMapUrl: gDir('OMO3 Kyoto Toji by Hoshino Resorts', 'Kiyomizu-dera Kyoto', 'transit'),
        },
      },
      {
        time: '09:00',
        title: '必訪名勝：清水寺（清水舞台・音羽瀑布）',
        area: '京都・東山區',
        stayDuration: '建議停留 90 分鐘',
        highlightTag: '必去世界遺產',
        description: '俯瞰京都盆地與冬日東山群峰的懸空木造「清水舞台」，由 139 根巨木榫接而成未用一根釘子。順著本堂走至奧之院回望舞台全景，下至音羽瀑布體驗三道清泉祈福。',
        kidTip: '清水寺本堂與奧之院動線設有推車坡道，但往音羽瀑布階梯較陡，建議將推車暫停本堂旁或由一位大人輪流照看；成人票 ¥500，學齡前免費。',
        mapUrl: gSearch('Kiyomizu-dera Kyoto'),
        nextTransit: {
          method: '步行下坡（古街巡禮）',
          routeSummary: '清水寺 → 三年坂・二年坂（推車建議走平緩的茶碗坂接八坂通）',
          duration: '邊走邊逛約 20 分鐘',
          costNote: '免費步行',
          routeMapUrl: gDir('Kiyomizu-dera Kyoto', 'Ninenzaka Kyoto', 'walking'),
        },
      },
      {
        time: '10:45',
        title: '三年坂・二年坂町家老街與八坂之塔拍照',
        area: '京都・東山老街',
        stayDuration: '建議停留 75 分鐘',
        description: '漫步於保留江戶與明治風情的石板町家古道，經過著名的榻榻米星巴克、京都七味粉老舖與清水燒陶藝店，於八坂通經典視角拍下全家與五重塔的冬日合影。',
        kidTip: '三年坂階梯較多，推嬰兒車時建議從「茶碗坂」下山接「八坂通」往法觀寺（八坂之塔），路寬平整安全，又能拍到最經典的古塔街景！',
        mapUrl: gSearch('Hokan-ji Yasaka Pagoda Kyoto'),
        nextTransit: {
          method: '步行平緩街道',
          routeSummary: '八坂之塔 → 下河原通／高台寺周邊餐廳',
          duration: '約 8 分鐘',
          costNote: '免費步行',
          routeMapUrl: gDir('Hokan-ji Yasaka Pagoda Kyoto', 'Hisago Kyoto', 'walking'),
        },
      },
      {
        time: '12:00',
        title: '午餐：東山溫暖京風烏龍麵或滑嫩親子丼（ひさご／高台寺周邊）',
        area: '東山・下河原通',
        stayDuration: '建議停留 65 分鐘',
        description: '在冷冽的 12 月午間來一碗京都柴魚高湯熱烏龍麵，或老舖「ひさご（葫蘆）」軟嫩甘甜的炭香雞肉親子丼，溫潤好入口，讓全家人徹底回暖休息。',
        kidTip: '親子丼半熟蛋若需全熟可提前禮貌向店員告知（Well-done / よく焼いてください），附餐清湯適合 3 歲幼兒拌飯。',
        mapUrl: gSearch('Hisago Higashiyama Kyoto'),
        nextTransit: {
          method: '步行穿越石塀小路外圍',
          routeSummary: '下河原通 → 八坂神社南樓門',
          duration: '約 6 分鐘',
          costNote: '免費步行',
          routeMapUrl: gDir('Hisago Higashiyama Kyoto', 'Yasaka Shrine Kyoto', 'walking'),
        },
      },
      {
        time: '13:15',
        title: '八坂神社與祇園花見小路・白川散步',
        area: '京都・祇園',
        stayDuration: '建議停留 60 分鐘',
        description: '參拜京都香火最鼎盛的朱紅「八坂神社」與祈求良緣美貌的「美御前社」，步出西樓門沿四條通轉入古色古香的「花見小路」與「祇園白川」石橋柳岸。',
        kidTip: '提醒小孩在花見小路私人巷道不可奔跑或觸碰木柵欄；走完八坂神社往四條河原町方向皆為平坦寬大的人行道，非常適合推車滑行。',
        mapUrl: gSearch('Yasaka Shrine Kyoto'),
        nextTransit: {
          method: '步行橫越鴨川四條大橋',
          routeSummary: '祇園 → 四條大橋 → 錦市場／四條河原町商圈',
          duration: '約 12 分鐘',
          costNote: '免費步行（亦可搭市巴士 2 站）',
          routeMapUrl: gDir('Yasaka Shrine Kyoto', 'Nishiki Market Kyoto', 'walking'),
        },
      },
      {
        time: '14:40',
        title: '錦市場巡禮與四條河原町抹茶甜點午茶',
        area: '京都・中京區／四條河原町',
        stayDuration: '建議停留 110 分鐘',
        description: '逛有「京都廚房」之稱的全遮雨棚錦市場（必試豆乳甜甜圈、玉子燒與烤仙貝），隨後至「茶寮都路里」或高島屋／大丸百貨品味濃郁宇治抹茶聖代，並輕鬆逛街採買。',
        kidTip: '錦市場內禁止邊走邊吃，須於店家旁指定區域吃完；高島屋與大丸百貨內設有頂級親子育嬰室與暖氣休憩區，是雙寶下午最佳充電站！',
        mapUrl: gSearch('Nishiki Market Kyoto'),
        nextTransit: {
          method: '京都市營地鐵烏丸線 ＋ 近鐵京都線',
          routeSummary: '四條站 → 京都站轉近鐵 1 站 → 東寺站（或直接於京都站晚餐）',
          duration: '約 18 分鐘',
          costNote: '地鐵 ¥220 ＋ 近鐵 ¥180 · 幼兒免費',
          routeMapUrl: gDir('Shijo Station Kyoto', 'OMO3 Kyoto Toji by Hoshino Resorts', 'transit'),
        },
      },
      {
        time: '17:30',
        title: '晚餐：四條河原町京風定食／拉麵後返飯店',
        area: '四條河原町或京都車站',
        stayDuration: '建議停留 75 分鐘',
        description: '於四條河原町品嚐清爽柚香拉麵「麵屋 豬一離れ」或高島屋餐廳層的京都茶泡飯與天婦羅，吃飽後搭地鐵烏丸線轉近鐵一站回 OMO3 東寺，整理戰利品早點歇息。',
        kidTip: '若晚上想省去在四條排隊，也可先搭車回京都站地下街 Porta 用餐，選擇多且離飯店僅一站。',
        mapUrl: gSearch('Kyoto Takashimaya Shopping Center'),
      },
    ],
  },
  {
    day: 4,
    dateLabel: '12/28',
    weekday: '週一',
    title: '冬日嵐山小火車，保津川峽谷與竹林漫遊',
    subtitle: 'JR 馬堀站 → 嵯峨野嵐山小火車 → 竹林小徑 → 天龍寺 → 渡月橋 → AEON Mall KYOTO',
    areaSummary: '龜岡 · 嵐山 · 京都南區',
    transitSummary: 'JR 嵯峨野線 ＋ 嵯峨野觀光小火車（順行不折返）',
    walkingLevel: '中度步行（竹林與河岸全平緩推車友善）',
    weatherNote: '預估 1°C – 8°C · 嵐山峽谷水岸風偏冷，務必戴圍巾與備暖暖包',
    image: IMAGES.arashiyama,
    imageCaption: 'Fig. 04 — 12 月 28 日正值小火車冬季停駛前最後營運週，朱紅列車沿翡翠保津川緩緩前行。',
    keyReminder: '嵐山小火車冬季停駛（12/30–2/28）前倒數第二天營運！務必於 2026/11/28 日本時間 00:00 上網預訂「龜岡 → 嵐山」10:30 左右班次，冬季請選 1–4 號有玻璃窗之車廂防寒！',
    stops: [
      {
        time: '08:45',
        title: 'OMO3 東寺出發，搭 JR 嵯峨野線前往馬堀站',
        area: '京都車站 32/33 號月台',
        stayDuration: '交通含步行轉乘約 50 分鐘',
        description: '由近鐵東寺站搭 1 站至京都站，轉乘 JR 嵯峨野線（山陰本線）普通車至「馬堀站」（約 24 分鐘），出站沿清楚指標穿過田園平路步行約 8 分鐘即抵「小火車龜岡站」。',
        kidTip: '採用「JR 去程至馬堀 → 搭小火車回嵐山」的順行玩法，完全不走回頭路，且龜岡出發往嵐山方向雙號側（C/D 座）前半段面峽谷風景絕佳！',
        mapUrl: gSearch('JR Umahori Station Kyoto'),
        nextTransit: {
          method: '近鐵 1 站 ＋ JR 嵯峨野線 ＋ 步行',
          routeSummary: '東寺站 → 京都站 → JR 馬堀站 → 步行 8 分鐘至小火車龜岡站',
          duration: '約 45 分鐘',
          costNote: '近鐵 ¥180 ＋ JR 成人 ¥330 · 幼兒免費',
          routeMapUrl: gDir('OMO3 Kyoto Toji by Hoshino Resorts', 'Torokko Kameoka Station', 'transit'),
        },
      },
      {
        time: '10:30',
        title: '必體驗：嵯峨野嵐山小火車（龜岡站 → 嵐山站）',
        area: '保津川峽谷',
        stayDuration: '車程約 22 分鐘（建議提早 20 分報到）',
        highlightTag: '必搭指定席',
        description: '搭乘經典復古紅黃配色的嵯峨野觀光列車，伴隨火車汽笛聲與緩慢節奏，近距離俯瞰冬季翠綠深邃的保津川溪谷與奇岩絕壁，在「小火車嵐山站」下車直接接軌竹林！',
        kidTip: '3 歲與 5 歲未滿 6 歲由大人抱坐免費（1 大限帶 1 小），若想坐得更舒服也可加買兒童票（¥440／人）；折疊推車請收摺置於腳邊或車廂置物空間。',
        mapUrl: gSearch('Torokko Kameoka Station'),
        nextTransit: {
          method: '嵯峨野觀光小火車（建議 1–4 號有窗車廂）',
          routeSummary: '小火車龜岡站 → 保津峽 → 小火車嵐山站',
          duration: '約 22 分鐘',
          costNote: '成人單程 ¥880 · 幼兒不佔位免費（佔位 ¥440）',
          routeMapUrl: gDir('Torokko Kameoka Station', 'Torokko Arashiyama Station', 'transit'),
        },
      },
      {
        time: '11:00',
        title: '嵐山竹林小徑與野宮神社',
        area: '京都・右京區嵐山',
        stayDuration: '建議停留 50 分鐘',
        description: '從小火車嵐山站出站就是竹林北側入口，沿途高聳入雲的孟宗竹隨冬風沙沙作響，途經以黑木鳥居聞名的「野宮神社」，感受如詩如畫的京都名景。',
        kidTip: '此段下坡平緩柏油路極為好推車，記得讓孩子抬頭聽聽竹林的風聲，並避開人力車通行車道靠邊行走。',
        mapUrl: gSearch('Arashiyama Bamboo Grove Kyoto'),
        nextTransit: {
          method: '步行平緩林道',
          routeSummary: '野宮神社 → 天龍寺北門',
          duration: '約 4 分鐘',
          costNote: '免費步行',
          routeMapUrl: gDir('Nonomiya Shrine Kyoto', 'Tenryu-ji Temple Kyoto', 'walking'),
        },
      },
      {
        time: '11:55',
        title: '世界遺產：天龍寺曹源池庭園',
        area: '京都・嵯峨天龍寺',
        stayDuration: '建議停留 50 分鐘',
        description: '由北門進入天龍寺，沿百花苑緩步下行至擁有 700 年歷史的「曹源池庭園」，借景後方嵐山與龜山山巒，冬日池水倒影清澈空靈，並由正門走回熱鬧的嵐山大街。',
        kidTip: '只購「庭園參拜票」（成人 ¥500，學齡前免費）即可推車暢遊大部分戶外庭園動線，省去脫鞋進室內穿脫的麻煩！',
        mapUrl: gSearch('Tenryu-ji Temple Kyoto'),
        nextTransit: {
          method: '步行沿嵐山大街往桂川方向',
          routeSummary: '天龍寺正門 → 渡月橋旁「嵐山よしむら」',
          duration: '約 6 分鐘',
          costNote: '免費步行',
          routeMapUrl: gDir('Tenryu-ji Temple Kyoto', 'Arashiyama Yoshimura Kyoto', 'walking'),
        },
      },
      {
        time: '12:50',
        title: '午餐：嵐山よしむら 手打蕎麥麵（河畔渡月橋景）',
        area: '嵐山・渡月橋北岸',
        stayDuration: '建議停留 75 分鐘',
        description: '坐擁桂川與渡月橋正面景觀的人氣名店，每日石臼現磨日本國產蕎麥粉，推薦溫熱湯蕎麥麵搭配炸蝦天婦羅與迷你天丼套餐。（亦可備案選擇「嵐山 稻」京都湯葉豆皮親子定食）',
        kidTip: '若 3 歲或 5 歲對蕎麥過敏，可點選天丼／烏龍麵或改至「嵐山 稻」享用豆皮丼飯與抹茶蕨餅；餐廳備有兒童椅。',
        mapUrl: gSearch('Arashiyama Yoshimura Kyoto'),
        nextTransit: {
          method: '步行沿桂川河岸步道',
          routeSummary: '嵐山よしむら → % Arabica 咖啡 → 渡月橋 → JR 嵯峨嵐山站',
          duration: '漫步約 15 分鐘',
          costNote: '免費步行',
          routeMapUrl: gDir('Arashiyama Yoshimura Kyoto', 'Togetsukyo Bridge Kyoto', 'walking'),
        },
      },
      {
        time: '14:15',
        title: '渡月橋河岸散步、% Arabica 拿鐵與嵐山老街點心',
        area: '嵐山・渡月橋與嵐電足湯商圈',
        stayDuration: '建議停留 75 分鐘',
        description: '買一杯香氣濃郁的 % Arabica 熱拿鐵與熱呼呼的嵐山烤糰子或炸豆腐霜淇淋，在渡月橋畔看水鳥與冬日山景；還可順道至嵐電嵐山站「友禪光林」繽紛和服柱廊拍照！',
        kidTip: '嵐山大街上有不少可愛的角落生物／米飛兔麵包店（Miffy Sakura Kitchen），買個造型紅豆麵包讓兩位小朋友當下午茶超開心！',
        mapUrl: gSearch('Togetsukyo Bridge Kyoto'),
        nextTransit: {
          method: 'JR 嵯峨野線 ＋ 步行',
          routeSummary: 'JR 嵯峨嵐山站 → JR 京都站 → 步行 5 分鐘至 AEON Mall KYOTO',
          duration: '車程 17 分鐘 ＋ 步行 10 分鐘',
          costNote: 'JR 成人 ¥240 · 幼兒免費',
          routeMapUrl: gDir('JR Saga-Arashiyama Station', 'AEON Mall KYOTO', 'transit'),
        },
      },
      {
        time: '16:15',
        title: 'AEON Mall KYOTO 晚餐、藥妝採買與超市草莓補貨',
        area: '京都車站八條西口（距飯店步行 8 分鐘）',
        stayDuration: '建議停留 130 分鐘',
        description: '京都車站旁超好逛的大型親子購物中心！集結 UNIQLO、GU、大創、玩具反斗城、藥妝店與 KOHYO 生鮮超市，美食街與餐廳選擇豐富，逛完慢慢散步 8 分鐘回 OMO3 整理最終行李。',
        kidTip: '商場內有免費卡通造型推車可借用，也有大型室內玩具店讓小孩放電，是收尾京都最後一夜最省心的一站！',
        mapUrl: gSearch('AEON Mall KYOTO'),
      },
    ],
  },
  {
    day: 5,
    dateLabel: '12/29',
    weekday: '週二・返程',
    title: '臨空城 Outlet 暢快採買，從容搭機返台',
    subtitle: '08:30 退房 → 臨空城 Outlet（10:00 開門）→ 海景午餐 → 關西機場 CX565 16:15 起飛',
    areaSummary: '京都車站 · 臨空城 · 關西國際機場',
    transitSummary: 'JR HARUKA 特急 ＋ 南海／JR 一站直抵臨空城與機場',
    walkingLevel: '平緩商場步行（全程無障礙好推車）',
    weatherNote: '預估 4°C – 10°C · 臨空城靠大阪灣海風大，外套留手邊不要先塞大行李箱',
    keyReminder: '請務必於 13:45 前離開臨空城、14:15 前抵達關西機場第一航廈辦理 CX565 報到！臨空城站與園區內皆有多處大型行李置物櫃，亦可多利用寄物櫃輕鬆空手逛街。',
    stops: [
      {
        time: '08:15',
        title: 'OMO3 京都東寺退房，搭車前往京都車站',
        area: '近鐵東寺站 → JR 京都站',
        stayDuration: '退房與移動約 30 分鐘',
        description: '完成退房手續，確認護照、戰利品免稅封袋與推車皆齊備；從近鐵東寺站搭 1 站至京都站（或直接步行 11 分鐘至八條口）搭乘 08:45 左右的 JR HARUKA 特急。',
        kidTip: '前晚先將大部分戰利品打包好，早上留一個登機袋裝小孩替換衣、零食與保暖外套，出門節奏最從容。',
        mapUrl: gSearch('OMO3 Kyoto Toji by Hoshino Resorts'),
        nextTransit: {
          method: 'JR HARUKA 特急 ＋ 關空線 1 站（於關西機場站轉乘或日根野轉乘）',
          routeSummary: 'JR 京都站（30 號月台）→ 關西機場站轉 JR／南海電鐵 1 站 → 臨空城站（Rinku-Town）',
          duration: '約 88 分鐘（含轉乘）',
          costNote: 'HARUKA 優惠票約 ¥2,200–2,700 ＋ 機場至臨空城 ¥370 · 幼兒免費',
          routeMapUrl: gDir('Kyoto Station', 'Rinku Premium Outlets Osaka', 'transit'),
        },
      },
      {
        time: '10:00',
        title: 'Rinku Premium Outlets 臨空城準時開門採買＆寄放行李',
        area: '大阪泉佐野・臨空城',
        stayDuration: '建議停留 3 小時 30 分鐘（含午餐）',
        highlightTag: '最後購物衝刺',
        description: '抵達臨空城站後，先將大型行李箱寄放於車站內或 Outlet 服務中心旁大型投幣置物櫃（¥700–1,000／格）。10:00 準時開逛超過 250 個品牌：Nike、Adidas、New Balance、Beams、Polo Ralph Lauren、Lego 與多間日本童裝品牌，享免稅與遊客額外優惠券！',
        kidTip: '先掃描服務台 QR Code 領取外國旅客折價券；園區 Sea Side 區面向大阪灣有草坪空間與親子友善休息區，可由一位大人陪孩子看飛機起降、另一位快閃採買！',
        mapUrl: gSearch('Rinku Premium Outlets Osaka'),
        nextTransit: {
          method: '園區內步行至 Sea Side 2F',
          routeSummary: 'Main Side 購物區 → Sea Side 海景美食街（Rinku Dining）',
          duration: '約 5 分鐘',
          costNote: '免費步行',
          routeMapUrl: gSearch('Rinku Premium Outlets Sea Side'),
        },
      },
      {
        time: '12:15',
        title: '海景午餐：臨空城 Sea Side 美食街（Rinku Dining）',
        area: '臨空城 Outlet Sea Side 區',
        stayDuration: '建議停留 60 分鐘',
        description: '邊欣賞關西機場連絡橋與海景邊享用日式拉麵、蛋包飯、烏龍麵或漢堡排，快速出餐免久候，飯後還能做最後 30 分鐘補貨並取回行李箱將戰利品裝箱整理。',
        kidTip: '美食街提供高腳兒童椅與大片海景窗位，讓 3 歲與 5 歲小朋友吃飽喝足，搭機前上好洗手間。',
        mapUrl: gSearch('Rinku Premium Outlets Sea Side'),
        nextTransit: {
          method: 'JR 關西機場線 或 南海機場線（僅 1 站）',
          routeSummary: '臨空城站 → 關西國際機場站（第一航廈直結）',
          duration: '車程 6 分鐘（加步行領行李約 25 分鐘）',
          costNote: '單程成人 ¥370 · 幼兒免費',
          routeMapUrl: gDir('Rinku-Town Station', 'Kansai International Airport Terminal 1', 'transit'),
        },
      },
      {
        time: '14:15',
        title: '抵達關西國際機場第一航廈，辦理 CX565 報到與免稅採買',
        area: '關西國際機場 KIX 第一航廈',
        stayDuration: '建議預留 120 分鐘',
        description: '至國泰航空櫃檯辦理行李托運與推車機邊托運申請；通過安檢與出境後，第一航廈全新免稅區可一次補齊白色戀人、ROYCE 生巧克力、抹茶伴手禮與兒童零食。',
        kidTip: '關西機場管制區內設有兒童遊戲空間與免費飲水機，登機前讓雙寶放電一下，上機更容易安穩小睡！',
        mapUrl: gSearch('Kansai International Airport Terminal 1'),
        nextTransit: {
          method: '國際航班 CX565',
          routeSummary: '關西國際機場 KIX（16:15 起飛）→ 桃園國際機場 TPE（約 18:30 抵達）',
          duration: '約 3 小時 15 分鐘',
          costNote: '滿載回憶平安返家',
          routeMapUrl: gSearch('Taiwan Taoyuan International Airport Terminal 1'),
        },
      },
    ],
  },
];

export const FOOD_CATEGORIES: FoodCategory[] = [
  '全部',
  '燒肉和牛',
  '京料理正餐',
  '街頭小吃',
  '抹茶甜點',
  '咖啡輕食',
];

export const RESTAURANTS: RestaurantItem[] = [
  {
    id: 'yakiniku-hiro',
    name: '京の焼肉処 弘（京都站八條口店）',
    jpName: '京の焼肉処 弘 京都駅八条口店',
    category: '燒肉和牛',
    area: '京都車站八條口',
    dayRef: 'Day 1 晚餐（必吃）',
    priceRangeJpy: '¥5,000 – ¥7,500 / 成人',
    reservation: '強烈建議提前 30–45 天線上訂位（17:00–23:00）',
    mustOrder: '今宵限りの盛り合わせ（特選和牛姿切拼盤）、厚切牛舌、壺漬牛肋、白飯＋海帶湯',
    kidNote: '可點不辣鹽味和牛與嫩牛五花配白飯，提供兒童餐具；距近鐵京都站僅 4 分鐘。',
    description: '京都老字號精肉商直營，主打整頭購入京都黑毛和牛，油花細膩而不膩口，是抵達京都第一夜最完美的高質感聖誕晚餐。',
    mapUrl: gSearch('Kyoto Yakiniku Hiro Hachijoguchi'),
    featured: true,
    image: IMAGES.yakiniku,
  },
  {
    id: 'katsukura-kyoto',
    name: '名代豬排 かつくら（京都車站店）',
    jpName: '名代とんかつ かつくら 京都駅ビル店',
    category: '京料理正餐',
    area: '京都車站大樓 11F',
    dayRef: 'Day 2 晚餐推薦',
    priceRangeJpy: '¥2,200 – ¥3,200 / 人',
    reservation: '現場候位，建議 17:30 前入座避開尖峰',
    mustOrder: '三元豚腰內豬排定食、季節炸蝦腰內雙拼、自磨白芝麻豬排醬',
    kidNote: '麥飯、高麗菜絲與紅味噌湯無限續加，腰內肉軟嫩適合 3 歲與 5 歲咀嚼。',
    description: '發源於京都三條的經典炸豬排名店，外酥內嫩不油膩，還能讓孩子體驗自己研磨芝麻的樂趣。',
    mapUrl: gSearch('Katsukura Kyoto Station'),
  },
  {
    id: 'shizuka-nara',
    name: '志津香 公園店（奈良釜飯）',
    jpName: '釜めし 志津香 公園店',
    category: '京料理正餐',
    area: '奈良公園西側',
    dayRef: 'Day 2 午餐推薦',
    priceRangeJpy: '¥1,600 – ¥2,400 / 人',
    reservation: '無預約制，建議 11:45–12:00 抵達',
    mustOrder: '奈良七種釜飯（七味綜合）、大和雞肉釜飯、鰻魚釜飯',
    kidNote: '現炊米飯清香溫熱、調味溫和不重鹹，適合全家分食；鍋身燙須由大人盛裝。',
    description: '緊鄰東大寺與奈良公園的半世紀老店，現點現煮的釜飯結合鮮甜高湯與微焦鍋巴，冬日吃來倍感溫暖。',
    mapUrl: gSearch('Shizuka Park Branch Nara'),
  },
  {
    id: 'hisago-higashiyama',
    name: 'ひさご（東山葫蘆親子丼）',
    jpName: 'ひさご 親子丼',
    category: '京料理正餐',
    area: '東山・下河原通（清水寺往八坂神社）',
    dayRef: 'Day 3 午餐推薦',
    priceRangeJpy: '¥1,200 – ¥1,800 / 人',
    reservation: '現場排隊，11:30 開門即前往較省時',
    mustOrder: '招牌丹波雞親子丼、京風豆皮湯烏龍麵（きつねうどん）',
    kidNote: '香甜滑蛋拌飯是幼兒最愛，亦可選擇熱湯烏龍麵，離高台寺與八坂神社都很近。',
    description: '昭和五年創業的東山老舖，選用軟嫩丹波雞與利尻昆布高湯煮出金黃滑順的京都名物親子丼。',
    mapUrl: gSearch('Hisago Higashiyama Kyoto'),
  },
  {
    id: 'arashiyama-yoshimura',
    name: '嵐山よしむら（河景手打蕎麥麵）',
    jpName: '嵐山よしむら',
    category: '京料理正餐',
    area: '嵐山・渡月橋北岸',
    dayRef: 'Day 4 午餐推薦',
    priceRangeJpy: '¥1,800 – ¥2,800 / 人',
    reservation: '現場登記候位（可先派一人取號）',
    mustOrder: '渡月套餐（湯／冷蕎麥麵＋迷你天丼）、季節野菜炸蝦天婦羅',
    kidNote: '備有兒童座椅，靠窗座位可看渡月橋；若對蕎麥過敏可改點飯類或備案「嵐山 稻」。',
    description: '改建自明治時期日本畫家畫室的典雅餐廳，職人每日石臼現磨手打蕎麥麵，坐享桂川冬日山光水色。',
    mapUrl: gSearch('Arashiyama Yoshimura Kyoto'),
  },
  {
    id: 'nakatanidou',
    name: '中谷堂（高速現搗艾草麻糬）',
    jpName: '中谷堂 よもぎ餅',
    category: '街頭小吃',
    area: '奈良・三條通與東向商店街口',
    dayRef: 'Day 2 下午點心',
    priceRangeJpy: '¥200 / 顆',
    reservation: '免預約，現場排隊購買',
    mustOrder: '現搗熱呼呼艾草紅豆麻糬（よもぎ餅）',
    kidNote: '現場搗麻糬表演超吸睛，雙寶一定看得出神；麻糬請分剪成小口給幼兒食用。',
    description: '全國冠軍高速搗麻糬名店，剛出爐還帶著微溫的艾草外皮散發清香，裹上黃豆粉與細緻紅豆餡。',
    mapUrl: gSearch('Nakatanidou Nara'),
  },
  {
    id: 'daibutsu-pudding',
    name: 'まほろば大佛布丁本舖（近鐵奈良站店）',
    jpName: 'まほろば大仏プリン本舗 近鉄奈良駅店',
    category: '街頭小吃',
    area: '近鐵奈良站 B1 改札口外',
    dayRef: 'Day 2 回程點心',
    priceRangeJpy: '¥450 – ¥500 / 瓶',
    reservation: '免預約，外帶回飯店或候車享用',
    mustOrder: '原味卡士達大佛布丁、大和茶口味布丁',
    kidNote: '口感像奶酪般入口即化，瓶蓋印有可愛大佛插畫，3 歲與 5 歲小朋友一口接一口。',
    description: '選用奈良當地鮮奶與雞蛋手工製作的超滑嫩布丁，返程搭近鐵前順手外帶超方便。',
    mapUrl: gSearch('Mahoroba Daibutsu Pudding Kintetsu Nara'),
  },
  {
    id: 'nishiki-donuts',
    name: 'こんなもんじゃ（錦市場豆乳甜甜圈）',
    jpName: '京とうふ藤野 こんなもんじゃ',
    category: '街頭小吃',
    area: '京都・錦市場內',
    dayRef: 'Day 3 下午散步',
    priceRangeJpy: '¥400 – ¥600 / 袋',
    reservation: '免預約，現場購買於店旁站食區享用',
    mustOrder: '現炸一口豆乳甜甜圈、京都豆乳霜淇淋',
    kidNote: '一口大小鬆軟不甜膩、無堅果，剛炸好溫熱香甜，非常適合當小朋友的冬日散步點心。',
    description: '京都百年豆腐名店「京とうふ藤野」直營小舖，以濃郁豆乳現炸的小巧甜甜圈是錦市場人氣招牌。',
    mapUrl: gSearch('Konnamonja Nishiki Market Kyoto'),
  },
  {
    id: 'tsujiri-gion',
    name: '茶寮都路里（祇園本店）',
    jpName: '茶寮都路里 祇園本店',
    category: '抹茶甜點',
    area: '京都・祇園四條通',
    dayRef: 'Day 3 下午茶推薦',
    priceRangeJpy: '¥1,400 – ¥1,900 / 份',
    reservation: '現場候位（位於 2F–3F，可先詢問推車寄放）',
    mustOrder: '特選都路里抹茶聖代、冬日限定熱抹茶白玉紅豆湯（ぜんざい）',
    kidNote: '冬天推薦點熱抹茶白玉紅豆湯搭配一份抹茶聖代分食，小朋友也能吃到軟 Q 白玉糰子。',
    description: '宇治茶老舖祇園辻利直營的茶寮名店，層次豐富的抹茶凍、白玉與栗子展現正統京味甜品美學。',
    mapUrl: gSearch('Saryo Tsujiri Gion Main Store Kyoto'),
  },
  {
    id: 'nakamura-tokichi',
    name: '中村藤吉本店（京都站店）',
    jpName: '中村藤吉本店 京都駅店',
    category: '抹茶甜點',
    area: 'JR 京都站西口 2F / 3F（SUVACO）',
    dayRef: 'Day 1–4 任一日彈性午茶',
    priceRangeJpy: '¥1,300 – ¥1,800 / 份',
    reservation: '現場抽號候位，亦有外帶櫃台可買生茶凍回飯店',
    mustOrder: '生茶ゼリイ（竹筒抹茶生茶凍）、焙茶拿鐵、溫熱抹茶蕎麥麵',
    kidNote: '外帶區可買抹茶／焙茶生茶凍直接帶回 OMO3 飯店慢慢享用，完全不必帶小孩排隊！',
    description: '創立於 1854 年的宇治茶名門，茶香深邃醇厚，京都車站分店位置極佳且提供精緻伴手禮。',
    mapUrl: gSearch('Nakamura Tokichi Kyoto Station'),
  },
  {
    id: 'arabica-arashiyama',
    name: '% Arabica（京都嵐山店）',
    jpName: '% Arabica Kyoto Arashiyama',
    category: '咖啡輕食',
    area: '嵐山・渡月橋北岸河堤',
    dayRef: 'Day 4 午後休憩',
    priceRangeJpy: '¥600 – ¥750 / 杯',
    reservation: '外帶為主，排隊速度頗快',
    mustOrder: '京都拿鐵（Kyoto Latte，帶微甜煉乳香）、熱拿鐵',
    kidNote: '大人買杯熱咖啡暖手，旁邊即可買嵐山米飛兔麵包或烤糰子給雙寶坐在河岸曬冬陽。',
    description: '極簡純白落地窗映照桂川與嵐山山嵐，手握一杯香濃熱拿鐵漫步渡月橋畔，是嵐山最具儀式感的片刻。',
    mapUrl: gSearch('Arabica Kyoto Arashiyama'),
  },
  {
    id: 'rinku-dining',
    name: 'Rinku Dining 海景美食街（臨空城 Outlet）',
    jpName: 'りんくうプレミアム・アウトレット シーサイド フードホール',
    category: '咖啡輕食',
    area: '臨空城 Outlet Sea Side 2F',
    dayRef: 'Day 5 返台前午餐',
    priceRangeJpy: '¥1,200 – ¥2,000 / 人',
    reservation: '免預約，座位寬敞明亮',
    mustOrder: '大阪名物神座拉麵／章魚燒、神戶牛漢堡排、釜揚烏龍麵',
    kidNote: '全區平緩好推車、兒童餐椅充足且面向海景看飛機，12:15 用餐最能錯開離場尖峰。',
    description: '坐擁大阪灣海景的現代美食廣場，集結關西人氣餐飲，讓登機前的最後一餐輕鬆又美味。',
    mapUrl: gSearch('Rinku Premium Outlets Sea Side'),
  },
];

export const TRANSIT_COMPARISONS: TransitOptionData[] = [
  {
    id: 'kix-haruka',
    group: 'airport',
    label: 'JR HARUKA 特急（遊客優惠票）',
    shortLabel: 'HARUKA 特急',
    durationMin: 75,
    adultFareJpy: 2700,
    familyFareJpy: 5400,
    childRule: '3 歲與 5 歲未滿 6 歲不佔位免費（1 大限帶 1 幼）',
    recommended: true,
    note: '直達京都站免轉車、有大型行李架與洗手間，帶雙寶首選！',
  },
  {
    id: 'kix-rapid',
    group: 'airport',
    label: 'JR 關空快速＋新快速（需大阪轉乘）',
    shortLabel: 'JR 關空快速',
    durationMin: 105,
    adultFareJpy: 1910,
    familyFareJpy: 3820,
    childRule: '未滿 6 歲免費；但通勤車型無指定席與行李架',
    note: '票價最省但車程長、尖峰易無座位且需於大阪站拖行李換月台。',
  },
  {
    id: 'kix-bus',
    group: 'airport',
    label: '利木津巴士（關西機場 → 京都八條口）',
    shortLabel: '利木津巴士',
    durationMin: 95,
    adultFareJpy: 2800,
    familyFareJpy: 5600,
    childRule: '未滿 6 歲不佔位免費；如需獨立座位須購半票 ¥1,400',
    note: '行李放車腹免搬上搬下，惟年底連假高速公路偶有塞車變數。',
  },
  {
    id: 'kix-charter',
    group: 'airport',
    label: '機場直達包車（參考比較）',
    shortLabel: '機場包車',
    durationMin: 85,
    adultFareJpy: 11000,
    familyFareJpy: 22000,
    childRule: '按車計價（含兒童安全座椅預約費，約 ¥20,000–24,000／趟）',
    note: '點對點最省力但費用高出 HARUKA 約四倍；本行程採大眾運輸為主。',
  },
  {
    id: 'sub-kintetsu-nara',
    group: 'suburban',
    label: '近鐵急行（東寺站 → 近鐵奈良站）',
    shortLabel: '近鐵急行(奈良)',
    durationMin: 48,
    adultFareJpy: 760,
    familyFareJpy: 1520,
    childRule: '3 歲與 5 歲未滿 6 歲免費',
    recommended: true,
    note: 'OMO3 步行 2 分鐘直上車，抵達近鐵奈良離奈良公園最近！',
  },
  {
    id: 'sub-kintetsu-ltd',
    group: 'suburban',
    label: '近鐵特急（京都站 → 近鐵奈良站）',
    shortLabel: '近鐵特急(奈良)',
    durationMin: 35,
    adultFareJpy: 1280,
    familyFareJpy: 2560,
    childRule: '不佔位免費；若幫幼兒加購指定席約 ¥640／人',
    note: '全車對號座最舒適，適合想保證全家人連坐時彈性加購。',
  },
  {
    id: 'sub-jr-nara',
    group: 'suburban',
    label: 'JR 奈良線快速（京都站 → JR 奈良站）',
    shortLabel: 'JR 奈良線',
    durationMin: 45,
    adultFareJpy: 720,
    familyFareJpy: 1440,
    childRule: '未滿 6 歲免費；但 JR 奈良站步行至公園較遠（約 20 分鐘）',
    note: '票價略低 ¥40，但到奈良公園需多走約 1 公里或轉搭市內公車。',
  },
  {
    id: 'sub-arashiyama',
    group: 'suburban',
    label: 'JR 嵯峨野線（馬堀）＋ 嵐山小火車',
    shortLabel: 'JR＋嵐山小火車',
    durationMin: 55,
    adultFareJpy: 1210,
    familyFareJpy: 2420,
    childRule: '3 歲與 5 歲不佔位免費；小火車若另購兒童座加 ¥440／位',
    recommended: true,
    note: 'Day 4 順行精華組合（JR ¥330 ＋ 小火車 ¥880），不走回頭路。',
  },
];

export const BUDGET_CATEGORIES: BudgetCategoryItem[] = [
  {
    id: 'local-transit',
    label: '日本當地大眾運輸',
    sublabel: 'HARUKA 往返、近鐵奈良、市巴士、JR 嵯峨野線與臨空城接駁（2 大＋2 幼免費規則）',
    defaultJpy: 21500,
    color: '#2B4C7E',
  },
  {
    id: 'dining',
    label: '五日餐飲與必吃燒肉弘',
    sublabel: '含 Day 1 燒肉弘（約 ¥18,000）及每日正餐、抹茶甜點與街邊小吃',
    defaultJpy: 78000,
    color: '#9E2A2B',
  },
  {
    id: 'tickets',
    label: '景點門票與嵐山小火車',
    sublabel: '小火車、清水寺、東大寺、天龍寺庭園、奈良鹿仙貝與置物櫃',
    defaultJpy: 10500,
    color: '#3A5A40',
  },
  {
    id: 'shopping',
    label: '臨空城 Outlet 與伴手禮預算',
    sublabel: 'Day 4 AEON Mall 藥妝日用品 ＋ Day 5 臨空城採買與機場免稅伴手禮',
    defaultJpy: 65000,
    color: '#A16207',
  },
  {
    id: 'misc',
    label: '彈性備用金（計程車應急／便利商店）',
    sublabel: '突發疲勞短程搭計程車、熱飲、暖暖包與藥局備品',
    defaultJpy: 15000,
    color: '#78716C',
  },
];

export const PACKING_ITEMS: PackingItem[] = [
  // 重要證件與預訂憑證
  {
    id: 'p-passport',
    category: '證件與交通票券',
    label: '4 人有效護照（確認效期滿 6 個月以上）',
    note: '建議手機雲端備份護照首頁照片',
  },
  {
    id: 'p-vjw',
    category: '證件與交通票券',
    label: 'Visit Japan Web 入境與海關 QR Code 截圖',
    note: '出發前 48 小時完成全家 4 人登錄，離線截圖存相簿',
  },
  {
    id: 'p-flight-hotel',
    category: '證件與交通票券',
    label: 'CX564 / CX565 電子機票與 OMO3 京都東寺訂房憑證',
    note: '列印紙本或存手機檔案，含兒童餐確認紀錄',
  },
  {
    id: 'p-iccard',
    category: '證件與交通票券',
    label: 'ICOCA / Suica 交通卡（或 Apple Pay 綁定）＋ 日圓現金',
    note: '京都市巴士、近鐵、JR 與置物櫃皆方便使用',
  },
  {
    id: 'p-esim',
    category: '證件與交通票券',
    label: '日本 5 日上網 eSIM / 漫遊開通確認',
    note: '確保雙親手機皆能獨立導航聯繫',
  },

  // 出發前關鍵搶票與訂位
  {
    id: 'p-book-train',
    category: '出發前關鍵預約',
    label: '【11/28 00:00 JST 搶票】12/28 嵐山小火車指定席（1–4 號車廂）',
    note: '選擇「龜岡 → 嵐山」10:30 左右班次，冬季務必選有窗車廂',
  },
  {
    id: 'p-book-hiro',
    category: '出發前關鍵預約',
    label: '【提前 30–45 天】12/25 19:00 京の焼肉処 弘（京都站八條口店）訂位',
    note: '備註 2 位成人 ＋ 3 歲與 5 歲幼兒座席需求',
  },
  {
    id: 'p-book-haruka',
    category: '出發前關鍵預約',
    label: '預購 JR HARUKA 關西機場 ⇄ 京都站遊客優惠電子票',
    note: '可事先於 JR West 官網或合作平台購買，現場掃碼領票最省時',
  },

  // 3 歲與 5 歲冬日穿搭
  {
    id: 'p-kids-heattech',
    category: '3 歲與 5 歲冬日洋蔥式穿搭',
    label: '兒童發熱衣、刷毛中層上衣與防風防潑水羽絨外套',
    note: '室內與電車暖氣強，採洋蔥式穿脫避免悶熱流汗著涼',
  },
  {
    id: 'p-kids-pants',
    category: '3 歲與 5 歲冬日洋蔥式穿搭',
    label: '防風刷毛長褲與厚底止滑好走布鞋（各備 1 雙替換襪）',
    note: '古寺石板路與奈良公園微涼，務必穿已磨合好走的鞋',
  },
  {
    id: 'p-kids-warmers',
    category: '3 歲與 5 歲冬日洋蔥式穿搭',
    label: '兒童毛帽、脖圍（優於長圍巾防勾拉）與手套',
    note: '12/28 嵐山河岸與 12/29 臨空城海風特別冷',
  },
  {
    id: 'p-kids-pajamas',
    category: '3 歲與 5 歲冬日洋蔥式穿搭',
    label: '輕薄長袖睡衣與備用貼身衣物（多帶 1–2 套應急）',
    note: '飯店暖氣較乾熱，睡衣不需太厚重',
  },

  // 親子推車與育兒必備
  {
    id: 'p-stroller',
    category: '親子推車與育兒用品',
    label: '輕量單手秒收折疊嬰兒推車 ＋ 防風防雨罩 ＋ 推車掛勾',
    note: '防風罩在冬日嵐山與奈良移動超保暖！另可評估加裝踏板給 5 歲兄姊',
  },
  {
    id: 'p-diaper',
    category: '親子推車與育兒用品',
    label: '3 歲備用尿布（帶前 2 日份，不夠可於 AEON Mall 補貨）＋ 濕紙巾',
    note: '隨身備妥小垃圾袋（日本街頭垃圾桶稀少）',
  },
  {
    id: 'p-thermos',
    category: '親子推車與育兒用品',
    label: '兒童保溫水壺 × 2、食物剪刀與折疊圍兜',
    note: '剪烏龍麵、燒肉與麻糬超實用，過安檢前剪刀請放托運行李！',
  },
  {
    id: 'p-meds',
    category: '親子推車與育兒用品',
    label: '幼兒常備藥品（退燒藥水、耳溫槍、過敏藥、OK 繃、保濕乳液）',
    note: '京都冬日濕度低，每天早晚幫雙寶擦高保濕乳液與護唇膏防乾裂',
  },
  {
    id: 'p-snacks',
    category: '親子推車與育兒用品',
    label: '候車與搭機安撫小玩具、貼紙書與小包裝點心',
    note: '搭乘 HARUKA 75 分鐘與餐廳候位時的和平神器',
  },

  // 大人裝備與電子用品
  {
    id: 'p-adult-wear',
    category: '大人裝備與電子用品',
    label: '大人保暖大衣／羽絨、手套、圍巾與好走步行鞋',
    note: '每日步數約 10,000–14,000 步，舒適鞋款最重要',
  },
  {
    id: 'p-handwarmer',
    category: '大人裝備與電子用品',
    label: '貼式與手握暖暖包（亦可抵京都便利商店隨時購買）',
    note: '切勿直接貼皮膚，給幼兒使用請隔厚衣並定時檢查溫度',
  },
  {
    id: 'p-powerbank',
    category: '大人裝備與電子用品',
    label: '行動電源（限手提登機）與多孔快充頭、充電線',
    note: '低溫會加速手機掉電，導航與拍照必備行動電源',
  },
  {
    id: 'p-bag',
    category: '大人裝備與電子用品',
    label: '折疊購物袋與行李電子秤',
    note: 'Day 5 臨空城 Outlet 採買後可即時確認行李重量避免超重',
  },
];
