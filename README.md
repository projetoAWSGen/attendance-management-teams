# Gerenciador de Presença

Este projeto processa arquivos CSV de presença, limpa e organiza os dados e gera um novo CSV com o status de presença de cada participante.

## Sobre o arquivo de entrada

O arquivo CSV de entrada deve ser gerado pelo relatório do aplicativo de chamada do Microsoft Teams. Basta exportar o relatório de presença do Teams e utilizar o arquivo CSV gerado como entrada nesta ferramenta.

## Funcionalidades

- Upload de um arquivo CSV exportado do Teams.
- Limpeza dos nomes dos participantes e remoção de e-mails externos.
- Exportação de um novo CSV organizado com todas as colunas relevantes.
- Código e interface limpos e organizados.

## Como usar

1. Abra o arquivo `index.html` no seu navegador.
2. Selecione o arquivo CSV exportado do Teams.
3. Clique em **Organizar e Baixar CSV**.
4. O CSV limpo e organizado será baixado automaticamente, com o nome no formato `dia-da-semana-DD-MM.csv` (exemplo: `segunda-26-08.csv`).

## Estrutura dos Arquivos

- `index.html`: Interface principal.
- `style.css`: Estilos da interface.
- `main.js`: Toda a lógica de leitura, limpeza e exportação do CSV.

## Requisitos

- Arquivo CSV exportado do relatório de presença do Teams.
