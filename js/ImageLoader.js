// 이미지 로딩 시스템
class ImageLoader {
  constructor() {
    this.images = {};
    this.loaded = false;
    this.loadedCount = 0;
    this.totalCount = 0;
  }

  // 모든 이미지 로드
  loadAll(callback) {
    // 로드할 이미지 목록
    const imagesToLoad = [];

    // 시작 화면 이미지 (캐시 방지)
    imagesToLoad.push({
      key: 'start-screen',
      src: `assets/start-screen.png?v=${Date.now()}`
    });

    // 플레이어 이미지
    imagesToLoad.push({
      key: 'player',
      src: CONFIG.PLAYER_IMAGE
    });

    // 레벨별 이미지 (먹이/포식자용)
    CONFIG.LEVELS.forEach((level, index) => {
      imagesToLoad.push({
        key: `level_${index}`,
        src: level.image
      });
    });

    this.totalCount = imagesToLoad.length;
    this.loadedCount = 0;

    // 이미지 로드
    imagesToLoad.forEach(item => {
      const img = new Image();
      img.onload = () => {
        this.loadedCount++;
        console.log(`이미지 로드: ${item.src} (${this.loadedCount}/${this.totalCount})`);

        if (this.loadedCount === this.totalCount) {
          this.loaded = true;
          console.log('모든 이미지 로드 완료!');
          if (callback) callback();
        }
      };

      img.onerror = () => {
        console.error(`이미지 로드 실패: ${item.src}`);
        this.loadedCount++;

        if (this.loadedCount === this.totalCount) {
          this.loaded = true;
          if (callback) callback();
        }
      };

      img.src = item.src;
      this.images[item.key] = img;
    });
  }

  // 플레이어 이미지 가져오기
  getPlayerImage() {
    return this.images['player'];
  }

  // 레벨별 이미지 가져오기 (먹이/포식자용)
  getLevelImage(level) {
    return this.images[`level_${level}`];
  }

  // 모든 이미지가 로드되었는지 확인
  isLoaded() {
    return this.loaded;
  }
}
