class Arrow extends Phaser.GameObjects.Rectangle {
    constructor(scene, x, y, angle) {
        super(scene, x, y, 20, 4, 0xFFFF00);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 화살 속성
        this.speed = 400;
        this.damage = 15;
        this.lifespan = 1000; // 1초
        
        // 화살 회전
        this.rotation = angle;
        
        // 화살 속도 설정
        const velocity = scene.physics.velocityFromRotation(angle, this.speed);
        this.body.setVelocity(velocity.x, velocity.y);
        
        // 화살 궤적 효과
        this.trail = [];
        for (let i = 0; i < 5; i++) {
            const trailPart = scene.add.rectangle(x, y, 10 - i * 2, 2, 0xFFFF00, 0.8 - i * 0.15);
            this.trail.push(trailPart);
        }
        
        // 일정 시간 후 화살 제거
        scene.time.delayedCall(this.lifespan, () => {
            this.destroy();
        });
    }
    
    update() {
        // 궤적 업데이트
        for (let i = this.trail.length - 1; i >= 0; i--) {
            if (i === 0) {
                this.trail[i].setPosition(this.x, this.y);
            } else {
                this.trail[i].setPosition(
                    this.trail[i-1].x,
                    this.trail[i-1].y
                );
            }
            this.trail[i].rotation = this.rotation;
        }
    }
    
    destroy() {
        // 화살 제거 시 궤적도 함께 제거
        this.trail.forEach(trail => trail.destroy());
        super.destroy();
    }
    
    hit(enemy) {
        // 적중 효과
        const hitEffect = this.scene.add.circle(this.x, this.y, 10, 0xFFFF00, 0.7);
        this.scene.tweens.add({
            targets: hitEffect,
            scale: 2,
            alpha: 0,
            duration: 200,
            onComplete: () => hitEffect.destroy()
        });
        
        // 데미지 적용
        enemy.takeDamage(this.damage);
        
        // 화살 제거
        this.destroy();
    }
} 