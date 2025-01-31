const imageStoneHandler = {
    stone: {
        draw: function(args, board) {
            const xr = board.getX(args.x) - board.stoneRadius; // Adjust x position
            const yr = board.getY(args.y) - board.stoneRadius; // Adjust y position
            const sr = board.stoneRadius * 2; // Ensure full size coverage

            const img = (args.c === WGo.B) ? blackStone : whiteStone; // Select image

            this.drawImage(img, xr, yr, sr, sr); // Draw stone image
        }
    }
};

const newYunziHandler = {
    stone: {
        draw: function(args, board) {
            let xr = board.getX(args.x),
                yr = board.getY(args.y),
                sr = board.stoneRadius,
                radgrad;

            // Create radial gradient for realistic shading
            if (args.c === WGo.B) { // Black (Slate)
                radgrad = this.createRadialGradient(xr - 2 * sr / 5, yr - 2 * sr / 5, 2, xr - sr / 5, yr - sr / 5, 4 * sr / 5);
                radgrad.addColorStop(0, "#333"); // Dark center
                radgrad.addColorStop(1, "#000"); // Outer black

            } else { // White (Shell)
                radgrad = this.createRadialGradient(xr - 2 * sr / 5, yr - 2 * sr / 5, 2, xr - sr / 5, yr - sr / 5, 4 * sr / 5);
                radgrad.addColorStop(0, "#FFF"); // Bright center
                radgrad.addColorStop(1, "#DDD"); // Outer shell texture
            }

            // Draw the stone
            this.beginPath();
            this.fillStyle = radgrad;
            this.arc(xr, yr, sr - 0.5, 0, 2 * Math.PI, true);
            this.fill();
        }
    }
};
const oldYunziHandler = {
    stone: {
        draw: function(args, board) {
            let xr = board.getX(args.x),
                yr = board.getY(args.y),
                sr = board.stoneRadius,
                radgrad;

            // Create radial gradient for realistic shading
            if (args.c === WGo.B) { // Black (Slate)
                radgrad = this.createRadialGradient(xr - 2 * sr / 5, yr - 2 * sr / 5, 2, xr - sr / 5, yr - sr / 5, 4 * sr / 5);
                radgrad.addColorStop(0, "#333"); // Dark center
                radgrad.addColorStop(1, "#000"); // Outer black

            } else { // White (Yellowed Shell)
                radgrad = this.createRadialGradient(xr - 2 * sr / 5, yr - 2 * sr / 5, 2, xr - sr / 5, yr - sr / 5, 4 * sr / 5);
                radgrad.addColorStop(0, "#FFF8DC"); // Warm ivory center (Cornsilk)
                radgrad.addColorStop(0.5, "#FAEAB1"); // Soft pale yellow tint
                radgrad.addColorStop(1, "#E0CDA9"); // Aged yellowish ivory
            }

            // Draw the stone
            this.beginPath();
            this.fillStyle = radgrad;
            this.arc(xr, yr, sr - 0.5, 0, 2 * Math.PI, true);
            this.fill();
        }
    }
};

const slateshell = {
    stone: {
        // draw function is called in context of CanvasRenderingContext2D, so we can paint immediately using this
        draw: function(args, board) {
            const xr = board.getX(args.x), // get absolute x coordinate of intersection
                yr = board.getY(args.y), // get absolute y coordinate of intersection
                sr = board.stoneRadius; // get field radius in px
            
            // if there is a black stone, draw white plane
            if(board.obj_arr[args.x][args.y][0].c === WGo.B) this.strokeStyle = "white"; 
            else this.strokeStyle = "black";
            
            this.lineWidth = 3;
            
            this.beginPath();
            
            this.moveTo(xr - sr*0.8, yr);
            this.lineTo(xr + sr*0.5, yr);
            this.lineTo(xr + sr*0.8, yr - sr*0.25);
            this.moveTo(xr - sr*0.4, yr);
            this.lineTo(xr + sr*0.3, yr - sr*0.6);
            this.moveTo(xr - sr*0.4, yr);
            this.lineTo(xr + sr*0.3, yr + sr*0.6);
            
            this.stroke();
        }
    }
}