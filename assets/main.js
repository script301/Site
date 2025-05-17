/* Mobile menu toggle */
document.addEventListener('DOMContentLoaded', function () {
    const mobileMenuBtn = document.querySelector('[aria-controls="mobile-menu"]');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function () {
            const menu = document.getElementById('mobile-menu');
            menu.classList.toggle('hidden');
        });
    }

    // Tool details modal (example functionality)
    window.showToolDetails = function () {
        document.getElementById('tool-details').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    window.closeToolDetails = function () {
        document.getElementById('tool-details').classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    // Simulate download (for demo purposes)
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            if (!this.href) {
                e.preventDefault();
                alert('Download would start here in a real implementation!');
            }
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});