// 플레이어 클래스
class Player {
  constructor(x, y, levelSystem) {
    this.x = x;
    this.y = y;
    this.levelSystem = levelSystem;
    this.radius = levelSystem.getCurrentSize();

    // 필살기 시스템
    this.preyEatenCount = 0; // 먹은 먹이 수
    this.ultimateReady = false; // 필살기 준비 완료
    this.ultimateActive = false; // 필살기 활성화 중
    this.ultimateEndTime = 0; // 필살기 종료 시간
  }

  // 크기에 반비례하는 속도 계산 (작을수록 빠름, 플레이어는 속도 감소폭이 적고 더 빠름)
  getSpeed() {
    // 공식: baseSpeed * (maxSize / currentSize) ^ playerSpeedVariation * playerBoost
    const speedMultiplier = Math.pow(CONFIG.MAX_SIZE / this.radius, CONFIG.PLAYER_SPEED_VARIATION);
    return CONFIG.BASE_SPEED * speedMultiplier * CONFIG.PLAYER_SPEED_BOOST;
  }

  // WASD 키보드로 이동
  update(direction, deltaTime) {
    // 필살기 종료 확인
    if (this.ultimateActive && Date.now() >= this.ultimateEndTime) {
      this.ultimateActive = false;
    }

    // 크기에 반비례하는 속도 (다른 개체와 동일한 방식)
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

    // 먹이를 먹을 때마다 카운트 증가
    this.preyEatenCount++;

    // 3개마다 필살기 충전
    if (this.preyEatenCount >= CONFIG.ULTIMATE_PREY_REQUIRED) {
      this.ultimateReady = true;
    }

    return result; // { leveledUp, reachedMax } 반환
  }

  // 필살기 활성화
  activateUltimate() {
    if (this.ultimateReady && !this.ultimateActive) {
      this.ultimateActive = true;
      this.ultimateEndTime = Date.now() + CONFIG.ULTIMATE_DURATION;
      this.ultimateReady = false;
      this.preyEatenCount = 0;
      return true;
    }
    return false;
  }

  // 필살기 게이지 퍼센트 (0-100)
  getUltimateProgress() {
    if (this.ultimateReady) return 100;
    return (this.preyEatenCount / CONFIG.ULTIMATE_PREY_REQUIRED) * 100;
  }

  // 은신 중인지 확인 (포식자가 인지하지 못함)
  isStealthed() {
    return this.ultimateActive;
  }

  // 무적 중인지 확인
  isInvulnerable() {
    return this.ultimateActive;
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
