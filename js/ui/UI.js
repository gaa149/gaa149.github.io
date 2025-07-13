class UI {
    constructor(scene) {
        this.scene = scene;
        
        // 체력바 배경
        this.healthBarBg = scene.add.rectangle(10, 10, 200, 20, 0x000000);
        this.healthBarBg.setOrigin(0, 0);
        
        // 체력바
        this.healthBar = scene.add.rectangle(10, 10, 200, 20, 0xFF0000);
        this.healthBar.setOrigin(0, 0);
        
        // 체력 텍스트
        this.healthText = scene.add.text(10, 35, '체력: 100/100', {
            fontSize: '16px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 2
        });

        // 레벨 텍스트
        this.levelText = scene.add.text(10, 60, 'Level: 1', {
            fontSize: '16px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 2
        });

        // 경험치바 배경
        this.expBarBg = scene.add.rectangle(10, 85, 200, 10, 0x000000);
        this.expBarBg.setOrigin(0, 0);
        
        // 경험치바
        this.expBar = scene.add.rectangle(10, 85, 0, 10, 0x00FF00);
        this.expBar.setOrigin(0, 0);
        
        // 경험치 텍스트
        this.expText = scene.add.text(10, 100, 'EXP: 0/100', {
            fontSize: '16px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 2
        });

        // 모든 UI 요소를 고정 위치에 표시
        this.healthBarBg.setScrollFactor(0);
        this.healthBar.setScrollFactor(0);
        this.healthText.setScrollFactor(0);
        this.levelText.setScrollFactor(0);
        this.expBarBg.setScrollFactor(0);
        this.expBar.setScrollFactor(0);
        this.expText.setScrollFactor(0);
    }

    update(player) {
        // 체력바 업데이트
        const healthPercent = player.health / player.maxHealth;
        this.healthBar.width = 200 * healthPercent;
        this.healthText.setText(`체력: ${player.health}/${player.maxHealth}`);

        // 레벨 텍스트 업데이트
        this.levelText.setText(`레벨: ${player.level}`);

        // 경험치바 업데이트
        const expPercent = player.experience / player.expToNextLevel;
        this.expBar.width = 200 * expPercent;
        this.expText.setText(`경험치: ${player.experience}/${player.expToNextLevel}`);
    }
} 