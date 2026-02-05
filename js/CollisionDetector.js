// 충돌 감지 시스템
class CollisionDetector {
  constructor() {
    this.onPreyEaten = null; // 먹이를 먹었을 때 콜백
    this.onGameOver = null;  // 게임 오버 콜백
    this.onVictory = null;   // 승리 콜백
  }

  // 원-원 충돌 감지 (최적화: 제곱 거리 사용)
  circleCollision(x1, y1, r1, x2, y2, r2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distSq = dx * dx + dy * dy;
    const radiusSumSq = (r1 + r2) * (r1 + r2);

    return distSq < radiusSumSq;
  }

  // 모든 충돌 체크
  checkCollisions(player, preyArray, predatorArray, godMode = false, documentArray = []) {
    // 먹이와 충돌 체크
    for (let i = preyArray.length - 1; i >= 0; i--) {
      const prey = preyArray[i];

      if (this.circleCollision(
        player.x, player.y, player.radius,
        prey.x, prey.y, prey.radius
      )) {
        // 플레이어가 먹이를 먹음
        if (this.onPreyEaten) {
          this.onPreyEaten(prey);
        }
      }
    }

    // 포식자와 충돌 체크 (무적 모드나 필살기 활성화가 아닐 때만)
    const isInvulnerable = godMode || player.isInvulnerable();
    if (!isInvulnerable) {
      for (let predator of predatorArray) {
        if (this.circleCollision(
          player.x, player.y, player.radius,
          predator.x, predator.y, predator.radius
        )) {
          // 플레이어가 포식자에게 잡힘 - 게임 오버
          if (this.onGameOver) {
            this.onGameOver();
          }
          return; // 게임 오버이므로 더 이상 체크 안 함
        }
      }

      // 서류와 충돌 체크 (하드모드 전용)
      if (CONFIG.DIFFICULTY === 'HARD') {
        for (let document of documentArray) {
          if (this.circleCollision(
            player.x, player.y, player.radius,
            document.x, document.y, document.radius
          )) {
            // 플레이어가 서류에 맞음 - 게임 오버
            if (this.onGameOver) {
              this.onGameOver();
            }
            return; // 게임 오버이므로 더 이상 체크 안 함
          }
        }
      }
    }
  }
}
