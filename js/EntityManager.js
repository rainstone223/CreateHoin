// 개체 관리 시스템
class EntityManager {
  constructor() {
    this.preyArray = [];
    this.predatorArray = [];
  }

  // 초기 개체 생성
  initialize(player) {
    // 먹이 생성
    const preyCount = Math.floor(
      Math.random() * (CONFIG.PREY_COUNT_MAX - CONFIG.PREY_COUNT_MIN + 1) + CONFIG.PREY_COUNT_MIN
    );

    for (let i = 0; i < preyCount; i++) {
      this.spawnPrey(player);
    }

    // 포식자 생성
    const predatorCount = Math.floor(
      Math.random() * (CONFIG.PREDATOR_COUNT_MAX - CONFIG.PREDATOR_COUNT_MIN + 1) + CONFIG.PREDATOR_COUNT_MIN
    );

    for (let i = 0; i < predatorCount; i++) {
      this.spawnPredator(player);
    }

    console.log(`개체 생성 완료 - 먹이: ${preyCount}, 포식자: ${predatorCount}`);
  }

  // 먹이 생성 (플레이어보다 작은 레벨)
  spawnPrey(player) {
    const playerLevel = player.levelSystem.currentLevel;

    // 플레이어보다 1-3 레벨 낮은 먹이 생성
    const preyLevel = Math.max(0, playerLevel - Math.floor(Math.random() * 3 + 1));
    const preySize = CONFIG.LEVELS[preyLevel].size;

    // 안전한 스폰 위치 찾기
    const pos = this.getSafeSpawnPosition(player);

    const prey = new Prey(pos.x, pos.y, preySize, preyLevel);
    this.preyArray.push(prey);
  }

  // 포식자 생성 (플레이어보다 큰 레벨)
  spawnPredator(player) {
    const playerLevel = player.levelSystem.currentLevel;

    // 플레이어보다 1-3 레벨 높은 포식자 생성
    const predatorLevel = Math.min(
      CONFIG.LEVELS.length - 1,
      playerLevel + Math.floor(Math.random() * 3 + 1)
    );
    const predatorSize = CONFIG.LEVELS[predatorLevel].size;

    // 안전한 스폰 위치 찾기
    const pos = this.getSafeSpawnPosition(player);

    const predator = new Predator(pos.x, pos.y, predatorSize, predatorLevel);
    this.predatorArray.push(predator);
  }

  // 안전한 스폰 위치 찾기 (플레이어로부터 멀리)
  getSafeSpawnPosition(player) {
    const minDist = CONFIG.MIN_SPAWN_DISTANCE;
    const padding = CONFIG.BOUNDARY_PADDING;
    let x, y, distance;
    let attempts = 0;
    const maxAttempts = 50;

    do {
      x = padding + Math.random() * (CONFIG.CANVAS_WIDTH - 2 * padding);
      y = padding + Math.random() * (CONFIG.CANVAS_HEIGHT - 2 * padding);

      const dx = x - player.x;
      const dy = y - player.y;
      distance = Math.sqrt(dx * dx + dy * dy);

      attempts++;
      if (attempts > maxAttempts) {
        // 너무 많이 시도하면 그냥 반환
        break;
      }
    } while (distance < minDist);

    return { x, y };
  }

  // 모든 개체 업데이트
  updateAll(player, deltaTime) {
    // 먹이 업데이트
    this.preyArray.forEach(prey => {
      prey.update(player, deltaTime);
    });

    // 포식자 업데이트
    this.predatorArray.forEach(predator => {
      predator.update(player, deltaTime);
    });
  }

  // 먹이 제거 및 리스폰
  removePrey(prey, player) {
    const index = this.preyArray.indexOf(prey);
    if (index > -1) {
      this.preyArray.splice(index, 1);
      // 새로운 먹이 생성
      this.spawnPrey(player);
    }
  }

  // 화면 밖으로 나간 개체 리스폰
  respawnOutOfBounds(player) {
    // 먹이 체크
    this.preyArray.forEach(prey => {
      if (prey.isOutOfBounds()) {
        this.removePrey(prey, player);
      }
    });

    // 포식자 체크 (화면 밖으로 나가도 그냥 유지)
    // 포식자는 화면 밖으로 나가지 않도록 경계로 제한됨
  }
}
