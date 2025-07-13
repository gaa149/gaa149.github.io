class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // 배경색 설정
        this.cameras.main.setBackgroundColor('#4488AA');

        // 단순한 바닥 타일 생성
        for(let y = 0; y < 19; y++) {
            for(let x = 0; x < 25; x++) {
                this.add.rectangle(x * 32, y * 32, 32, 32, 0x228B22);
            }
        }

        // 벽 생성
        this.walls = this.physics.add.staticGroup();
        
        // 위쪽 벽
        for(let x = 0; x < 25; x++) {
            const wall = this.add.rectangle(x * 32, 0, 32, 32, 0x654321);
            this.walls.add(wall);
        }
        
        // 아래쪽 벽
        for(let x = 0; x < 25; x++) {
            const wall = this.add.rectangle(x * 32, 18 * 32, 32, 32, 0x654321);
            this.walls.add(wall);
        }
        
        // 왼쪽 벽
        for(let y = 1; y < 18; y++) {
            const wall = this.add.rectangle(0, y * 32, 32, 32, 0x654321);
            this.walls.add(wall);
        }
        
        // 오른쪽 벽
        for(let y = 1; y < 18; y++) {
            const wall = this.add.rectangle(24 * 32, y * 32, 32, 32, 0x654321);
            this.walls.add(wall);
        }
        
        // 플레이어 생성
        this.player = new Player(this, 400, 300);
        
        // 적 그룹 생성
        this.enemies = this.add.group();
        this.spawnEnemies();

        // 화살 그룹 생성
        this.arrows = this.add.group();
        
        // UI 생성
        this.ui = new UI(this);
        
        // 충돌 설정
        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.enemies, this.walls);
        this.physics.add.collider(this.enemies, this.enemies);
        
        // 키보드 입력 설정
        this.cursors = this.input.keyboard.createCursorKeys();

        // 적 생성 타이머
        this.time.addEvent({
            delay: 5000,  // 5초마다
            callback: this.spawnEnemies,
            callbackScope: this,
            loop: true
        });
    }

    spawnEnemies() {
        // 현재 적의 수 확인
        if (this.enemies.getChildren().length >= 10) return;

        // 플레이어 레벨에 따른 적 레벨 결정
        const playerLevel = this.player.level;
        const minLevel = Math.max(1, playerLevel - 2);
        const maxLevel = playerLevel + 2;

        // 1-3마리의 적 생성
        const count = Phaser.Math.Between(1, 3);
        
        for (let i = 0; i < count; i++) {
            // 생성 위치 결정 (벽 근처는 제외)
            let x, y;
            do {
                x = Phaser.Math.Between(2, 23) * 32;
                y = Phaser.Math.Between(2, 17) * 32;
            } while (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < 200);

            // 적 레벨 결정
            const enemyLevel = Phaser.Math.Between(minLevel, maxLevel);
            
            // 적 생성
            const enemy = new Enemy(this, x, y, enemyLevel);
            this.enemies.add(enemy);
        }
    }

    update() {
        if (!this.player.active) return;

        // 플레이어 업데이트
        this.player.update(this.cursors);
        
        // 적 업데이트
        this.enemies.getChildren().forEach(enemy => {
            enemy.update(this.player);
        });

        // 화살 업데이트
        this.arrows.getChildren().forEach(arrow => {
            arrow.update();
        });
        
        // UI 업데이트
        this.ui.update(this.player);
    }
} 