const fs = require('fs');
const path = require('path');

function carregarEnv() {
    const caminho = path.join(__dirname, '..', '.env');

    if (!fs.existsSync(caminho)) {
        return '';
    }

    const linha = fs.readFileSync(caminho, 'utf8')
        .split(/\r?\n/)
        .find(l => l.trim().startsWith('TMDB_API_KEY='));

    if (!linha) {
        return '';
    }

    return linha.slice(linha.indexOf('=') + 1)
        .trim()
        .replace(/^["']|["']$/g, '');
}

module.exports = {
    get apiKey() {
        return process.env.TMDB_API_KEY || carregarEnv();
    }
};
