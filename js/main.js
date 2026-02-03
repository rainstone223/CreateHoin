// 게임 메인 파일 - 게임 루프 및 초기화
const game = {
  // 캔버스 & 렌더링
  canvas: null,
  ctx: null,
  renderer: null,

  // 게임 상태
  state: CONFIG.STATE.START,
  startTime: null,
  lastFrameTime: 0,
  deltaTime: 0,

  // 게임 객체 (나중에 초기화)
  player: null,
  entityManager: null,
  levelSystem: null,
  inputHandler: null,
  collisionDetector: null,
  ui: null,

  // 통계
  elapsedTime: 0,

  // 디버그
  godMode: false
};

// 게임 초기화
function init() {
  // 캔버스 가져오기
  game.canvas = document.getElementById('gameCanvas');
  game.ctx = game.canvas.getContext('2d');

  if (!game.ctx) {
    alert('Canvas를 지원하지 않는 브라우저입니다.');
    return;
  }

  // Renderer 초기화
  game.renderer = new Renderer(game.canvas, game.ctx);

  // 입력 핸들러 초기화
  game.inputHandler = new InputHandler(game.canvas);

  // 레벨 시스템 초기화
  game.levelSystem = new LevelSystem();

  // 플레이어 초기화 (중앙에서 시작)
  game.player = new Player(
    CONFIG.CANVAS_WIDTH / 2,
    CONFIG.CANVAS_HEIGHT / 2,
    game.levelSystem
  );

  // 개체 관리자 초기화 (아직 사용 안 함)
  game.entityManager = new EntityManager();

  // 충돌 감지 초기화
  game.collisionDetector = new CollisionDetector();

  // 충돌 이벤트 핸들러 설정
  game.collisionDetector.onPreyEaten = (prey) => {
    // 먹이를 먹었을 때
    const result = game.player.gainXP(CONFIG.XP_PER_PREY);

    // 레벨업 알림
    if (result.leveledUp) {
      game.ui.showLevelUpNotification(game.levelSystem.getCurrentLevel().name);
    }

    // 먹이 제거 및 리스폰
    game.entityManager.removePrey(prey, game.player);

    // 최종 레벨 도달 시 승리
    if (result.reachedMax) {
      game.state = CONFIG.STATE.VICTORY;
      console.log('승리! 호인 달성!');
    }
  };

  game.collisionDetector.onGameOver = () => {
    game.state = CONFIG.STATE.GAMEOVER;
    console.log('게임 오버!');
  };

  // UI 초기화
  game.ui = new UI(game.renderer);

  console.log('게임 초기화 완료');

  // 클릭하면 게임 시작
  game.canvas.addEventListener('click', startGame, { once: true });

  // 엔터키로도 게임 시작 가능
  const handleEnterKey = (e) => {
    if (e.key === 'Enter' && game.state === CONFIG.STATE.START) {
      window.removeEventListener('keydown', handleEnterKey);
      startGame();
    }
  };
  window.addEventListener('keydown', handleEnterKey);

  // 디버그 키 설정
  setupDebugKeys();

  // 게임 루프 시작
  requestAnimationFrame(gameLoop);
}

// 디버그 키 설정
function setupDebugKeys() {
  window.addEventListener('keydown', (e) => {
    // 게임 오버/승리 시 엔터키로 재시작
    if (e.key === 'Enter' && (game.state === CONFIG.STATE.GAMEOVER || game.state === CONFIG.STATE.VICTORY)) {
      location.reload();
      return;
    }

    if (game.state !== CONFIG.STATE.PLAYING) return;

    switch (e.key.toLowerCase()) {
      case 'l':
        // 즉시 레벨업
        if (game.levelSystem.currentLevel < CONFIG.LEVELS.length - 1) {
          game.levelSystem.currentLevel++;
          game.ui.showLevelUpNotification(game.levelSystem.getCurrentLevel().name);
          console.log('디버그: 레벨업!', game.levelSystem.getCurrentLevel().name);
        }
        break;

      case 'g':
        // 무적 모드 토글
        game.godMode = !game.godMode;
        console.log('디버그: 무적 모드', game.godMode ? 'ON' : 'OFF');
        break;

      case 'r':
        // 게임 리셋
        location.reload();
        break;
    }
  });
}

// 게임 시작
function startGame() {
  game.state = CONFIG.STATE.PLAYING;
  game.startTime = Date.now();

  // 개체 초기화
  game.entityManager.initialize(game.player);

  console.log('게임 시작!');
}

// deltaTime 계산
function calculateDeltaTime(timestamp) {
  if (game.lastFrameTime === 0) {
    game.lastFrameTime = timestamp;
    return 0;
  }

  const delta = timestamp - game.lastFrameTime;
  game.lastFrameTime = timestamp;

  // 60 FPS 기준으로 정규화 (delta를 밀리초에서 초로 변환하고 60을 곱함)
  return (delta / 1000) * 60;
}

// 게임 업데이트
function update(deltaTime) {
  if (game.state === CONFIG.STATE.PLAYING) {
    // 경과 시간 업데이트
    game.elapsedTime = (Date.now() - game.startTime) / 1000; // 초 단위

    // 키보드 입력 가져오기
    const direction = game.inputHandler.getMovementDirection();

    // 플레이어 업데이트
    game.player.update(direction, deltaTime);

    // 개체 업데이트
    game.entityManager.updateAll(game.player, deltaTime);

    // 화면 밖으로 나간 개체 리스폰
    game.entityManager.respawnOutOfBounds(game.player);

    // 충돌 감지
    game.collisionDetector.checkCollisions(
      game.player,
      game.entityManager.preyArray,
      game.entityManager.predatorArray,
      game.godMode
    );
  }
}

// 게임 렌더링
function render() {
  if (game.state === CONFIG.STATE.START) {
    // 시작 화면
    game.ui.drawStartScreen();
  } else if (game.state === CONFIG.STATE.PLAYING) {
    // 게임 화면
    game.renderer.renderFrame(
      game.player,
      game.entityManager.preyArray,
      game.entityManager.predatorArray,
      game.levelSystem,
      game.elapsedTime,
      game.state,
      game.godMode
    );

    // HUD 그리기
    game.ui.drawHUD(game.levelSystem, game.elapsedTime, game.godMode);
  } else if (game.state === CONFIG.STATE.GAMEOVER) {
    // 게임 오버 화면
    game.ui.drawGameOverScreen(game.levelSystem, game.elapsedTime);
  } else if (game.state === CONFIG.STATE.VICTORY) {
    // 승리 화면
    game.ui.drawVictoryScreen(game.elapsedTime);
  }
}

// 게임 루프
function gameLoop(timestamp) {
  // deltaTime 계산
  game.deltaTime = calculateDeltaTime(timestamp);

  // 업데이트
  update(game.deltaTime);

  // 렌더링
  render();

  // 다음 프레임 요청
  requestAnimationFrame(gameLoop);
}

// 페이지 로드 시 게임 초기화
window.addEventListener('load', init);
