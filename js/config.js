// 게임 설정 상수
const CONFIG = {
  // 캔버스 설정
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,

  // 게임 경계 (스폰 시 가장자리 패딩)
  BOUNDARY_PADDING: 50,

  // 레벨 정의 (9단계) - 크기 축소
  LEVELS: [
    { name: "사원", size: 12, xpRequired: 0 },
    { name: "대리", size: 15, xpRequired: 100 },
    { name: "과장", size: 18, xpRequired: 250 },
    { name: "차장", size: 22, xpRequired: 450 },
    { name: "부장", size: 26, xpRequired: 700 },
    { name: "임원", size: 31, xpRequired: 1000 },
    { name: "사장", size: 37, xpRequired: 1400 },
    { name: "회장", size: 44, xpRequired: 1900 },
    { name: "호인", size: 53, xpRequired: 2500 }
  ],

  // 개체 설정
  ENTITY_SPEED: 2.5, // 모든 개체 동일 속도
  PREY_COUNT_MIN: 5,
  PREY_COUNT_MAX: 10,
  PREDATOR_COUNT_MIN: 4,
  PREDATOR_COUNT_MAX: 6,
  XP_PER_PREY: 10,

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
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAMEOVER: 'GAMEOVER',
    VICTORY: 'VICTORY'
  }
};
