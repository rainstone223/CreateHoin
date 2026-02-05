// 포식자 클래스 - 플레이어를 추적
class Predator extends Entity {
  constructor(x, y, radius, level) {
    super(x, y, radius, level);
  }

  // 포식자 속도 (기본 속도에 패널티 적용)
  getSpeed() {
    const baseSpeed = super.getSpeed();
    return baseSpeed * CONFIG.PREDATOR_SPEED_PENALTY;
  }

  // 업데이트 - Phase 3: 기본 배회만, Phase 4에서 추적 로직 추가
  update(player, deltaTime) {
    const distance = this.distanceTo(player);

    // 플레이어가 은신 중이면 인지하지 못함
    const canSeePlayer = !player.isStealthed();

    // Phase 4에서 구현할 추적 로직 자리
    if (canSeePlayer && distance < CONFIG.CHASE_DISTANCE) {
      // 추적 로직 (Phase 4)
      this.chasePlayer(player, deltaTime);
    } else {
      // 순찰 (배회)
      this.wanderRandomly(deltaTime);
    }
  }

  // 플레이어 추적
  chasePlayer(player, deltaTime) {
    // 플레이어 방향 계산
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      // 정규화된 방향
      const dirX = dx / distance;
      const dirY = dy / distance;

      // 플레이어 방향으로 이동 (크기에 반비례하는 속도)
      const speed = this.getSpeed();
      this.x += dirX * speed * deltaTime;
      this.y += dirY * speed * deltaTime;
    }

    // 경계 내 유지 (하드 클램프 - 경계에서도 계속 추적 가능)
    const padding = CONFIG.BOUNDARY_PADDING;
    this.x = Math.max(padding, Math.min(CONFIG.CANVAS_WIDTH - padding, this.x));
    this.y = Math.max(padding, Math.min(CONFIG.CANVAS_HEIGHT - padding, this.y));
  }
}
