// 개체 관리 시스템
class EntityManager {
  constructor() {
    this.preyArray = [];
    this.predatorArray = [];
    this.documentArray = []; // 하드모드용 서류 배열
  }

  // 플레이어 레벨에 따른 포식자 수 결정
  getPredatorCount(playerLevel) {
    // 사원(0), 대리(1): 3마리
    // 과장(2) 이상: 4마리
    return playerLevel <= 1 ? 3 : 4;
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

    // 포식자 생성 (플레이어 레벨에 따라 동적으로 결정)
    const predatorCount = this.getPredatorCount(player.levelSystem.currentLevel);

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

  // 포식자 생성 (플레이어보다 무조건 높은 레벨)
  spawnPredator(player) {
    const playerLevel = player.levelSystem.currentLevel;

    // 포식자는 플레이어보다 무조건 높은 레벨 (최소 +1)
    const minPredatorLevel = playerLevel + 1;

    // 플레이어가 최대 레벨이면 포식자 생성 불가
    if (minPredatorLevel > CONFIG.LEVELS.length - 1) {
      return; // 포식자를 생성하지 않음
    }

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
    // 먹이 업데이트 (하드모드에서는 포식자 배열 전달)
    this.preyArray.forEach(prey => {
      if (CONFIG.DIFFICULTY === 'HARD') {
        prey.update(player, deltaTime, this.predatorArray);
      } else {
        prey.update(player, deltaTime);
      }
    });

    // 포식자 업데이트 (하드모드에서는 EntityManager 전달)
    this.predatorArray.forEach(predator => {
      if (CONFIG.DIFFICULTY === 'HARD') {
        predator.update(player, deltaTime, this);
      } else {
        predator.update(player, deltaTime);
      }
    });

    // 서류 업데이트 (하드모드 전용)
    if (CONFIG.DIFFICULTY === 'HARD') {
      this.documentArray.forEach(doc => {
        doc.update(deltaTime);
      });

      // 화면 밖으로 나간 서류 제거
      this.documentArray = this.documentArray.filter(doc => !doc.isOutOfBounds());
    }
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

  // 플레이어보다 낮거나 같은 레벨의 포식자 제거 및 재생성
  cleanupWeakPredators(player) {
    const playerLevel = player.levelSystem.currentLevel;
    const targetCount = this.getPredatorCount(playerLevel);
    let removedCount = 0;

    // 플레이어보다 낮거나 같은 레벨의 포식자 제거
    this.predatorArray = this.predatorArray.filter(predator => {
      if (predator.level <= playerLevel) {
        removedCount++;
        return false; // 제거
      }
      return true; // 유지
    });

    // 현재 포식자 수
    const currentCount = this.predatorArray.length;

    // 목표 수에 맞춰 포식자 조정
    if (currentCount < targetCount) {
      // 부족하면 추가 생성
      const toAdd = targetCount - currentCount;
      for (let i = 0; i < toAdd; i++) {
        this.spawnPredator(player);
      }
      console.log(`포식자 ${toAdd}마리 추가 생성 (총 ${targetCount}마리)`);
    } else if (currentCount > targetCount) {
      // 초과하면 제거 (먼저 생성된 것부터)
      const toRemove = currentCount - targetCount;
      this.predatorArray.splice(0, toRemove);
      console.log(`포식자 ${toRemove}마리 제거 (총 ${targetCount}마리)`);
    } else if (removedCount > 0) {
      // 수는 맞지만 약한 포식자를 교체한 경우
      console.log(`약한 포식자 ${removedCount}마리 교체`);
    }
  }

  // 서류 던지기 (하드모드 전용)
  throwDocument(fromX, fromY, targetX, targetY) {
    const document = new Document(fromX, fromY, targetX, targetY);
    this.documentArray.push(document);
  }
}
