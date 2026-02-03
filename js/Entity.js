// 개체 베이스 클래스
class Entity {
  constructor(x, y, radius, level = 0) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.level = level; // 개체의 레벨 (크기 결정)

    // 랜덤 이동 방향 (배회용)
    this.wanderAngle = Math.random() * Math.PI * 2;
    this.wanderChangeTime = 0;
  }

  // 기본 업데이트 (자식 클래스에서 오버라이드)
  update(player, deltaTime) {
    // 자식 클래스에서 구현
  }

  // 랜덤 배회 이동
  wanderRandomly(deltaTime) {
    // 일정 시간마다 방향 변경
    this.wanderChangeTime += deltaTime;
    if (this.wanderChangeTime > 60) { // 약 1초마다
      this.wanderAngle += (Math.random() - 0.5) * Math.PI;
      this.wanderChangeTime = 0;
    }

    // 배회 속도는 개체 속도의 절반
    const wanderSpeed = CONFIG.ENTITY_SPEED * 0.5;
    this.x += Math.cos(this.wanderAngle) * wanderSpeed * deltaTime;
    this.y += Math.sin(this.wanderAngle) * wanderSpeed * deltaTime;

    // 경계 체크 및 반사
    this.constrainToBounds();
  }

  // 경계 내에 유지
  constrainToBounds() {
    const padding = CONFIG.BOUNDARY_PADDING;

    // 경계에 닿으면 방향 반전
    if (this.x < padding) {
      this.x = padding;
      this.wanderAngle = Math.PI - this.wanderAngle;
    } else if (this.x > CONFIG.CANVAS_WIDTH - padding) {
      this.x = CONFIG.CANVAS_WIDTH - padding;
      this.wanderAngle = Math.PI - this.wanderAngle;
    }

    if (this.y < padding) {
      this.y = padding;
      this.wanderAngle = -this.wanderAngle;
    } else if (this.y > CONFIG.CANVAS_HEIGHT - padding) {
      this.y = CONFIG.CANVAS_HEIGHT - padding;
      this.wanderAngle = -this.wanderAngle;
    }
  }

  // 다른 개체와의 거리 계산
  distanceTo(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
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
