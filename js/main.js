// 게임 메인 파일 - 게임 루프 및 초기화
const game = {
  // 캔버스 & 렌더링
  canvas: null,
  ctx: null,
  renderer: null,

  // 게임 상태
  state: CONFIG.STATE.START, // 시작 화면부터 시작
  startTime: null,
  lastFrameTime: 0,
  deltaTime: 0,

  // 난이도 선택 UI 상태
  selectedDifficulty: 0, // 0: Easy, 1: Hard
  difficultyScreenEnterTime: 0, // 난이도 선택 화면 진입 시간

  // 게임 객체 (나중에 초기화)
  player: null,
  entityManager: null,
  levelSystem: null,
  inputHandler: null,
  mobileControls: null,
  collisionDetector: null,
  ui: null,
  imageLoader: null,

  // 통계
  elapsedTime: 0,

  // 디버그
  godMode: false,

  // 승리 애니메이션
  victoryAnimationStartTime: null,
  victoryAnimationDuration: 3000, // 3초 동안 확대

  // 크레딧 비디오
  creditVideo: null,
  skipButton: null
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

  // 모바일 감지 및 캔버스 크기 조정
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                   (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);

  if (isMobile) {
    // 실제 화면 크기 감지
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // 화면의 98% 사용 (비율 고정 없이 최대한 활용)
    let canvasWidth = Math.floor(screenWidth * 0.98);
    let canvasHeight = Math.floor(screenHeight * 0.98);

    // 크기 제한 적용 (최소 400x300, 최대 1920x1080)
    canvasWidth = Math.max(400, Math.min(1920, canvasWidth));
    canvasHeight = Math.max(300, Math.min(1080, canvasHeight));

    // 캔버스 크기 설정
    game.canvas.width = canvasWidth;
    game.canvas.height = canvasHeight;
    CONFIG.CANVAS_WIDTH = canvasWidth;
    CONFIG.CANVAS_HEIGHT = canvasHeight;

    // 화면 면적 비율 계산 (PC 대비)
    const pcArea = 800 * 600;
    const mobileArea = canvasWidth * canvasHeight;
    const areaRatio = mobileArea / pcArea;

    // 개체 크기 스케일 팩터 (면적의 제곱근)
    const sizeScale = Math.sqrt(areaRatio);
    CONFIG.SIZE_SCALE = sizeScale;

    // 속도도 화면 크기에 맞춰 조정 (PC와 동일한 플레이 느낌 유지)
    CONFIG.BASE_SPEED = 2.5 * sizeScale;

    // 모든 레벨의 크기를 스케일 조정
    CONFIG.LEVELS.forEach(level => {
      level.size = Math.round(level.size * sizeScale);
    });

    // 거리 관련 값도 스케일 조정
    CONFIG.FLEE_DISTANCE = Math.round(CONFIG.FLEE_DISTANCE * sizeScale);
    CONFIG.CHASE_DISTANCE = Math.round(CONFIG.CHASE_DISTANCE * sizeScale);
    CONFIG.MIN_SPAWN_DISTANCE = Math.round(CONFIG.MIN_SPAWN_DISTANCE * sizeScale);
    CONFIG.MAX_SIZE = CONFIG.LEVELS[CONFIG.LEVELS.length - 1].size;

    // 개체 수도 면적 비율에 맞춰 조정 (약간만 증가)
    const countScale = Math.min(1.3, Math.sqrt(areaRatio));
    CONFIG.PREY_COUNT_MIN = Math.round(CONFIG.PREY_COUNT_MIN * countScale);
    CONFIG.PREY_COUNT_MAX = Math.round(CONFIG.PREY_COUNT_MAX * countScale);
    CONFIG.PREDATOR_COUNT_MAX = Math.round(CONFIG.PREDATOR_COUNT_MAX * countScale);

    console.log(`모바일 모드: 화면 ${screenWidth}x${screenHeight}, 캔버스 ${canvasWidth}x${canvasHeight}, 크기 스케일 ${sizeScale.toFixed(2)}, 개체 수 스케일 ${countScale.toFixed(2)}`);
  } else {
    // PC: 기본 크기 유지 (800x600)
    game.canvas.width = CONFIG.CANVAS_WIDTH;
    game.canvas.height = CONFIG.CANVAS_HEIGHT;
    CONFIG.SIZE_SCALE = 1.0;
    console.log('PC 모드: 캔버스 크기 800x600');
  }

  // ImageLoader 초기화 및 이미지 로드
  game.imageLoader = new ImageLoader();
  game.imageLoader.loadAll(() => {
    console.log('이미지 로드 완료, 게임 준비됨');
  });

  // Renderer 초기화 (imageLoader 전달)
  game.renderer = new Renderer(game.canvas, game.ctx, game.imageLoader);

  // 입력 핸들러 초기화
  game.inputHandler = new InputHandler(game.canvas);

  // 모바일 컨트롤 초기화
  game.mobileControls = new MobileControls(game.canvas);

  // 필살기 활성화 핸들러 (공통)
  const handleUltimateActivate = () => {
    if (game.state === CONFIG.STATE.PLAYING && game.player) {
      const activated = game.player.activateUltimate();
      if (activated) {
        console.log('필살기 활성화!');
      }
    }
  };

  // 키보드 필살기 활성화 핸들러 설정
  game.inputHandler.onUltimateActivate = handleUltimateActivate;

  // 모바일 필살기 활성화 핸들러 설정
  game.mobileControls.onUltimateActivate = handleUltimateActivate;

  // InputHandler에 모바일 컨트롤 연결
  game.inputHandler.setMobileControls(game.mobileControls);

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
      // 레벨업 시 약한 포식자 제거 및 재생성
      game.entityManager.cleanupWeakPredators(game.player);
    }

    // 먹이 제거 및 리스폰
    game.entityManager.removePrey(prey, game.player);

    // 최종 레벨 도달 시 승리 애니메이션 시작
    if (result.reachedMax) {
      game.state = CONFIG.STATE.VICTORY_ANIMATION;
      game.victoryAnimationStartTime = Date.now();
      console.log('승리! 호인 달성! 애니메이션 시작');
    }
  };

  game.collisionDetector.onGameOver = () => {
    game.state = CONFIG.STATE.GAMEOVER;
    console.log('게임 오버!');
  };

  // UI 초기화
  game.ui = new UI(game.renderer);

  // UI에 모바일 컨트롤 연결
  game.ui.setMobileControls(game.mobileControls);

  // 크레딧 비디오 초기화
  game.creditVideo = document.getElementById('creditVideo');
  game.skipButton = document.getElementById('skipButton');
  setupCreditVideo();
  setupSkipButton();

  console.log('게임 초기화 완료');

  // 난이도 선택 완료 함수
  const confirmDifficulty = () => {
    if (game.selectedDifficulty === 0) {
      CONFIG.DIFFICULTY = 'EASY';
      console.log('이지 모드 선택됨');
    } else {
      CONFIG.DIFFICULTY = 'HARD';
      console.log('하드 모드 선택됨');
    }
    startGame(); // 바로 게임 시작
  };

  // 난이도 선택 키보드 핸들러
  const handleDifficultyKeyboard = (e) => {
    if (game.state !== 'DIFFICULTY_SELECT') return;

    // 난이도 선택 화면 진입 직후 200ms 동안은 입력 무시 (영상 스킵 키와 중복 방지)
    const timeSinceEnter = Date.now() - game.difficultyScreenEnterTime;
    if (timeSinceEnter < 200) {
      console.log('난이도 선택 화면 진입 직후 입력 무시');
      return;
    }

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault();
        game.selectedDifficulty = 0; // Easy
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        game.selectedDifficulty = 1; // Hard
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        confirmDifficulty();
        break;
    }
  };

  // 난이도 선택 마우스 클릭 핸들러
  const handleDifficultyClick = (e) => {
    if (game.state !== 'DIFFICULTY_SELECT') return;

    const rect = game.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 버튼 영역 계산 (drawDifficultyScreen과 동일)
    const buttonWidth = 300;
    const buttonHeight = 60;
    const easyButtonX = CONFIG.CANVAS_WIDTH / 2 - buttonWidth / 2;
    const easyButtonY = CONFIG.CANVAS_HEIGHT / 2 - 20;
    const hardButtonX = CONFIG.CANVAS_WIDTH / 2 - buttonWidth / 2;
    const hardButtonY = CONFIG.CANVAS_HEIGHT / 2 + 80;

    // 이지 모드 버튼 클릭
    if (x >= easyButtonX && x <= easyButtonX + buttonWidth &&
        y >= easyButtonY && y <= easyButtonY + buttonHeight) {
      game.selectedDifficulty = 0;
      confirmDifficulty();
      return;
    }

    // 하드 모드 버튼 클릭
    if (x >= hardButtonX && x <= hardButtonX + buttonWidth &&
        y >= hardButtonY && y <= hardButtonY + buttonHeight) {
      game.selectedDifficulty = 1;
      confirmDifficulty();
      return;
    }
  };

  // 난이도 선택 이벤트 리스너
  window.addEventListener('keydown', handleDifficultyKeyboard);
  game.canvas.addEventListener('click', handleDifficultyClick);

  // 모바일 터치 지원
  if (game.mobileControls.isMobile) {
    game.canvas.addEventListener('touchstart', (e) => {
      if (game.state !== 'DIFFICULTY_SELECT') return;
      e.preventDefault();

      const touch = e.touches[0];
      const rect = game.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      // 버튼 영역 계산
      const buttonWidth = 300;
      const buttonHeight = 60;
      const easyButtonX = CONFIG.CANVAS_WIDTH / 2 - buttonWidth / 2;
      const easyButtonY = CONFIG.CANVAS_HEIGHT / 2 - 20;
      const hardButtonX = CONFIG.CANVAS_WIDTH / 2 - buttonWidth / 2;
      const hardButtonY = CONFIG.CANVAS_HEIGHT / 2 + 80;

      // 이지 모드 버튼 터치
      if (x >= easyButtonX && x <= easyButtonX + buttonWidth &&
          y >= easyButtonY && y <= easyButtonY + buttonHeight) {
        game.selectedDifficulty = 0;
        confirmDifficulty();
        return;
      }

      // 하드 모드 버튼 터치
      if (x >= hardButtonX && x <= hardButtonX + buttonWidth &&
          y >= hardButtonY && y <= hardButtonY + buttonHeight) {
        game.selectedDifficulty = 1;
        confirmDifficulty();
        return;
      }
    });
  }

  // 게임 시작 핸들러
  const handleGameStart = () => {
    if (game.state === CONFIG.STATE.START) {
      if (game.mobileControls.isMobile) {
        // 모바일에서는 시작 동영상 생략하고 바로 난이도 선택 화면으로
        game.state = 'DIFFICULTY_SELECT';
        console.log('모바일: 난이도 선택 화면으로 이동');
      } else {
        // PC에서는 시작 동영상 재생
        playStartingCredit();
      }
    }
  };

  // 클릭/터치로 게임 시작
  game.canvas.addEventListener('click', handleGameStart);

  // 모바일에서는 터치로도 시작 가능
  if (game.mobileControls.isMobile) {
    game.canvas.addEventListener('touchstart', (e) => {
      if (game.state === CONFIG.STATE.START) {
        e.preventDefault();
        // 모바일에서는 시작 동영상 생략하고 바로 난이도 선택 화면으로
        game.state = 'DIFFICULTY_SELECT';
        console.log('모바일: 난이도 선택 화면으로 이동');
      }
    });
  }

  // 엔터키로도 게임 시작 가능 (PC만)
  if (!game.mobileControls.isMobile) {
    const handleEnterKey = (e) => {
      if (e.key === 'Enter' && game.state === CONFIG.STATE.START) {
        playStartingCredit();
      }
    };
    window.addEventListener('keydown', handleEnterKey);
  }

  // 디버그 키 설정
  setupDebugKeys();

  // 게임 루프 시작
  requestAnimationFrame(gameLoop);
}

// 디버그 키 설정
function setupDebugKeys() {
  // 게임 오버/승리 시 재시작 (터치)
  if (game.mobileControls.isMobile) {
    game.canvas.addEventListener('touchstart', (e) => {
      if (game.state === CONFIG.STATE.GAMEOVER || game.state === CONFIG.STATE.VICTORY) {
        e.preventDefault();
        resetGame(); // 난이도 선택 화면으로
      }
    });
  }

  // 키보드 이벤트
  window.addEventListener('keydown', (e) => {
    // 게임 오버/승리 시 엔터키로 재시작
    if (e.key === 'Enter' && (game.state === CONFIG.STATE.GAMEOVER || game.state === CONFIG.STATE.VICTORY)) {
      resetGame(); // 난이도 선택 화면으로
      return;
    }

    if (game.state !== CONFIG.STATE.PLAYING) return;

    switch (e.key.toLowerCase()) {
      case 'l':
        // 즉시 레벨업
        if (game.levelSystem.currentLevel < CONFIG.LEVELS.length - 1) {
          game.levelSystem.currentLevel++;
          game.ui.showLevelUpNotification(game.levelSystem.getCurrentLevel().name);
          // 레벨업 시 약한 포식자 제거 및 재생성
          game.entityManager.cleanupWeakPredators(game.player);
          console.log('디버그: 레벨업!', game.levelSystem.getCurrentLevel().name);
        }
        break;

      case 'g':
        // 무적 모드 토글
        game.godMode = !game.godMode;
        console.log('디버그: 무적 모드', game.godMode ? 'ON' : 'OFF');
        break;

      case 'r':
        // 게임 리셋 (완전 새로고침)
        location.reload();
        break;
    }
  });
}

// 크레딧 비디오 설정
function setupCreditVideo() {
  const video = game.creditVideo;

  // 비디오 종료 이벤트
  video.addEventListener('ended', () => {
    if (game.state === CONFIG.STATE.STARTING_CREDIT) {
      // 오프닝 크레딧 끝나면 난이도 선택 화면으로
      hideVideo();
      game.state = 'DIFFICULTY_SELECT';
      game.difficultyScreenEnterTime = Date.now(); // 진입 시간 기록
      console.log('난이도 선택 화면으로 이동');
    } else if (game.state === CONFIG.STATE.ENDING_CREDIT) {
      // 엔딩 크레딧 끝나면 승리 화면
      hideVideo();
      game.state = CONFIG.STATE.VICTORY;
      console.log('엔딩 크레딧 완료');
    }
  });

  // ESC나 Enter로 스킵 가능
  const handleSkip = (e) => {
    if ((e.key === 'Escape' || e.key === 'Enter') &&
        (game.state === CONFIG.STATE.STARTING_CREDIT || game.state === CONFIG.STATE.ENDING_CREDIT)) {
      e.preventDefault();
      e.stopImmediatePropagation(); // 다른 핸들러로 이벤트 전파 방지
      skipVideo();
    }
  };
  window.addEventListener('keydown', handleSkip);
}

// 스킵 버튼 설정
function setupSkipButton() {
  game.skipButton.addEventListener('click', () => {
    skipVideo();
  });
}

// 비디오 스킵
function skipVideo() {
  const video = game.creditVideo;
  video.pause();

  // 상태에 따라 다음 단계로 진행
  if (game.state === CONFIG.STATE.STARTING_CREDIT) {
    hideVideo();
    game.state = 'DIFFICULTY_SELECT';
    game.difficultyScreenEnterTime = Date.now(); // 진입 시간 기록
    console.log('오프닝 크레딧 스킵됨, 난이도 선택 화면으로 이동');
  } else if (game.state === CONFIG.STATE.ENDING_CREDIT) {
    hideVideo();
    game.state = CONFIG.STATE.VICTORY;
    console.log('엔딩 크레딧 스킵됨');
  }
}

// 비디오 표시
function showVideo(videoSrc) {
  const video = game.creditVideo;
  const canvas = game.canvas;

  console.log('비디오 재생 시도:', videoSrc);

  // 비디오 소스 설정
  video.src = videoSrc;
  video.load(); // 명시적으로 로드

  // 화면 전환
  canvas.style.display = 'none';
  video.style.display = 'block';

  console.log('캔버스 숨김, 비디오 표시');
  console.log('비디오 display:', video.style.display);
  console.log('캔버스 display:', canvas.style.display);

  // 비디오가 로드되면 재생
  const playVideo = () => {
    video.play()
      .then(() => {
        console.log('비디오 재생 성공');
      })
      .catch(err => {
        console.error('비디오 재생 실패:', err);
        alert('비디오 재생에 실패했습니다. 건너뜁니다.');
        // 비디오 재생 실패 시 다음 단계로 진행
        video.dispatchEvent(new Event('ended'));
      });
  };

  // 비디오 데이터 로드 완료 시 재생
  if (video.readyState >= 3) {
    // 이미 로드됨
    playVideo();
  } else {
    // 로드 대기
    video.addEventListener('canplay', playVideo, { once: true });
  }
}

// 비디오 숨김
function hideVideo() {
  const video = game.creditVideo;
  const canvas = game.canvas;

  video.style.display = 'none';
  canvas.style.display = 'block';
  video.src = '';
  game.skipButton.style.display = 'none'; // 스킵 버튼 숨김
}

// 오프닝 크레딧 재생
function playStartingCredit() {
  game.state = CONFIG.STATE.STARTING_CREDIT;
  showVideo(CONFIG.STARTING_CREDIT_VIDEO);
  game.skipButton.style.display = 'block'; // 스킵 버튼 표시
  console.log('오프닝 크레딧 재생 시작');
}

// 엔딩 크레딧 재생
function playEndingCredit() {
  game.state = CONFIG.STATE.ENDING_CREDIT;
  showVideo(CONFIG.ENDING_CREDIT_VIDEO);
  console.log('엔딩 크레딧 재생 시작');
}

// 게임 재시작 (난이도 선택 화면으로)
function resetGame() {
  // 게임 상태 초기화
  game.state = 'DIFFICULTY_SELECT';
  game.selectedDifficulty = 0;
  game.difficultyScreenEnterTime = Date.now();
  game.startTime = null;
  game.elapsedTime = 0;
  game.godMode = false;
  game.victoryAnimationStartTime = null;

  // 레벨 시스템 초기화
  game.levelSystem = new LevelSystem();

  // 플레이어 초기화
  game.player = new Player(
    CONFIG.CANVAS_WIDTH / 2,
    CONFIG.CANVAS_HEIGHT / 2,
    game.levelSystem
  );

  // 개체 관리자 초기화
  game.entityManager = new EntityManager();

  console.log('게임 재시작: 난이도 선택 화면으로 이동');
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
      game.godMode,
      game.entityManager.documentArray
    );
  } else if (game.state === CONFIG.STATE.VICTORY_ANIMATION) {
    // 승리 애니메이션 업데이트
    const elapsed = Date.now() - game.victoryAnimationStartTime;
    const progress = Math.min(elapsed / game.victoryAnimationDuration, 1);

    // 플레이어 크기를 화면 대각선 길이까지 확대
    const targetSize = Math.sqrt(CONFIG.CANVAS_WIDTH ** 2 + CONFIG.CANVAS_HEIGHT ** 2);
    const initialSize = game.levelSystem.getCurrentSize();
    game.player.radius = initialSize + (targetSize - initialSize) * progress;

    // 애니메이션 완료 시 엔딩 크레딧 재생
    if (progress >= 1) {
      playEndingCredit();
      console.log('승리 애니메이션 완료, 엔딩 크레딧 시작');
    }
  }
}

// 게임 렌더링
function render() {
  // 크레딧 재생 중에는 렌더링하지 않음
  if (game.state === CONFIG.STATE.STARTING_CREDIT || game.state === CONFIG.STATE.ENDING_CREDIT) {
    return;
  }

  if (game.state === 'DIFFICULTY_SELECT') {
    // 난이도 선택 화면 (선택된 항목 전달)
    game.ui.drawDifficultyScreen(game.selectedDifficulty);
  } else if (game.state === CONFIG.STATE.START) {
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
      game.godMode,
      game.entityManager.documentArray
    );

    // HUD 그리기
    game.ui.drawHUD(game.levelSystem, game.elapsedTime, game.player, game.godMode);
  } else if (game.state === CONFIG.STATE.VICTORY_ANIMATION) {
    // 승리 애니메이션 화면
    game.renderer.renderFrame(
      game.player,
      game.entityManager.preyArray,
      game.entityManager.predatorArray,
      game.levelSystem,
      game.elapsedTime,
      game.state,
      game.godMode,
      game.entityManager.documentArray
    );
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
