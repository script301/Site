// Lê o ID da ferramenta da query string (?id=0)
function getToolId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function renderTool() {
    const id = getToolId();
    const tools = JSON.parse(localStorage.getItem('tools') || '[]');
    const tool = tools[id];
    const content = document.getElementById('tool-content');
    if (!tool) {
        content.innerHTML = '<p class="text-red-400 text-xl">Ferramenta não encontrada.</p>';
        return;
    }
    content.innerHTML = `
        <div class="flex items-center mb-6">
            <div class="h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-4">
                <i class="${tool.icon} text-white text-2xl"></i>
            </div>
            <div>
                <h1 class="text-3xl font-bold text-white">${tool.name}</h1>
                <span class="text-gray-400 text-sm">v${tool.version}</span>
            </div>
        </div>
        <p class="text-gray-300 mb-6">${tool.desc}</p>
        <div class="flex gap-4 mb-6">
            <a href="${tool.link}" target="_blank" class="download-btn inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                <i class="fas fa-download mr-2"></i> Baixar / Ver Projeto
            </a>
        </div>
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-900 text-pink-200">
            <i class="fas fa-star mr-1"></i> ${tool.stars} Estrelas
        </span>
    `;
}

document.addEventListener('DOMContentLoaded', renderTool);