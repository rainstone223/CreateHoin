// 플레이어 클래스
class Player {
  constructor(x, y, levelSystem) {
    this.x = x;
    this.y = y;
    this.levelSystem = levelSystem;
    this.radius = levelSystem.getCurrentSize();
  }

  // 크기에 반비례하는 속도 계산 (작을수록 빠름)
  getSpeed() {
    const speedMultiplier = Math.pow(CONFIG.MAX_SIZE / this.radius, CONFIG.SPEED_VARIATION);
    return CONFIG.BASE_SPEED * speedMultiplier * 2; // 플레이어는 개체보다 2배 빠름
  }

  // WASD 키보드로 이동
  update(direction, deltaTime) {
    // 크기에 반비례하는 속도
    const speed = this.getSpeed();

    // 방향에 따라 이동
    if (direction.dx !== 0 || direction.dy !== 0) {
      this.x += direction.dx * speed * deltaTime;
      this.y += direction.dy * speed * deltaTime;
    }

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
