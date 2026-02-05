// 서류 클래스 - 포식자가 던지는 투사체
class Document {
  constructor(x, y, targetX, targetY) {
    this.x = x;
    this.y = y;
    this.radius = CONFIG.HARD_MODE.DOCUMENT_SIZE;

    // 목표 방향으로 이동하기 위한 각도 계산
    const dx = targetX - x;
    const dy = targetY - y;
    const angle = Math.atan2(dy, dx);

    // 속도 벡터
    this.vx = Math.cos(angle) * CONFIG.HARD_MODE.DOCUMENT_SPEED;
    this.vy = Math.sin(angle) * CONFIG.HARD_MODE.DOCUMENT_SPEED;
  }

  // 업데이트 - 직선으로 날아감
  update(deltaTime) {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
  }

  // 화면 밖으로 나갔는지 체크
  isOutOfBounds() {
    return (
      this.x < -this.radius ||
      this.x > CONFIG.CANVAS_WIDTH + this.radius ||
      this.y < -this.radius ||
      this.y > CONFIG.CANVAS_HEIGHT + this.radius
    );
  }
}
