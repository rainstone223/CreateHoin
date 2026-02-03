// 캔버스 렌더링 시스템
class Renderer {
  constructor(canvas, ctx, imageLoader = null) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.imageLoader = imageLoader;
  }

  // 캔버스 초기화
  clear() {
    this.ctx.fillStyle = CONFIG.BACKGROUND_COLOR;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // 배경 그리기 (격자 패턴 추가)
  drawBackground() {
    this.clear();

    // 격자 패턴 그리기
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.lineWidth = 1;

    // 세로선
    for (let x = 0; x < this.canvas.width; x += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    // 가로선
    for (let y = 0; y < this.canvas.height; y += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  // 원형 개체 그리기
  drawCircle(x, y, radius, fillColor, strokeColor = 'rgba(255, 255, 255, 0.3)', strokeWidth = 2) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = fillColor;
    this.ctx.fill();

    if (strokeColor) {
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = strokeWidth;
      this.ctx.stroke();
    }
  }

  // 텍스트 그리기
  drawText(text, x, y, fontSize = 16, color = 'white', align = 'left', baseline = 'top') {
    this.ctx.font = `${fontSize}px 'Malgun Gothic', sans-serif`;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = baseline;
    this.ctx.fillText(text, x, y);
  }

  // 개체 그리기 (Entity, Prey, Predator)
  drawEntity(entity, color) {
    // 이미지 로더가 있고 이미지가 로드되었으면 이미지 렌더링
    if (this.imageLoader && this.imageLoader.isLoaded() &&
        entity.level !== undefined && entity.level >= 0 && entity.level < CONFIG.LEVELS.length) {
      const img = this.imageLoader.getLevelImage(entity.level);

      if (img && img.complete) {
        // 이미지를 원형 크기에 맞춰 그리기
        const size = entity.radius * 2;
        this.ctx.drawImage(
          img,
          entity.x - entity.radius,
          entity.y - entity.radius,
          size,
          size
        );

        // 이미지 위에 원형 테두리 추가
        this.ctx.beginPath();
        this.ctx.arc(entity.x, entity.y, entity.radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
      } else {
        // 이미지 로드 실패 시 원형으로 폴백
        this.drawCircle(entity.x, entity.y, entity.radius, color);
      }
    } else {
      // 이미지 로더가 없거나 로드 중이면 원형으로 그리기
      this.drawCircle(entity.x, entity.y, entity.radius, color);
    }

    // 개체 레벨명 라벨 표시
    if (entity.level !== undefined && entity.level >= 0 && entity.level < CONFIG.LEVELS.length) {
      const levelName = CONFIG.LEVELS[entity.level].name;
      this.drawText(
        levelName,
        entity.x,
        entity.y + entity.radius + 8,
        10,
        'rgba(255, 255, 255, 0.8)',
        'center',
        'top'
      );
    }
  }

  // 플레이어 그리기 (최종 레벨인 경우 특별 표시)
  drawPlayer(player, isHoinLevel = false, godMode = false) {
    // 무적 모드일 때 깜빡임 효과
    if (godMode) {
      const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7;
      this.ctx.globalAlpha = pulse;
    }

    // 이미지 로더가 있고 이미지가 로드되었으면 이미지 렌더링
    if (this.imageLoader && this.imageLoader.isLoaded()) {
      const img = this.imageLoader.getPlayerImage();

      if (img && img.complete) {
        // 호인 이미지를 플레이어 크기에 맞춰 그리기
        const size = player.radius * 2;
        this.ctx.drawImage(
          img,
          player.x - player.radius,
          player.y - player.radius,
          size,
          size
        );
      } else {
        // 이미지 로드 실패 시 원형으로 폴백
        this.drawCircle(
          player.x,
          player.y,
          player.radius,
          godMode ? '#FFD700' : CONFIG.PLAYER_COLOR,
          godMode ? 'rgba(255, 215, 0, 0.8)' : 'rgba(255, 255, 255, 0.6)',
          3
        );
      }
    } else {
      // 이미지 로더가 없거나 로드 중이면 원형으로 그리기
      this.drawCircle(
        player.x,
        player.y,
        player.radius,
        godMode ? '#FFD700' : CONFIG.PLAYER_COLOR,
        godMode ? 'rgba(255, 215, 0, 0.8)' : 'rgba(255, 255, 255, 0.6)',
        3
      );
    }

    // 최종 레벨인 경우 후광 효과
    if (isHoinLevel) {
      this.ctx.beginPath();
      this.ctx.arc(player.x, player.y, player.radius + 10, 0, Math.PI * 2);
      this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
      this.ctx.lineWidth = 5;
      this.ctx.stroke();
    }

    // 무적 모드일 때 외곽선 추가
    if (godMode) {
      this.ctx.beginPath();
      this.ctx.arc(player.x, player.y, player.radius + 5, 0, Math.PI * 2);
      this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
    }

    // 알파 값 리셋
    this.ctx.globalAlpha = 1;
  }

  // 전체 프레임 렌더링
  renderFrame(player, preyArray, predatorArray, levelSystem, elapsedTime, gameState, godMode = false) {
    // 배경 그리기
    this.drawBackground();

    // 게임 상태에 따라 렌더링
    if (gameState === CONFIG.STATE.PLAYING || gameState === CONFIG.STATE.VICTORY_ANIMATION) {
      // 먹이 그리기
      preyArray.forEach(prey => {
        this.drawEntity(prey, CONFIG.PREY_COLOR);
      });

      // 포식자 그리기
      predatorArray.forEach(predator => {
        this.drawEntity(predator, CONFIG.PREDATOR_COLOR);
      });

      // 플레이어 그리기
      const isHoin = levelSystem.currentLevel === 5; // 인덱스 5 = 호인
      this.drawPlayer(player, isHoin, godMode);
    }
  }
}
