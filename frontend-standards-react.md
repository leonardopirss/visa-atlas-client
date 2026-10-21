# Frontend Standards — React + TypeScript

> **Versão 1.1 — Outubro de 2026**  
> Guia **genérico e reutilizável** para desenvolvimento frontend com React e TypeScript.  
> **Fonte principal sobre design patterns:** [Aryanne Silva / WoMakersCode — Design Patterns: como eles se aplicam no React](https://dev.to/womakerscode/design-patterns-como-eles-se-aplicam-no-react-1118) (março de 2024).  
> **Fora de escopo:** regras obrigatórias de modularidade, arquitetura de pastas, bibliotecas de UI/estado/estilização específicas, decisões de domínio e convenções exclusivas de um projeto.

## 0. Objetivo e princípios

- Construir interfaces **acessíveis, confiáveis, responsivas, legíveis, testáveis e performáticas**.
- **Composição antes de herança; simplicidade antes de abstração.** Design patterns são ferramentas para problemas recorrentes, não metas de arquitetura.
- Dar prioridade a **comportamentos observáveis por pessoas usuárias**, não a detalhes internos da implementação.
- Usar **React e TypeScript em versões estáveis compatíveis**, com `strict: true`, lockfile e dependências verificadas. Vite pode ser a ferramenta de build quando adequada; não é um requisito universal.
- Escolher ferramentas conforme o contexto: **Vitest ou Jest** e React Testing Library para testes locais; **Playwright é obrigatório para validar fluxos integrados ao backend real**. CSS nativo, CSS Modules, Tailwind, bibliotecas de componentes e gerenciadores de estado são escolhas do projeto.
- Não impor arquitetura Clean/Hexagonal, Atomic Design, Feature-Sliced Design, Redux, React Query, framework SSR nem uma estrutura de diretórios.
- Não confundir **padrão de código** com **padrão visual**: boas escolhas de componentes não substituem acessibilidade, estados de interface e experiência real.

### O que vem do artigo e o que é ampliação deste guia

O artigo da WoMakersCode apresenta três React patterns: **Higher-Order Component**, **Provider** e **Hooks**. Sua premissa central é reutilizar soluções de interface para melhorar flexibilidade e manutenção. As seções sobre composição, componentes compostos, Strategy, Adapter, testes, segurança, performance, acessibilidade e CI/CD são **complementos de engenharia**, fundamentados nas referências oficiais ao final; não são padrões atribuídos ao artigo.

---

## 1. TypeScript e fundamentos de código

### Diretrizes

- Configurar `strict: true`, `noImplicitAny`, `strictNullChecks` e, quando viável, `noUncheckedIndexedAccess` e `exactOptionalPropertyTypes`.
- Tipar props, eventos, retornos e dados externos de maneira explícita quando a inferência não for clara.
- **`unknown` em vez de `any`** na fronteira de confiança; fazer narrowing e validação em runtime antes de usar payloads de APIs.
- Priorizar `type`/`interface`, unions discriminadas e `satisfies` para contratos claros; não usar tipos TypeScript como substitutos de validação de dados recebidos.
- Preferir `const`, dados imutáveis e atualizações de estado sem mutações (`map`, `filter`, spread etc.).
- Nomes descritivos, early returns, funções puras e responsabilidades claras.
- Evitar `as unknown as ...`, `!`, `@ts-ignore`, `eslint-disable` e coerções sem justificativa documentada.
- **Não criar interfaces/abstrações artificiais** apenas para satisfazer SOLID ou um padrão de nomenclatura.
- DRY significa evitar **duplicação de regras/conhecimento**, não extrair qualquer JSX que apareça duas vezes.
- KISS e YAGNI prevalecem quando uma solução direta é mais fácil de ler e evoluir.
- Não instalar bibliotecas para tarefas triviais que APIs nativas ou recursos já instalados atendem com clareza.

### Exemplo de props com estado discriminado

```tsx
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

function UsersSummary({ state }: { state: RequestState<string[]> }) {
  switch (state.status) {
    case 'idle':
      return <p>Start a search</p>;
    case 'loading':
      return <p role="status">Loading users…</p>;
    case 'error':
      return <p role="alert">{state.message}</p>;
    case 'success':
      return <p>{state.data.length} users found</p>;
  }
}
```

A union impede, em tempo de compilação, combinações impossíveis como `status: 'success'` sem `data`. Payloads reais precisam de validação em runtime.

---

## 2. Fundamentos do React

- Componentes e hooks devem ser **puros durante a renderização**; não disparar requisições, alterar o DOM ou escrever no storage dentro do corpo de render.
- **Hooks somente no topo** de componentes React ou de custom hooks: não chamá-los em loops, condições, handlers nem funções JavaScript arbitrárias.
- O React deve invocar componentes por JSX; não chamar `MyComponent()` diretamente.
- **Props e state são snapshots imutáveis**; atualizar state por setters, sem modificar objetos anteriores.
- Manter o state no menor escopo compartilhado possível, elevando-o apenas quando consumidores reais precisarem.
- Preferir **dados derivados** durante render a duplicar a mesma informação em estados diferentes.
- Usar `useEffect` para **sincronizar com sistemas externos** (rede, DOM imperativo, eventos, timers, SDKs); não para derivar valores que podem ser calculados a partir de props ou state.
- Limpar assinaturas, timers e operações assíncronas quando necessário; considerar cancelamento de requisições.
- React `StrictMode` deve estar habilitado em desenvolvimento para detectar efeitos/impurezas; corrigir a causa de comportamentos duplicados, não desativá-lo automaticamente.
- Adicionar `useMemo`, `useCallback` e `memo` **quando houver ganho demonstrado** ou necessidade de estabilizar identidade; não espalhar memoização como ritual. Considerar o uso de React Compiler se o projeto o adotar.
- Usar `key` estável e identificador do item em coleções dinâmicas; evitar índice quando inserção/reordenação puder ocorrer.
- Preferir formulários sem estado excessivo; trabalhar com inputs controlados ou não controlados conforme a interação.

---

## 3. Design patterns: do artigo WoMakersCode

### 3.1 Higher-Order Component (HOC)

**Definição da fonte:** uma função que recebe um componente e retorna outro componente com comportamento adicionado.

**Usar quando:** o mesmo comportamento transversal precisa envolver componentes diferentes e uma composição simples via `children` ou custom hook não atende tão bem — por exemplo, uma camada de apresentação condicional ou uma integração legada.

**Evitar quando:** um componente wrapper ou hook resolve com menos indireção. Não transformar cada componente em uma cadeia de HOCs.

```tsx
import type { ComponentType } from 'react';

function withFeatureGate<P extends object>(
  Component: ComponentType<P>,
  enabled: boolean,
) {
  return function FeatureGatedComponent(props: P) {
    if (!enabled) return null;
    return <Component {...props} />;
  };
}

function PromotionalBanner({ title }: { title: string }) {
  return <aside>{title}</aside>;
}

const GatedBanner = withFeatureGate(PromotionalBanner, true);
// <GatedBanner title="New feature" />
```

> Neste exemplo a flag é definida na criação do HOC. Para flags dinâmicas, ler a configuração da fonte adequada em um componente ou hook e manter a checagem de autorização real no backend. Esconder interface **não protege operações**.

### 3.2 Provider Pattern + Context API

**Definição da fonte:** um Provider disponibiliza informações a componentes descendentes, reduzindo `prop drilling`. O artigo cita temas, autenticação e idioma como exemplos.

**Usar quando:** existe dado compartilhado por componentes distantes, com dono e escopo claros — tema, idioma, preferências locais ou contexto de uma funcionalidade.

**Evitar quando:** props ou composição com `children` são mais diretas. Context não é automaticamente uma solução para cache de API, sincronização de servidor nem estado global de alta frequência.

```tsx
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

type Theme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (value === null) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return value;
}
```

**Cuidados:**

- Prover apenas o escopo necessário e reduzir re-renderizações excessivas ao dividir contextos quando houver evidência.
- Não colocar tokens/segredos sensíveis em Context como se fosse proteção de segurança.
- Não acoplar toda a UI a um único Provider com dezenas de responsabilidades.
- O exemplo é didático: persistência da preferência, sincronização com sistema operacional e classes CSS dependerão do produto.

### 3.3 Hooks Pattern / Custom Hooks

**Definição da fonte:** hooks dão acesso ao state, context e efeitos em componentes funcionais; custom hooks permitem **reaproveitar lógica de comportamento**.

**Usar quando:** comportamentos com state/efeitos/lógica React se repetem, ou a extração torna o componente significativamente mais compreensível.

**Evitar quando:** a lógica é uma função pura comum sem necessidade de hooks; nem toda função utilitária deve começar com `use`.

```tsx
import { useState } from 'react';

export function useDisclosure(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((current) => !current),
  };
}

function HelpPanel() {
  const disclosure = useDisclosure();

  return (
    <section>
      <button type="button" onClick={disclosure.toggle} aria-expanded={disclosure.isOpen}>
        Help
      </button>
      {disclosure.isOpen && <p>How can we help?</p>}
    </section>
  );
}
```

- Nomes começam com `use` quando de fato seguem as regras de hooks.
- Documentar entradas e saídas claramente; retornar APIs pequenas e estáveis.
- Testar comportamento através de um componente consumidor sempre que isso representar melhor o uso real.
- **Custom hooks compartilham lógica, não automaticamente a mesma instância de state**. Para compartilhar state, usar um dono comum, Context ou solução externa apropriada.

---

## 4. Design patterns complementares (não cobertos pelo artigo)

| Pattern / técnica | Aplicar quando | Evitar quando |
|---|---|---|
| **Composition** (`children`, slots via props) | Componentes de interface combinam-se com variações úteis | Abstração torna o JSX indecifrável |
| **Compound Components** | Peças de interface compartilham contexto: Tabs, Accordion, Menu | Um componente com poucas props é mais simples |
| **Strategy** | Renderização/validação/algoritmo varia conforme tipo ou contexto | Um condicional pequeno é mais legível |
| **Adapter** | SDKs, APIs ou formatos de terceiros não correspondem ao formato usado na UI | Apenas renomeia função sem reduzir dependência |
| **Container / Presentational** | Separar carga de dados/efeitos de apresentação melhora reuso ou teste | Criaria componentes pass-through sem benefício |
| **Controlled / Uncontrolled** | Formulários e componentes expõem estado controlado quando exigido pelo uso | Manter duas fontes da verdade sem contrato claro |
| **Render Props** | API existente ou necessidade específica de composição via função | `children`, hooks ou componentes simples atendem |
| **State Machine / Reducer** | Fluxos complexos com transições explícitas, como checkout, wizard, upload | Toggle e estado trivial não exigem máquina |
| **Error Boundary** | Isolar falhas de renderização de partes importantes da árvore | Usar como substituto de tratamento de erro HTTP/evento |

### 4.1 Exemplo — Composition

```tsx
import type { ReactNode } from 'react';

type PanelProps = {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
};

function Panel({ title, actions, children }: PanelProps) {
  return (
    <section aria-label={title}>
      <header>
        <h2>{title}</h2>
        {actions}
      </header>
      <div>{children}</div>
    </section>
  );
}

// <Panel title="Profile" actions={<button>Edit</button>}>
//   <ProfileDetails />
// </Panel>
```

O componente compõe outras peças sem conhecer suas regras de negócio. Prefira **elementos semânticos e `children`** a flags como `isProfile`, `isBilling`, `isAdmin` em uma única implementação genérica.

### 4.2 Exemplo — Strategy de apresentação

```tsx
type Status = 'pending' | 'approved' | 'rejected';

const statusLabels: Record<Status, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

function StatusLabel({ status }: { status: Status }) {
  return <span>{statusLabels[status]}</span>;
}
```

**Importante:** este mapa é a alternativa simples. Só extrair objetos/implementações Strategy quando comportamentos realmente divergirem e a evolução da lógica justificar.

### Regra de adoção

Antes de introduzir um pattern, responder: **qual problema atual resolve, o que simplifica, qual o custo de manutenção e como será testado?** Padrões não devem aumentar o número de componentes, providers, hooks ou arquivos sem ganho verificável.

---

## 5. Componentes e experiência de interface

- Cada componente deve ter uma **responsabilidade de UI identificável**, mas não precisa ser pequeno apenas para satisfazer uma métrica de linhas.
- Preferir interfaces semânticas (`button`, `a`, `label`, `form`, `nav`, `main`, `dialog`) em vez de simular interações com `div` clicáveis.
- Componentes reutilizáveis devem expor contratos previsíveis (props, valores padrão e callbacks) e permitir composição.
- Representar explicitamente estados de **carregamento, vazio, sucesso, erro, sem permissão e offline**, quando relevantes.
- Não usar estado visual que sugira sucesso se a ação ainda não foi confirmada. Se houver UI otimista, definir rollback e mensagem quando falhar.
- Não acoplar textos, estilos e comportamento de modo que toda variação exija reescrever componentes.
- Usar rotas, formulários e links apropriados à navegação; respeitar comportamento nativo de teclado, foco, histórico e abertura de abas.
- Listas exigem identificadores estáveis; overlays, dropdowns e modais exigem gestão de foco e fechamento apropriados.
- Evitar manipulação direta do DOM, exceto integração necessária (ex.: canvas, gráficos, editores, bibliotecas de terceiros).
- Componentes externos devem ser avaliados por acessibilidade, manutenção, peso, licenciamento e qualidade de API antes da adoção.

---

## 6. Estado local, estado remoto e efeitos

- **State local (`useState`)** para estados de interação próximos ao componente.
- **`useReducer`** para transições complexas e relacionadas; preferir reducers puros com ações claras.
- **Context** para dados compartilhados em uma árvore quando props/composição não forem suficientes.
- **Estado remoto** tem problemas próprios: loading, erro, cache, deduplicação, invalidação, paginação e race conditions; avaliar TanStack Query/SWR ou recursos do framework quando necessário, sem torná-los obrigatórios.
- Não duplicar payload remoto em vários states e depois tentar sincronizá-los com `useEffect`.
- Para requisições manuais, verificar `response.ok`, lidar com erros, suportar `AbortSignal` e prevenir atualizações obsoletas.
- Hooks de busca assíncrona precisam de política explícita para request em voo, estado vazio, mudanças rápidas de filtro e resultados fora de ordem.
- **Actions e mutações** precisam comunicar andamento, confirmação e falha; desabilitar duplicação de submit quando isso fizer sentido.
- Persistir apenas preferências e dados adequados à persistência local. `localStorage`, `sessionStorage` e Context não são cofres de segredos.
- Evitar guardar estado puramente derivado: calcular de props/state durante render quando possível.

---

## 7. APIs, contratos e tratamento de erros

- Definir tipos claros para entrada/saída de serviços HTTP e validar em runtime payloads não confiáveis quando sua estrutura importar ao comportamento.
- Manter base URL e políticas de autenticação, timeout, headers e erros coerentes com o projeto; não duplicá-las em cada componente.
- Preferir `fetch` nativo ou cliente já existente. Adotar Axios/SDK quando a funcionalidade justificar.
- Não assumir que `fetch` rejeita Promise para HTTP `4xx/5xx`: checar `response.ok`.
- Sempre que possível, traduzir erros técnicos em **mensagens seguras e acionáveis**; guardar diagnóstico técnico em observabilidade apropriada.
- Tratamento de `401/403` deve refletir autenticação e autorização reais, não mera ocultação de elementos na tela.
- Tipos de API idealmente derivam de contratos compartilhados/gerados (OpenAPI etc.) se houver infraestrutura para isso; evitar contratos divergentes mantidos manualmente.
- Paginação, ordenação e filtros devem refletir query params/URL quando sua persistência/navegação for útil; evitar serializar dados sensíveis na URL.
- Não usar React Error Boundaries para capturar erro de click handler ou Promises de `fetch`: tratar esses erros nos fluxos apropriados.
- Não criar uma abstração HTTP universal com dezenas de opções especulativas.

---

## 8. Acessibilidade (requisito de qualidade)

- Tomar **WCAG 2.2 nível AA** como referência de conformidade quando aplicável ao produto; critérios legais/contratuais podem exigir mais.
- Garantir uso por teclado, ordem lógica do foco, foco visível e ausência de armadilhas de teclado.
- Rótulos perceptíveis para inputs (`label` associado, `aria-label` quando necessário), mensagens de erro vinculadas (`aria-describedby`) e feedback anunciado quando importante (`role="alert"`/live regions com moderação).
- Preferir HTML semântico a ARIA; ARIA complementa a semântica, não substitui controles nativos.
- Imagens informativas precisam de texto alternativo; imagens puramente decorativas têm `alt=""`.
- Contraste, tamanho de alvos, zoom, responsividade e movimento reduzido devem ser considerados no design e na implementação.
- Modais e popovers precisam de foco inicial, retorno de foco e interações acessíveis.
- Verificar leitores de tela e navegação por teclado em fluxos críticos, não apenas passar em um scanner automatizado.
- Usar queries de testes por `role`, nome acessível, `label` e texto real; elas frequentemente revelam problemas reais de acessibilidade.

---

## 9. Estilos, responsividade e design system

- Não obrigar uma biblioteca de estilos. Preferir a opção consistente com o projeto e suas restrições.
- Usar tokens para atributos recorrentes de marca (`colors`, `spacing`, `typography`, `radius`, `shadows`) quando houver necessidade de consistência e escala.
- Layout responsivo baseado em conteúdo e uso, não apenas em três breakpoints arbitrários.
- Priorizar CSS moderno (`grid`, `flexbox`, `clamp`, container queries quando suportadas, media queries) antes de adicionar dependências por conveniência.
- Estados de hover **não podem ser a única forma** de descobrir ou operar controles; considerar toque e teclado.
- Preferir animações intencionais e leves; respeitar `prefers-reduced-motion`.
- Cuidado com contraste, fontes de terceiros, CLS causado por mídia sem dimensões e tamanhos fixos que quebram em zoom.
- Bibliotecas visuais/animação/3D precisam ser justificadas por valor à experiência, orçamento de performance e acessibilidade; fornecer fallback.
- Nomes de classes, estratégias de escopo CSS e convenções de tokens devem ser consistentes; não misturar três soluções de styling sem motivo.

---

## 10. Performance e Core Web Vitals

- Estabelecer **budgets específicos ao produto**, com métricas reais: **LCP**, **INP** e **CLS**, além de tempos de API e tamanho de bundles.
- Medir antes de otimizar; usar Lighthouse, Web Vitals, DevTools e dados de usuários reais quando disponíveis.
- Dividir código por rotas/funcionalidades quando reduzir custo de carregamento; lazy loading não deve gerar cascatas excessivas de requests.
- Carregar imagens nas dimensões corretas, com formatos adequados, `srcset`/`sizes`, placeholders e lazy loading conforme prioridade; não aplicar lazy loading à imagem crítica de LCP.
- Reduzir JavaScript desnecessário, dependências pesadas e renderizações de grandes coleções; virtualizar quando a dimensão real justificar.
- Evitar cálculos caros durante render; usar técnicas de memoização ou pré-processamento somente após identificar gargalo.
- Efeitos precisam de cleanup e dependências corretas; timers/event listeners deixados ativos geram bugs e consumo desnecessário.
- Definir cache e políticas de invalidação conforme a natureza do dado; não confundir dados remotos com state visual.
- Se houver SSR/streaming, avaliar hydration mismatch, tratamento de dados no servidor e trade-offs antes de aplicar padrões só de SPA.

---

## 11. Segurança e privacidade no frontend

- Frontend **não é uma fronteira de segurança**: backend valida permissões, escopos, propriedade de recursos e integridade de dados.
- Nunca colocar segredos, credenciais privadas, chaves de API confidenciais ou tokens administrativos em bundles, variáveis de build públicas ou repositório. Variáveis `VITE_*` expostas no cliente **não são secretas**.
- Evitar `dangerouslySetInnerHTML` e inserção direta de `innerHTML` com conteúdo não confiável; quando HTML for necessário, aplicar sanitização apropriada e política de origem.
- CSP no servidor/hosting é defesa em profundidade contra XSS; não substitui escape, sanitização nem tratamento seguro de URLs.
- Validar protocolos e destinos de links externos; considerar `rel="noopener noreferrer"` ao abrir contextos externos quando necessário.
- Autenticação baseada em cookie deve observar `HttpOnly`, `Secure`, `SameSite` e proteção CSRF adequada ao fluxo. Persistência de tokens no navegador deve ser decidida com base no modelo de ameaças, não por conveniência.
- Não guardar dados pessoais ou sensíveis em analytics, logs do browser, query strings ou armazenamento local sem justificativa e controles adequados.
- Não expor stack traces internas ou payloads confidenciais em feedback ao usuário.
- Auditar dependências e evitar bibliotecas descontinuadas; controlar scripts, fontes e widgets de terceiros.
- Validar upload de arquivos também no backend: a extensão/MIME verificados no browser são somente UX.

---

## 12. Estratégia de testes

### 12.1 Camadas e ferramentas de referência

| Camada | O que validar | Ferramentas possíveis |
|---|---|---|
| **Unitário** | Funções puras, reducers, formatação, validações e Strategy | Vitest ou Jest |
| **Componente** | Render, props, interações, acessibilidade básica, loading/erro | React Testing Library + `user-event` |
| **Integração de UI** | Componente + hook + provider + comunicação HTTP simulada | React Testing Library + MSW ou ferramenta equivalente |
| **E2E** | Jornadas críticas no navegador, rotas, formulários, autenticação e integração real com a API | **Playwright obrigatório quando o frontend estiver integrado ao backend** |
| **Acessibilidade** | Roles, labels, foco, teclado, contrastes e revisão manual | Testing Library, axe, DevTools e leitores de tela |
| **Visual** | Regressões intencionais de layout e responsividade | Screenshots Playwright ou ferramenta visual apropriada |
| **Performance** | Bundle, LCP/INP/CLS, loading e regressões relevantes | Lighthouse, Web Vitals e observabilidade |

### 12.2 Regras para testes confiáveis

1. **Testar o que o usuário vê e faz**. Preferir `getByRole`, `getByLabelText`, `getByText`; `data-testid` apenas quando não houver seletor semântico confiável.
2. Testes descrevem comportamento: `showsErrorWhenRequestFails`, `submitsFormWhenFieldsAreValid`.
3. Cobrir happy path, falhas, estados vazios, loading, validação, navegação por teclado e permissões relevantes.
4. Evitar testar estados privados, chamadas internas de hooks, estrutura de implementação ou número de renders como assertiva principal.
5. Simular **fronteiras externas** (rede, relógio, integrações de terceiros); preferir MSW para HTTP a mockar implementações internas de hooks/API quando o objetivo é testar comportamento completo.
6. Testes independentes: reset de mocks, handlers, storage e dados; evitar dependência de ordem e sleeps fixos.
7. Preferir `userEvent` à manipulação direta de estados. Usar `findBy...`/`waitFor` para mudanças assíncronas; não aguardar tempo arbitrário.
8. Testes E2E com isolamento de sessão, seletores resilientes (`getByRole`, `getByLabel`) e navegação de usuário; evitar classes CSS frágeis.
9. Não fazer mocks de tudo. Um teste que apenas confirma que o mock foi chamado pode não validar o comportamento real.
10. **Coverage** serve como sinal de risco. Priorizar alterações críticas e cenários importantes; mutation testing (StrykerJS ou equivalente) pode complementar onde justificar.
11. Não publicar `.only`, `.skip` ou screenshots desatualizados para “fazer CI passar”; exceções precisam de justificativa e prazo.
12. Rodar revisão manual de teclado e leitor de tela nos fluxos críticos; scanners de acessibilidade não cobrem tudo.

### 12.3 Exemplo — teste comportamental de componente

```tsx
// help-panel.spec.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { HelpPanel } from './help-panel';

describe('HelpPanel', () => {
  it('revealsHelpContentWhenClicked', async () => {
    const user = userEvent.setup();
    render(<HelpPanel />);

    const button = screen.getByRole('button', { name: 'Help' });
    expect(button.getAttribute('aria-expanded')).toBe('false');

    await user.click(button);

    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('How can we help?')).toBeTruthy();
  });
});
```

> Para usar este exemplo, exportar `HelpPanel` de seu arquivo e configurar o ambiente DOM do runner (`jsdom` ou equivalente). Com `@testing-library/jest-dom` instalado, prefira matchers expressivos como `toBeInTheDocument`.

### 12.4 Exemplo — E2E de navegação (base)

```ts
import { test, expect } from '@playwright/test';

test('navigatesToHelpPage', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Help' }).click();

  await expect(page.getByRole('heading', { name: 'Help' })).toBeVisible();
});
```

> Exemplo pressupõe que `baseURL` e as rotas tenham sido configurados. Um teste E2E real deve ter ambiente e dados determinísticos; não depender de sites terceiros instáveis.

### 12.5 Playwright obrigatório após integração com backend

**Regra obrigatória para agentes de IA e desenvolvedores:** sempre que uma funcionalidade frontend estiver conectada a endpoints de um backend executável, **executar testes E2E com Playwright antes de considerar a funcionalidade concluída**. Não basta verificar build, testes unitários ou uma interface que funciona com respostas simuladas.

- **Ambiente real de integração:** subir ou acessar um ambiente controlado com frontend e backend funcionando, API configurada e banco/dados de teste preparados quando necessário. **Nunca usar produção** como ambiente padrão para E2E.
- **Requests reais:** exercitar as chamadas HTTP de fato realizadas pelo browser contra o backend de teste. **Não substituir por `page.route()`, MSW, fixtures ou mocks** as rotas que fazem parte do fluxo de integração sob validação. Mocks continuam adequados para testes unitários/de componente e para terceiros fora do escopo.
- **Cenários mínimos relevantes:** validar o caminho de sucesso, dados exibidos, criação/edição quando aplicável, navegação, validação de formulários e comportamento diante de respostas de erro. Incluir autenticação/autorização, estado vazio, loading e falha de rede quando relevantes ao fluxo; cenários de falha podem ser reproduzidos com dados/controladores de teste sem alterar a API principal.
- **Asserções observáveis:** verificar o resultado na interface e, quando necessário, a resposta HTTP ou o efeito persistido; não considerar apenas que a requisição foi disparada ou retornou `200`.
- **Estabilidade:** usar dados previsíveis e isolados, reset/cleanup, usuários de teste, `getByRole`/`getByLabel`, `expect` com auto-wait e nada de `waitForTimeout` arbitrário.
- **Execução e evidências:** rodar `npx playwright test` (ou o script equivalente do repositório) após integrar e após alterações que afetem o contrato ou o fluxo. Registrar testes executados, resultados e falhas; anexar trace/screenshot em falhas quando configurados.
- **Critério de conclusão:** se Playwright falhar, corrigir e executar novamente. Se backend/ambiente não estiver disponível, **não declarar a integração validada**: reportar o bloqueio e o que falta testar, sem fingir sucesso.
- **Antes da integração:** protótipos com dados simulados podem ser testados em isolamento; esta exigência de E2E real começa **quando a conexão com o backend estiver implementada e testável**.


---

## 13. Observabilidade e experiência de falha

- Monitorar erros inesperados do cliente, falhas de navegação e indicadores de performance **sem coletar dados pessoais desnecessários**.
- Correlacionar requests com identificadores seguros quando a API fornecer `traceId`/`correlationId`.
- Evitar `console.log` de payloads sensíveis em produção; erros enviados a plataformas de monitoramento precisam ser sanitizados.
- Capturar estados de erro recuperáveis na interface, com possibilidade de tentar novamente quando apropriado.
- Erro de renderização em uma seção não deveria inutilizar toda a aplicação quando isolamento com Error Boundary for justificável.
- Métricas devem direcionar melhorias reais, não transformar cada interação da UI em evento analítico.

---

## 14. Qualidade e CI/CD

### Pipeline recomendado

```text
checkout + install com lockfile
  → lint + format check
  → TypeScript typecheck
  → testes unitários e de componentes
  → testes de integração
  → build de produção
  → auditoria de dependências e bundle analysis
  → **Playwright E2E obrigatório contra backend de teste nos fluxos integrados**
  → checks de acessibilidade/performance quando aplicáveis
  → publicação com validação de ambiente
```

### Scripts ilustrativos (`package.json`)

```json
{
  "scripts": {
    "dev": "vite",
    "lint": "eslint .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "build": "tsc --noEmit && vite build"
  }
}
```

> Scripts de referência apenas para **React + TypeScript + Vite + Vitest + Playwright**. Adaptar ao ambiente existente. Projetos com vários `tsconfig` podem precisar de `tsc -b`; a configuração de cobertura exige pacote de provider compatível.

### Critérios para pull request

- Código formatado e tipado; lint, typecheck, testes e build aprovados.
- Mudança de comportamento acompanhada por teste(s) proporcionais ao risco.
- Loading, vazio, erro, foco e teclado contemplados onde a interação exigir.
- Dependências novas justificadas por benefício técnico ou experiência do usuário.
- Componentes e hooks reutilizáveis não introduzem abstrações especulativas.
- Nenhuma mudança arbitrária na identidade visual ou UX quando não solicitada.
- API e tratamento de erro compatíveis com contratos reais; não há credenciais em código cliente.
- Se houver integração frontend/backend, testes Playwright executados contra a API real de teste, com resultados documentados.
- Alterações em layout responsivo e componentes interativos verificadas nos tamanhos relevantes.
- Cuidado com bundle, assets grandes, terceiros e performance.

---

## 15. Convenções de nomenclatura

| Elemento | Convenção sugerida |
|---|---|
| Componentes, tipos, interfaces | `PascalCase` |
| Hooks | `useSomething` |
| Funções, variáveis, props, JSON | `camelCase` |
| Constantes de configuração | `UPPER_SNAKE_CASE` quando fizer sentido |
| Arquivos | `kebab-case.ts(x)` **ou** convenção já adotada pelo repositório |
| Testes | `*.spec.ts(x)` / `*.test.ts(x)`; E2E conforme runner |
| CSS/tokens | Convenção coesa escolhida no projeto |
| Commits | Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:` etc.) |

Evitar renomeações de massa sem relação com a tarefa e não misturar convenções dentro de um mesmo repositório.

---

## 16. Checklist para agentes de IA e revisão de código

### Implementação

- [ ] A solução atende ao pedido, sem inventar arquitetura, páginas ou requisitos?
- [ ] Composição simples foi considerada antes de HOC, Context global ou pattern avançado?
- [ ] Hooks cumprem as Rules of Hooks e a renderização continua pura?
- [ ] O state está no escopo apropriado e não duplica valores derivados?
- [ ] Existem estados coerentes de loading, vazio, erro e confirmação?
- [ ] Contratos TypeScript são seguros; dados externos não foram tratados como tipos garantidos?
- [ ] O código é compreensível sem abstrações ou dependências desnecessárias?

### Testes e confiabilidade

- [ ] Regras e comportamentos modificados têm testes relevantes?
- [ ] Testes usam seletores semânticos e simulam ações reais?
- [ ] Fronteiras externas foram isoladas sem esconder problemas de integração?
- [ ] Se o frontend estiver integrado ao backend, os fluxos afetados foram **executados e aprovados no Playwright contra a API real de teste, sem mocks dessas rotas**?
- [ ] Não há timeouts arbitrários, testes pulados ou dependências da ordem da suíte?

### UX, segurança e performance

- [ ] Navegação e formulários funcionam com teclado e foco visível?
- [ ] Há rótulos, mensagens de erro e semântica HTML adequada?
- [ ] UI é responsiva, com imagens e animações adequadas ao dispositivo?
- [ ] Credenciais não estão presentes no bundle e permissões reais dependem do backend?
- [ ] Não existe HTML não confiável sendo inserido sem proteção?
- [ ] Mudanças de bundle e performance são proporcionais ao benefício?
- [ ] Lint, typecheck, testes e build passaram?

### Guardrails para execução automatizada

1. Ler convenções e componentes existentes **antes** de criar novos.
2. Reutilizar componentes e bibliotecas aprovadas no repositório.
3. Não adicionar dependências, gerenciamento global de estado ou providers sem necessidade explícita ou benefício justificado.
4. Não mudar infraestrutura, rotas públicas ou contratos de API fora do escopo da tarefa.
5. Não remover validações, acessibilidade, segurança ou testes para corrigir build.
6. Não declarar integrações, pagamentos, envios, deploys ou chamadas reais como concluídos quando apenas simulados.
7. Implementar testes proporcionais à mudança, executar verificações disponíveis e reportar limitações com clareza.
8. **Integração frontend/backend pronta = Playwright obrigatório:** executar os fluxos E2E usando o backend de teste real, corrigir falhas e só então declarar a funcionalidade validada. Se não houver ambiente disponível, sinalizar explicitamente o bloqueio.

---

## Fontes

### Fonte principal fornecida

- [WoMakersCode — Design Patterns: como eles se aplicam no React](https://dev.to/womakerscode/design-patterns-como-eles-se-aplicam-no-react-1118) — base conceitual para **HOC, Provider e Hooks patterns**.

### Referências complementares (expansão de engenharia)

- [React — Rules of React](https://react.dev/reference/rules) — pureza e regras de componentes/hooks.
- [React — Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks).
- [React — StrictMode](https://react.dev/reference/react/StrictMode).
- [React — You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect).
- [React — Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context).
- [React Testing Library — Introduction](https://testing-library.com/docs/react-testing-library/intro/).
- [Vitest — Coverage](https://vitest.dev/guide/coverage.html).
- [Playwright — Best Practices](https://playwright.dev/docs/best-practices).
- [W3C — WCAG 2.2](https://www.w3.org/TR/WCAG22/).
- [MDN — XSS](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS).
- [MDN — Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/CSP).

**Nota de manutenção:** padrões e ferramentas evoluem. Confirmar compatibilidade de versões e bibliotecas antes de aplicar exemplos. Este documento é uma referência de engenharia — **não é uma prescrição de arquitetura ou um template de projeto**.
