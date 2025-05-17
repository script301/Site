// URL do backend
const BACKEND_URL = "https://1392d607-caf5-40f3-88e1-3ea812c6273b-00-g113hf7pwva5.worf.replit.dev/info"; // Troque pelo seu backend real

const urlInput = document.getElementById('youtube-url');
const previewDiv = document.getElementById('preview');
const thumbImg = document.getElementById('preview-thumb');
const titleDiv = document.getElementById('preview-title');
const uploaderDiv = document.getElementById('preview-uploader');
const durationDiv = document.getElementById('preview-duration');
const status = document.getElementById('status');
const baixarBtn = document.getElementById('baixar-btn');

let lastUrl = "";

function formatDuration(seconds) {
    if (!seconds) return "";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

async function fetchInfo(url) {
    previewDiv.classList.add('hidden');
    titleDiv.textContent = '';
    thumbImg.src = '';
    uploaderDiv.textContent = '';
    durationDiv.textContent = '';
    if (!url || !/^https?:\/\/.+/.test(url)) return;
    status.textContent = 'Buscando informações do vídeo...';
    try {
        const res = await fetch(`${BACKEND_URL}/info`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        if (!res.ok) throw new Error('Erro ao buscar informações');
        const info = await res.json();
        if (info.erro) throw new Error(info.erro);
        titleDiv.textContent = info.title || 'Sem título';
        thumbImg.src = info.thumbnail || '';
        uploaderDiv.textContent = info.uploader ? `Canal: ${info.uploader}` : '';
        durationDiv.textContent = info.duration ? `Duração: ${formatDuration(info.duration)}` : '';
        previewDiv.classList.remove('hidden');
        status.textContent = '';
    } catch (e) {
        previewDiv.classList.add('hidden');
        status.textContent = 'Erro ao buscar informações: ' + e.message;
    }
}

// Busca preview ao colar ou sair do campo
urlInput.addEventListener('change', () => {
    const url = urlInput.value.trim();
    if (url && url !== lastUrl) {
        lastUrl = url;
        fetchInfo(url);
    }
});
urlInput.addEventListener('blur', () => {
    const url = urlInput.value.trim();
    if (url && url !== lastUrl) {
        lastUrl = url;
        fetchInfo(url);
    }
});

// Baixar botão (igual ao seu original, mas usando a variável BACKEND_URL)
baixarBtn.onclick = async function() {
    const url = urlInput.value.trim();
    const formato = document.getElementById('formato').value;
    if (!url) {
        status.textContent = 'Informe o link do vídeo!';
        return;
    }
    this.disabled = true;
    status.textContent = 'Processando, aguarde...';
    try {
        const res = await fetch(`${BACKEND_URL}/baixar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, formato })
        });
        if (!res.ok) {
            let erroMsg = '';
            try {
                const erro = await res.json();
                erroMsg = erro.erro || 'Erro ao baixar';
            } catch {
                erroMsg = await res.text();
                if (erroMsg.startsWith('<!DOCTYPE')) {
                    erroMsg = 'Erro inesperado do servidor (HTML recebido).';
                }
            }
            throw new Error(erroMsg);
        }
        const blob = await res.blob();
        const ext = formato === 'mp3' ? 'mp3' : 'mp4';
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `youtube-download.${ext}`;
        a.click();
        status.textContent = 'Download iniciado!';
    } catch (e) {
        status.textContent = 'Erro: ' + e.message;
    }
    this.disabled = false;
};
