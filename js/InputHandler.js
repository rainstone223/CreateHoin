// 키보드 및 모바일 입력 처리
class InputHandler {
  constructor(canvas) {
    this.canvas = canvas;

    // 키 상태 추적
    this.keys = {
      w: false,
      a: false,
      s: false,
      d: false,
      ArrowUp: false,
      ArrowLeft: false,
      ArrowDown: false,
      ArrowRight: false
    };

    // 필살기 활성화 콜백
    this.onUltimateActivate = null;

    // 모바일 컨트롤 (나중에 설정됨)
    this.mobileControls = null;

    // 키보드 이벤트 리스너
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();

      // 스페이스바 처리 (필살기)
      if (e.key === ' ') {
        if (this.onUltimateActivate) {
          this.onUltimateActivate();
        }
        e.preventDefault();
        return;
      }

      if (key in this.keys || e.key in this.keys) {
        this.keys[key in this.keys ? key : e.key] = true;
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      if (key in this.keys || e.key in this.keys) {
        this.keys[key in this.keys ? key : e.key] = false;
        e.preventDefault();
      }
    });
  }

  // 모바일 컨트롤 설정
  setMobileControls(mobileControls) {
    this.mobileControls = mobileControls;
  }

  // 이동 방향 벡터 반환
  getMovementDirection() {
    let dx = 0;
    let dy = 0;

    // 모바일 컨트롤 우선
    if (this.mobileControls && this.mobileControls.isMobile) {
      const mobileDir = this.mobileControls.getMovementDirection();
      dx = mobileDir.dx;
      dy = mobileDir.dy;
    } else {
      // WASD 키
      if (this.keys.w || this.keys.ArrowUp) dy -= 1;
      if (this.keys.s || this.keys.ArrowDown) dy += 1;
      if (this.keys.a || this.keys.ArrowLeft) dx -= 1;
      if (this.keys.d || this.keys.ArrowRight) dx += 1;

      // 대각선 이동 시 속도 정규화
      if (dx !== 0 && dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx /= length;
        dy /= length;
      }
    }

    return { dx, dy };
  }
}
