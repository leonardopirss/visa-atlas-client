# Feature Specification: Shortlist e comparação segura de destinos

**Feature:** `006-destination-shortlist-comparison` · **Prioridade:** P1 · **Status:** Draft para revisão · **Data:** 2026-11-15

## Problem

O Visa Atlas permite descobrir e abrir um destino, mas a seleção desaparece ao
trocar de país ou recarregar a página. A pessoa não consegue montar uma lista
curta, rever destinos nem compartilhar o recorte explorado. Também não existe
uma forma segura de colocar destinos lado a lado sem sugerir que métricas de
vistos, residência e titulares de permissão sejam equivalentes.

## User Scenarios & Testing

### US1 — Montar e rever uma shortlist (P1)

**Independent Test:** adicionar três países, recarregar o navegador e remover
um deles preserva a ordem dos restantes sem criar conta ou enviar dados ao
servidor.

**Acceptance Scenarios:**

1. **Given** um país aberto, **When** adiciono o destino à shortlist, **Then** o
   estado do botão, o contador global e a lista persistida são atualizados.
2. **Given** uma shortlist existente, **When** recarrego ou reabro a aplicação
   no mesmo navegador, **Then** encontro os mesmos ISO3 na mesma ordem.
3. **Given** três destinos salvos, **When** tento adicionar um quarto, **Then**
   recebo orientação para remover um destino e nenhum item existente é
   substituído silenciosamente.
4. **Given** storage ausente, bloqueado ou corrompido, **When** a aplicação
   inicia, **Then** continua funcional com shortlist vazia e sem erro fatal.
5. **Given** uso teclado ou leitor de tela, **When** adiciono ou removo um país,
   **Then** a mudança é anunciada e o foco permanece previsível.

### US2 — Comparar destinos sem misturar métricas (P1)

**Independent Test:** comparar destinos compatíveis mostra valores lado a lado;
comparar Canadá, Reino Unido e Europa cria grupos separados e não produz
ranking, soma, vencedor ou escala numérica compartilhada.

**Acceptance Scenarios:**

1. **Given** dois ou três destinos com a mesma métrica, unidade, período e
   `comparisonGroupId`, **When** abro a comparação, **Then** os valores podem ser
   alinhados no mesmo grupo comparável, sempre com fonte e significado visíveis.
2. **Given** destinos com métricas, unidades, períodos ou grupos diferentes,
   **When** abro a comparação, **Then** cada contexto aparece separadamente com
   uma explicação de que os números não são diretamente comparáveis.
3. **Given** um país sem observação publicada, **When** comparo, **Then** vejo
   `UNAVAILABLE` e orientação útil, nunca zero, estimativa ou exclusão silenciosa.
4. **Given** uma consulta falha e as demais respondem, **When** a comparação é
   renderizada, **Then** apenas o cartão afetado mostra erro e retry; os demais
   permanecem disponíveis.
5. **Given** modalidades verificadas, **When** comparo, **Then** vejo patrocínio,
   data de verificação e link oficial por destino sem inferência de
   elegibilidade pessoal.

### US3 — Compartilhar e restaurar o recorte (P1)

**Independent Test:** abrir uma URL com até três ISO3 válidos restaura a
comparação em navegador sem storage; parâmetros inválidos são ignorados com
segurança e o restante da aplicação continua utilizável.

**Acceptance Scenarios:**

1. **Given** uma comparação aberta, **When** uso “Compartilhar”, **Then** recebo
   uma URL canônica contendo apenas os ISO3 ordenados e o modo de comparação.
2. **Given** acesso uma URL compartilhada, **When** o catálogo termina de
   carregar, **Then** somente países reconhecidos são restaurados, até o limite
   de três, sem alterar automaticamente minha shortlist persistida.
3. **Given** ISO3 duplicado, malformado ou inexistente na URL, **When** a página
   abre, **Then** o valor é ignorado e uma mensagem não bloqueante explica o
   recorte restaurado.
4. **Given** `navigator.share` indisponível, **When** compartilho, **Then** a
   aplicação oferece cópia para a área de transferência e um fallback manual.
5. **Given** navego com Voltar/Avançar, **When** alterno entre globo, país e
   comparação, **Then** a visualização e o foco correspondem à URL atual.

### US4 — Entender o que comparar e o próximo passo (P2)

**Independent Test:** uma pessoa identifica por texto o evento medido, fonte,
período, unidade, disponibilidade e limite interpretativo de cada destino, e
consegue abrir a página oficial de uma modalidade verificada.

**Acceptance Scenarios:**

1. **Given** um valor estatístico, **When** leio a comparação, **Then** vejo a
   descrição específica da métrica e o aviso de que volume não representa
   chance pessoal de aprovação.
2. **Given** grupos incompatíveis, **When** navego sem cores, **Then** títulos,
   texto e estrutura comunicam a separação sem depender apenas do visual.
3. **Given** uma fonte ou modalidade com URL externa, **When** aciono o link,
   **Then** apenas URL HTTP(S) validada abre em nova aba com proteção apropriada.

## Functional Requirements

- **DS-FR-001:** A shortlist DEVE aceitar de zero a três ISO3 únicos presentes
  no catálogo mundial e preservar a ordem de inclusão.
- **DS-FR-002:** A shortlist DEVE ser local ao navegador, versionada e validada
  na leitura; não DEVE exigir login, cookie, novo endpoint ou sincronização com
  o backend.
- **DS-FR-003:** Falha, indisponibilidade ou corrupção do storage NÃO DEVE
  impedir mapa, busca, lista ou detalhe de funcionar.
- **DS-FR-004:** Adicionar um quarto destino NÃO DEVE remover ou substituir um
  item existente sem ação explícita da pessoa.
- **DS-FR-005:** A comparação DEVE reutilizar os cinco endpoints REST v1 e os
  DTOs gerados do OpenAPI; não será criado endpoint `/compare`.
- **DS-FR-006:** Cada destino DEVE ser consultado com a métrica aplicável ao seu
  dataset, preservando cidadania `BRA`, finalidade `WORK`, ano resolvido e grupo
  de comparação retornado pela API.
- **DS-FR-007:** Valores só PODEM aparecer no mesmo grupo numérico quando
  `metricType`, `unit`, período e `comparisonGroupId` forem iguais e não nulos
  nos campos que definem comparabilidade.
- **DS-FR-008:** Grupos incompatíveis DEVEM permanecer visual e semanticamente
  separados; a interface NÃO DEVE calcular ranking, pontuação, média, soma,
  “melhor destino”, “mais fácil” ou probabilidade pessoal.
- **DS-FR-009:** `value=0` DEVE permanecer zero confirmado; ausência, supressão,
  revisão e erro DEVEM manter estados distintos e nunca virar zero.
- **DS-FR-010:** Loading, erro e retry DEVEM ser independentes por destino; uma
  falha não pode apagar ou substituir os dados dos outros países.
- **DS-FR-011:** A URL compartilhável DEVE conter no máximo três ISO3, em uma
  representação canônica, sem PII, payload estatístico, fonte externa ou dado
  não necessário.
- **DS-FR-012:** Estado vindo da URL DEVE ser validado contra sintaxe e catálogo
  antes de uso e NÃO DEVE sobrescrever a shortlist persistida automaticamente.
- **DS-FR-013:** Alterações de país e modo DEVEM integrar o histórico do
  navegador sem quebrar os parâmetros existentes suportados, incluindo
  `view=list`.
- **DS-FR-014:** Adicionar, remover, atingir o limite, restaurar URL, carregar,
  falhar e compartilhar DEVEM possuir feedback textual acessível.
- **DS-FR-015:** A experiência DEVE funcionar em desktop, mobile, teclado,
  touch, leitor de tela, movimento reduzido e fallback sem WebGL.
- **DS-FR-016:** Links oficiais DEVEM reutilizar a validação de URL existente e
  abrir com `noopener noreferrer`; nenhum texto deve ser tratado como HTML.
- **DS-FR-017:** O produto DEVE identificar comparação compartilhada e shortlist
  privada como estados diferentes para evitar que abrir um link altere
  preferências locais sem consentimento.

## Key Entities

- **Shortlist:** coleção local ordenada e versionada de até três ISO3 únicos.
- **ComparisonSelection:** ISO3 vindos da shortlist ou URL para a sessão atual.
- **DestinationSnapshot:** país, estatística, modalidades e fontes retornadas
  pelo detalhe existente, com estado de consulta independente.
- **ComparisonKey:** tupla de compatibilidade formada por métrica, unidade,
  período e `comparisonGroupId`.
- **ComparisonGroup:** conjunto derivado de snapshots com a mesma chave; não é
  uma nova entidade persistida nem altera o domínio do backend.

## Success Criteria

- **DS-SC-001:** 100% dos fluxos de adicionar, persistir, remover e atingir o
  limite passam em desktop e mobile sem conta ou chamada de escrita ao backend.
- **DS-SC-002:** Testes automatizados provam que snapshots com qualquer dimensão
  de compatibilidade diferente nunca entram no mesmo grupo numérico.
- **DS-SC-003:** URL canônica restaura de um a três países válidos em uma sessão
  limpa e ignora entradas inválidas, duplicadas ou excedentes sem erro fatal.
- **DS-SC-004:** Falha isolada de um destino preserva todos os resultados
  bem-sucedidos e oferece retry somente para a consulta afetada.
- **DS-SC-005:** Em auditoria de conteúdo, nenhum estado usa volume como taxa,
  facilidade, elegibilidade ou recomendação pessoal.
- **DS-SC-006:** Lint, format check, typecheck, testes unitários, E2E integrado
  ao backend real e build passam antes da conclusão da feature.

## Assumptions

- O recorte continua `BRA / WORK` e não solicita dados pessoais.
- O limite de três privilegia legibilidade em telas móveis e custo previsível de
  consultas; sua alteração exige nova avaliação de UX e performance.
- A primeira versão usa `localStorage` com degradação segura e não sincroniza
  entre dispositivos.
- O detalhe atual contém os dados necessários para a primeira comparação.

## Out of Scope

- Login, perfil, sincronização em nuvem, alertas e colaboração multiusuário.
- Score de destino, recomendação automática, ranking global ou aconselhamento
  jurídico/migratório.
- Comparar custo de vida, salário, idioma, clima ou requisitos não presentes em
  fontes oficiais modeladas pelo produto.
- Analytics de terceiros ou envio de eventos antes de decisão específica de
  privacidade e observabilidade.
- Novo endpoint público, alteração de OpenAPI ou persistência de shortlist no
  servidor.
