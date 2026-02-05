// 모바일 컨트롤 (조이스틱 + 필살기 버튼)
class MobileControls {
  constructor(canvas) {
    this.canvas = canvas;
    this.isMobile = this.detectMobile();

    // 조이스틱 상태
    this.joystick = {
      active: false,
      baseX: 0,
      baseY: 0,
      stickX: 0,
      stickY: 0,
      dx: 0,
      dy: 0,
      touchId: null
    };

    // 필살기 버튼 상태
    this.ultimateButton = {
      x: 0,
      y: 0,
      radius: 40,
      active: false,
      touchId: null
    };

    // 콜백
    this.onUltimateActivate = null;

    // 모바일이면 터치 이벤트 등록
    if (this.isMobile) {
      this.setupTouchEvents();
      this.calculateButtonPositions();
    }
  }

  // 모바일 기기 감지
  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);
  }

  // 버튼 위치 계산 (가로모드 최적화)
  calculateButtonPositions() {
    // 조이스틱 초기 위치 (터치 시 실제 위치로 변경됨)
    const marginX = Math.min(100, CONFIG.CANVAS_WIDTH * 0.12);
    const marginY = Math.min(100, CONFIG.CANVAS_HEIGHT * 0.17);

    this.joystick.baseX = CONFIG.CANVAS_WIDTH - marginX;
    this.joystick.baseY = CONFIG.CANVAS_HEIGHT - marginY;

    // 필살기는 화면 왼쪽 절반 터치로 발동 (버튼 위치 불필요)
  }

  // 터치 이벤트 설정
  setupTouchEvents() {
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.canvas.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });
  }

  // 캔버스 좌표로 변환
  getTouchPos(touch) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = CONFIG.CANVAS_WIDTH / rect.width;
    const scaleY = CONFIG.CANVAS_HEIGHT / rect.height;

    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY
    };
  }

  // 터치 시작
  handleTouchStart(e) {
    e.preventDefault();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const pos = this.getTouchPos(touch);

      if (!this.joystick.active) {
        // 조이스틱이 비활성 상태: 화면 어디든 터치하면 조이스틱 생성
        this.joystick.active = true;
        this.joystick.touchId = touch.identifier;
        this.joystick.baseX = pos.x;
        this.joystick.baseY = pos.y;
        this.joystick.stickX = pos.x;
        this.joystick.stickY = pos.y;
        this.updateJoystickDirection();
      } else if (touch.identifier !== this.joystick.touchId) {
        // 조이스틱 활성 중 다른 곳 터치: 필살기 발동
        if (this.onUltimateActivate) {
          this.onUltimateActivate();
        }
      }
    }
  }

  // 터치 이동
  handleTouchMove(e) {
    e.preventDefault();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const pos = this.getTouchPos(touch);

      // 조이스틱 이동
      if (this.joystick.active && touch.identifier === this.joystick.touchId) {
        const maxDistance = 50; // 조이스틱 최대 이동 거리
        const dx = pos.x - this.joystick.baseX;
        const dy = pos.y - this.joystick.baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > maxDistance) {
          // 최대 거리로 제한
          this.joystick.stickX = this.joystick.baseX + (dx / distance) * maxDistance;
          this.joystick.stickY = this.joystick.baseY + (dy / distance) * maxDistance;
        } else {
          this.joystick.stickX = pos.x;
          this.joystick.stickY = pos.y;
        }

        this.updateJoystickDirection();
      }
    }
  }

  // 터치 종료
  handleTouchEnd(e) {
    e.preventDefault();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      // 조이스틱 종료
      if (this.joystick.active && touch.identifier === this.joystick.touchId) {
        this.joystick.active = false;
        this.joystick.touchId = null;
        this.joystick.dx = 0;
        this.joystick.dy = 0;
      }
    }
  }

  // 조이스틱 방향 업데이트
  updateJoystickDirection() {
    const dx = this.joystick.stickX - this.joystick.baseX;
    const dy = this.joystick.stickY - this.joystick.baseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) { // 데드존
      this.joystick.dx = dx / distance;
      this.joystick.dy = dy / distance;
    } else {
      this.joystick.dx = 0;
      this.joystick.dy = 0;
    }
  }

  // 이동 방향 가져오기
  getMovementDirection() {
    if (!this.isMobile) {
      return { dx: 0, dy: 0 };
    }

    return {
      dx: this.joystick.dx,
      dy: this.joystick.dy
    };
  }

  // 조이스틱 그리기
  draw(ctx) {
    if (!this.isMobile) return;

    // 조이스틱은 활성화되었을 때만 표시 (터치한 위치에서 동작)
    if (this.joystick.active) {
      // 조이스틱 베이스
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(this.joystick.baseX, this.joystick.baseY, 60, 0, Math.PI * 2);
      ctx.fill();

      // 조이스틱 스틱
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(this.joystick.stickX, this.joystick.stickY, 30, 0, Math.PI * 2);
      ctx.fill();

      // 스틱 테두리
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 필살기는 화면 왼쪽 절반 터치로 발동 (버튼 UI 제거)
  }
}
