

const companionToggleButton = document.getElementById('companionToggleButton');

companionToggleButton.addEventListener('click', () => {
    const isActive = companionToggleButton.classList.contains('bg-blue-500');
    companionToggleButton.classList.toggle('bg-blue-500', !isActive);
    companionToggleButton.classList.toggle('bg-gray-300', isActive);

    const toggleCircle = companionToggleButton.querySelector('div');
    toggleCircle.classList.toggle('translate-x-4', !isActive);
});