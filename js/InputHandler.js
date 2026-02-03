// 마우스 입력 처리
class InputHandler {
  constructor(canvas) {
    this.canvas = canvas;
    this.mouseX = canvas.width / 2;
    this.mouseY = canvas.height / 2;

    // 마우스 이동 이벤트 리스너
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      // 캔버스 스케일 고려한 정확한 좌표 계산
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      this.mouseX = (e.clientX - rect.left) * scaleX;
      this.mouseY = (e.clientY - rect.top) * scaleY;
    });

    // 마우스가 캔버스를 벗어날 때
    canvas.addEventListener('mouseleave', () => {
      // 마우스가 벗어나도 마지막 위치 유지
    });
  }

  getMousePosition() {
    return { x: this.mouseX, y: this.mouseY };
  }
}
