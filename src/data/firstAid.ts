import { Language } from "./translations";

export interface FirstAidStep {
  title: Record<Language, string>;
  description: Record<Language, string>;
}

export interface FirstAidTopic {
  id: string;
  keywords: string[];
  title: Record<Language, string>;
  steps: FirstAidStep[];
}

export const firstAidData: FirstAidTopic[] = [
  {
    id: "cpr",
    keywords: [
      "cpr",
      "심폐소생술",
      "heart",
      "attack",
      "심장마비",
      "atake sa puso",
    ],
    title: {
      en: "CPR (Cardiopulmonary Resuscitation)",
      ko: "심폐소생술 (CPR)",
      tl: "CPR (Cardiopulmonary Resuscitation)",
    },
    steps: [
      {
        title: {
          en: "Check the Scene and the Person",
          ko: "현장 및 환자 의식 확인",
          tl: "Suriin ang Lugar at ang Tao",
        },
        description: {
          en: 'Make sure the scene is safe, then tap the person on the shoulder and shout "Are you OK?" to ensure that they need help.',
          ko: '현장이 안전한지 먼저 확인합니다. 환자의 어깨를 가볍게 두드리며 "괜찮으세요?"라고 큰 소리로 물어 의식을 확인합니다.',
          tl: 'Tiyaking ligtas ang lugar, pagkatapos ay tapikin ang balikat ng tao at sumigaw, "Ayos ka lang ba?" upang malaman kung kailangan nila ng tulong.',
        },
      },
      {
        title: {
          en: "Call for Emergency Help",
          ko: "응급구조 신속 요청",
          tl: "Humingi ng Tulong Emergency",
        },
        description: {
          en: "If they do not respond, ask a bystander to call 911 and get an AED. In the Philippines, the emergency hotlines are 911 or 143 (Red Cross).",
          ko: "환자가 반응이 없으면 특정 주변 사람을 지목하여 911 신고 및 자동심장충격기(AED) 구비를 요청합니다. (필리핀 응급번호: 911 또는 143 적십자)",
          tl: "Kung walang tugon, tumawag sa 911 at humingi ng AED. Sa Pilipinas, ang hotlines ay 911 o 143 (Red Cross).",
        },
      },
      {
        title: {
          en: "Perform Chest Compressions",
          가: "강한 가슴 압박 실시",
          tl: "Padiin sa Dibdib (Chest Compressions)",
        } as any, // Will fix "가" later below, keeping logic here simple or just inline fixing
        description: {
          en: "Place the heel of one hand on the center of the chest. Place the other hand on top and interlace your fingers. Push hard and fast (at least 2 inches deep, 100-120 pushes a minute).",
          ko: "한 손의 손바닥 아랫부분을 환자 가슴 정중앙(흉골 아래쪽 절반)에 대고, 다른 손을 위에 포개어 깍지를 낍니다. 강하고 빠르게 (최소 5cm 깊이, 분당 100-120회) 가슴을 압박합니다.",
          tl: "Ilagay ang ibaba ng palad sa gitna ng dibdib. Ilagay ang kabilang kamay sa ibabaw at magkapit. Diinan nang malakas at mabilis (hindi bababa sa 2 pulgada, 100-120 beses bawat minuto).",
        },
      },
    ],
  },
  {
    id: "burn",
    keywords: ["burn", "화상", "fire", "paso", "hot", "뜨거운"],
    title: {
      en: "Burns & Scalds",
      ko: "화상 및 뜨거운 물에 데었을 때",
      tl: "Mga Paso",
    },
    steps: [
      {
        title: {
          en: "Cool the Burn with Flowing Water",
          ko: "흐르는 물로 화상 부위 식히기",
          tl: "Palamigin ang Paso",
        },
        description: {
          en: "Hold the burned area under cool (not cold) running water for at least 10-15 minutes or until the pain eases. Do not use ice.",
          ko: "화상 부위를 흐르는 시원한(차갑지 않은) 물에 10~15분 이상 대고 있거나, 통증이 줄어들 때까지 식혀줍니다. 절대 얼음을 직접 대지 마세요 (조직 손상 위험).",
          tl: "Itapat ang bahaging may paso sa umaagos na malamig na tubig sa loob ng 10-15 minuto hanggang mabawasan ang sakit. Huwag gumamit ng yelo.",
        },
      },
      {
        title: {
          en: "Remove Tight Items",
          ko: "부종 예방을 위한 장신구 제거",
          tl: "Alisin ang Masisikip na Gamit",
        },
        description: {
          en: "Carefully remove rings, watches, or other tight items from the burned area before it starts to swell.",
          ko: "화상 부위가 부어오르기 전에 화상 부위 근처의 반지, 시계, 팔찌 등 조이는 장신구나 물품을 조심스럽게 제거합니다.",
          tl: "Dahan-dahang alisin ang mga singsing o iba pang masisikip na bagay mula sa bahaging may paso bago ito mamaga.",
        },
      },
      {
        title: {
          en: "Bandage and Protect",
          ko: "깨끗한 붕대로 보호하기",
          tl: "Balutan ang Paso",
        },
        description: {
          en: "Cover the burn loosely with a sterile, non-fluffy bandage or clean cloth. Do not pop any blisters.",
          ko: "소독된 거즈 붕대나 보풀이 없는 깨끗한 천으로 화상 부위를 느슨하게 덮어 외부 감염으로부터 보호합니다. 물집은 절대 터뜨리지 마세요.",
          tl: "Takpan ng maluwag ang paso gamit ang malinis na gasa (gauze). Huwag putukin ang mga paltos.",
        },
      },
    ],
  },
  {
    id: "fever",
    keywords: [
      "fever",
      "고열",
      "열",
      "heat",
      "lagnat",
      "temperature",
      "dengue",
      "뎅기열",
    ],
    title: {
      en: "High Fever (Caution for Dengue)",
      ko: "고열 대처 (뎅기열 주의)",
      tl: "Mataas na Lagnat",
    },
    steps: [
      {
        title: {
          en: "Rest and Hydrate Continuously",
          ko: "충분한 휴식 및 지속적인 수분 섭취",
          tl: "Magpahinga at Uminom ng Tubig",
        },
        description: {
          en: "Encourage the person to rest in a cool room and drink plenty of fluids like water to prevent dehydration.",
          ko: "시원한 방에서 환자가 충분한 휴식을 취하도록 하고, 탈수를 막기 위해 물, 이온음료 등을 자주 마시게 합니다.",
          tl: "Hikayatin ang pasyenteng magpahinga sa malamig na kwarto at uminom ng maraming tubig upang maiwasan ang dehydration.",
        },
      },
      {
        title: {
          en: "Dress Lightly and Cool Compress",
          ko: "가벼운 옷차림 및 미지근한 물수건 사용",
          tl: "Manipis na Damit at Cool Compress",
        },
        description: {
          en: "Use lightweight clothing. Apply a cool, damp cloth to the forehead or armpits. Avoid cold water baths.",
          ko: "두꺼운 옷을 벗기고 얇은 옷을 입힙니다. 미지근한 물에 적신 수건으로 이마나 겨드랑이, 목 주변을 부드럽게 닦아 열을 발산시킵니다. 차가운 물로 씻겨선 안 됩니다.",
          tl: "Magsuot ng manipis na damit. Maglagay ng malamig na basang pamunas sa noo at kilikili. Iwasan ang malamig na paliguan.",
        },
      },
      {
        title: {
          en: "Monitor and Seek Medical Help",
          ko: "증상 모니터링 및 즉각적인 의료기관 방문",
          tl: "Bantayan at Humingi ng Tulong Medikal",
        },
        description: {
          en: "In the tropics, a sudden high fever with joint pain or rash could be Dengue. If fever persists for more than 2-3 days, visit a clinic immediately.",
          ko: "열대지방에서는 고열과 함께 관절통, 발진이 동반되면 뎅기열일 가능성이 높습니다. 열이 2~3일 이상 지속되거나 구토를 동반하면 즉시 가까운 병원을 방문하세요.",
          tl: "Kung ang lagnat ay may kasamang pananakit ng kasukasuan at pantal, maaaring ito ay Dengue. Mag-patingin agad sa doktor kung hindi bumaba ang lagnat sa loob ng 2-3 araw.",
        },
      },
    ],
  },
];
