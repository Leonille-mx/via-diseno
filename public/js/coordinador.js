document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.getElementById('navToggle');
    const sidebar = document.querySelector('.nav-coordinador');
    const overlay = document.getElementById('navOverlay');

    const toggleMenu = () => {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        navToggle.style.display = sidebar.classList.contains('active') ? 'none' : 'block';
    };

    navToggle.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    window.addEventListener('resize', () => {
        if (window.innerWidth > 992) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            navToggle.style.display = 'none';
        } else {
            navToggle.style.display = 'block';
        }
    });
});