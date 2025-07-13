class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // 에셋 로딩이 필요 없음
    }

    create() {
        this.scene.start('GameScene');
    }
} 