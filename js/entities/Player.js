class Player extends Phaser.GameObjects.Rectangle {
    constructor(scene, x, y) {
        super(scene, x, y, 32, 32, 0xFF0000);
        
        this.scene = scene;
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 기본 속성 설정
        this.body.setCollideWorldBounds(true);
        this.health = 100;
        this.maxHealth = 100;
        this.speed = 200;
        this.damage = 20;

        // 레벨 시스템
        this.level = 1;
        this.experience = 0;
        this.expToNextLevel = 100;

        // 공격 관련 속성
        this.attackCooldown = 500; // 0.5초
        this.lastAttackTime = 0;
        this.isDrawingBow = false;
        this.drawStartTime = 0;
        this.maxDrawTime = 1000; // 1초
        this.minArrowDamage = 10;
        this.maxArrowDamage = 30;

        // 조준선 생성
        this.aimLine = scene.add.line(0, 0, 0, 0, 0, 0, 0xFFFF00, 0.5);
        this.aimLine.setLineWidth(1);
        this.aimLine.setVisible(false);

        // 활 시위 당기는 효과
        this.bowDrawEffect = scene.add.circle(x, y, 20, 0xFFFF00, 0.3);
        this.bowDrawEffect.setVisible(false);

        // 데미지 텍스트 스타일
        this.damageTextStyle = {
            fontSize: '20px',
            fill: '#FF0000',
            stroke: '#FFFFFF',
            strokeThickness: 2
        };
    }

    update(cursors) {
        const speed = this.speed;
        
        // 이동 로직
        if (cursors.left.isDown) {
            this.body.setVelocityX(-speed);
        } else if (cursors.right.isDown) {
            this.body.setVelocityX(speed);
        } else {
            this.body.setVelocityX(0);
        }

        if (cursors.up.isDown) {
            this.body.setVelocityY(-speed);
        } else if (cursors.down.isDown) {
            this.body.setVelocityY(speed);
        } else {
            this.body.setVelocityY(0);
        }

        // 마우스 위치 기준으로 조준
        const pointer = this.scene.input.activePointer;
        const angle = Phaser.Math.Angle.Between(
            this.x, this.y,
            pointer.x + this.scene.cameras.main.scrollX,
            pointer.y + this.scene.cameras.main.scrollY
        );

        // 활 시위 당기기
        if (pointer.isDown && !this.isDrawingBow && 
            this.scene.time.now > this.lastAttackTime + this.attackCooldown) {
            this.startDrawingBow();
        }

        // 활 시위 당기는 중
        if (this.isDrawingBow) {
            this.updateBowDrawing(angle);
        }

        // 활 발사
        if (this.isDrawingBow && !pointer.isDown) {
            this.shootArrow(angle);
        }
    }

    startDrawingBow() {
        this.isDrawingBow = true;
        this.drawStartTime = this.scene.time.now;
        
        // 조준선 표시
        this.aimLine.setVisible(true);
        
        // 활 시위 당기는 효과 표시
        this.bowDrawEffect.setVisible(true);
        this.bowDrawEffect.setPosition(this.x, this.y);
        this.bowDrawEffect.setScale(0.5);
    }

    updateBowDrawing(angle) {
        const drawTime = this.scene.time.now - this.drawStartTime;
        const drawProgress = Math.min(drawTime / this.maxDrawTime, 1);
        
        // 조준선 업데이트
        const lineLength = 50 + drawProgress * 50;
        const endX = this.x + Math.cos(angle) * lineLength;
        const endY = this.y + Math.sin(angle) * lineLength;
        this.aimLine.setTo(this.x, this.y, endX, endY);
        
        // 활 시위 당기는 효과 업데이트
        this.bowDrawEffect.setScale(0.5 + drawProgress * 0.5);
        this.bowDrawEffect.setPosition(this.x, this.y);
        this.bowDrawEffect.setAlpha(0.3 + drawProgress * 0.3);
    }

    shootArrow(angle) {
        const drawTime = this.scene.time.now - this.drawStartTime;
        const drawPower = Math.min(drawTime / this.maxDrawTime, 1);
        
        // 데미지 계산
        const arrowDamage = this.minArrowDamage + 
            (this.maxArrowDamage - this.minArrowDamage) * drawPower;
        
        // 화살 생성
        const arrow = new Arrow(this.scene, this.x, this.y, angle);
        arrow.damage = arrowDamage;
        
        // 화살과 적의 충돌 설정
        this.scene.physics.add.collider(
            arrow,
            this.scene.enemies,
            (arrow, enemy) => arrow.hit(enemy)
        );
        
        // 화살과 벽의 충돌 설정
        this.scene.physics.add.collider(
            arrow,
            this.scene.walls,
            (arrow) => arrow.destroy()
        );
        
        // 화살을 arrows 그룹에 추가
        this.scene.arrows.add(arrow);
        
        // 상태 초기화
        this.isDrawingBow = false;
        this.lastAttackTime = this.scene.time.now;
        this.aimLine.setVisible(false);
        this.bowDrawEffect.setVisible(false);
    }

    takeDamage(damage) {
        // 데미지 적용
        this.health = Math.max(0, this.health - damage);

        // 데미지 텍스트 표시
        const damageText = this.scene.add.text(
            this.x, 
            this.y - 20, 
            `-${damage}`, 
            this.damageTextStyle
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

    gainExperience(exp) {
        this.experience += exp;
        
        // 레벨업 체크
        while (this.experience >= this.expToNextLevel) {
            this.levelUp();
        }

        // 경험치 획득 텍스트 표시
        const expText = this.scene.add.text(
            this.x,
            this.y - 40,
            `+${exp}XP`,
            {
                fontSize: '16px',
                fill: '#FFFF00',
                stroke: '#000000',
                strokeThickness: 2
            }
        );

        this.scene.tweens.add({
            targets: expText,
            y: expText.y - 30,
            alpha: 0,
            duration: 1000,
            onComplete: () => expText.destroy()
        });
    }

    levelUp() {
        this.level++;
        this.experience -= this.expToNextLevel;
        this.expToNextLevel = Math.floor(this.expToNextLevel * 1.5);

        // 스탯 증가
        this.maxHealth += 20;
        this.health = this.maxHealth;
        this.damage += 5;
        this.speed += 10;
        this.minArrowDamage += 3;
        this.maxArrowDamage += 5;

        // 레벨업 이펙트
        const levelUpText = this.scene.add.text(
            this.x,
            this.y,
            'LEVEL UP!',
            {
                fontSize: '32px',
                fill: '#FFFF00',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        // 레벨업 애니메이션
        this.scene.tweens.add({
            targets: levelUpText,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 1000,
            onComplete: () => levelUpText.destroy()
        });
    }

    die() {
        // 사망 이펙트
        const gameOverText = this.scene.add.text(
            400,
            300,
            'GAME OVER',
            {
                fontSize: '64px',
                fill: '#FF0000',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5);

        // 게임 재시작 버튼
        const restartButton = this.scene.add.text(
            400,
            400,
            'Click to Restart',
            {
                fontSize: '32px',
                fill: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 4
            }
        )
        .setOrigin(0.5)
        .setInteractive();

        restartButton.on('pointerdown', () => {
            this.scene.scene.restart();
        });

        // 플레이어 비활성화
        this.body.setVelocity(0, 0);
        this.setActive(false);
    }
} 