import { Language } from "./translations";

export type FacilityType = "Hospital" | "Clinic" | "Pharmacy";

export interface Facility {
  id: string;
  name: Record<Language, string>;
  type: FacilityType;
  city: string;
  address: Record<Language, string>;
  phone: string;
  lat: number;
  lng: number;
}

export const facilitiesData: Facility[] = [
  // Metro Manila
  {
    id: "hosp1",
    name: {
      en: "Philippine General Hospital (PGH)",
      ko: "필리핀 종합병원 (국공립 PGH)",
      tl: "Philippine General Hospital (PGH)",
    },
    type: "Hospital",
    city: "Manila",
    address: {
      en: "Taft Ave, Ermita, Manila, 1000 Metro Manila",
      ko: "메트로 마닐라, 에르미타, 타프트 애비뉴",
      tl: "Taft Ave, Ermita, Manila, 1000 Metro Manila",
    },
    phone: "(02) 8554 8400",
    lat: 14.5786,
    lng: 120.9859,
  },
  {
    id: "hosp4",
    name: {
      en: "Makati Medical Center",
      ko: "마카티 메디컬 센터",
      tl: "Makati Medical Center",
    },
    type: "Hospital",
    city: "Makati",
    address: {
      en: "2 Amorsolo Street, Legazpi Village, Makati",
      ko: "마카티 레가스피 빌리지, 아모르솔로 거리 2",
      tl: "2 Amorsolo Street, Legazpi Village, Makati",
    },
    phone: "(02) 8888 8999",
    lat: 14.5593,
    lng: 121.0135,
  },
  {
    id: "clin1",
    name: {
      en: "Manila Health Department (Free Clinic)",
      ko: "마닐라 보건소 (내외국인 무료 진료)",
      tl: "Kagawaran ng Kalusugan ng Maynila",
    },
    type: "Clinic",
    city: "Manila",
    address: {
      en: "Manila City Hall Annex, Ermita, Manila",
      ko: "마닐라 시청 별관 보건국",
      tl: "Manila City Hall Annex, Ermita, Manila",
    },
    phone: "(02) 8527 4950",
    lat: 14.5898,
    lng: 120.9816,
  },
  {
    id: "phar1",
    name: {
      en: "Mercury Drug - Taft Avenue",
      ko: "머큐리 드럭 (주요 대형 약국) - 타프트 애비뉴 점",
      tl: "Mercury Drug - Taft Avenue",
    },
    type: "Pharmacy",
    city: "Manila",
    address: {
      en: "Taft Ave, Manila",
      ko: "마닐라 타프트 애비뉴",
      tl: "Taft Ave, Maynila",
    },
    phone: "(02) 8526 2305",
    lat: 14.58,
    lng: 120.984,
  },
  // Cebu
  {
    id: "hosp_cebu1",
    name: {
      en: "Chong Hua Hospital",
      ko: "청화 병원 (세부)",
      tl: "Chong Hua Hospital",
    },
    type: "Hospital",
    city: "Cebu",
    address: {
      en: "Don Mariano Cui St, Cebu City, 6000 Cebu",
      ko: "세부시 돈 마리아노 쿠이 거리",
      tl: "Don Mariano Cui St, Lungsod ng Cebu, 6000 Cebu",
    },
    phone: "(032) 255 8000",
    lat: 10.3121,
    lng: 123.8906,
  },
  {
    id: "phar_cebu1",
    name: {
      en: "Rose Pharmacy - Fuente",
      ko: "로즈 파머시 - 푸엔테 점",
      tl: "Rose Pharmacy - Fuente",
    },
    type: "Pharmacy",
    city: "Cebu",
    address: {
      en: "Fuente Osmeña Blvd, Cebu City",
      ko: "세부시 푸엔테 오스메냐 거거리",
      tl: "Fuente Osmeña Blvd, Lungsod ng Cebu",
    },
    phone: "(032) 254 3971",
    lat: 10.3105,
    lng: 123.8943,
  },
  // Davao
  {
    id: "hosp_davao1",
    name: {
      en: "Southern Philippines Medical Center (SPMC)",
      ko: "남필리핀 메디컬 센터",
      tl: "Southern Philippines Medical Center (SPMC)",
    },
    type: "Hospital",
    city: "Davao",
    address: {
      en: "J.P. Laurel Ave, Bajada, Davao City",
      ko: "다바오시 바하다, J.P. 로럴 애비뉴",
      tl: "J.P. Laurel Ave, Bajada, Lungsod ng Davao",
    },
    phone: "(082) 227 2731",
    lat: 7.0864,
    lng: 125.6133,
  },
  {
    id: "clin_davao1",
    name: {
      en: "Davao City Health Office",
      ko: "다바오 시티 보건소",
      tl: "Davao City Health Office",
    },
    type: "Clinic",
    city: "Davao",
    address: {
      en: "A. Pichon St, Davao City",
      ko: "다바오시 A. 피촌 거리",
      tl: "A. Pichon St, Lungsod ng Davao",
    },
    phone: "(082) 224 1964",
    lat: 7.0673,
    lng: 125.6074,
  },
  // Baguio
  {
    id: "hosp_baguio1",
    name: {
      en: "Baguio General Hospital",
      ko: "바기오 종합병원",
      tl: "Baguio General Hospital",
    },
    type: "Hospital",
    city: "Baguio",
    address: {
      en: "Gov. Pack Road, Baguio, Benguet",
      ko: "벵게트 바기오, 거버너 팩 로드",
      tl: "Gov. Pack Road, Baguio, Benguet",
    },
    phone: "(074) 442 4216",
    lat: 16.4023,
    lng: 120.5960,
  },
  {
    id: "phar_baguio1",
    name: {
      en: "Watsons - SM City Baguio",
      ko: "왓슨스 - SM 시티 바기오점",
      tl: "Watsons - SM City Baguio",
    },
    type: "Pharmacy",
    city: "Baguio",
    address: {
      en: "SM City Baguio, Baguio, Benguet",
      ko: "벵게트 바기오, SM 시티",
      tl: "SM City Baguio, Baguio, Benguet",
    },
    phone: "(074) 442 9999",
    lat: 16.4116,
    lng: 120.5997,
  },
  // Iloilo
  {
    id: "hosp_iloilo1",
    name: {
      en: "Western Visayas Medical Center",
      ko: "서부 비사야스 메디컬 센터",
      tl: "Western Visayas Medical Center",
    },
    type: "Hospital",
    city: "Iloilo",
    address: {
      en: "Q. Abeto St, Mandurriao, Iloilo City",
      ko: "일로일로시 만두리아오 Q. 아베토 거리",
      tl: "Q. Abeto St, Mandurriao, Lungsod ng Iloilo",
    },
    phone: "(033) 321 2841",
    lat: 10.7107,
    lng: 122.5471,
  },
  // Cagayan de Oro
  {
    id: "hosp_cdo1",
    name: {
      en: "Northern Mindanao Medical Center",
      ko: "북민다나오 메디컬 센터",
      tl: "Northern Mindanao Medical Center",
    },
    type: "Hospital",
    city: "Cagayan de Oro",
    address: {
      en: "Capitol Compound, Cagayan de Oro",
      ko: "카가얀데오로, 캐피톨 컴파운드",
      tl: "Capitol Compound, Lungsod ng Cagayan de Oro",
    },
    phone: "(088) 852 1409",
    lat: 8.4842,
    lng: 124.6465,
  }
];
