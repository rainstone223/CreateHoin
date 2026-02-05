// UI 시스템
class UI {
  constructor(renderer) {
    this.renderer = renderer;
    this.levelUpNotification = null; // 레벨업 알림
    this.levelUpTime = 0;
    this.mobileControls = null; // 모바일 컨트롤 참조
  }

  // 모바일 컨트롤 설정
  setMobileControls(mobileControls) {
    this.mobileControls = mobileControls;
  }

  // 시작 화면
  drawStartScreen() {
    const ctx = this.renderer.ctx;
    const imageLoader = this.renderer.imageLoader;

    // 시작 화면 이미지 표시
    const startImage = imageLoader.images['start-screen'];
    if (startImage && startImage.complete) {
      // 캔버스 크기에 맞게 이미지 그리기
      ctx.drawImage(startImage, 0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    } else {
      // 이미지 로드 실패 시 기존 UI 사용
      this.renderer.drawBackground();

      // 제목 (큰 노란색)
      this.renderer.drawText(
        '호인 키우기',
        CONFIG.CANVAS_WIDTH / 2,
        CONFIG.CANVAS_HEIGHT / 2 - 150,
        64,
        '#FFD700',
        'center',
        'middle'
      );

      // 부제목 (흰색)
      this.renderer.drawText(
        '작은 호인이 성장하여 최종 단계 "호인"에 도달하세요!',
        CONFIG.CANVAS_WIDTH / 2,
        CONFIG.CANVAS_HEIGHT / 2 - 80,
        18,
        'rgba(255, 255, 255, 0.9)',
        'center',
        'middle'
      );

      // 조작 방법 (밝은 회색) - 모바일 여부에 따라 다르게 표시
      const isMobile = this.mobileControls && this.mobileControls.isMobile;
      const controlText = isMobile
        ? '조이스틱으로 호인을 조작하세요'
        : 'WASD 또는 화살표 키로 호인을 조작하세요';

      this.renderer.drawText(
        controlText,
        CONFIG.CANVAS_WIDTH / 2,
        CONFIG.CANVAS_HEIGHT / 2 - 45,
        16,
        'rgba(200, 200, 200, 0.8)',
        'center',
        'middle'
      );

      // 시작 버튼 (초록색, 깜빡임 효과)
      const pulse = Math.sin(Date.now() / 300) * 0.2 + 0.8;
      const startText = isMobile ? '화면을 터치하여 시작' : '클릭하여 시작';
      this.renderer.drawText(
        startText,
        CONFIG.CANVAS_WIDTH / 2,
        CONFIG.CANVAS_HEIGHT / 2 + 30,
        32,
        `rgba(76, 175, 80, ${pulse})`,
        'center',
        'middle'
      );

      // 엔터키 안내 (작은 텍스트) - 모바일이 아닐 때만
      if (!isMobile) {
        this.renderer.drawText(
          '또는 Enter 키를 눌러 시작',
          CONFIG.CANVAS_WIDTH / 2,
          CONFIG.CANVAS_HEIGHT / 2 + 65,
          14,
          'rgba(150, 150, 150, 0.7)',
          'center',
          'middle'
        );
      }

      // 구분선
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(CONFIG.CANVAS_WIDTH / 2 - 200, CONFIG.CANVAS_HEIGHT / 2 + 100);
      ctx.lineTo(CONFIG.CANVAS_WIDTH / 2 + 200, CONFIG.CANVAS_HEIGHT / 2 + 100);
      ctx.stroke();

      // 규칙 (작은 글씨, 정렬)
      const rules = [
        '• 초록색 개체를 먹어 성장하세요',
        '• 빨간색 개체는 피하세요 (게임 오버)',
        '• 6단계를 거쳐 "호인"이 되면 승리!'
      ];

      rules.forEach((rule, index) => {
        this.renderer.drawText(
          rule,
          CONFIG.CANVAS_WIDTH / 2,
          CONFIG.CANVAS_HEIGHT / 2 + 125 + index * 22,
          13,
          'rgba(180, 180, 180, 0.7)',
          'center',
          'middle'
        );
      });
    }
  }

  // HUD 그리기
  drawHUD(levelSystem, elapsedTime, player, godMode = false) {
    const ctx = this.renderer.ctx;

    // 좌상단: 현재 레벨
    const levelName = levelSystem.getCurrentLevel().name;
    this.renderer.drawText(`직급: ${levelName}`, 20, 20, 22, 'white');

    // 상단 중앙: 경험치 바
    const barWidth = 250;
    const barHeight = 25;
    const barX = (CONFIG.CANVAS_WIDTH - barWidth) / 2;
    const barY = 15;
    const progress = levelSystem.getProgressPercent();

    // 배경 (어두운 테두리)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);

    // 배경 바
    ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // 진행 바 (그라디언트)
    const gradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
    gradient.addColorStop(0, '#4CAF50');
    gradient.addColorStop(1, '#8BC34A');
    ctx.fillStyle = gradient;
    ctx.fillRect(barX, barY, (barWidth * progress) / 100, barHeight);

    // 테두리
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // XP 텍스트
    const nextLevel = levelSystem.getNextLevel();
    const xpText = nextLevel
      ? `${levelSystem.xp} / ${nextLevel.xpRequired} XP`
      : 'MAX';
    this.renderer.drawText(
      xpText,
      CONFIG.CANVAS_WIDTH / 2,
      barY + barHeight + 8,
      13,
      'white',
      'center'
    );

    // 우상단: 경과 시간
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = Math.floor(elapsedTime % 60);
    const timeText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    this.renderer.drawText(
      `시간: ${timeText}`,
      CONFIG.CANVAS_WIDTH - 20,
      20,
      22,
      'white',
      'right'
    );

    // 레벨업 알림
    if (this.levelUpNotification) {
      const alpha = Math.max(0, 1 - (Date.now() - this.levelUpTime) / 2000);
      if (alpha > 0) {
        this.renderer.drawText(
          `레벨업! ${this.levelUpNotification}`,
          CONFIG.CANVAS_WIDTH / 2,
          CONFIG.CANVAS_HEIGHT / 2 - 100,
          36,
          `rgba(255, 215, 0, ${alpha})`,
          'center',
          'middle'
        );
      } else {
        this.levelUpNotification = null;
      }
    }

    // 무적 모드 표시
    if (godMode) {
      this.renderer.drawText(
        '무적 모드 (G)',
        CONFIG.CANVAS_WIDTH / 2,
        CONFIG.CANVAS_HEIGHT - 30,
        18,
        '#FFD700',
        'center',
        'middle'
      );
    }

    // 디버그 키 안내 (좌하단)
    this.renderer.drawText(
      'L: 레벨업 | G: 무적 | R: 리셋',
      10,
      CONFIG.CANVAS_HEIGHT - 15,
      12,
      'rgba(255, 255, 255, 0.3)',
      'left',
      'middle'
    );

    // 필살기 게이지 (하단 중앙) - 모바일이 아닐 때만
    const isMobile = this.mobileControls && this.mobileControls.isMobile;
    if (!isMobile) {
      this.drawUltimateGauge(player);
    }

    // 모바일 컨트롤 그리기
    if (this.mobileControls && this.mobileControls.isMobile) {
      this.mobileControls.draw(this.renderer.ctx);
    }
  }

  // 필살기 게이지 그리기
  drawUltimateGauge(player) {
    const ctx = this.renderer.ctx;
    const gaugeWidth = 200;
    const gaugeHeight = 20;
    const gaugeX = (CONFIG.CANVAS_WIDTH - gaugeWidth) / 2;
    const gaugeY = CONFIG.CANVAS_HEIGHT - 40;

    // 배경 (반투명 검은색)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(gaugeX - 2, gaugeY - 2, gaugeWidth + 4, gaugeHeight + 4);

    // 배경 바
    ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
    ctx.fillRect(gaugeX, gaugeY, gaugeWidth, gaugeHeight);

    // 진행 바
    const progress = player.getUltimateProgress();
    const gradient = ctx.createLinearGradient(gaugeX, gaugeY, gaugeX + gaugeWidth, gaugeY);

    if (player.ultimateActive) {
      // 필살기 활성화 중 - 금색 깜빡임
      const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7;
      gradient.addColorStop(0, `rgba(255, 215, 0, ${pulse})`);
      gradient.addColorStop(1, `rgba(255, 165, 0, ${pulse})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(gaugeX, gaugeY, gaugeWidth, gaugeHeight);
    } else if (player.ultimateReady) {
      // 필살기 준비 완료 - 밝은 금색 깜빡임
      const pulse = Math.sin(Date.now() / 200) * 0.2 + 0.8;
      gradient.addColorStop(0, `rgba(255, 215, 0, ${pulse})`);
      gradient.addColorStop(1, `rgba(255, 165, 0, ${pulse})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(gaugeX, gaugeY, gaugeWidth, gaugeHeight);
    } else {
      // 충전 중 - 파란색
      gradient.addColorStop(0, '#4A90E2');
      gradient.addColorStop(1, '#2E5C8A');
      ctx.fillStyle = gradient;
      ctx.fillRect(gaugeX, gaugeY, (gaugeWidth * progress) / 100, gaugeHeight);
    }

    // 테두리
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(gaugeX, gaugeY, gaugeWidth, gaugeHeight);

    // 텍스트
    let gaugeText = '';
    if (player.ultimateActive) {
      const remaining = Math.ceil((player.ultimateEndTime - Date.now()) / 1000);
      gaugeText = `필살기 활성화! (${remaining}초)`;
    } else if (player.ultimateReady) {
      gaugeText = '필살기 준비 완료! [Space]';
    } else {
      gaugeText = `필살기 충전 중... (${player.preyEatenCount}/${CONFIG.ULTIMATE_PREY_REQUIRED})`;
    }

    this.renderer.drawText(
      gaugeText,
      CONFIG.CANVAS_WIDTH / 2,
      gaugeY - 8,
      12,
      'rgba(255, 255, 255, 0.9)',
      'center',
      'bottom'
    );
  }

  // 레벨업 알림 표시
  showLevelUpNotification(levelName) {
    this.levelUpNotification = levelName;
    this.levelUpTime = Date.now();
  }

  // 게임 오버 화면
  drawGameOverScreen(levelSystem, elapsedTime) {
    this.renderer.drawBackground();

    // "Game Over" 텍스트
    this.renderer.drawText(
      'GAME OVER',
      CONFIG.CANVAS_WIDTH / 2,
      CONFIG.CANVAS_HEIGHT / 2 - 100,
      64,
      '#E74C3C',
      'center',
      'middle'
    );

    // 도달 레벨
    const levelName = levelSystem.getCurrentLevel().name;
    this.renderer.drawText(
      `도달 직급: ${levelName}`,
      CONFIG.CANVAS_WIDTH / 2,
      CONFIG.CANVAS_HEIGHT / 2 - 20,
      28,
      'white',
      'center',
      'middle'
    );

    // 획득 XP
    this.renderer.drawText(
      `획득 경험치: ${levelSystem.xp} XP`,
      CONFIG.CANVAS_WIDTH / 2,
      CONFIG.CANVAS_HEIGHT / 2 + 20,
      20,
      'rgba(255, 255, 255, 0.8)',
      'center',
      'middle'
    );

    // 경과 시간
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = Math.floor(elapsedTime % 60);
    const timeText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    this.renderer.drawText(
      `생존 시간: ${timeText}`,
      CONFIG.CANVAS_WIDTH / 2,
      CONFIG.CANVAS_HEIGHT / 2 + 60,
      20,
      'rgba(255, 255, 255, 0.8)',
      'center',
      'middle'
    );

    // 재시작 안내 - 모바일 여부에 따라 다르게 표시
    const isMobile = this.mobileControls && this.mobileControls.isMobile;
    const restartText = isMobile ? '화면을 터치하여 재시작' : 'Enter를 눌러 재시작';
    this.renderer.drawText(
      restartText,
      CONFIG.CANVAS_WIDTH / 2,
      CONFIG.CANVAS_HEIGHT / 2 + 120,
      22,
      '#4CAF50',
      'center',
      'middle'
    );
  }

  // 승리 화면
  drawVictoryScreen(elapsedTime) {
    this.renderer.drawBackground();

    // "호인 달성!" 텍스트 (깜빡임 효과)
    const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
    this.renderer.drawText(
      '호인 달성!',
      CONFIG.CANVAS_WIDTH / 2,
      CONFIG.CANVAS_HEIGHT / 2 - 100,
      72,
      `rgba(255, 215, 0, ${pulse})`,
      'center',
      'middle'
    );

    // 축하 메시지
    this.renderer.drawText(
      '축하합니다!',
      CONFIG.CANVAS_WIDTH / 2,
      CONFIG.CANVAS_HEIGHT / 2 - 20,
      32,
      'white',
      'center',
      'middle'
    );

    this.renderer.drawText(
      '최종 단계에 도달했습니다!',
      CONFIG.CANVAS_WIDTH / 2,
      CONFIG.CANVAS_HEIGHT / 2 + 20,
      24,
      'rgba(255, 255, 255, 0.9)',
      'center',
      'middle'
    );

    // 클리어 시간
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = Math.floor(elapsedTime % 60);
    const timeText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    this.renderer.drawText(
      `클리어 시간: ${timeText}`,
      CONFIG.CANVAS_WIDTH / 2,
      CONFIG.CANVAS_HEIGHT / 2 + 70,
      22,
      '#FFD700',
      'center',
      'middle'
    );

    // 재시작 안내 - 모바일 여부에 따라 다르게 표시
    const isMobile = this.mobileControls && this.mobileControls.isMobile;
    const restartText = isMobile ? '화면을 터치하여 다시 플레이' : 'Enter를 눌러 다시 플레이';
    this.renderer.drawText(
      restartText,
      CONFIG.CANVAS_WIDTH / 2,
      CONFIG.CANVAS_HEIGHT / 2 + 120,
      20,
      '#4CAF50',
      'center',
      'middle'
    );
  }
}
