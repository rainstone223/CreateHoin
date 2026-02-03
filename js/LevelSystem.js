// 레벨 진행 시스템
class LevelSystem {
  constructor() {
    this.currentLevel = 0; // 시작 레벨 인덱스 (0 = 사원)
    this.xp = 0;
  }

  // XP 추가 및 레벨업 체크
  addXP(amount) {
    this.xp += amount;
    let leveledUp = false;

    // 레벨업 체크
    while (this.currentLevel < CONFIG.LEVELS.length - 1) {
      const nextLevel = CONFIG.LEVELS[this.currentLevel + 1];
      if (this.xp >= nextLevel.xpRequired) {
        this.currentLevel++;
        leveledUp = true;
        console.log(`레벨업! ${this.getCurrentLevel().name}`);
      } else {
        break;
      }
    }

    // 최종 레벨 도달 체크
    return {
      leveledUp: leveledUp,
      reachedMax: this.isMaxLevel()
    };
  }

  // 현재 레벨 정보 가져오기 (플레이어는 레벨 5를 "호인"으로 표시)
  getCurrentLevel() {
    const level = CONFIG.LEVELS[this.currentLevel];

    // 플레이어가 최대 레벨(5)에 도달하면 "호인"으로 표시
    if (this.currentLevel === CONFIG.LEVELS.length - 1) {
      return { ...level, name: "호인" };
    }

    return level;
  }

  // 다음 레벨 정보 가져오기
  getNextLevel() {
    if (this.currentLevel < CONFIG.LEVELS.length - 1) {
      return CONFIG.LEVELS[this.currentLevel + 1];
    }
    return null; // 최종 레벨
  }

  // 경험치 바 진행률 (0-100)
  getProgressPercent() {
    if (this.isMaxLevel()) return 100;

    const currentLevelXP = this.getCurrentLevel().xpRequired;
    const nextLevelXP = this.getNextLevel().xpRequired;

    const xpInCurrentLevel = this.xp - currentLevelXP;
    const xpNeededForLevel = nextLevelXP - currentLevelXP;

    return (xpInCurrentLevel / xpNeededForLevel) * 100;
  }

  // 최종 레벨 도달 여부
  isMaxLevel() {
    return this.currentLevel === CONFIG.LEVELS.length - 1;
  }

  // 현재 레벨에 맞는 크기 반환
  getCurrentSize() {
    return this.getCurrentLevel().size;
  }
}
