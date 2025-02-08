function createParticles(celebration_percent) {
    console.log("Showing particles")
    const container = document.getElementById('particle-container');
    // Example Tailwind colors
    const colors = ['text-yellow-400', 'text-blue-400', 'text-pink-400', 'text-white'];
    const particleCount = celebration_percent * 2;
  
    // Clear previous particles
    container.innerHTML = '';
  
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      // Distribute angles around a circle
      const angle = (Math.PI * 2 * i) / particleCount;
      // Vary the distance for random "explosion" radius
      const distance = Math.random() * 800 + 50;
      
      // Random properties
      const size = Math.random() * 6 + 3;
      const color = colors[Math.floor(Math.random() * colors.length)];
      // Calculate final x/y offsets
      const tx = Math.cos(angle) * distance + 'px';
      const ty = Math.sin(angle) * distance + 'px';
      // Random delay and duration for more natural look
      const delay = Math.random() * 0.3;
      const duration = Math.random() * 0.7 + 1.5;
  
      // Apply Tailwind color + "particle" style class
      particle.className = `particle ${color}`;
      
      // Define custom properties and animation
      // --tx and --ty allow us to use them in @keyframes
      particle.style.cssText = `
        position: absolute;
        left: 50%;
        top: 50%;
        width: ${size}px;
        height: ${size}px;
        background: currentColor; /* uses the text color */
        border-radius: 50%;
        transform: translate(-50%, -50%);
        --tx: ${tx};
        --ty: ${ty};
        animation: explode ${duration}s ease-out ${delay}s forwards;
        opacity: 0;
      `;
  
      container.appendChild(particle);
  
      // Remove particle after it finishes animating
      setTimeout(() => particle.remove(), (duration + delay) * 1000);
    }
  }
  