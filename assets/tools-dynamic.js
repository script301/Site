document.addEventListener('DOMContentLoaded', function () {
    const grid = document.getElementById('tools-grid');
    if (!grid) return;
    const tools = JSON.parse(localStorage.getItem('tools') || '[]');
    if (tools.length === 0) {
        grid.innerHTML = '<p class="text-gray-400">Nenhuma ferramenta cadastrada.</p>';
        return;
    }
    grid.innerHTML = '';
    tools.forEach(tool => {
        const card = document.createElement('div');
        card.className = "p-5 tool-card bg-gray-900 rounded-lg shadow";
        card.innerHTML = `
            <div class="flex items-center">
                <div class="flex-shrink-0 bg-gray-800 p-3 rounded-lg">
                    <i class="${tool.icon} text-pink-500 text-2xl"></i>
                </div>
                <div class="ml-4">
                    <h3 class="text-lg font-medium text-white">${tool.name}</h3>
                    <p class="mt-1 text-sm text-gray-300">v${tool.version}</p>
                </div>
            </div>
            <p class="mt-4 text-gray-300">${tool.desc}</p>
            <div class="mt-6 flex justify-between items-center">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-900 text-pink-200">
                    <i class="fas fa-star mr-1"></i> ${tool.stars} Estrelas
                </span>
                <a href="${tool.link}" class="text-pink-400 hover:text-pink-300 text-sm font-medium">
                    Ver Detalhes <i class="fas fa-chevron-right ml-1"></i>
                </a>
            </div>
        `;
        grid.appendChild(card);
    });
});