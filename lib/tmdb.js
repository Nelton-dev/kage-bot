const axios = require('axios');

const API_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const config = require('../config/tmdb');

function obterChave() {
    const chave = process.env.TMDB_API_KEY || config.apiKey;

    if (!chave) {
        throw new Error(
            'Chave TMDB não configurada. Verifica o ficheiro .env.'
        );
    }

    return chave;
}

async function pesquisar(tipo, titulo) {
    const endpoints = {
        filme: '/search/movie',
        serie: '/search/tv'
    };

    const endpoint = endpoints[tipo];

    if (!endpoint) {
        throw new Error('Tipo de pesquisa inválido.');
    }

    const resposta = await axios.get(`${API_URL}${endpoint}`, {
        params: {
            api_key: obterChave(),
            query: titulo,
            language: 'pt-PT',
            include_adult: false
        },
        timeout: 15000
    });

    const resultado = resposta.data?.results?.[0];

    if (!resultado) {
        return null;
    }

    return {
        id: resultado.id,
        titulo: resultado.title || resultado.name,
        tituloOriginal: resultado.original_title || resultado.original_name,
        descricao: resultado.overview || 'Sinopse não disponível.',
        data: resultado.release_date || resultado.first_air_date || '',
        classificacao: resultado.vote_average,
        votos: resultado.vote_count,
        generos: resultado.genre_ids || [],
        cartaz: resultado.poster_path
            ? `${IMAGE_URL}${resultado.poster_path}`
            : null
    };
}

async function detalhesSerie(id) {
    const resposta = await axios.get(`${API_URL}/tv/${id}`, {
        params: {
            api_key: obterChave(),
            language: 'pt-PT'
        },
        timeout: 15000
    });

    const serie = resposta.data;

    return {
        temporadas: serie.number_of_seasons,
        episodios: serie.number_of_episodes,
        estado: serie.status,
        dataFinal: serie.last_air_date
    };
}

async function obterGeneros(tipo) {
    const resposta = await axios.get(
        `${API_URL}/genre/${tipo}/list`,
        {
            params: {
                api_key: obterChave(),
                language: 'pt-PT'
            },
            timeout: 15000
        }
    );

    return Object.fromEntries(
        (resposta.data.genres || []).map(g => [g.id, g.name])
    );
}

module.exports = {
    pesquisar,
    detalhesSerie,
    obterGeneros
};
