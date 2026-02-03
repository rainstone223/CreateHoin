// 게임 설정 상수
const CONFIG = {
  // 캔버스 설정
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,

  // 게임 경계 (스폰 시 가장자리 패딩)
  BOUNDARY_PADDING: 50,

  // 레벨 정의 (6단계) - 크기 증가, 경험치 완만하게 조정
  LEVELS: [
    { name: "사원", size: 18, xpRequired: 0, image: "assets/sawon.png" },
    { name: "대리", size: 23, xpRequired: 50, image: "assets/daeri.png" },
    { name: "과장", size: 28, xpRequired: 110, image: "assets/gwajang.png" },
    { name: "부장", size: 34, xpRequired: 180, image: "assets/bujang.png" },
    { name: "사장", size: 41, xpRequired: 260, image: "assets/sajang.png" },
    { name: "회장", size: 50, xpRequired: 600, image: "assets/hweojang.png" } // 포식자 최고 레벨 (플레이어는 "호인")
  ],

  // 플레이어 이미지 (레벨과 무관하게 항상 호인)
  PLAYER_IMAGE: "assets/hoin.png",

  // 개체 설정
  BASE_SPEED: 2.5, // 기본 속도 (초기 세팅으로 복원)
  MAX_SIZE: 50, // 최대 크기 (속도 계산용)
  SPEED_VARIATION: 0.4, // 속도 변화 지수 (큰 개체일수록 더 느리게)
  PLAYER_SPEED_BOOST: 1.25, // 플레이어 속도 부스트 (같은 크기 대비 25% 빠름)
  PREDATOR_SPEED_PENALTY: 0.95, // 포식자 속도 패널티 (5% 감소)
  PREY_SPEED_PENALTY: 0.65, // 먹이 속도 패널티 (15% 감소)
  PREY_COUNT_MIN: 7,
  PREY_COUNT_MAX: 10,
  PREDATOR_COUNT_MIN: 4,
  PREDATOR_COUNT_MAX: 4,
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
