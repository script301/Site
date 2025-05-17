document.addEventListener('DOMContentLoaded', function () {
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    const tabs = JSON.parse(localStorage.getItem('tabs') || '[]');
    nav.innerHTML = '';
    tabs.forEach(tab => {
        const a = document.createElement('a');
        a.href = tab.link;
        a.className = "nav-link px-3 py-2 text-sm font-medium text-gray-300 hover:text-white";
        a.textContent = tab.name;
        if (window.location.pathname.endsWith(tab.link)) {
            a.classList.add('active-nav');
            a.classList.remove('text-gray-300');
            a.classList.add('text-white');
        }
        nav.appendChild(a);
    });
});