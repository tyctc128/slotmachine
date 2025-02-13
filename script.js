document.addEventListener('DOMContentLoaded', function() {
    // 隨機排列圖片
    function shuffleImages() {
        const imageSlots = Array.from(document.querySelectorAll('.image-slot'));
        const container = document.querySelector('.image-container');
        
        // 創建一個臨時數組來存儲打亂後的元素
        const shuffledArray = [...imageSlots];
        
        // Fisher-Yates 洗牌算法
        for (let i = shuffledArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
        }
        
        // 清空容器
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        
        // 按照打亂後的順序重新添加元素
        shuffledArray.forEach(slot => {
            container.appendChild(slot);
        });
    }
    
    // 在頁面加載時執行隨機排列
    shuffleImages();

    const imageContainer = document.querySelector('.image-container');
    const lever = document.getElementById('lever');
    const totalImages = document.querySelectorAll('.image-slot').length;
    const slotHeight = 400; // 每個圖片槽的高度
    let isSpinning = false;

    // 設置初始位置
    imageContainer.style.transform = 'translateY(0)';

    // 載入拉桿音效
    const moveSound = new Audio('sounds/move.mp3');
    moveSound.volume = 0.3;

    // 拉桿的點擊功能
    lever.addEventListener('click', function() {
        if (!isSpinning) {
            isSpinning = true;
            pullLever();
        }
    });

    function pullLever() {
        // 播放拉桿音效
        moveSound.currentTime = 0;
        moveSound.play().catch(() => {});

        // 拉桿動畫
        lever.style.transform = 'translateY(100px) rotate(15deg)';
        setTimeout(() => {
            lever.style.transform = 'translateY(0) rotate(0deg)';
        }, 200);

        spinSlots();
    }

    function spinSlots() {
        let position = parseFloat(imageContainer.style.transform.replace('translateY(', '').replace('px)', '')) || 0;
        let speed = 0;
        let acceleration = 12;    // 加速度
        let maxSpeed = 200;       // 最高速度
        let currentPhase = 'accelerating';
        let spinCount = 0;
        let targetSpins = 2 + Math.floor(Math.random() * 2);  // 2-3次旋轉
        let lastStepTime = performance.now();
        let deceleration = 0.6;   // 減速率
        let extraSpinDistance = null;  // 額外旋轉距離
        const offsetCorrection = -62;   // 位置修正值
        
        function step(currentTime) {
            const deltaTime = currentTime - lastStepTime;
            lastStepTime = currentTime;
            
            if (currentPhase === 'accelerating') {
                speed = Math.min(speed + acceleration, maxSpeed);
                if (speed >= maxSpeed) {
                    currentPhase = 'constant';
                }
            } else if (currentPhase === 'constant') {
                spinCount++;
                if (spinCount > targetSpins) {
                    currentPhase = 'decelerating';
                    // 當開始減速時，決定額外旋轉的隨機距離
                    extraSpinDistance = Math.random() * slotHeight;
                }
            } else if (currentPhase === 'decelerating') {
                speed = Math.max(0, speed * (1 - deceleration * (deltaTime / 1000)));
            }
            
            position -= speed * (deltaTime / 16);
            
            if (position <= -slotHeight * totalImages) {
                position = 0;
            }
            
            imageContainer.style.transform = `translateY(${position}px)`;
            
            if (currentPhase === 'decelerating' && speed <= 2) {
                // 計算最後一個進入視野的圖片位置，加上隨機距離和位置修正
                let adjustedPosition = position - (extraSpinDistance || 0);
                let currentSlot = Math.floor((-adjustedPosition - offsetCorrection) / slotHeight);
                // 確保在有效範圍內
                currentSlot = Math.max(0, Math.min(currentSlot + 1, totalImages - 1));
                const finalPosition = (-currentSlot * slotHeight) + offsetCorrection;
                
                // 緩慢移動到目標位置
                const moveToTarget = () => {
                    const currentPosition = parseFloat(imageContainer.style.transform.replace('translateY(', '').replace('px)', ''));
                    const distance = finalPosition - currentPosition;
                    const step = distance * 0.1; // 每次移動距離的 10%
                    
                    if (Math.abs(distance) > 0.5) {
                        const newPosition = currentPosition + step;
                        imageContainer.style.transform = `translateY(${newPosition}px)`;
                        requestAnimationFrame(moveToTarget);
                    } else {
                        imageContainer.style.transform = `translateY(${finalPosition}px)`;
                        isSpinning = false;
                    }
                };
                
                moveToTarget();
                return;
            }
            
            requestAnimationFrame(step);
        }
        
        requestAnimationFrame(step);
    }
});
