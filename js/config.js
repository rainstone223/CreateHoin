// 게임 설정 상수
const CONFIG = {
  // 캔버스 설정 (모바일에서는 동적으로 변경됨)
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  SIZE_SCALE: 1.0, // 개체 크기 스케일 팩터 (모바일에서 조정됨)

  // 게임 경계 (스폰 시 가장자리 패딩)
  BOUNDARY_PADDING: 50,

  // 레벨 정의 (6단계) - 크기 증가, 경험치 완만하게 조정
  LEVELS: [
    { name: "사원", size: 18, xpRequired: 0, image: "assets/sawon.png" },
    { name: "대리", size: 23, xpRequired: 30, image: "assets/daeri.png" },
    { name: "과장", size: 28, xpRequired: 70, image: "assets/gwajang.png" },
    { name: "부장", size: 34, xpRequired: 120, image: "assets/bujang.png" },
    { name: "사장", size: 41, xpRequired: 190, image: "assets/sajang.png" },
    { name: "회장", size: 50, xpRequired: 290, image: "assets/hweojang.png" } // 포식자 최고 레벨 (플레이어는 "호인")
  ],

  // 플레이어 이미지 (레벨과 무관하게 항상 호인)
  PLAYER_IMAGE: "assets/hoin.png",

  // 개체 설정
  BASE_SPEED: 2.5, // 기본 속도 (초기 세팅으로 복원)
  MAX_SIZE: 50, // 최대 크기 (속도 계산용)
  SPEED_VARIATION: 0.55, // 속도 변화 지수 (큰 개체일수록 더 느리게)
  PLAYER_SPEED_VARIATION: 0.15, // 플레이어 속도 변화 지수 (레벨업 시 속도 감소폭 최소화)
  PLAYER_SPEED_BOOST: 1.25, // 플레이어 속도 부스트 (같은 크기 대비 25% 빠름)
  PREDATOR_SPEED_PENALTY: 0.75, // 포식자 속도 패널티 (25% 감소)
  PREY_SPEED_PENALTY: 0.60, // 먹이 속도 패널티 (40% 감소)
  PREY_COUNT_MIN: 7,
  PREY_COUNT_MAX: 10,
  PREDATOR_COUNT_MIN: 4,
  PREDATOR_COUNT_MAX: 4,
  XP_PER_PREY: 10,

  // 필살기 설정
  ULTIMATE_PREY_REQUIRED: 3, // 필살기 충전에 필요한 먹이 수
  ULTIMATE_DURATION: 1500, // 필살기 지속 시간 (1.5초)

  // AI 행동 설정
  FLEE_DISTANCE: 150,  // 먹이가 도망치기 시작하는 거리
  CHASE_DISTANCE: 200, // 포식자가 추적하기 시작하는 거리
  MIN_SPAWN_DISTANCE: 150, // 플레이어로부터 최소 스폰 거리

  // 시각 설정
  PLAYER_COLOR: '#4A90E2',
  PREY_COLOR: '#4CAF50',
  PREDATOR_COLOR: '#E74C3C',
  BACKGROUND_COLOR: '#1a1a2e',

  // 게임 상태
  STATE: {
    START: 'START',
    STARTING_CREDIT: 'STARTING_CREDIT',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAMEOVER: 'GAMEOVER',
    VICTORY_ANIMATION: 'VICTORY_ANIMATION',
    ENDING_CREDIT: 'ENDING_CREDIT',
    VICTORY: 'VICTORY'
  },

  // 크레딧 영상 경로
  STARTING_CREDIT_VIDEO: 'assets/startingcredit.mp4',
  ENDING_CREDIT_VIDEO: 'assets/ending_credit.mp4',

  // 난이도 설정
  DIFFICULTY: 'EASY', // 'EASY' 또는 'HARD'

  // 하드 모드 설정
  HARD_MODE: {
    PREDATOR_SPEED_MULTIPLIER: 1.0, // 포식자 속도 (이지모드와 동일)
    DOCUMENT_THROW_INTERVAL: 2000, // 2초마다 서류 던지기 (밀리초)
    DOCUMENT_SPEED: 3.5, // 서류 속도
    DOCUMENT_SIZE: 18, // 서류 크기 (사원 크기)
    PREY_HIDE_BEHIND_PREDATOR_CHANCE: 0.1 // 먹이가 포식자 뒤로 숨을 확률 (20%)
  }
};
