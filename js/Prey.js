// 먹이 클래스 - 플레이어를 피해 도망
class Prey extends Entity {
  constructor(x, y, radius, level) {
    super(x, y, radius, level);
  }

  // 업데이트 - Phase 3: 기본 배회만, Phase 4에서 도망 로직 추가
  update(player, deltaTime) {
    const distance = this.distanceTo(player);

    // Phase 4에서 구현할 도망 로직 자리
    if (distance < CONFIG.FLEE_DISTANCE) {
      // 도망 로직 (Phase 4)
      this.fleeFrom(player, deltaTime);
    } else {
      // 랜덤 배회
      this.wanderRandomly(deltaTime);
    }
  }

  // 플레이어로부터 도망
  fleeFrom(player, deltaTime) {
    // 플레이어 반대 방향 계산
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    const angle = Math.atan2(dy, dx);

    // 반대 방향으로 이동 (크기에 반비례하는 속도)
    const speed = this.getSpeed();
    this.x += Math.cos(angle) * speed * deltaTime;
    this.y += Math.sin(angle) * speed * deltaTime;

    // 경계 내 유지
    this.constrainToBounds();
  }
}
