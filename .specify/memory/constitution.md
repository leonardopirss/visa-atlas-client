# Constituição do Visa Atlas

**Versão:** 1.0.0 · **Ratificada (proposta):** 2026-10-19 · **Última alteração:** 2026-10-19

## Princípios fundamentais

### I. Confiabilidade estatística inegociável
- Cada valor publicado DEVE conter tipo de métrica, unidade, período, cidadania, finalidade, destino, fonte primária, release e situação de disponibilidade.
- O sistema NÃO DEVE confundir `FIRST_RESIDENCE_PERMITS_GRANTED`, `WORK_VISAS_ISSUED`, `APPLICATIONS_RECEIVED`, `APPLICATIONS_REFUSED`, `DECISIONS_GRANTED` ou `VALID_PERMIT_HOLDERS`.
- `value=0` é um zero confirmado pela fonte; ausente, suprimido ou não importado é `value=null` com `dataStatus` explicativo.
- NÃO produzir taxa de aprovação sem numerador, denominador e universo comparáveis. Volume de concessões NÃO significa chance pessoal de aprovação.
- A fonte original e a classificação original devem ser auditáveis. Sem números ilustrativos na build de produção.

### II. Contratos antes de paralelismo
- `specs/001-shared-api-contract/contracts/openapi.yaml` governa as integrações. Alterações exigem atualização do contrato, dos testes e consenso entre responsáveis.
- Frontend acessa somente DTOs/OpenAPI, NUNCA tipos do Prisma. Dados geográficos são identificados por ISO 3166-1 alpha-3.
- Cinco endpoints REST v1; não adicionar outros sem necessidade demonstrada e revisão do contrato.

### III. Modularidade e responsabilidades claras
- React/MapLibre renderizam experiência, não calculam agregações ou consultam fontes governamentais diretamente.
- NestJS agrega, valida e versiona dados; `Countries`, `Statistics`, `VisaPrograms`, `Sources`, `Ingestion` isolam regras do domínio.
- Monólito modular até que evidência demonstre necessidade de serviços separados.

### IV. Segurança, licenciamento e privacidade
- Sem dados sensíveis, autenticação ou solicitação de visto no MVP.
- Validar todas as entradas; normalizar URLs; proteger jobs de ingestão; segredos somente no servidor.
- Verificar licenças de mapas, fronteiras, tiles e fontes; exibir atribuições. Não copiar ativos proprietários da Apple.
- Limites e timeouts para integrações externas, logs estruturados sem conteúdo pessoal, proteção contra dependências maliciosas.

### V. Testes antes de aceitar entrega
- Feature somente concluída após testes de contratos, unitários e integração. Experiência crítica de seleção do mapa deve possuir E2E.
- Testar seleção de país multipolígono, retorno ao globo, ausência de dados, falhas, redução de movimento, ambiente sem WebGL.
- Ingestão deve possuir testes de idempotência, rejeição de incompatíveis e promoção atômica de releases.
- Pipeline deve validar lint, tipos, testes e build, sem desabilitar verificações para passar.

### VI. Experiência cartográfica acessível
- Globo MapLibre com países selecionados verde `#30D883` e todos os demais cinza; oceanos neutros. Navegação teclado, busca e fallback sem WebGL equivalentes.
- Nunca esconder aviso de fonte/dado ausente. Erro de rede não pode mostrar conteúdo de outro país como se fosse atual.
- Mobile e desktop utilizam o mesmo comportamento de seleção; respeitar `prefers-reduced-motion`.

### VII. Escopo mínimo e observabilidade
- Recorte BRA/WORK e dados oficiais comparáveis são P1. Comparação multinacional avançada, login, IA para elegibilidade e alertas são futuras features.
- Promover apenas dados validados; execução de ingestão rastreável; manter último snapshot válido quando atualização falhar.
- Evitar abstrações e infraestrutura não exigidas pela primeira entrega.

## Governança

- Todo `spec.md`, `plan.md` e `tasks.md` DEVE demonstrar conformidade com I–VII.
- Planos registram dúvidas e decisões técnicas, com riscos e alternativas quando relevante.
- Mudanças no contrato público, na interpretação de métrica ou nos princípios exigem revisão conjunta de FE e BE.
- Os artefatos são propostas a validar. Uma decisão divergente deve ficar registrada no histórico do projeto; não alterar silenciosamente métricas e contratos.
