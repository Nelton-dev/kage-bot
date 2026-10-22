# Kage-Bot: Plano de desenvolvimento

## Estado atual

- [x] Ligação ao WhatsApp através de Baileys
- [x] Arquitetura modular de comandos
- [x] Comando ping
- [x] Menu de comandos
- [x] Pesquisa de animes
- [x] Tentativa de tradução das descrições
- [x] Consulta de animes da temporada
- [x] Ranking de animes
- [x] Recomendação aleatória de animes

As funcionalidades acima foram registadas com base no estado conhecido do projeto. Devem continuar a ser testadas após alterações.

## Fase 1: Consolidar a base

- [ ] Testar todos os comandos existentes.
- [ ] Confirmar o funcionamento do menu automático.
- [ ] Confirmar o carregamento do banner.
- [ ] Melhorar o tratamento de erros das APIs.
- [ ] Verificar reconexão e estabilidade do WhatsApp.
- [ ] Configurar um .gitignore seguro.
- [ ] Criar testes básicos para funções importantes.

## Fase 2: Expandir o entretenimento

- [ ] Criar comando de pesquisa de filmes.
- [ ] Criar comando de pesquisa de séries.
- [ ] Criar pesquisa unificada de entretenimento.
- [ ] Organizar os comandos por categorias.
- [ ] Permitir que cada módulo declare a sua própria categoria.
- [ ] Melhorar a apresentação das informações e imagens.

## Fase 3: Melhorar a experiência

- [ ] Uniformizar mensagens e cartões visuais.
- [ ] Melhorar mensagens de erro e resultados vazios.
- [ ] Evitar chamadas desnecessárias às APIs.
- [ ] Implementar cache onde fizer sentido.
- [ ] Documentar limites e dependências de cada API.

## Requisitos do projeto

- Desenvolver no Termux.
- Evitar dependências desnecessárias.
- Preferir serviços gratuitos no início.
- Preservar a arquitetura modular.
- Testar antes de substituir funcionalidades.
- Manter a documentação atualizada.
- Nunca publicar sessões ou credenciais privadas.

## Regra de prioridade

Primeiro garantir que as funcionalidades atuais funcionam. Depois implementar uma funcionalidade de cada vez, testar e atualizar a documentação.
