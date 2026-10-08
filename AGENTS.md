<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:copa-kartista-contexto -->
# Copa Kartista do Vale — contexto do projeto

## Ambiente

- **Next.js 15.5.22** (Webpack, não Turbopack) · TypeScript · **Tailwind v3.4.19** · Supabase · Vercel
- macOS (Apple Silicon). Pasta: `~/campeonato-kart`
- **Site publicado:** https://copa-kartista-do-vale.vercel.app
- **Supabase:** https://supabase.com/dashboard/project/xqtvyisepknmxyskuatw
- **GitHub:** rcampos1980/Copa-Kartista-do-Vale · branch `main` · etiqueta `v1.0-estavel`
- **Admin:** rcampos7@me.com · Campeonato 2026 id `f8cc2447-dc16-4f3d-9498-5acf1902374b`
- **Dependências:** `@supabase/ssr` 0.12.4, `@supabase/supabase-js` 2.111.0, `lucide-react` 1.28.0, React 18.3
- **ESLint não está instalado** (o build avisa, não impede)

### Variáveis de ambiente

Em `.env.local` e na Vercel (Settings → Environments → Production e Preview):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL=https://copa-kartista-do-vale.vercel.app
```

### E-mail

SMTP do **Brevo** configurado em Supabase → Authentication → Emails → SMTP Settings (`smtp-relay.brevo.com`, porta 587). O **rastreamento de cliques do Brevo precisa ficar desligado** — ele reescreve os links e destrói os tokens do Supabase.

O acesso usa **código numérico**, não link, porque o Safe Links do Outlook consome links de uso único. O modelo de e-mail "Reset Password" no Supabase usa `{{ .Token }}`. O código pode ter 6 ou 8 dígitos conforme a configuração *Email OTP Length*; a tela aceita qualquer tamanho a partir de 6.

---

## Preferências de trabalho — LEIA ANTES DE ESCREVER CÓDIGO

Estas regras nasceram de erros reais que quebraram o site nesta sessão.

1. **Nunca sobrescrever arquivo sem ter visto o conteúdo atual.** Reescrever `globals.css` e `tailwind.config.ts` no escuro derrubou o Tailwind inteiro e custou várias rodadas. Peça o arquivo antes.
2. **Nunca escrever tag JSX sozinha numa linha.** Linhas contendo só `<a` desaparecem no caminho entre a resposta e o terminal — aconteceu quatro vezes. Escreva sempre `<a href={...}` com pelo menos um atributo na mesma linha.
3. **Usar `FIM` como terminador de heredoc**, não `EOF`. Quando dois blocos são colados juntos sem quebra de linha, o `EOF` gruda no comando seguinte e o arquivo sai corrompido.
4. **Arquivos completos e consolidados**, nunca fragmentos ou diffs.
5. **Rotular cada bloco como `bash` (terminal do Mac) ou `SQL` (SQL Editor do Supabase).** O usuário já colou SQL no terminal várias vezes.
6. **Um bloco por vez**, com um `grep` de verificação logo depois. Se não retornar o esperado, o arquivo não gravou.
7. **Passo a passo numerado.**
8. **Parar o `npm run dev` com Ctrl+C antes de rodar `npm run build`**, e `rm -rf .next` ao alternar entre os dois. Os dois brigam pelo cache e geram erros do tipo `__webpack_modules__ is not a function` e `Cannot find module './vendor-chunks/...'`.
9. **Ao depurar, pedir a saída real do terminal.** Não chutar.
10. Substituições com Python devem sempre **imprimir o que falhou**, e o usuário precisa conferir antes de seguir.

---

## Regras de negócio

- **Lastro:** peso-alvo 90 kg. `lastro = least(floor((alvo − peso) / 5) × 5, 20)`, nunca negativo. **Teto de 20 kg por piloto** — é o limite físico, então quem pesa menos de 70 kg não passa disso. Peso é por temporada. O teto vive em três lugares: `calcular_lastro_etapa`, `vw_lastro` e `ajustar_lastro_piloto` no banco, mais a constante `LASTRO_MAXIMO` em `src/lib/format.ts`.
- **Etapa agendada:** lastro calculado ao vivo pelos pesos atuais.
- **Etapa realizada:** lastro **congelado** em `etapa_pilotos.lastro_congelado`. Mudar peso não altera corrida passada.
- **Pontuação atual (2026):** 1º=40, 2º=35, 3º=30, 4º=25, 5º=22, 6º=20, 7º=18, 8º=16, 9º=14, 10º=12, 11º=10, 12º=9, 13º=8, 14º=7, 15º=6, 16º=5, 17º=4, 18º=3, 19º=2, 20º=1, 21º–30º=0. Bônus de volta rápida = 2.
- **Convidado** não pontua na classificação, entra no lastro e pode marcar volta rápida.
- **Volta rápida é exclusiva** e obrigatória ao lançar resultado.
- **Associação por etapa** (`etapa_pilotos`) define quem corre. Lançar resultado exige pilotos associados e data já chegada.
- **Ordem alfabética** em todas as listas de pilotos, exceto resultado de corrida (por posição).
- **Lançar resultado e mudar status são ações separadas.**
- **Pontuação zera por temporada** — cada ano é um campeonato próprio.
- **Só e-mails cadastrados no piloto podem criar conta.** Um gatilho no banco recusa o resto.
- Sempre confirmar antes de gravar (padrão implementado no lançamento de resultado e no recálculo de lastro).

---

## Banco de dados

### Tabelas

| Tabela | Observações |
|---|---|
| `campeonatos` | ano, nome, peso_alvo, bonus_melhor_volta, **regulamento** (text), **visivel** (bool) |
| `pilotos` | nome, foto_url, idade, numero_kart, categoria, cidade, telefone, estilo_pilotagem, caracteristicas, ativo, **email** (único por `lower(email)`), **is_admin** |
| `participacoes` | piloto × campeonato, tipo (fixo/convidado), peso |
| `etapas` | campeonato_id, nome, pista, data, **horario** (time), status, observacoes, **link_mapa** (text, link do Google Maps) |
| `etapa_pilotos` | etapa × piloto (único), **lastro_congelado** (int), **lastro_ajustado_em** |
| `regras_pontuacao` | campeonato_id, posicao, pontos |
| `resultados` | etapa × piloto, posicao_chegada, pontos, is_convidado, peso_convidado, melhor_volta_flag |
| `midia_etapa` | etapa_id, tipo (foto/video), url, titulo, ordem |
| `usuarios` | id, **email (NOT NULL)**, role (enum `user_role`: piloto/admin), piloto_id, created_at |
| `visitas` | caminho, sessao, referencia, dispositivo, criado_em |
| `historico_peso` | — |

### Views

- `vw_classificacao` — pontos ao vivo via `regras_pontuacao` + bônus
- `vw_resultados_publico` — id, etapa_id, piloto_id, piloto_nome, piloto_numero, posicao_chegada, is_convidado, melhor_volta_flag, pontos
- `vw_pilotos_publico` — id, nome, foto_url, numero_kart, categoria, estilo_pilotagem, caracteristicas, ativo. **Sem telefone, e-mail, created_at, idade e cidade** (idade e cidade saíram por proteção de dados; continuam no cadastro do admin, que lê direto de `pilotos`). Mudar colunas exige `drop view` + `create view` + **`grant select to anon, authenticated`** — o grant se perde no drop e sem ele o site inteiro para de ler.
- `vw_lastro`

### Funções

- `calcular_lastro_etapa(uuid)` — cálculo cru pelos pesos atuais. Une três fontes: quem tem resultado, quem está associado, e os fixos ativos.
- `relatorio_lastro_etapa(uuid)` — usa `coalesce(lastro_congelado, calculado)` e devolve a coluna `congelado`
- `congelar_lastro_etapa(uuid)` — grava o congelado (exige `is_admin()`)
- `ajustar_lastro_piloto(uuid, uuid, int)` — ajuste manual (exige `is_admin()`)
- `email_autorizado(text)` — usada pelo cadastro
- `ao_criar_usuario()` — gatilho em `auth.users`, recusa e-mail não cadastrado em piloto e cria a linha em `usuarios`
- `limpar_visitas_antigas()` — apaga visitas com mais de 180 dias
- `is_admin()`

### Buckets

`fotos-etapas` (público) e `fotos-pilotos` (público).

### Atenção com RLS

- `pilotos` tem RLS restrita a admin. Leituras públicas usam `vw_pilotos_publico`.
- O SQL Editor roda como `postgres`, sem sessão — funções que checam `is_admin()` falham ali. Para carga inicial, rode a lógica direto em vez de chamar a função.
- Mudar colunas de view exige `drop view` + `create view` (o `create or replace` dá erro 42P16).

---

## Estrutura do site

### Público

| Rota | Conteúdo |
|---|---|
| `/` | Seletor de temporada, cartão da próxima etapa (contagem fixa, textura ao fundo, botão “Como chegar”), três indicadores, pódio com foto em degrau, última corrida horizontal com miniatura, próximas etapas, atalhos para regulamento e estatísticas |
| `/classificacao` | Pódio ouro/prata/bronze + tabela · **botão de compartilhar no WhatsApp** |
| `/pilotos` | Grade compacta (auto-fill 240px). Só foto, nome e selo fixo/convidado — sem cidade, idade ou número do kart |
| `/pilotos/[id]` | 8 indicadores, **gráfico de posição por etapa**, **comparador entre pilotos** com confronto direto, histórico |
| `/etapas` | Lista compacta, próxima etapa destacada em vermelho |
| `/etapas/[id]` | Pódio da corrida, 4 números com maior subida/queda vs etapa anterior, resultado, vídeos, galeria em tela cheia, painel de lastro |
| `/regulamento` | Texto da temporada selecionada (menu "Regras") |
| `/estatisticas` | Abas **Geral · Desempenho · Ranking**. Geral: 4 destaques, 3 números com barra e avatares, tabela com “Ver todos”. Desempenho: aproveitamento = pontos ÷ máximo possível nas etapas que o piloto correu (1º lugar + bônus de volta rápida, lidos do banco), ordenado por ele. Ranking: tabela completa. Botões de compartilhar e salvar em PDF |
| `/login`, `/definir-senha` | Acesso por código numérico |

### Administração (`/admin`)

Abas: **Pilotos · Etapas · Pontuação · Temporadas · Visitas · Manual**

- **Pilotos** — lista primeiro, busca, contadores, botão "Novo piloto", e-mail de login, marcador de administrador, avião de papel para reenviar acesso
- **Etapas** — mesmo padrão, botão "Nova etapa", campo de horário; cada linha tem Editar · Pilotos · Resultado · Mídia
- **Temporadas** — criar temporada em branco, escrever regulamento, olho para ocultar dos pilotos
- **Visitas** — acessos hoje/7/30 dias, visitantes únicos, gráfico por dia, páginas mais vistas, celular vs computador
- **Manual** — passo a passo com linha do tempo da corrida e seções recolhíveis agrupadas por frequência

Todas as telas do admin trazem a **barra âmbar "Operando na temporada X"** com botões para trocar.

### Arquivos de apoio

- `src/lib/campeonato.ts` — `getCampeonatoAdmin()`, resolve a temporada pelo cookie e inclui as ocultas
- `src/lib/temporada.ts` — `getTemporadas()` (só visíveis), `getTemporadasTodas()`, `getAnoSelecionado()`, `getRegulamento()`
- `src/lib/supabase/admin.ts` — cliente com a chave de serviço, só servidor
- `src/components/Rastreador.tsx` — registra visita, ignora `/admin`
- `src/app/error.tsx` (tela de erro, distingue falha de banco) e `loading.tsx`. **`not-found.tsx` e `global-error.tsx` não existem mais** — constavam do histórico antigo mas sumiram do código.
- `src/app/api/manter-ativo/route.ts` + `vercel.json` — ping diário às 9h que impede o Supabase de pausar o projeto. Também serve de diagnóstico: devolve `{ok:true, campeonatos:N}` ou 503.
- `src/lib/format.ts` — além de `formatarData` e `pluralizar`, concentra o fuso: `hojeEmSaoPaulo()`, `diaEmSaoPaulo()`, `diasEntre()` e `LASTRO_MAXIMO`.
- `src/app/manifest.ts` + `public/icone-192.png` + `public/icone-512.png` + `src/app/icon.png` + `src/app/apple-icon.png` — aplicativo instalável
- `src/app/opengraph-image.tsx` e `src/app/etapas/[id]/opengraph-image.tsx` — cartões de compartilhamento
- `scripts/backup.mjs` — `node scripts/backup.mjs` salva todas as tabelas em `backups/`
- `scripts/limpar-fotos.mjs` — acha fotos órfãs no armazenamento; `--apagar` remove

---

## Feito nas sessões anteriores

Correção do ano fixo na administração · backup · auditoria de segurança (telefone e e-mail não vazam) · desempenho (removido `force-dynamic` do layout, `loading.tsx`, `optimizePackageImports`) · temporadas com regulamento e visibilidade · lastro congelado com ajuste manual e recálculo · manual do admin · painel de visitas · compressão de foto no navegador · galeria em tela cheia · aplicativo instalável · perfil do piloto com gráfico e comparador · horário da etapa · compartilhar a classificação.

**Removidos por decisão do usuário:** modo pista e bolão de palpites. As tabelas `palpites` e a view `vw_palpites_publico` podem ainda existir no banco sem uso.

---

## Feito na sessão de outubro/2026

- **Home redesenhada** — cartão da próxima etapa compacto com contagem de tamanho fixo e textura ao fundo (foto da pista quando existe, bandeira quadriculada quando não), pódio em degrau com selo de medalha, última corrida horizontal com miniatura e três dados, lista de próximas etapas, atalhos para regulamento e estatísticas.
- **Barra inferior com 4 abas + “Mais”** — antes eram 6 ou 7 com rolagem lateral. “Regras” virou “Regulamento”.
- **Link do mapa na etapa** — coluna `link_mapa` em `etapas`, campo no admin, botão “Como chegar” na home e na página da etapa.
- **Estatísticas com abas** e a métrica de aproveitamento com teto real (ver tabela de rotas).
- **Capa da etapa sem migração** — a foto mais recente da mesma pista, tirada de `midia_etapa`.
- **Fuso de São Paulo** — a Vercel roda em UTC, e das 21h à meia-noite o servidor já tinha virado o dia. Afetava a contagem regressiva, a próxima etapa destacada, a liberação para lançar resultado e o painel de visitas. Resolvido no código, não via variável `TZ`.
- **Teto de 20 kg no lastro**, no banco e no site.
- **Privacidade** — idade, cidade e número do kart fora das telas e da view pública.
- **Anti-pausa do Supabase** — ping diário (ver arquivos de apoio).
- **Erro de banco deixou de ser silencioso** — `resolverCampeonato` levanta o erro em vez de devolver nulo, e existe `error.tsx`.

**Revertido:** uma varredura de acessibilidade (piso de contraste, piso de fonte, tokens `accent-claro`/`info`/`sucesso`, componente `CabecalhoTela`, seletor de temporada em todas as telas) foi aplicada e desfeita a pedido do usuário. O estado dela está em `backups/antes-reverter/`, caso um dia valha retomar. Os achados continuam válidos: `text-white/40` dá 3,8:1 sobre o fundo escuro e reprova na WCAG AA, e há rótulos de 9–10 px.

---

## Pendências

1. **Confirmação ao salvar a pontuação** — a tela mais perigosa do admin, trinta campos sem aviso. Arquivo: `src/app/admin/pontuacao/PontuacaoEditor.tsx`.
2. **Aviso automático por e-mail antes da corrida** — dois dias antes, com pista, horário e lastro. Usa o Brevo já configurado e o cron da Vercel, que agora existe.
3. **Registro de alterações** — hoje não há como saber quem mudou um lastro ou um peso.
4. **Tempo da volta rápida** — o banco só guarda `melhor_volta_flag`, quem fez e não quanto. Mostrar o tempo exige coluna nova em `resultados` e campo na tela de lançar resultado.
5. **Tabela `pistas`** — hoje pista é texto repetido em cada etapa. Uma tabela própria (nome, endereço, lat/lng, foto, link do Maps) evita redigitar e permite mapa de verdade.
6. **Hall da fama** — só faz sentido com uma segunda temporada encerrada.
7. **Acessibilidade** — ver o revertido acima.

---

## Armadilhas conhecidas

- **O Supabase gratuito pausa o projeto após 7 dias sem atividade.** O site fica sem dados até alguém religar no painel. O ping diário previne; se acontecer de novo, religar em Settings do projeto. Dá 90 dias para religar.
- **Depois de religar, o banco leva alguns minutos para responder certo.** Logo após o restore uma consulta pode voltar zero linha sem erro — o que parece RLS bloqueando e não é. Esperar e repetir antes de investigar.
- **Diagnóstico rápido de “site vazio”:** abrir `/api/manter-ativo`. Erro de rede = banco fora; `ok:false` = banco recusando; `ok:true` com número = banco bem, problema em outro lugar.
- Foto acima de ~4,5 MB falha no site publicado (limite da Vercel). A compressão no navegador reduz para 1600 px antes de subir e resolve na prática.
- Link de e-mail com rastreamento do Brevo ligado não funciona.
- O ícone do aplicativo precisa de margem (o logo ocupa 70% do quadrado) senão o sistema corta nos cantos.
- Ao apagar uma foto pela tela de mídia o arquivo sai do armazenamento junto; para o resto existe o script de faxina.
- Variável nova na Vercel só vale no próximo deploy. O mesmo vale para o `vercel.json`: o cron só é registrado no deploy seguinte.
- **`tsconfig.json` compila tudo por padrão.** A pasta `backups/` está no `exclude` porque senão o `npm run build` quebra com erro de módulo inexistente.
- O SQL Editor do Supabase mostra só o resultado da **última** consulta quando se cola várias juntas. Rodar uma por vez.

<!-- END:copa-kartista-contexto -->
