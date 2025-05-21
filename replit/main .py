
import os
import tempfile
import zipfile
import shutil
import subprocess
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from yt_dlp import YoutubeDL

app = Flask(__name__)
CORS(app)  # Libera CORS para todas as rotas

def sanitize_filename(name):
    # Remove caracteres inválidos para nome de arquivo
    return "".join(c for c in name if c.isalnum() or c in " .-_").rstrip()

@app.route("/", methods=["GET"])
def home():
    return "OK", 200

@app.route("/info", methods=["POST"])
def info():
    data = request.get_json()
    url = data.get("url")
    if not url:
        return jsonify({"erro": "URL não informada"}), 400
    try:
        with YoutubeDL({"quiet": True}) as ydl:
            info = ydl.extract_info(url, download=False)
        return jsonify({
            "title": info.get("title"),
            "thumbnail": info.get("thumbnail"),
            "uploader": info.get("uploader"),
            "duration": info.get("duration"),
            "erro": None
        })
    except Exception as e:
        return jsonify({"erro": str(e)}), 400

@app.route("/baixar", methods=["POST"])
def baixar():
    data = request.get_json()
    url = data.get("url")
    formato = data.get("formato", "mp3")
    if not url:
        return jsonify({"erro": "URL não informada"}), 400

    # Detecta se é playlist
    try:
        with YoutubeDL({"quiet": True}) as ydl:
            info = ydl.extract_info(url, download=False)
    except Exception as e:
        return jsonify({"erro": f"Erro ao obter info: {str(e)}"}), 400

    is_playlist = info.get("_type") == "playlist" or "entries" in info

    if is_playlist:
        # Baixa playlist, compacta em ZIP
        return baixar_playlist(url, formato, info)
    else:
        # Baixa vídeo único
        return baixar_unico(url, formato, info)

def convert_to_mp4(input_path, output_path):
    # Converte qualquer vídeo para mp4 usando ffmpeg
    try:
        subprocess.run([
            "ffmpeg", "-y", "-i", input_path, "-c:v", "copy", "-c:a", "aac", output_path
        ], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return True
    except Exception as e:
        return False

def baixar_unico(url, formato, info):
    import mimetypes
    with tempfile.TemporaryDirectory() as tmpdir:
        title = sanitize_filename(info.get("title", "youtube-download"))
        outtmpl = os.path.join(tmpdir, f"%(title)s.%(ext)s")
        ydl_opts = {
            "format": "bestaudio/best" if formato == "mp3" else "bestvideo+bestaudio/best",
            "outtmpl": outtmpl,
            "noplaylist": True,
            "quiet": True,
        }
        if formato == "mp3":
            ydl_opts["postprocessors"] = [{
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }]
        try:
            with YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])
            # Procura o arquivo baixado
            files = os.listdir(tmpdir)
            if formato == "mp3":
                for fname in files:
                    if fname.lower().endswith(".mp3"):
                        filepath = os.path.join(tmpdir, fname)
                        return send_file(
                            filepath,
                            as_attachment=True,
                            download_name=fname,
                            mimetype="audio/mpeg"
                        )
                return jsonify({"erro": "Arquivo não encontrado"}), 500
            else:
                # Procura qualquer arquivo de vídeo
                video_exts = [".mp4", ".webm", ".mkv", ".mov", ".avi"]
                for fname in files:
                    if any(fname.lower().endswith(ext) for ext in video_exts):
                        filepath = os.path.join(tmpdir, fname)
                        # Se já for mp4, envia direto
                        if fname.lower().endswith(".mp4"):
                            return send_file(
                                filepath,
                                as_attachment=True,
                                download_name=fname,
                                mimetype="video/mp4"
                            )
                        # Se não for mp4, converte
                        else:
                            mp4_name = os.path.splitext(fname)[0] + ".mp4"
                            mp4_path = os.path.join(tmpdir, mp4_name)
                            ok = convert_to_mp4(filepath, mp4_path)
                            if ok and os.path.exists(mp4_path):
                                return send_file(
                                    mp4_path,
                                    as_attachment=True,
                                    download_name=mp4_name,
                                    mimetype="video/mp4"
                                )
                            else:
                                return jsonify({"erro": "Falha ao converter para mp4"}), 500
                return jsonify({"erro": "Arquivo não encontrado"}), 500
        except Exception as e:
            return jsonify({"erro": f"Erro ao baixar: {str(e)}"}), 500

def baixar_playlist(url, formato, info):
    import mimetypes
    with tempfile.TemporaryDirectory() as tmpdir:
        outtmpl = os.path.join(tmpdir, "%(playlist_index)02d - %(title)s.%(ext)s")
        ydl_opts = {
            "format": "bestaudio/best" if formato == "mp3" else "bestvideo+bestaudio/best",
            "outtmpl": outtmpl,
            "noplaylist": False,
            "quiet": True,
        }
        if formato == "mp3":
            ydl_opts["postprocessors"] = [{
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }]
        try:
            with YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])
            # Compacta todos os arquivos em ZIP
            zip_path = os.path.join(tmpdir, "playlist.zip")
            with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
                files = os.listdir(tmpdir)
                if formato == "mp3":
                    for fname in files:
                        if fname.lower().endswith(".mp3"):
                            zipf.write(os.path.join(tmpdir, fname), fname)
                else:
                    video_exts = [".mp4", ".webm", ".mkv", ".mov", ".avi"]
                    for fname in files:
                        if any(fname.lower().endswith(ext) for ext in video_exts):
                            filepath = os.path.join(tmpdir, fname)
                            # Se já for mp4, adiciona direto
                            if fname.lower().endswith(".mp4"):
                                zipf.write(filepath, fname)
                            else:
                                # Converte para mp4 antes de adicionar
                                mp4_name = os.path.splitext(fname)[0] + ".mp4"
                                mp4_path = os.path.join(tmpdir, mp4_name)
                                ok = convert_to_mp4(filepath, mp4_path)
                                if ok and os.path.exists(mp4_path):
                                    zipf.write(mp4_path, mp4_name)
                                else:
                                    # Se falhar, adiciona o original mesmo assim
                                    zipf.write(filepath, fname)
            return send_file(
                zip_path,
                as_attachment=True,
                download_name="playlist.zip",
                mimetype="application/zip"
            )
        except Exception as e:
            return jsonify({"erro": f"Erro ao baixar playlist: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
