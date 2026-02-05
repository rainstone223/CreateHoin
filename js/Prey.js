// 먹이 클래스 - 플레이어를 피해 도망
class Prey extends Entity {
  constructor(x, y, radius, level) {
    super(x, y, radius, level);

    // 하드모드: 포식자 뒤로 숨기 패턴 관련
    this.hidePatternActive = false;
    this.hidePatternCooldown = 0;
  }

  // 먹이 전용 속도 계산 (패널티 적용)
  getSpeed() {
    return super.getSpeed() * CONFIG.PREY_SPEED_PENALTY;
  }

  // 업데이트 - Phase 3: 기본 배회만, Phase 4에서 도망 로직 추가
  update(player, deltaTime, predatorArray = []) {
    const distance = this.distanceTo(player);

    // 쿨다운 감소
    if (this.hidePatternCooldown > 0) {
      this.hidePatternCooldown -= deltaTime;
    }

    // Phase 4에서 구현할 도망 로직 자리
    if (distance < CONFIG.FLEE_DISTANCE) {
      // 하드모드: 일정 확률로 포식자 뒤로 숨기
      if (CONFIG.DIFFICULTY === 'HARD' && predatorArray.length > 0 &&
          this.hidePatternCooldown <= 0 &&
          Math.random() < CONFIG.HARD_MODE.PREY_HIDE_BEHIND_PREDATOR_CHANCE) {
        this.hideBehindPredator(player, predatorArray, deltaTime);
        this.hidePatternCooldown = 300; // 5초 쿨다운 (60 FPS 기준)
      } else {
        // 도망 로직 (Phase 4)
        this.fleeFrom(player, deltaTime);
      }
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

  // 포식자 뒤로 숨기 (하드모드 전용)
  hideBehindPredator(player, predatorArray, deltaTime) {
    // 가장 가까운 포식자 찾기
    let closestPredator = null;
    let closestDistance = Infinity;

    for (let predator of predatorArray) {
      const dist = this.distanceTo(predator);
      if (dist < closestDistance) {
        closestDistance = dist;
        closestPredator = predator;
      }
    }

    if (!closestPredator) {
      // 포식자가 없으면 그냥 도망
      this.fleeFrom(player, deltaTime);
      return;
    }

    // 플레이어 -> 포식자 방향 계산
    const dx = closestPredator.x - player.x;
    const dy = closestPredator.y - player.y;
    const angle = Math.atan2(dy, dx);

    // 포식자 뒤쪽으로 이동 (플레이어 기준으로 포식자 반대편)
    const targetDistance = closestPredator.radius + 30; // 포식자 뒤에 30px 떨어진 곳
    const targetX = closestPredator.x + Math.cos(angle) * targetDistance;
    const targetY = closestPredator.y + Math.sin(angle) * targetDistance;

    // 목표 지점으로 이동
    const toTargetDx = targetX - this.x;
    const toTargetDy = targetY - this.y;
    const toTargetAngle = Math.atan2(toTargetDy, toTargetDx);

    const speed = this.getSpeed();
    this.x += Math.cos(toTargetAngle) * speed * deltaTime;
    this.y += Math.sin(toTargetAngle) * speed * deltaTime;

    // 경계 내 유지
    this.constrainToBounds();
  }
}
