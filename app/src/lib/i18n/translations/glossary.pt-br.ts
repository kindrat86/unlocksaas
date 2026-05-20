/**
 * Brazilian Portuguese (pt-BR) translation of the Brunson glossary.
 *
 * Status: pending-review (see src/lib/i18n/registry.ts).
 * Source: src/lib/glossary.ts GLOSSARY (en-US canonical) +
 *         src/lib/seo/entity.ts DEFINED_TERMS (short definitions).
 * Translation by: Claude (sales@sipiteno.com session, 2026-05-20).
 *
 * Editorial notes for founder review
 * ----------------------------------
 * - Voice: Reluctant Hero (workbook 02 §3). Plain register, no startup-
 *   marketing buzzwords. Brazilian Portuguese (não peninsular) — same
 *   discipline as faq.pt-br.ts. Avoid pt-PT idioms ("connosco", "rapariga",
 *   "factor" with -ct-, "telemóvel"); prefer pt-BR conventions
 *   ("conosco", "celular", "fator").
 *
 * - Brand-glossary preservation (stays English in every locale):
 *   "Hook", "Story", "Offer", "Big Domino", "Reluctant Hero",
 *   "Stack Slide", "Soap Opera Sequence" (SOS), "Seinfeld Email",
 *   "Dream 100", "Perfect Webinar", "Wrong Person", "Weak Offer",
 *   "Weak Belief", "Value Ladder", "Verified Builder",
 *   "Brunson Hard-Rule", "Stripe", "Playbook", "Indie Hackers",
 *   "Hacker News", "founder", "outreach", "webhook", "dashboard",
 *   "framework", "milestones", "launch post", "ChatGPT".
 *
 * - Display headings (term names) stay in English — Brunson canonical
 *   nouns. Portuguese appears in the prose around them.
 *
 * - Overlay shape: this file translates only the textual fields. The
 *   structural fields (slug, category, relatedTerms, appearsIn) live in
 *   the canonical and are spliced in by getGlossaryEntries().
 *
 * - Approval lock: until the registry flips to `status: "approved"`,
 *   /pt-BR/glossary and /pt-BR/glossary/<slug> render with noindex and
 *   are omitted from the sitemap.
 */

import type { GlossaryTranslation } from "./glossary.es";

export const GLOSSARY_PT_BR: ReadonlyArray<GlossaryTranslation> = [
  // ---- Hook layer ----------------------------------------------------------
  {
    slug: "hook",
    shortDefinition:
      "A promessa de abertura da página mais a sua jogada de polaridade: nomeia o resultado que o leitor quer e nomeia para quem a página não é, tudo nos primeiros três segundos.",
    longDefinition:
      "Um Hook é a promessa de abertura da página mais a sua jogada de polaridade. A promessa nomeia o resultado; a jogada de polaridade nomeia para quem a página não é. As duas coisas têm que disparar nos primeiros três segundos porque essa é a janela antes de um visitante frio decidir se vai continuar lendo.",
    whyItMatters:
      "Founders pós-launch que ainda não faturam quase sempre têm um problema de Hook antes de ter um problema de produto. A página above the fold descreve o produto em vez de capturar o leitor certo. Consertar o Hook costuma ser uma edição de uma tarde que dobra o tempo em página; reconstruir features leva semanas e raramente move a linha.",
    howToApply: [
      "Substitua o título tipo lista-de-features pelo resultado que o dream customer quer.",
      "Adicione uma linha de polaridade no subtítulo pra que o leitor errado vá embora de propósito.",
      "Corte cada adjetivo que não muda pra quem a página fala.",
      "Teste o título lendo só os primeiros três segundos em voz alta — se soa como qualquer outra ferramenta da categoria, não é um Hook.",
    ],
    example:
      'O Hook do Unlock SaaS é "Your first paying customer in 60 days, or you do not pay." O resultado é nomeado na primeira cláusula; a polaridade ("se você ainda não lançou, isso não é pra você") dispara imediatamente embaixo. Juntas filtram a canonical audience em três segundos.',
    commonConfusions: [
      {
        term: "Headline",
        difference:
          "Um headline são as palavras. Um Hook é a promessa mais a jogada de polaridade — um headline pode carregar isso, mas um Hook também inclui o subtítulo, o desqualificador de polaridade e qualquer visual de abertura que dispara dentro dos primeiros três segundos.",
      },
      {
        term: "Lead magnet",
        difference:
          "Um lead magnet é a isca oferecida em troca de um email. Um Hook é a promessa em nível de página que decide se o leitor para pra considerar o lead magnet ou não.",
      },
    ],
    faqs: [
      {
        q: "Qual é a diferença entre um Hook e um headline?",
        a: "O headline são as palavras literais no topo da página. O Hook é a promessa de abertura completa mais a jogada de polaridade que dispara junto com ela — subtítulo, desqualificador e qualquer visual de abertura incluídos. Uma página pode ter um headline aceitável e não ter Hook.",
      },
      {
        q: "Quão longo é o Hook?",
        a: "Três segundos de leitura. Isso é aproximadamente o headline mais o subtítulo mais a linha de polaridade direto abaixo. Se o leitor precisa rolar, o Hook já falhou.",
      },
      {
        q: "Um Hook pode ser uma pergunta?",
        a: 'Sim, mas só se a pergunta filtra o leitor certo. "Por que sua linha do Stripe está plana?" é um Hook pra um founder pós-launch que ainda não fatura. "Quer mais clientes?" não — não filtra ninguém.',
      },
    ],
  },
  {
    slug: "big-domino",
    shortDefinition:
      "A única afirmação que a página tem que provar. Se o leitor a aceita, todas as objeções menores ficam irrelevantes; se ele a rejeita, nenhuma quantidade de features ou prova social resgata a página.",
    longDefinition:
      "O Big Domino é a única afirmação que a página tem que provar. Se o leitor aceita essa única afirmação, cada objeção menor fica irrelevante; se ele a rejeita, nenhuma quantidade de copy de features ou prova social resgata a página. O framework do Russell Brunson para páginas de alto ticket é construído em torno disso: nomeie a única crença, depois gaste o resto da página provando ela.",
    whyItMatters:
      "A maioria das páginas planas de indie SaaS tenta provar dez coisas ao mesmo tempo. A página é barulhenta sobre cada feature secundária e silenciosa sobre a única crença que de fato decide a venda. Nomear o Big Domino em uma frase é o que permite ao founder cortar metade da página sem perder um único comprador.",
    howToApply: [
      'Escreva o Big Domino como uma frase: "Se você acredita em X, você vai comprar."',
      "Audite cada parágrafo da página. Se um parágrafo não move o leitor em direção a X, corte.",
      "Coloque o Big Domino above the fold, na voz do founder — não em marketing-speak.",
      "Teste o Big Domino em três conversas reais com o dream customer. Se não nomeia uma crença que eles já têm pela metade, reescreva.",
    ],
    example:
      'O Big Domino do Unlock SaaS é: "O trabalho entre o produto lançado e o primeiro cliente pagante é o trabalho que ninguém te ensinou — e o Playbook faz." Aceite isso, e o preço de $49/mês, a garantia de 60 dias e a estrutura de sete passos param de ser objeções.',
    faqs: [
      {
        q: "Como o Big Domino se diferencia de uma value proposition?",
        a: 'Uma value prop descreve o que o produto faz. O Big Domino é a crença prévia que o leitor precisa aceitar antes que qualquer value prop importe. "Reembolso de 60 dias" é uma value prop; "o trabalho que ninguém te ensinou é o que faz a diferença" é o Big Domino em que ela se apoia.',
      },
      {
        q: "Uma página pode ter mais de um Big Domino?",
        a: "Não. O ponto é justamente escolher a única crença que, uma vez aceita, faz cada outra objeção desmoronar. Dois Big Dominos são duas páginas — separe em duas surfaces ou uma Soap Opera Sequence entre elas.",
      },
    ],
  },
  {
    slug: "reluctant-hero",
    shortDefinition:
      "Um dos quatro arquétipos de Attractive Character do Russell Brunson. O founder resolveu o próprio problema primeiro, continuou resolvendo pros amigos que continuavam pedindo, e publica o playbook a contragosto porque a demanda não vai embora.",
    longDefinition:
      'O Reluctant Hero é um dos quatro arquétipos de attractive character do Russell Brunson. O founder resolveu o próprio problema primeiro, continuou resolvendo pros amigos que continuavam pedindo, e publica o playbook a contragosto porque a demanda não vai embora. A relutância é a alavanca de credibilidade: um founder vendendo um sistema que inventou pra si mesmo se lê como honesto de um jeito que um founder que começa com "vim mudar a indústria" nunca consegue.',
    whyItMatters:
      'Os founders indie de SaaS estão sentados em cima de capital de Reluctant Hero e não gastam. A página de about se lê como uma bio corporativa quando deveria se ler como uma confissão: "Construí isso pra mim, depois pra três amigos, depois os amigos continuaram pedindo." Essa única frase vale mais que três case studies que o founder ainda não tem.',
    howToApply: [
      "Reescreva a página de about em primeira pessoa, começando pelo momento em que você decidiu resolver o problema pra você mesmo.",
      "Nomeie o momento em que você percebeu que outras pessoas tinham o mesmo problema — os três amigos originais, o primeiro ping no Discord, o DM frio que fez clicar.",
      'Solte o pronome "we" se você é founder solo. Páginas Reluctant Hero solo convertem; páginas "we believe" não.',
      "Carregue a relutância pela página de vendas: a oferta existe porque a audiência continuou pedindo, não porque o founder queria um exit de SaaS.",
    ],
    example:
      'A bio do Maryan no Unlock SaaS abre com: "Built the playbook he uses for his own launch. Marketer by trade, not engineer." A página vende o mesmo playbook pelo qual o founder está lançando o próprio produto. Reluctant Hero aqui é estrutural — o comprador não está pagando por teoria, está pagando pelo sistema que o founder está usando agora.',
    faqs: [
      {
        q: "O Reluctant Hero é a mesma coisa que uma founder story?",
        a: "Founder story é o conteúdo; o Reluctant Hero é um arquétipo específico pelo qual a founder story pode ser contada. Brunson nomeia quatro arquétipos (Reluctant Hero, Leader, Adventurer, Reporter). A maioria dos founders indie de SaaS se encaixa melhor em Reluctant Hero porque lançou pra resolver o próprio problema.",
      },
      {
        q: "E se eu construí o produto por contrato pra um cliente, não pra mim?",
        a: 'Então sua história de Reluctant Hero começa com o cliente, não com você: "Um amigo me pediu pra construir isso pro time dele; o time dele continuou usando; os amigos do time começaram a pedir." A relutância continua sendo real — você não saiu querendo construir um SaaS.',
      },
    ],
  },

  // ---- Story layer ---------------------------------------------------------
  {
    slug: "story",
    shortDefinition:
      "Tudo que vive entre o Hook e o fechamento. Não é um recurso literário; é a pilha de crenças que o leitor tem que aceitar, um pequeno reconhecimento por vez, antes que a oferta aterrisse.",
    longDefinition:
      'A Story é tudo que vive entre o Hook e o fechamento. Não é um recurso literário; é a pilha de crenças. Cada seção da página é um reconhecimento pequeno que o leitor tem que aceitar ("sim, essa é a minha situação", "sim, isso é o que eu tentei", "sim, é aí que falhou") antes que a oferta possa aterrissar. Pular a pilha de crenças e a oferta parece cara; construir e a oferta parece barata.',
    whyItMatters:
      "A página plana de indie SaaS quase sempre tem um Hook usável e uma oferta real mas nada no meio. O leitor rola por uma parede de features procurando uma razão pra acreditar e não acha. Construir a pilha de crenças é o que transforma uma página que recebe shares mas não compradores em uma página que recebe menos shares e uma linha plana do Stripe que inclina pra cima.",
    howToApply: [
      "Escreva cinco frases que descrevem a situação de hoje do seu dream customer, nas palavras dele.",
      "Escreva três frases que descrevem o que ele já tentou e por que travou.",
      "Escreva uma frase que nomeia a falsa crença sobre a qual tudo que ele tentou foi construído.",
      "Substitua o meio da sua página de vendas por essas nove frases antes de reintroduzir a oferta.",
    ],
    example:
      "Em /playbook-sales a seção do meio nomeia as três coisas que um founder pós-launch já tentou (mais features, mais tráfego, conselho de AI co-founder) e a falsa crença em que cada uma se apoia. A oferta lá embaixo só funciona porque essa pilha de crenças é construída primeiro.",
    faqs: [
      {
        q: "A Story precisa ser uma história pessoal?",
        a: 'Não. A Story é a pilha de crenças, não a autobiografia do founder. Uma página pode construir crença através de case studies, comparações dimensionais, screenshots ou um teardown da página atual do leitor — qualquer coisa que mova ele pela sequência de reconhecimentos pequenos que termina em "isso é pra mim."',
      },
      {
        q: "Quão longa deve ser a seção de Story?",
        a: "O tempo que leva pra caminhar o leitor de onde ele está até onde a oferta faz sentido óbvio. Pra um SaaS de $49/mês com tráfego morno isso costuma ser cinco a sete scrolls. Pra tráfego frio pode ser o dobro e ainda converter.",
      },
    ],
  },
  {
    slug: "soap-opera-sequence",
    shortDefinition:
      "O padrão de indoctrinação de cinco emails do Russell Brunson. Um novo assinante recebe um email por dia durante cinco dias, estruturados em torno de um cliffhanger de backstory que se resolve na oferta no dia cinco.",
    longDefinition:
      "A Soap Opera Sequence (SOS) é o padrão de indoctrinação de cinco emails do Russell Brunson. Um novo assinante recebe um email por dia durante cinco dias, estruturados em torno de um cliffhanger de backstory que se resolve na oferta no dia cinco. Cada email deixa um open loop deliberado pra que o próximo se sinta ganho, não empurrado.",
    whyItMatters:
      "Founders indie de SaaS lançam um formulário de signup e depois não mandam nada por duas semanas. O assinante esquece do produto antes do founder escrever o primeiro follow-up. Uma SOS que funciona é a diferença entre uma lista que converte a 1% e uma lista que converte a 8% sobre o mesmo tráfego.",
    howToApply: [
      "Dia 1: chegue com a backstory do founder e um open loop específico.",
      "Dia 2: nomeie o momento em que tudo mudou (o reconhecimento).",
      "Dia 3: nomeie o inimigo público — a falsa crença que a audiência carrega.",
      "Dia 4: nomeie a epifania — a crença nova que virou o resultado do founder.",
      "Dia 5: abra a oferta, condicionada a aceitar a crença nova.",
    ],
    example:
      "O Unlock SaaS manda uma SOS de cinco emails no dia em que um founder pede o diagnóstico gratuito. O dia 5 abre a oferta do Starter de $1. Assinantes que não abrem o dia 1 saem da sequência — a SOS só roda pra leitores que estão lendo de fato.",
    commonConfusions: [
      {
        term: "Seinfeld Email",
        difference:
          "A SOS é uma sequência fixa de cinco emails de indoctrinação mandada na primeira semana. Os Seinfeld Emails são emails diários mandados pra sempre depois disso — histórias slice-of-life que pivotam pra um pitch suave.",
      },
    ],
    faqs: [
      {
        q: "A SOS tem que ser exatamente de cinco emails?",
        a: "Cinco é a forma canônica do Brunson porque cada dia mapeia pra um shift de crença (backstory, reconhecimento, inimigo, epifania, oferta). Quatro funciona se você comprimir reconhecimento e inimigo; seis só funciona se sua audiência for incomumente paciente. Três são poucos demais — a oferta aterrissa antes da crença estar construída.",
      },
      {
        q: "Quando eu mando a SOS?",
        a: "Dispare em uma única ação de alta intenção: signup de free trial, download de lead magnet, conclusão do diagnóstico ou entrada em uma waitlist. Não dispare só em signup de newsletter — esse tráfego não está morno o suficiente pra ler cinco dias de Story.",
      },
    ],
  },
  {
    slug: "seinfeld-email",
    shortDefinition:
      'O padrão de email diário do Russell Brunson: uma história slice-of-life curta na voz do founder que pivota pra um pitch suave nas últimas linhas. "Seinfeld" porque a história é sobre qualquer coisa em particular e o pitch aterrissa porque a história já pagou pela atenção do leitor.',
    longDefinition:
      'O padrão de email diário do Russell Brunson: uma história slice-of-life curta na voz do founder que pivota pra um pitch suave nas últimas linhas. "Seinfeld" porque a história é sobre qualquer coisa em particular — uma conversa numa cafeteria, uma caminhada, um bug no produto — e o pitch aterrissa porque a história já pagou pela atenção do leitor.',
    whyItMatters:
      "A maioria dos founders indie de SaaS não consegue sustentar um schedule diário de emails porque trata cada email como um anúncio de feature. Os Seinfeld Emails são sustentáveis: o founder escreve a partir do que já aconteceu hoje, e a cadência diária é o que compõe a relação. Emails diários superam newsletters semanais em conversão-por-assinante por margens que founders indie acham constrangedoras assim que fazem a conta.",
    howToApply: [
      "Escreva o email sobre algo específico que aconteceu de verdade hoje.",
      "Aterrisse a história em 150 a 300 palavras.",
      "Pivote pra oferta nas últimas duas ou três linhas, não nas primeiras.",
      "Mande diário por pelo menos 30 dias antes de julgar o canal.",
    ],
    example:
      "O Unlock SaaS roda uma corrente Seinfeld depois que a Soap Opera Sequence termina. Do dia 6 em diante, o founder manda um email diário sobre um momento real construindo o produto ou conversando com um cliente. O pitch nas últimas duas linhas aponta pro diagnóstico, pro Starter de $1 ou pro Playbook dependendo da semana.",
    commonConfusions: [
      {
        term: "Soap Opera Sequence",
        difference:
          "A SOS é a indoctrinação fixa de cinco emails na primeira semana. Os Seinfeld Emails rodam depois disso, diários, indefinidamente. Cadência diferente, propósito diferente.",
      },
    ],
    faqs: [
      {
        q: "Como um Seinfeld Email é diferente de uma newsletter regular?",
        a: "Uma newsletter anuncia coisas. Um Seinfeld Email conta uma única história slice-of-life específica e termina com um pitch suave. O modo newsletter treina leitores a pular; o modo Seinfeld treina eles a abrir porque a próxima história é sempre nova.",
      },
      {
        q: "Emails diários vão fazer as pessoas dar unsubscribe?",
        a: "Sim, e esse é o ponto. Os leitores errados saem; os certos compõem. Uma lista de 800 leitores diários que reconhecem sua voz converte mais alto que uma lista de 8.000 leitores semanais que mal lembram de ter assinado.",
      },
    ],
  },

  // ---- Offer layer ---------------------------------------------------------
  {
    slug: "offer",
    shortDefinition:
      "O que a página pede e o que ela dá em troca, estruturado de modo que o valor percebido fique inequivocamente acima do preço. Uma boa oferta não é o produto; é o resultado do qual o produto é o mecanismo de entrega, mais a prova de que o resultado vai chegar, mais a reversão do downside do comprador.",
    longDefinition:
      "A Offer é o que a página pede e o que dá em troca, estruturada de modo que o valor percebido fique inequivocamente acima do preço. Uma boa oferta não é o produto; é o resultado do qual o produto é o mecanismo de entrega, mais a prova de que o resultado vai chegar, mais a reversão do downside do comprador.",
    whyItMatters:
      'A maioria das páginas de indie SaaS vende features e chama isso de oferta. O leitor vê "$49/mês pela ferramenta X" e se pergunta se quer a ferramenta X — que é a pergunta errada. Uma oferta de verdade faz o comprador comparar o preço com o resultado e a garantia com o downside dele; enquadrada assim, o mesmo produto converte duas a cinco vezes mais alto sobre tráfego idêntico.',
    howToApply: [
      'Substitua "compre nosso produto" por "obtenha esse resultado específico."',
      "Adicione uma garantia ou reversão que nomeia o downside real do comprador.",
      "Itemize o que está incluso pra que o valor percebido fique acima do preço.",
      "Teste a oferta em três conversas reais com o dream customer antes de mandar pra página.",
    ],
    example:
      'A Offer do Unlock SaaS não é "$49/mês por uma ferramenta de SaaS." É "primeiro cliente pagante em 60 dias ou você é reembolsado, com um cap duro de $98 sobre o que você pode chegar a perder." O produto é o mecanismo de entrega; a oferta é o resultado mais a reversão.',
    faqs: [
      {
        q: "A oferta é a mesma coisa que o preço?",
        a: "Não. O preço é um componente de uma oferta; o resto são o resultado que o comprador recebe, a garantia que reverte o downside dele e o value stack itemizado que justifica o preço. Uma página com só um preço e sem reversão está vendendo um produto, não uma oferta.",
      },
      {
        q: "Toda página precisa de uma oferta?",
        a: "Toda página que pede dinheiro ou um compromisso significativo (trial estendido, demo, inscrição). Páginas de conteúdo gratuito não precisam de uma oferta nesse sentido — a oferta é a própria página.",
      },
    ],
  },
  {
    slug: "value-ladder",
    shortDefinition:
      "Uma sequência ordenada de ofertas pelas quais o mesmo cliente pode passar ao longo do tempo, onde cada degrau entrega estritamente mais valor que o anterior a um preço proporcional à entrega.",
    longDefinition:
      "Uma Value Ladder é uma sequência ordenada de ofertas pelas quais o mesmo cliente pode passar ao longo do tempo, onde cada degrau entrega estritamente mais valor que o anterior a um preço proporcional à entrega. A ladder é o roadmap de produtos do founder visto do lado do comprador: o que compram primeiro, o que compram depois, o que compram quando confiam em você.",
    whyItMatters:
      "Founders indie de SaaS por padrão têm um produto a um preço pra todo mundo. O resultado é um funnel binário — compradores ou não-compradores — sem caminho entre os dois. Uma Value Ladder de dois degraus ($1 de entrada, $49/mês core) dobra o mercado endereçável porque dá ao leitor frio um primeiro passo real que não exige confiar no founder ainda.",
    howToApply: [
      "Nomeie um degrau de entrada que custa quase nada e prova intenção.",
      "Nomeie um degrau core que entrega o resultado-título.",
      "Decida se um terceiro degrau existe; não construa até o degrau core ter três ciclos de cliente completos.",
      "Torne cada degrau legível na página — um comprador deveria saber em qual degrau está e o que o próximo compra pra ele.",
    ],
    example:
      "A Value Ladder do Unlock SaaS são dois degraus hoje: Starter de $1 (desbloqueia os passos 1 e 2 do Playbook) e Core de $49/mês (o Playbook completo de sete passos). O Rung 3 (Repeatable Revenue) é um spec publicado em /repeatable; o build está travado por três ciclos de cliente Core completarem — a ladder não cresce até o degrau abaixo provar.",
    faqs: [
      {
        q: "Preciso de um degrau grátis no fundo?",
        a: "Às vezes. Um degrau grátis faz sentido quando o próximo degrau precisa de confiança real (coaching de alto ticket, SaaS enterprise). Pra um produto indie de $49/mês, um degrau de $1 funciona melhor que grátis — pagar $1 é o menor sinal de intenção real que um cliente pode dar, e o Stripe verifica.",
      },
      {
        q: "Quantos degraus são demais?",
        a: "Três é o teto pra um indie SaaS até o degrau core ter pelo menos 20 ciclos de cliente completos. Além disso, um quarto degrau faz sentido se e somente se a audiência pedir sem provocação. Adicionar degraus que a audiência não pediu é como produtos indie viram plataformas inchadas.",
      },
    ],
  },
  {
    slug: "stack-slide",
    shortDefinition:
      "O padrão de revelação da oferta que Russell Brunson popularizou no Perfect Webinar. Cada entregável na oferta é itemizado na própria linha e ancorado a um preço standalone; o total das âncoras é mostrado explicitamente; depois o preço real é revelado como um desconto sobre esse total.",
    longDefinition:
      "O Stack Slide é o padrão de revelação da oferta que Russell Brunson tornou famoso no Perfect Webinar. Cada entregável na oferta é itemizado na própria linha e ancorado a um preço standalone; o total das âncoras é mostrado explicitamente; depois o preço real é revelado como um desconto sobre esse total. O ponto não é enganar — o ponto é fazer o comprador avaliar a oferta inteira em vez de brigar com a etiqueta de preço.",
    whyItMatters:
      "Páginas que listam features sem ancorar elas a valores standalone perdem o comprador pra um único número: o preço. Páginas que stackeiam a oferta corretamente perdem a comparação de preço inteira — o comprador está comparando o stack total com o downside real, não a mensalidade com a mensalidade de um competidor.",
    howToApply: [
      "Liste cada entregável na própria linha.",
      "Ancore cada linha ao valor standalone realista daquele entregável.",
      "Mostre o total das âncoras antes de revelar seu preço.",
      "Revele o preço como um desconto sobre o total ancorado, com o raciocínio em uma frase.",
    ],
    example:
      "O stack do Unlock SaaS em /playbook-sales itemiza os sete passos do Playbook, o diagnóstico, a linha de suporte do founder e a entrada no Verified Builders directory, cada um ancorado a um preço standalone que o mercado indie de SaaS realmente cobra por essas coisas. O número de $49/mês aterrissa como um desconto sobre esse total, não como uma etiqueta de feature page.",
    faqs: [
      {
        q: "O Stack Slide é manipulador?",
        a: "Só é manipulador se os preços ancorados são fabricados. Se cada line item realmente custaria o que você ancora num provedor comparável, o stack é um serviço pro comprador — ele teria que montar o mesmo valor sozinho e pagar cada pedaço separado. Brunson Hard-Rule: nunca ancore a um preço que o mercado não cobra de verdade.",
      },
      {
        q: "O Stack funciona pra um produto de assinatura?",
        a: "Sim, mas as âncoras devem ser equivalentes mensais, não preços vitalícios. Ancore cada entregável ao equivalente mensal honesto de um provedor concorrente, some isso, depois revele sua fee mensal como um desconto sobre a soma. O leitor está comprando um mês, então avalia o stack mensalmente.",
      },
    ],
  },
  {
    slug: "perfect-webinar",
    shortDefinition:
      "O framework do Russell Brunson pra vender uma oferta de alto ticket pra tráfego frio numa única apresentação um-pra-muitos. A estrutura é fixa: nomeie o Big Domino, ande pelos três secrets que provam (vehicle, internal beliefs, external beliefs), stackeie a oferta e feche.",
    longDefinition:
      "O Perfect Webinar é o framework do Russell Brunson pra vender uma oferta de alto ticket pra tráfego frio numa única apresentação um-pra-muitos. A estrutura é fixa: nomeie o Big Domino, ande pelos três secrets que provam (vehicle, internal beliefs, external beliefs), stackeie a oferta e feche. Founders indie de SaaS raramente rodam webinars literais, mas a forma do Perfect Webinar é a estrutura canônica que a página de vendas deles deveria seguir.",
    whyItMatters:
      "A maioria das páginas de vendas de indie SaaS é organizada por categoria de feature. O Perfect Webinar reorganiza por sequência de crenças — exatamente o que um leitor frio percorre no caminho pra comprar. Founders que reestruturam a página de vendas plana na forma de um Perfect Webinar costumam ver lift de conversão sobre tráfego que já estavam recebendo.",
    howToApply: [
      "Abra a página com a frase do Big Domino.",
      "Rode três seções, cada uma um secret: vehicle (por que essa categoria), internal beliefs (por que você consegue), external beliefs (por que nada de fora está no caminho).",
      "Aterrisse no Stack Slide.",
      "Feche com a revelação do preço e a garantia.",
    ],
    example:
      "/playbook-sales segue a forma do Perfect Webinar numa página de vendas em vez de um webinar. Big Domino no topo, três seções de secret no meio (por que um Playbook ganha de um curso, por que um founder não-engineer consegue rodar, por que tráfego não é o blocker), stack perto do fundo, fechamento refund-in-code no final.",
    faqs: [
      {
        q: "Preciso rodar um webinar literal?",
        a: "Não. O Perfect Webinar é um template estrutural — a forma de crenças que um leitor frio precisa atravessar. A mesma forma funciona numa página de vendas, num VSL, numa Soap Opera Sequence de cinco emails e num webinar ao vivo de 90 minutos. Escolha o formato que o dream customer realmente consome.",
      },
      {
        q: "Quão longo é um Perfect Webinar?",
        a: "Ao vivo: 60 a 90 minutos. Numa página de vendas: o tempo que leva pra andar pelos três secrets e stackear a oferta — tipicamente 10 a 20 scrolls pra um produto de $49/mês, mais longo pra alto ticket.",
      },
    ],
  },

  // ---- Diagnostic layer ----------------------------------------------------
  {
    slug: "wrong-person",
    shortDefinition:
      'Um dos três rótulos de diagnóstico que o Unlock SaaS devolve quando um founder cola a URL do produto no ar. "Wrong Person" dispara quando a oferta na página está ok mas a página é apontada pra ninguém em particular — copy genérico, visuais genéricos, lista de features genérica.',
    longDefinition:
      'Wrong Person é um dos três rótulos de diagnóstico que o Unlock SaaS devolve quando um founder cola a URL do produto no ar. "Wrong Person" dispara quando a oferta na página está ok mas a página é apontada pra ninguém em particular — copy genérico, visuais genéricos, lista de features genérica. A página converteria pra alguém, mas não filtra ninguém, então não converte pra nenhum.',
    whyItMatters:
      "A maioria das páginas planas de indie SaaS recebe esse diagnóstico. Founders acham que têm problema de feature e dobram a aposta no roadmap do produto; o diagnóstico mostra que têm problema de nomear a audiência e um conserto de uma tarde.",
    howToApply: [
      "Nomeie uma pessoa específica, num papel específico, numa empresa específica.",
      "Reescreva o Hook pra falar com essa pessoa diretamente.",
      "Adicione uma linha de polaridade que nomeia pra quem a página não é.",
      "Rode o diagnóstico de novo. Se ainda saca Wrong Person, você nomeou uma persona, não uma pessoa.",
    ],
    example:
      'Um resultado de diagnóstico Wrong Person pra um SaaS de feedback collection levou a renomear a página de "Customer Feedback Made Easy" pra "For solo SaaS founders who need three real interviews this week." Mesmo produto, audiência nomeada, conversão subiu sobre o tráfego que o founder já tinha.',
    faqs: [
      {
        q: "Como Wrong Person é diferente de um target market ruim?",
        a: 'Target market é uma categoria ("founders indie de SaaS"). Wrong Person dispara quando a página mira numa categoria em vez de numa pessoa. O conserto não é escolher uma categoria diferente; é nomear um humano específico dentro da categoria que você já escolheu.',
      },
      {
        q: "Um B2B SaaS pode cair em Wrong Person?",
        a: 'Sim — é o diagnóstico de B2B SaaS mais comum. Uma página que diz "for teams" sem nomear um papel, um tamanho de time, um stack tech ou um workflow específico é Wrong Person por padrão.',
      },
    ],
  },
  {
    slug: "weak-offer",
    shortDefinition:
      "Rótulo de diagnóstico disparado quando a pessoa na página está ok mas a oferta é uma lista de features em vez de um resultado. O leitor sabe que é pra ele; só não consegue dizer o que está comprando.",
    longDefinition:
      "Weak Offer é o rótulo de diagnóstico disparado quando a pessoa na página está ok mas a oferta é uma lista de features em vez de um resultado. O leitor sabe que é pra ele; só não consegue dizer o que está comprando. Weak Offer é o segundo rótulo mais comum e quase sempre coexiste com uma garantia faltante ou um stack faltante.",
    whyItMatters:
      "Weak Offer é o diagnóstico que founders mais empurram pra trás porque a página tem todas as features certas. O diagnóstico não está dizendo que o produto está errado; está dizendo que a página está pedindo pro leitor traduzir features em resultado, e a maioria dos leitores não traduz.",
    howToApply: [
      "Reescreva o título como um resultado, não uma feature.",
      "Adicione uma garantia de uma frase que nomeia o downside real do comprador.",
      "Construa um Stack Slide que ancora cada entregável a um preço standalone.",
      "Rode o diagnóstico de novo.",
    ],
    example:
      'Um diagnóstico sobre um clone do Linear pra founders solo virou Weak Offer. A seção de features era forte; o Hook dizia "Project management for solo founders." Reescrever pra "Ship one feature a week on a calendar your future self can audit" mais uma garantia de devolução de 30 dias deixou o diagnóstico verde.',
    faqs: [
      {
        q: "Se meu preço é competitivo, ainda posso ter uma Weak Offer?",
        a: "Sim. Weak Offer é sobre como a oferta está enquadrada, não quão barata é. Um produto bem-precificado com uma página de lista de features se lê como Weak Offer; um produto de preço médio com uma oferta stackeada e uma garantia se lê como uma oferta forte no mesmo número.",
      },
      {
        q: "Uma garantia sempre conserta Weak Offer?",
        a: "Uma garantia mais um título result-named mais um stack conserta. Uma garantia sozinha, parafusada numa feature page sem mudar, é uma nota de rodapé — leitores veem e ignoram porque o resto da página não ganhou o read.",
      },
    ],
  },
  {
    slug: "weak-belief",
    shortDefinition:
      "Rótulo de diagnóstico disparado quando a pessoa e a oferta estão ok mas a página não faz o leitor acreditar que a oferta vai funcionar pra ele especificamente. O leitor se reconhece; entende a oferta; só não acredita.",
    longDefinition:
      "Weak Belief é o rótulo de diagnóstico disparado quando a pessoa e a oferta estão ok mas a página não faz o leitor acreditar que a oferta vai funcionar pra ele especificamente. O leitor se reconhece; entende a oferta; só não acredita. Weak Belief é o mais raro dos três rótulos e o mais difícil de consertar — é o diagnóstico que pede prova social, screenshots ou uma história de Reluctant Hero que o founder talvez ainda não tenha.",
    whyItMatters:
      "Founders com Weak Belief costumam estar mais perto de converter do que pensam. A página está fazendo 80% do trabalho; o leitor está lendo até o final e quicando. O conserto é cirúrgico — uma peça de prova real na posição certa do scroll — não uma reescrita.",
    howToApply: [
      "Adicione uma peça de prova real na terceira posição do scroll: um screenshot do dashboard do Stripe de um cliente real, uma citação de uma conversa real, uma gravação de tela do resultado acontecendo ao vivo.",
      'Corte cada palavra de hedge ("pode", "poderia", "frequentemente") e substitua por compromissos concretos.',
      "Adicione uma história de Reluctant Hero na página de about e linke da página de vendas.",
      "Rode o diagnóstico de novo.",
    ],
    example:
      "Um diagnóstico sobre uma ferramenta de analytics de nicho virou Weak Belief. O conserto foi adicionar um screenshot anotado do dashboard de um usuário real acima do pricing fold, mais um Reluctant Hero de duas frases na página de about. Nenhum copy foi reescrito em outro lugar; a conversão subiu.",
    faqs: [
      {
        q: "Ainda não tenho screenshots de clientes — que prova posso usar?",
        a: "Prova pré-receita é prova real: uma gravação de tela do produto fazendo o resultado sobre seus próprios dados; uma linha honesta sobre onde o produto está no ciclo de vida; uma história de Reluctant Hero; um beta user nomeado com permissão. Testemunhos fabricados não são prova e falham auditorias.",
      },
      {
        q: "Weak Belief é a mesma coisa que não ter case studies?",
        a: "Case studies são uma forma de prova de crença, mas não a única. Uma gravação de tela, um screenshot anotado, um log de build-in-public transparente ou uma citação de um único beta user nomeado também contam. O diagnóstico mede se a crença aterrissa, não se case studies existem.",
      },
    ],
  },

  // ---- Audience layer ------------------------------------------------------
  {
    slug: "dream-100",
    shortDefinition:
      "A lista nomeada dos 100 humanos, publicações, comunidades ou plataformas específicas onde o dream customer já se reúne. O framework do Russell Brunson no Traffic Secrets — o ponto de entrada pra cada canal outbound.",
    longDefinition:
      "A Dream 100 é a lista nomeada dos 100 humanos, publicações, comunidades ou plataformas específicas onde o dream customer já se reúne. O framework do Russell Brunson no Traffic Secrets — o ponto de entrada pra cada canal outbound. A Dream 100 é nomeada, não segmentada: handles reais do Twitter, URLs reais de subreddits, nomes reais de podcasts, editores reais de newsletters.",
    whyItMatters:
      'Founders indie de SaaS gastam meses "procurando a audiência" quando a audiência já se juntou em 100 lugares que poderiam nomear numa tarde. A Dream 100 obriga o founder a escrever a lista, que é o que transforma "audience research" abstrata em outreach concreto na manhã seguinte.',
    howToApply: [
      "Passe uma tarde escrevendo 100 linhas específicas. Sem categorias — só handles, URLs, nomes.",
      "Anote cada linha com a menor primeira jogada possível (responder um tweet, comentar num episódio de podcast, escrever pro editor com uma pergunta específica).",
      "Escolha cinco linhas por semana. Faça a jogada. Acompanhe respostas.",
      "Substitua linhas que não vão a lugar nenhum; mantenha linhas que respondem, mesmo que mornamente.",
    ],
    example:
      "A Dream 100 do Maryan pro Unlock SaaS inclui os Discords de indie SaaS que o dream customer lê, três podcasts cujos hosts lançaram com ferramentas de AI, quatro newsletters sobre a luta pós-launch e founders nomeados que admitem publicamente linhas planas do Stripe. A lista não é aspiracional — cada linha está a um outbound de distância.",
    faqs: [
      {
        q: "A Dream 100 tem que ser exatamente 100?",
        a: "Não, mas tem que ser específica. Cinquenta entradas nomeadas ganham de mil categorias vagas. Brunson usa 100 porque abaixo de 30 um founder pega só os alvos fáceis e acima de 200 a lista deixa de ser acionável. Escolha um número onde cada linha é real e a próxima jogada está a um clique.",
      },
      {
        q: "A Dream 100 é paga ou orgânica?",
        a: "Majoritariamente orgânica pra indie SaaS — respostas diretas, comentários, DMs, inscrições pra ser convidado de podcast. Jogadas pagas vão em cima da mesma lista (patrocinar as mesmas newsletters, rodar ads contra os mesmos subreddits) mas a jogada orgânica precede a paga, sempre.",
      },
    ],
  },

  // ---- Editorial layer ----------------------------------------------------
  {
    slug: "verified-builder",
    shortDefinition:
      "Um founder cujo primeiro cliente pagante foi confirmado via conta Stripe conectada do founder — não auto-reportado, não por screenshot, não por testemunho. O Verified Builders directory no Unlock SaaS só cresce quando o webhook do Stripe confirma o ciclo.",
    longDefinition:
      "Um Verified Builder é um founder cujo primeiro cliente pagante foi confirmado via conta Stripe conectada do founder — não auto-reportado, não por screenshot, não por testemunho. O Verified Builders directory no Unlock SaaS só cresce quando o webhook do Stripe confirma o ciclo. O status de verificado é a unidade canônica de prova social no site.",
    whyItMatters:
      "A maioria dos murais de testemunhos em páginas de indie SaaS falha em auditorias porque é inverificável. O status de Verified Builder é o oposto: é forçado no código, assinado pelo Stripe, e a entrada no directory existe só porque uma cobrança real entrou. Isso faz dele o raro sinal de prova social que sobrevive tanto ao escrutínio do comprador quanto às Google Quality Rater Guidelines.",
    howToApply: [
      'Se você roda seu próprio SaaS, defina o que "cliente verificado" significa no seu domínio e force no código.',
      "Recuse-se a publicar prova social que seu sistema não consegue verificar — claims quebrados doem mais que paredes vazias.",
      "Amarre qualquer directory de prova social ao mesmo evento de verificação.",
      "Se você ainda não consegue verificar, lance o empty state honesto e deixe o sistema crescer.",
    ],
    example:
      "/builders renderiza só os founders cujo webhook do Stripe confirmou pelo menos um cliente pagante na conta conectada. Até isso disparar, eles não estão no directory — não existe caminho de auto-reporte.",
    faqs: [
      {
        q: "Por que não deixar founders auto-reportarem o primeiro cliente?",
        a: "Porque prova social auto-reportada falha em auditorias de qualidade e erode a confiança do comprador. O custo de rodar um gate de verificação mais apertado é um directory menor; o benefício é que cada linha do directory é incontestável. Brunson Hard-Rule.",
      },
      {
        q: "O que conta como um cliente pagante verificado?",
        a: "Uma cobrança real do Stripe na conta conectada do founder, de um cliente que não é o próprio founder, que não dá reembolso dentro da janela de auditoria de sete dias. Sem exceção. O fluxo do webhook está documentado em /editorial-policy.",
      },
    ],
  },
  {
    slug: "brunson-hard-rule",
    shortDefinition:
      "O padrão editorial pelo qual o Unlock SaaS publica. Cada afirmação pública é independentemente verificável, datada quando o fato subjacente pode mudar, e não fabricada. Nenhum aggregateRating antes de reviewers verificados existirem; nenhuma contagem de testemunhos antes de testemunhos existirem.",
    longDefinition:
      "A Brunson Hard-Rule é o padrão editorial pelo qual o Unlock SaaS publica. Cada afirmação pública é independentemente verificável, datada quando o fato subjacente pode mudar, e não fabricada. Nenhum aggregateRating antes de reviewers verificados existirem; nenhuma contagem de testemunhos antes de testemunhos existirem; nenhum sameAs antes do founder ser dono da conta; nenhum Q-ID do Wikidata antes de uma entrada real estar publicada. A regra nomeia o que NÃO vamos fazer, não o que vamos.",
    whyItMatters:
      "Founders pré-receita são tentados a fabricar prova social pra parecerem críveis. A Brunson Hard-Rule diz não, e a disciplina compõe: cada fato no site é um que um comprador pode verificar, que é o que torna os poucos fatos que PUBLICAMOS desproporcionalmente críveis. Também faz o site sobreviver à de-duplicação de AI Overviews, à auditoria de quality rater do Google e a qualquer revisão futura puxada por scraper que o site receba.",
    howToApply: [
      "Audite cada claim de prova social na página. Se você não pode provar de uma fonte pública, tire.",
      "Adicione uma data Last Verified em cada claim que pode mudar (preço, headcount, integrações).",
      "Publique uma política editorial que documenta como você pesquisa fontes, assina e corrige claims.",
      "Quando estiver na dúvida, lance o empty state honesto e deixe o sistema crescer pra preencher o slot.",
    ],
    example:
      "No Unlock SaaS, o JSON-LD do Playbook SoftwareApplication intencionalmente omite aggregateRating porque nenhum reviewer verificado ainda lançou uma review pública. O graph do schema tem um buraco onde reviews iriam, e a omissão é o sinal de auditoria: o dia que uma review real aterrissar, o slot enche.",
    faqs: [
      {
        q: "A Brunson Hard-Rule é uma regra do Russell Brunson?",
        a: "Não. O nome é um aceno — os frameworks do Brunson são centrais ao produto — mas a regra editorial é própria do Unlock SaaS. É o inverso do erro de funnel-marketing mais comum: fabricar prova pra parecer mais adiante do que você está.",
      },
      {
        q: "Isso freia o crescimento?",
        a: "Sim, deliberadamente. O site faz a prova social crescer na velocidade em que a prova social real chega. O trade é uma página com aparência mais lenta em troca de uma página que sobrevive a cada auditoria que o Google, um LLM ou um comprador esperto pode rodar contra ela. Pra um produto indie abaixo de $100, o trade vale a pena; pra produtos de ticket mais alto, é impossível pular.",
      },
    ],
  },
];

// ----- Sanity check ---------------------------------------------------------

const _shapeCheck: GlossaryTranslation = GLOSSARY_PT_BR[0]!;
void _shapeCheck;
