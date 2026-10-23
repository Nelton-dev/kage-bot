const tmdb = require('./lib/tmdb');

async function main() {
    try {
        const filme = await tmdb.pesquisar(
            'filme',
            'Interstellar'
        );

        if (!filme) {
            console.log('Nenhum resultado encontrado.');
            return;
        }

        console.log({
            titulo: filme.titulo,
            ano: filme.data?.slice(0, 4),
            cartaz: Boolean(filme.cartaz)
        });
    } catch (erro) {
        console.error(
            'Erro:',
            erro.response?.status || erro.message
        );
    }
}

main();
