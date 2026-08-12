
// Light / Dark theme toggle

document.addEventListener('DOMContentLoaded', function () {
    const body = document.body,
        themeToggleBtn = document.querySelector('.theme-toggle-btn');

    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function () {
            body.classList.toggle('dark');
            localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
        });
    }
});
