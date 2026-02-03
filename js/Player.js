// 플레이어 클래스
class Player {
  constructor(x, y, levelSystem) {
    this.x = x;
    this.y = y;
    this.levelSystem = levelSystem;
    this.radius = levelSystem.getCurrentSize();
  }

  // 마우스를 향해 부드럽게 이동
  update(mouseX, mouseY, deltaTime) {
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 목표 위치에 거의 도달한 경우 그대로 유지
    if (distance < 2) {
      this.x = mouseX;
      this.y = mouseY;
      return;
    }

    // 정규화된 방향 벡터로 이동 (속도 조절 가능)
    const speed = 4; // 플레이어 속도
    const moveX = (dx / distance) * speed * deltaTime;
    const moveY = (dy / distance) * speed * deltaTime;

    this.x += moveX;
    this.y += moveY;

    // 캔버스 경계 내에 유지
    this.x = Math.max(this.radius, Math.min(CONFIG.CANVAS_WIDTH - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(CONFIG.CANVAS_HEIGHT - this.radius, this.y));

    // 레벨에 따른 크기 업데이트
    this.radius = this.levelSystem.getCurrentSize();
  }

  // 경험치 획득
  gainXP(amount) {
    const result = this.levelSystem.addXP(amount);
    return result; // { leveledUp, reachedMax } 반환
  }

  // 충돌 감지용 반경 반환
  getRadius() {
    return this.radius;
  }

  // 다른 개체와 충돌 체크
  isCollidingWith(entity) {
    const dx = this.x - entity.x;
    const dy = this.y - entity.y;
    const distanceSquared = dx * dx + dy * dy;
    const radiusSum = this.radius + entity.radius;
    const radiusSumSquared = radiusSum * radiusSum;

    return distanceSquared < radiusSumSquared;
  }
}
