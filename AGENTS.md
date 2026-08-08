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

- **Lastro:** peso-alvo 90 kg. `lastro = floor((alvo − peso) / 5) × 5`, nunca negativo. Peso é por temporada.
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
| `etapas` | campeonato_id, nome, pista, data, **horario** (time), status, observacoes |
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
- `vw_pilotos_publico` — **sem telefone, e-mail e created_at**
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
| `/` | Seletor de temporada, próxima etapa com contagem regressiva e horário, pódio, última corrida com vencedor e volta rápida, três números |
| `/classificacao` | Pódio ouro/prata/bronze + tabela · **botão de compartilhar no WhatsApp** |
| `/pilotos` | Grade compacta (auto-fill 240px) |
| `/pilotos/[id]` | 8 indicadores, **gráfico de posição por etapa**, **comparador entre pilotos** com confronto direto, histórico |
| `/etapas` | Lista compacta, próxima etapa destacada em vermelho |
| `/etapas/[id]` | Pódio da corrida, 4 números com maior subida/queda vs etapa anterior, resultado, vídeos, galeria em tela cheia, painel de lastro |
| `/regulamento` | Texto da temporada selecionada (menu "Regras") |
| `/estatisticas` | 4 destaques com empatados, 3 números, tabela por piloto |
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
- `src/app/error.tsx`, `not-found.tsx`, `global-error.tsx`, `loading.tsx`
- `src/app/manifest.ts` + `public/icone-192.png` + `public/icone-512.png` + `src/app/icon.png` + `src/app/apple-icon.png` — aplicativo instalável
- `src/app/opengraph-image.tsx` e `src/app/etapas/[id]/opengraph-image.tsx` — cartões de compartilhamento
- `scripts/backup.mjs` — `node scripts/backup.mjs` salva todas as tabelas em `backups/`
- `scripts/limpar-fotos.mjs` — acha fotos órfãs no armazenamento; `--apagar` remove

---

## Feito nesta sessão

Correção do ano fixo na administração (era `ANO_ATUAL = 2026` em cinco arquivos, quebraria em 2027) · telas de erro · backup · auditoria de segurança (telefone e e-mail não vazam) · desempenho (removido `force-dynamic` do layout, adicionado `loading.tsx` e `optimizePackageImports`) · temporadas com regulamento e visibilidade · lastro congelado com ajuste manual e recálculo · manual do admin · painel de visitas · compressão de foto no navegador · galeria em tela cheia · aplicativo instalável · perfil do piloto com gráfico e comparador · horário da etapa · botão de compartilhar a classificação.

**Removidos por decisão do usuário:** modo pista e bolão de palpites. As tabelas `palpites` e a view `vw_palpites_publico` podem ainda existir no banco sem uso.

---

## Pendências

1. **Confirmação ao salvar a pontuação** — a tela mais perigosa do admin, trinta campos sem aviso. Precisa do arquivo `src/app/admin/pontuacao/PontuacaoEditor.tsx`.
2. **Aviso automático por e-mail antes da corrida** — dois dias antes, com pista, horário e lastro. Usa o Brevo já configurado e agendamento da Vercel.
3. **Registro de alterações** — hoje não há como saber quem mudou um lastro ou um peso.
4. **Hall da fama** — só faz sentido com uma segunda temporada encerrada.
5. **Paralelizar consultas** com `Promise.all` nas páginas principais.

---

## Armadilhas conhecidas

- Foto acima de ~4,5 MB falha no site publicado (limite da Vercel). A compressão no navegador reduz para 1600 px antes de subir e resolve na prática.
- Link de e-mail com rastreamento do Brevo ligado não funciona.
- O ícone do aplicativo precisa de margem (o logo ocupa 70% do quadrado) senão o sistema corta nos cantos.
- Ao apagar uma foto pela tela de mídia o arquivo sai do armazenamento junto; para o resto existe o script de faxina.
- Variável nova na Vercel só vale no próximo deploy.
<!-- END:copa-kartista-contexto -->
