class MoveTimer {
    constructor(initialSeconds, displayElementId) {
        this.initialSeconds = initialSeconds;
        this.currentSeconds = initialSeconds;
        this.displayElement = document.getElementById(displayElementId);
        this.timer = null;
        this.isPaused = false;
        this.isDead = false; // Tracks if the timer has ever hit 0
        this.updateDisplay();
    }

    startTimer() {
        if (this.timer || this.currentSeconds <= 0) return; // Prevent multiple intervals
        this.isPaused = false;

        this.timer = setInterval(() => {
            if (this.currentSeconds > 0) {
                this.currentSeconds--;
                this.updateDisplay();
            }
            if (this.currentSeconds <= 0) {
                clearInterval(this.timer);
                this.timer = null;
                this.isDead = true; // Mark timer as "dead"
            }
        }, 1000);
    }

    pauseTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
            this.isPaused = true;
        }
    }

    getTimeElapsed(){
        return this.initialSeconds - this.currentSeconds
    }

    resetMoveTimer() {
        this.currentSeconds = this.initialSeconds;
        this.isPaused = false;
        clearInterval(this.timer);
        this.timer = null;
        this.updateDisplay();
        this.startTimer(); // Automatically restart
        // Note: `isDead` is NOT reset here to track if it has ever reached 0
    }

    getIsDead() {
        return this.isDead;
    }

    updateDisplay() {
        if (this.displayElement) {
            this.displayElement.textContent = this.currentSeconds;
        }
    }
}

