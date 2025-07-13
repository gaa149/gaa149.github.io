class Enemy extends Phaser.GameObjects.Rectangle {
    constructor(scene, x, y, level = 1) {
        const color = Enemy.getColorByLevel(level);
        super(scene, x, y, 32, 32, color);
        
        this.scene = scene;
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 레벨 기반 속성 설정
        this.level = level;
        this.health = 50 + (level - 1) * 30;
        this.maxHealth = this.health;
        this.speed = 100 + (level - 1) * 10;
        this.damage = 10 + (level - 1) * 5;
        this.experienceValue = 20 + (level - 1) * 15;

        // 공격 관련 속성
        this.attackRange = 40;
        this.attackCooldown = 1000; // 1초
        this.lastAttackTime = 0;

        // 레벨 표시
        this.levelText = scene.add.text(x, y - 20, `Lv.${level}`, {
            fontSize: '16px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // 체력바 배경
        this.healthBarBg = scene.add.rectangle(x, y + 20, 32, 4, 0x000000);
        
        // 체력바
        this.healthBar = scene.add.rectangle(x, y + 20, 32, 4, 0xFF0000);
    }

    static getColorByLevel(level) {
        // 레벨에 따른 색상 변경
        if (level <= 3) return 0x00FF00;      // 초급: 초록색
        if (level <= 6) return 0x0000FF;      // 중급: 파란색
        if (level <= 9) return 0xFF00FF;      // 고급: 보라색
        return 0xFF0000;                      // 보스: 빨간색
    }

    update(player) {
        if (!this.active) return;

        // 플레이어 추적 로직
        if (player && player.active) {
            const distance = Phaser.Math.Distance.Between(
                this.x, this.y,
                player.x, player.y
            );

            if (distance <= this.attackRange && 
                this.scene.time.now > this.lastAttackTime + this.attackCooldown) {
                this.attack(player);
            } else if (distance > this.attackRange) {
                const angle = Phaser.Math.Angle.Between(
                    this.x, this.y,
                    player.x, player.y
                );
                
                const speed = this.speed;
                this.body.setVelocityX(Math.cos(angle) * speed);
                this.body.setVelocityY(Math.sin(angle) * speed);
            }
        }

        // UI 업데이트
        this.updateUI();
    }

    updateUI() {
        // 레벨 텍스트 위치 업데이트
        this.levelText.setPosition(this.x, this.y - 20);
        
        // 체력바 위치 및 크기 업데이트
        this.healthBarBg.setPosition(this.x, this.y + 20);
        this.healthBar.setPosition(this.x - (32 * (1 - this.health/this.maxHealth))/2, this.y + 20);
        this.healthBar.setSize(32 * (this.health/this.maxHealth), 4);
    }

    attack(player) {
        this.lastAttackTime = this.scene.time.now;

        // 공격 이펙트
        const attackEffect = this.scene.add.rectangle(
            this.x, this.y,
            40, 40,
            0xFF0000,
            0.5
        );

        // 데미지 적용
        player.takeDamage(this.damage);

        // 이펙트 제거
        this.scene.time.delayedCall(200, () => {
            attackEffect.destroy();
        });
    }

    takeDamage(damage) {
        // 데미지 적용
        this.health = Math.max(0, this.health - damage);

        // 데미지 텍스트 표시
        const damageText = this.scene.add.text(
            this.x,
            this.y - 20,
            `-${damage}`,
            {
                fontSize: '20px',
                fill: '#FF0000',
                stroke: '#FFFFFF',
                strokeThickness: 2
            }
        );

        // 데미지 텍스트 애니메이션
        this.scene.tweens.add({
            targets: damageText,
            y: damageText.y - 50,
            alpha: 0,
            duration: 800,
            onComplete: () => damageText.destroy()
        });

        // 피격 효과
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            yoyo: true,
            duration: 100,
            repeat: 2
        });

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        // 경험치 제공
        this.scene.player.gainExperience(this.experienceValue);

        // 사망 이펙트
        const deathEffect = this.scene.add.circle(
            this.x,
            this.y,
            20,
            0xFFFFFF,
            1
        );

        this.scene.tweens.add({
            targets: deathEffect,
            scale: 2,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                deathEffect.destroy();
                this.levelText.destroy();
                this.healthBarBg.destroy();
                this.healthBar.destroy();
                this.destroy();
            }
        });
    }
} 