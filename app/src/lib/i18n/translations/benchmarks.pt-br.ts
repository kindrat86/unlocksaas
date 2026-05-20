/**
 * Brazilian Portuguese (pt-BR) translation of the indie SaaS benchmarks
 * catalog.
 *
 * Status: pending-review (see src/lib/i18n/registry.ts).
 * Source: src/lib/benchmarks.ts BENCHMARK_ENTRIES (en-US canonical).
 * Translation by: Claude (sales@sipiteno.com session, 2026-05-20).
 *
 * Editorial notes for founder review
 * ----------------------------------
 * - Voice: Reluctant Hero (workbook 02 §3). Plain register, no startup-
 *   marketing buzzwords. Brazilian Portuguese (não peninsular) — same
 *   discipline as faq.pt-br.ts and glossary.pt-br.ts. Avoid pt-PT
 *   idioms ("connosco", "factor" with -ct-, "telemóvel"); prefer pt-BR
 *   conventions ("conosco", "fator", "celular").
 *
 * - Brand-glossary preservation rules from benchmarks.es.ts apply
 *   verbatim. All brand terms, framework names, vendor names, metric
 *   abbreviations (LTV/CAC/MRR/ARR/ICP/PLG/OTO/SPF/DKIM/DMARC), and
 *   USD pricing kept English.
 *
 * - Band labels ("Underperforming", "Typical range", "Outperforming")
 *   stay verbatim — TypeScript discriminated union literals.
 *
 * - Approval lock: until the registry flips to `status: "approved"`,
 *   /pt-BR/benchmarks and /pt-BR/benchmarks/<slug> render with noindex
 *   and are omitted from the sitemap.
 */

import type { BenchmarkTranslation } from "./benchmarks.es";

export const BENCHMARK_ENTRIES_PT_BR: ReadonlyArray<BenchmarkTranslation> = [
  {
    slug: "landing-page-conversion-rate",
    metric: "taxa de conversão de landing page",
    metaTitle: "Taxa média de conversão de landing page (SaaS)",
    metaDescription:
      "Landing pages de indie SaaS convertem a 1% até 5% em tráfego frio. Abaixo de 1% indica Wrong Person; acima de 5% costuma ser contaminação de audiência morna.",
    aeoAnswer:
      "Para landing pages de indie SaaS em tráfego frio, uma taxa de conversão saudável fica entre 1% e 5%. Abaixo de 1% quase sempre aponta pra um problema de Wrong Person (o tráfego não casa com a oferta). Acima de 5% em tráfego genuinamente frio normalmente indica contaminação de audiência morna — a fonte não é tão fria quanto o dashboard diz.",
    bands: [
      {
        label: "Underperforming",
        range: "Menos de 1%",
        diagnosis:
          "Tráfego Wrong Person. A audiência que visita não casa com a oferta da página. Conserte a fonte de tráfego ou o frame do título antes de fazer qualquer A/B test.",
      },
      {
        label: "Typical range",
        range: "1% a 5%",
        diagnosis:
          "Conversão normal sobre tráfego frio. Refinos (título, prova, copy do CTA) movem dentro dessa banda; mudanças estruturais movem pra fora dela. Abaixo de 2% é o piso da banda, acima de 4% é o teto.",
      },
      {
        label: "Outperforming",
        range: "Mais de 5%",
        diagnosis:
          "Contaminação de audiência morna é a explicação mais comum. Verifique a fonte. Se for genuinamente frio, a página está fazendo o trabalho de uma sales letter e a oferta está excepcionalmente bem enquadrada.",
      },
    ],
    drivers: [
      "Audience-page fit (o maior driver, por 10x)",
      "Elemento de prova above the fold (resultados verificados, credenciais do founder)",
      "Presença e qualidade do Stack Slide",
      "Visibilidade da reversão de risco (termos da garantia acima do CTA)",
      "Especificidade do título (cohort nomeado + resultado nomeado)",
    ],
    misreadings: [
      "Ler a taxa de conversão antes de 200 visitantes qualificados. Sample size pequeno demais.",
      'Comparar sua taxa com a "média da indústria" entre SaaS. Indie SaaS tem baseline diferente de enterprise.',
      "Otimizar cor de botão quando o diagnóstico está no nível do frame do título.",
    ],
    faqs: [
      {
        q: "Qual é uma boa taxa de conversão pra uma pricing page de SaaS especificamente?",
        a: 'Pricing pages convertem tipicamente a 2% a 8% dos visitantes que chegam nelas (não do tráfego total do site). A definição de conversão importa: "clicou Buy" vs "completou o pagamento" diferem em 40% a 70%.',
      },
      {
        q: "Como sei se o problema é meu tráfego ou minha página?",
        a: "Se a conversão está abaixo de 1% mas o engajamento (tempo na página, scroll depth) está saudável, a página está ok e o tráfego é o problema. Se o engajamento também está fraco (menos de 30 segundos, menos de 30% de scroll), o problema é a página.",
      },
      {
        q: "A definição de taxa de conversão inclui signups de free trial?",
        a: 'A convenção varia. A definição Brunson conta o momento em que um comprador se compromete a algo irreversível (pagamento, ligação agendada). Signups de free trial são "micro-conversões" e convertem a taxas mais altas (5% a 25%), mas a conversão paga é o número que carrega o peso.',
      },
    ],
    sourceNote:
      "Faixa baseada nos dados observados pelo founder através de 41 funnel teardowns de indie SaaS publicados entre janeiro e maio de 2026, cruzada com benchmarks públicos do Baymard Institute e a pesquisa 2024 de operadores indie da ConvertKit. Use como âncora direcional, não como previsão.",
  },
  {
    slug: "checkout-completion-rate",
    metric: "taxa de conclusão de checkout",
    metaTitle: "Taxa média de conclusão de checkout (SaaS)",
    metaDescription:
      "A conclusão de checkout em indie SaaS (clique em Buy ao pagamento bem-sucedido) fica em 40% a 70% sobre tráfego frio. Abaixo de 40% significa que a oferta está sendo relitigada no checkout.",
    aeoAnswer:
      'A conclusão de checkout em tráfego frio para indie SaaS (a conversão do clique em "Buy" ao pagamento bem-sucedido) fica entre 40% e 70%. Abaixo de 40% quase sempre significa que a oferta está sendo relitigada no checkout — o preço não foi ancorado upstream. Acima de 70% sobre tráfego frio normalmente significa que o preço é baixo demais pra agir como âncora séria.',
    bands: [
      {
        label: "Underperforming",
        range: "Menos de 40%",
        diagnosis:
          'A oferta está sendo relitigada no checkout. O preço não foi ancorado na landing page, então o comprador chega no checkout perguntando "vale a pena?" em vez de "como eu pago?".',
      },
      {
        label: "Typical range",
        range: "40% a 70%",
        diagnosis:
          "Fluxo de checkout saudável. As otimizações (Apple Pay, menos campos de formulário, layout mobile-first) movem dentro dessa banda; mudanças no nível da oferta não são o gargalo.",
      },
      {
        label: "Outperforming",
        range: "Mais de 70%",
        diagnosis:
          "O preço está sem âncora (baixo) ou o tráfego está muito pré-vendido (referral morno, cliente recorrente). Verifique se sua oferta tem preço pelo valor que você de fato entrega.",
      },
    ],
    drivers: [
      "Visibilidade do preço na página ANTES do botão Buy (driver enorme)",
      "Presença do Stack Slide (configura a âncora de preço)",
      "Garantia exposta no próprio passo do checkout, não enterrada na FAQ",
      "Número de campos do formulário (cada campo extra acima de 2 reduz a conclusão 5% a 15%)",
      "Velocidade do checkout mobile (abaixo de 60 segundos ponta a ponta)",
    ],
    misreadings: [
      'Confundir "cart abandonment" (carrinho salvo não concluído em 24h) com "checkout abandonment" (Buy clicado, pagamento não concluído na sessão). São métricas diferentes.',
      'Tratar a disponibilidade do Apple Pay como um "fix" quando o diagnóstico está upstream no enquadramento da oferta.',
      "Ler a taxa de conclusão em menos de 100 clicks em Buy. Precisa de 200+ pra taxa estabilizar.",
    ],
    faqs: [
      {
        q: "O Apple Pay realmente sobe a conclusão de checkout?",
        a: "Sim, marginalmente. A disponibilidade do Apple Pay sobe a conclusão mobile em 5 a 15 pontos percentuais sobre tráfego morno. Não conserta um diagnóstico de Weak Offer ou Weak Belief upstream. Adicione depois que as causas upstream estiverem resolvidas.",
      },
      {
        q: "Quanto os campos do formulário importam de verdade?",
        a: 'Muito. Cada campo de formulário acima de email + pagamento reduz a conclusão 5% a 15%. O campo "só coleta o endereço pro envio" num produto digital custa 10% a 20% das conclusões. Seja impiedoso.',
      },
      {
        q: "Por que minha taxa de checkout B2B é tão mais baixa que B2C?",
        a: "O checkout B2B costuma envolver um passo de procurement ou aprovação de um gestor, o que estica o tempo até a conclusão de minutos pra semanas. O conserto Brunson é expor o caminho procurement-friendly (nota fiscal, licença multi-assento) com destaque pra que o caminho até a conclusão fique visível.",
      },
    ],
    sourceNote:
      "Faixa baseada na pesquisa de cart-abandonment do Baymard Institute e na faixa observada pelo founder em 41 teardowns de indie SaaS. O Baymard publica a média universal; o subset indie SaaS roda 5 a 10 pontos acima do baseline de ecommerce por causa de tráfego com mais intenção.",
  },
  {
    slug: "tripwire-conversion-rate",
    metric: "taxa de conversão de tripwire",
    metaTitle: "Taxa média de conversão de tripwire (Ofertas de $1)",
    metaDescription:
      "A conversão de tripwire sobre tráfego frio fica em 3% a 12% para tripwires SaaS abaixo de $10. Abaixo de 3% parece armadilha; acima de 12% filtra tire-kickers.",
    aeoAnswer:
      "A conversão de tripwire em tráfego frio para indie SaaS fica entre 3% e 12% para tripwires precificados abaixo de $10. Abaixo de 3% significa que a oferta parece armadilha (a conta não fecha pro comprador). Acima de 12% normalmente significa que o tripwire está filtrando tire-kickers que não vão upar pra oferta core.",
    bands: [
      {
        label: "Underperforming",
        range: "Menos de 3%",
        diagnosis:
          'A promessa do tripwire é grande demais pro preço. O leitor assume armadilha. Ajuste o tamanho da promessa ou adicione "uma única vez, sem assinatura" textual no botão de compra.',
      },
      {
        label: "Typical range",
        range: "3% a 12%",
        diagnosis:
          "Tripwire saudável. A conta parece honesta pro leitor e converte numa taxa que enche o topo da value ladder.",
      },
      {
        label: "Outperforming",
        range: "Mais de 12%",
        diagnosis:
          "O tripwire está convertendo tire-kickers. Verifique a taxa de conversão de tripwire pra core. Se está abaixo de 5%, o tripwire está filtrando o cohort errado.",
      },
    ],
    drivers: [
      "Razão promessa-pra-preço (o fator único que mais carrega peso)",
      'Texto explícito de "uma única vez, sem assinatura" no botão de compra',
      "Caminho natural-próximo-passo pra oferta core",
      "Velocidade de entrega (abaixo de 90 segundos do pagamento ao acesso)",
      "Visibilidade da política de reembolso",
    ],
    misreadings: [
      "Ler a conversão do tripwire isoladamente. A métrica que importa é tripwire-pra-core, não tripwire-pra-qualquer-um.",
      "Baixar o preço pra consertar a conversão quando o diagnóstico é parece-armadilha. Um preço mais baixo não conserta um problema de conta-parece-fake.",
      "Comparar a conversão do tripwire com a conversão da landing page. São passos diferentes do funnel com baselines diferentes.",
    ],
    faqs: [
      {
        q: "Qual é o preço certo pra um tripwire?",
        a: "$1 a $7 se a promessa é uma única coisa finalizada e acotada. $7 a $27 se a promessa é um compromisso de vários dias. Acima de $27 a oferta deixa de ser tripwire e deve ser precificada como oferta core.",
      },
      {
        q: "O tripwire deve ter upsell?",
        a: "Quase sempre. A taxa de aceite do OTO num tripwire é tipicamente 15% a 35%, que muitas vezes supera a receita do front-end. Um tripwire sem OTO está deixando mais dinheiro na mesa do que o tripwire em si gera.",
      },
      {
        q: "Que taxa de conversão de tripwire-pra-core eu devo esperar?",
        a: "5% a 15% dos compradores de tripwire upgradeiam pra oferta core em 30 dias. Abaixo de 5% significa que a ladder está quebrada (sem natural-next-step). Acima de 15% normalmente significa que o tripwire era redundante — os compradores teriam comprado o core direto.",
      },
    ],
    sourceNote:
      "Faixa baseada nos dados observados pelo founder em 41 teardowns de indie SaaS e validada contra os padrões Brunson de tripwire documentados em DotCom Secrets. Use como âncora direcional especificamente pra indie SaaS; tripwires de ecommerce (trial de produto físico) rodam baselines diferentes.",
  },
  {
    slug: "email-open-rate",
    metric: "taxa de abertura de email",
    metaTitle: "Taxa média de abertura de email (Founder SaaS)",
    metaDescription:
      "Taxas de abertura de lista engajada para emails de founder indie SaaS ficam em 30% a 55%. Abaixo de 30% é quase sempre deliverability, não subject lines.",
    aeoAnswer:
      "Taxas de abertura de lista engajada para emails de founder indie SaaS ficam entre 30% e 55%. Abaixo de 30% é quase sempre um problema de deliverability (alinhamento de SPF/DKIM/DMARC ou envio pra cauda desengajada), não um problema de subject line. Acima de 55% normalmente significa que a lista é pequena e bem curada.",
    bands: [
      {
        label: "Underperforming",
        range: "Menos de 30%",
        diagnosis:
          "Problema de deliverability primeiro. Passe o domínio de envio pelo mail-tester.com. Score abaixo de 8/10 indica desalinhamento de SPF, DKIM ou DMARC. Conserte isso antes de mexer em subject lines.",
      },
      {
        label: "Typical range",
        range: "30% a 55%",
        diagnosis:
          "Taxa de abertura saudável. Refinos de subject line e mudanças de nome do sender movem dentro dessa banda. Abaixo de 40% sugere espaço pra melhorar especificidade do subject; acima de 50% é excelente pra maturidade de lista fria.",
      },
      {
        label: "Outperforming",
        range: "Mais de 55%",
        diagnosis:
          "Lista pequena bem curada, ou cohort morno (assinantes pagos, clientes recentes). Verifique por segmento: assinantes adquiridos a frio não deveriam abrir a 55%+ consistentemente.",
      },
    ],
    drivers: [
      "Deliverability (alinhamento SPF/DKIM/DMARC) — o driver dominante abaixo de 30%",
      "Nome do sender (nome do founder ganha do nome da marca por 15% a 40%)",
      "Especificidade do subject line (entregável específico ganha de enquadramento vago de newsletter)",
      "Higiene da lista (mandar só pro segmento engajado)",
      "Frequência de envio (2 a 4 por semana é o sweet spot)",
    ],
    misreadings: [
      "Apple Mail Privacy Protection infla as taxas de abertura em 20 a 40 pontos percentuais em listas iOS-pesadas. Trate aberturas do Apple Mail como talvez-aberturas, não como aberturas.",
      "Ler a taxa de abertura sem a taxa de clique. A taxa de clique é a métrica que carrega peso; as aberturas são barulhentas.",
      "Otimizar subject lines quando o diagnóstico é deliverability. Subject lines movem aberturas 5 a 15 pontos percentuais; deliverability move 30 a 50.",
    ],
    faqs: [
      {
        q: "Por que minhas taxas de abertura estão caindo mesmo que meu conteúdo seja o mesmo?",
        a: "Quase sempre envelhecimento da lista. Os assinantes ficam dormentes ao longo de meses; mandar pra assinantes dormentes machuca a deliverability, o que suprime aberturas na cauda engajada. Segmente fora os assinantes dormentes (sem abertura em 90 dias) e mande só pro segmento engajado por 2 semanas.",
      },
      {
        q: "Devo mandar do meu próprio nome ou do nome da minha marca?",
        a: '"Maryan do Unlock SaaS" ganha de "Unlock SaaS Team" por 15% a 40% em aberturas. O leitor compra a relação antes de comprar a marca.',
      },
      {
        q: "Quão precisa é a inflação de taxa de abertura da Apple?",
        a: "Difícil de medir com precisão, mas a maior parte dos operadores vê taxas de abertura iOS 20 a 40 pontos percentuais maiores que leituras reais (a Apple pré-carrega imagens sem importar se o usuário abriu o email). Trate a taxa de clique como o sinal honesto de engajamento.",
      },
    ],
    sourceNote:
      "Faixa baseada nos benchmarks 2024 de criadores indie da ConvertKit e validada contra dados observados pelo founder em operações de newsletter pessoais. Exclui a inflação por Apple Mail Privacy Protection onde possível.",
  },
  {
    slug: "email-click-rate",
    metric: "taxa de clique de email",
    metaTitle: "Taxa média de clique de email (Founder SaaS)",
    metaDescription:
      "Taxas de clique de lista engajada para emails de founder indie SaaS ficam em 3% a 12%. Abaixo de 3% significa que o CTA não está amarrado a um resultado específico do leitor.",
    aeoAnswer:
      "Taxas de click-through para emails de founder indie SaaS ficam entre 3% e 12% das aberturas. Abaixo de 3% quase sempre significa que o CTA não está amarrado a um resultado específico do leitor. Acima de 12% normalmente significa cohort morno (assinantes pagos, clientes recentes) ou um email de Soap Opera Sequence onde o clique é parte do arco narrativo.",
    bands: [
      {
        label: "Underperforming",
        range: "Menos de 3%",
        diagnosis:
          'O CTA é genérico ("dá uma olhada", "saiba mais"). Um copy de CTA específico amarrado a um resultado do leitor move essa banda na hora.',
      },
      {
        label: "Typical range",
        range: "3% a 12%",
        diagnosis:
          "Taxa de clique saudável. O email está fazendo o trabalho e o CTA é específico o suficiente pra agir. Refinos (posição do link, botão vs texto, linha P.S.) movem dentro dessa banda.",
      },
      {
        label: "Outperforming",
        range: "Mais de 12%",
        diagnosis:
          "Cohort morno ou payoff do arco narrativo. O clique penúltimo de um email Soap Opera pode bater 20%+ porque a sequência construiu momentum.",
      },
    ],
    drivers: [
      'Especificidade do CTA (amarrado ao resultado do leitor ganha de "saiba mais")',
      "Posição do link (above the fold, mais um perto do final)",
      "Linha P.S. (subutilizada; muitas vezes o elemento mais clicado)",
      "Plain-text vs HTML (plain-text costuma superar HTML pesado)",
      "Posição na sequência (emails mais tardios da sequência costumam ter taxas de clique mais altas)",
    ],
    misreadings: [
      "Ler a taxa de clique sem separar por posição na sequência. Emails 3 e 4 da Soap Opera devem clicar mais alto que o email 1.",
      'Confundir "click rate" (cliques por entregue) com "click-to-open rate" (cliques por abertura). A segunda costuma ser 2 a 3x a primeira.',
      "Otimizar cor de botão quando o diagnóstico é o copy do CTA.",
    ],
    faqs: [
      {
        q: "Devo incluir mais ou menos links por email?",
        a: 'Menos, quase sempre. Um CTA primário mais um link P.S. pro mesmo destino supera três links competindo. A exceção é um email curado tipo "melhores da semana" onde o formato em si promete múltiplos links.',
      },
      {
        q: "Botões são melhores que links de texto?",
        a: "Botões costumam superar links de texto 1.5 a 2x na mesma oferta. A exceção é no padrão Seinfeld Email onde um email casual do founder soa mais autêntico com um único link de texto. Case o formato com a voz do email.",
      },
      {
        q: "Como melhoro cliques numa lista plana?",
        a: "Quase sempre upstream: melhore a taxa de abertura primeiro (deliverability + nome do sender), depois refine o CTA. Uma taxa de clique plana numa lista com taxa de abertura de 20% é difícil de diagnosticar porque o sample é pequeno demais.",
      },
    ],
    sourceNote:
      "Faixa baseada nos benchmarks 2024 de operadores indie da ConvertKit pra criadores com 1.000 a 25.000 assinantes. Validada contra dados observados pelo founder em Soap Opera Sequence e Seinfeld Email.",
  },
  {
    slug: "trial-to-paid-conversion",
    metric: "conversão de trial pra pago",
    metaTitle: "Conversão média de trial pra pago (SaaS)",
    metaDescription:
      "A conversão de trial pra pago de indie SaaS fica em 8% a 25% pra free trials e 30% a 60% pra trials de $1. A ativação é o driver dominante.",
    aeoAnswer:
      'A conversão de trial pra pago para indie SaaS fica entre 8% e 25% pra free trials e entre 30% e 60% pra trials de $1 (onde o usuário já entrou um cartão). O driver dominante é o momento de ativação na primeira sessão, não o follow-up por email. Um usuário que chega num momento "aha" na sessão um converte a 2 a 4x a taxa de um que não chega.',
    bands: [
      {
        label: "Underperforming",
        range: "Menos de 8% (free trial) / Menos de 30% (trial de $1)",
        diagnosis:
          "O momento de ativação não está construído no fluxo do trial. O usuário se inscreve, dá uma olhada e quica antes de chegar no ponto onde o valor é óbvio.",
      },
      {
        label: "Typical range",
        range: "8% a 25% (free trial) / 30% a 60% (trial de $1)",
        diagnosis:
          "Conversão de trial saudável. Refinos no fluxo de onboarding e melhorias no momento de ativação compõem aqui. O follow-up por email tem papel de suporte.",
      },
      {
        label: "Outperforming",
        range: "Mais de 25% (free trial) / Mais de 60% (trial de $1)",
        diagnosis:
          "Cohort de trial muito pré-vendido (referral morno, usuário recorrente) ou um produto cujo valor se revela na primeira sessão por design.",
      },
    ],
    drivers: [
      "Tempo até ativação (o momento de valor óbvio na sessão um)",
      "Tipo de trial (trial de $1 vs free trial — a diferença é 3 a 4x)",
      "Design do fluxo de onboarding (guiado > self-serve > nada)",
      "Soap Opera Sequence por email durante o trial",
      "Outreach liderado pelo founder pra SaaS de alto ticket ($99+/mês)",
    ],
    misreadings: [
      "Ler a conversão do trial sem separar usuários ativados vs não ativados. A conversão dos ativados costuma ser 5 a 10x a dos não ativados.",
      "Otimizar o email de fim de trial quando o diagnóstico é a ativação. O email é late game; a ativação é a primeira jogada.",
      "Comparar conversão de free trial com conversão de trial de $1. A diferença de 4x é estrutural, não otimizável.",
    ],
    faqs: [
      {
        q: "Devo usar trial de $1 ou free trial?",
        a: "Depende do ICP. Trial de $1 pré-qualifica compradores sérios e converte a 3 a 4x a taxa; free trial joga rede mais ampla e traz mais usuários de trial. Pra SaaS de alto ticket ($49+/mês), trial de $1 quase sempre ganha em qualidade de cohort.",
      },
      {
        q: "Quão longo deve ser o trial?",
        a: "7 dias pra SaaS simples, 14 dias pra complexidade moderada, 30 dias pra ferramentas enterprise. Trials mais longos não aumentam a conversão — aumentam o percentual de usuários que nunca ativam. A maioria dos usuários decide nas primeiras 48 horas independente da duração.",
      },
      {
        q: "Devo estender um trial que não ativou?",
        a: 'Uma vez, com outreach liderado pelo founder. "Vi que você se inscreveu mas não fez X ainda — posso ajudar?" converte 10% a 25% sobre trials não ativados. Extensão automática sem outreach quase nunca converte; o usuário já perdeu o interesse.',
      },
    ],
    sourceNote:
      "Faixa baseada em múltiplos benchmarks públicos de indie SaaS (pesquisa PMF do Lenny Rachitsky, relatório de SaaS metrics da ProfitWell) e dados observados pelo founder em 41 teardowns. A faixa do trial de $1 é enviesada pra implementações de value ladder Brunson.",
  },
  {
    slug: "saas-churn-rate",
    metric: "taxa de churn de SaaS",
    metaTitle: "Taxa média mensal de churn de SaaS (Indie)",
    metaDescription:
      "O churn mensal de indie SaaS fica em 5% a 12% pra SMB e 3% a 7% pra B2B mid-market. A desagregação por cohort importa mais que o número-manchete.",
    aeoAnswer:
      "O churn mensal pra indie SaaS fica entre 5% e 12% pra produtos focados em SMB e 3% a 7% pra B2B mid-market. O número-manchete é quase sempre enganoso — a desagregação por cohort (pago vs free trial, mensal vs anual, ICP-fit vs ICP-miss) conta a história real. Um churn-manchete de 10% escondendo um churn ICP-miss de 25% é um problema de positioning, não de produto.",
    bands: [
      {
        label: "Underperforming",
        range: "Mais de 12% mensal (SMB) / Mais de 7% mensal (B2B mid-market)",
        diagnosis:
          "Ou o positioning atrai signups wrong-fit (o mais comum) ou o momento de ativação não é forte o suficiente pra reter. Cheque o churn dos primeiros 30 dias separado do churn de estado estável.",
      },
      {
        label: "Typical range",
        range: "5% a 12% mensal (SMB) / 3% a 7% mensal (B2B)",
        diagnosis:
          "Churn normal de indie SaaS. Otimizações em emails de retenção, prompts de upgrade e fluxos de reativação compõem aqui. O trabalho de ICP-fit te tira da banda.",
      },
      {
        label: "Outperforming",
        range: "Menos de 5% mensal (SMB) / Menos de 3% mensal (B2B)",
        diagnosis:
          "Encaixe excelente. Normalmente um mix de clientes pesado em anual (planos anuais churnam 3 a 5x menos que mensais), ou um produto cujo valor se revela com o tempo e cria custo de troca.",
      },
    ],
    drivers: [
      "Encaixe com o ICP (o driver dominante, de longe)",
      "Mix de planos anual vs mensual (anual churna 3 a 5x menos)",
      "Ativação dos primeiros 30 dias (prevê o churn de estado estável)",
      "Campanhas de reativação pra usuários dormentes",
      "Encaixe honesto de preço (downgrades > cancelamentos totais)",
    ],
    misreadings: [
      "Olhar o churn-manchete mensal sem separar cohorts. Clientes anuais, mensais e os convertidos do trial têm baselines diferentes.",
      "Confundir churn voluntário (cancelamentos) com churn involuntário (pagamentos falhos). O churn involuntário se conserta com lógica de retry, não com trabalho de retenção.",
      'Ler o churn depois de 30 dias como um número "consertável". Os primeiros 30 dias são ativação; o churn de estado estável é a métrica de retenção.',
    ],
    faqs: [
      {
        q: "Devo focar em reduzir churn ou aumentar aquisição?",
        a: "Se o churn mensal está acima de 10%, reduza churn primeiro. Aquisição num balde que vaza é não-lucrativa. Abaixo de 7%, aquisição compõe. O padrão value ladder Brunson diz: o back-end (retenção, upsell) paga o front-end (aquisição), não o contrário.",
      },
      {
        q: "Qual a melhor forma de reduzir churn voluntário?",
        a: "Fluxos pré-cancelamento que oferecem pausa, downgrade ou ajuda específica por caso de uso convertem 20% a 40% dos cancelamentos. O driver dominante é se o usuário chegou no momento de ativação; usuários que nunca ativaram cancelam e não são salvos por um fluxo pré-cancel.",
      },
      {
        q: "Quanto do churn é involuntário (pagamentos falhos)?",
        a: "Tipicamente 20% a 40% do churn total é involuntário (cartão recusado, vencido, etc.). Lógica de retry inteligente (múltiplas tentativas em 7 dias) recupera 50% a 70% do churn involuntário. Esse é trabalho de infraestrutura de alto ROI, não de retenção.",
      },
    ],
    sourceNote:
      "Faixa baseada nos benchmarks 2024 de SaaS da ProfitWell, na pesquisa PMF do Lenny Rachitsky e na faixa observada pelo founder em teardowns. As bandas SMB e B2B mid-market são aproximadamente inversas ao tamanho do deal.",
  },
  {
    slug: "webinar-show-up-rate",
    metric: "taxa de comparecimento em webinar",
    metaTitle: "Taxa média de comparecimento em webinar (Benchmarks ao vivo)",
    metaDescription:
      "Taxas de comparecimento em webinars ao vivo ficam em 25% a 50% das inscrições. Abaixo de 25% significa que o título prometeu demais; acima de 50% significa jogo pesado de lembretes.",
    aeoAnswer:
      "Taxas de comparecimento em webinars ao vivo pra indie SaaS ficam entre 25% e 50% das inscrições. Abaixo de 25% normalmente significa que a página de inscrição prometeu mais do que o conteúdo entrega. Acima de 50% quase sempre significa uma sequência de lembretes pesada (3+ toques nas 48 horas pré-evento) mais um calendar block.",
    bands: [
      {
        label: "Underperforming",
        range: "Menos de 25%",
        diagnosis:
          "A página de inscrição prometeu mais do que o webinar entrega. O inscrito decide não aparecer entre a inscrição e o ao vivo. Cheque o match entre título e conteúdo.",
      },
      {
        label: "Typical range",
        range: "25% a 50%",
        diagnosis:
          "Taxa de comparecimento saudável. Sequência de lembretes (2 a 3 emails, um SMS pra alto ticket) move essa banda. Calendar block na página de inscrição ajuda na metade superior.",
      },
      {
        label: "Outperforming",
        range: "Mais de 50%",
        diagnosis:
          "Jogo pesado de lembretes, inscrição paga, ou ligação de qualificação pré-evento. Comum pra webinars de oferta de alto ticket ($1K+).",
      },
    ],
    drivers: [
      "Sequência de lembretes (o maior driver movível)",
      "Calendar block na página de inscrição",
      "Match título-conteúdo (prometer demais afunda o comparecimento)",
      "Encaixe de horário com a audiência",
      "Disponibilidade de replay (paradoxalmente, SEM replay = comparecimento mais alto)",
    ],
    misreadings: [
      "Ler a taxa de comparecimento sem considerar o comportamento do replay-viewer. Viewers de replay e participantes ao vivo são cohorts diferentes.",
      "Comparar comparecimento de webinar grátis com webinar pago. Webinars pagos rodam 60% a 85% de comparecimento; grátis rodam 25% a 50%.",
      'Tratar baixo comparecimento como problema de "subject line". Quase sempre é problema de promessa-vs-entrega.',
    ],
    faqs: [
      {
        q: "Devo oferecer replay?",
        a: "Sim, com expiração de 48 horas. Sem replay maximiza o comparecimento ao vivo; replay ilimitado afunda. A janela de replay de 48 horas é o padrão do Perfect Webinar de Brunson — preserva a urgência sem punir conflitos razoáveis de agenda.",
      },
      {
        q: "Qual o melhor dia e horário pra um webinar?",
        a: "Pra B2C, noites de dia útil (19-21h local). Pra B2B, terça ou quarta de manhã (10-12h local). Evite segunda de manhã (catch-up de calendário) e sexta à tarde (cognitive offload). O horário move o comparecimento 5 a 15 pontos percentuais.",
      },
      {
        q: "Quantos emails de lembrete devo mandar?",
        a: 'Três: um em 24 horas, um em 1 hora, um em "começando agora". Lembrete por SMS em 1 hora pode subir o comparecimento outros 5 a 10 pontos percentuais se a audiência optou em SMS. Mais de três lembretes treinam a audiência a ignorar.',
      },
    ],
    sourceNote:
      "Faixa baseada em implementações do Perfect Webinar de Brunson e na faixa observada pelo founder em webinars de coaching de alto ticket. As bandas de webinar grátis assumem inscrição genuinamente grátis (sem gating de email além do formulário).",
  },
  {
    slug: "saas-mrr-growth-rate",
    metric: "taxa de crescimento de MRR de SaaS",
    metaTitle: "Taxa média mensal de crescimento de MRR (Indie SaaS)",
    metaDescription:
      "O crescimento mensal de MRR de indie SaaS fica em 5% a 15% em MRR de $1K-$10K e 3% a 8% em $10K-$100K. O crescimento desacelera com a escala.",
    aeoAnswer:
      "O crescimento mensal de MRR pra indie SaaS fica em 5% a 15% durante o estágio de $1K-$10K, 3% a 8% durante $10K-$100K, e 1% a 4% acima de $100K MRR. A desaceleração é estrutural — o mesmo número de clientes novos representa um percentual de crescimento menor conforme o MRR escala. Composto a 5%/mês rende ~80% YoY.",
    bands: [
      {
        label: "Underperforming",
        range: "Menos de 5%/mês em $1K-$10K MRR / Menos de 3%/mês em $10K-$100K MRR",
        diagnosis:
          "Ou a aquisição estagnou ou o churn está comendo os novos clientes adicionados. Olhe MRR-novo-líquido (novo menos churnado) e MRR-novo-bruto separados.",
      },
      {
        label: "Typical range",
        range: "5% a 15%/mês em $1K-$10K / 3% a 8%/mês em $10K-$100K",
        diagnosis:
          "Crescimento saudável de indie SaaS. O funnel está compondo. Novos clientes cobrem o churn mais adicionam MRR líquido. Faixa operacional padrão.",
      },
      {
        label: "Outperforming",
        range: "Mais de 15%/mês em $1K-$10K / Mais de 8%/mês em $10K-$100K",
        diagnosis:
          "Crescimento quente. Mecânicas virais, partnership-driven ou tailwind sazonal. Verifique sustentabilidade antes de tratar como o novo baseline.",
      },
    ],
    drivers: [
      "MRR-novo-líquido vs MRR-novo-bruto (a diferença é o churn)",
      "Mix de planos anuais (anual suaviza volatilidade do crescimento)",
      "Diversificação de canais de aquisição (um canal = um risco)",
      "Receita de expansão (upgrades de clientes existentes)",
      "Retenção por cohort (melhor retenção = o MRR compõe)",
    ],
    misreadings: [
      "Ler o crescimento de MRR sem separar MRR novo de MRR de expansão. São drivers diferentes.",
      "Comparar com benchmarks de empresas SaaS públicas. Bessemer e ProfitWell publicam números enviesados pra empresas com financiamento. Baselines indie são diferentes.",
      "Tratar volatilidade mês-a-mês como tendência. MRR de SaaS é barulhento em escala indie; média móvel de 3 meses é mais útil.",
    ],
    faqs: [
      {
        q: "Quanto tempo leva pra ir de $1K a $10K MRR?",
        a: "Com 10% de crescimento mensal, ~24 meses. Com 15%, ~16 meses. Com 5%, ~48 meses. A maioria dos indie SaaS leva 18 a 36 meses de $1K a $10K. A variância é dominada pela velocidade de encaixe com o ICP, não pelo ritmo de envio de features.",
      },
      {
        q: "Crescimento de MRR é a métrica certa ou ARR é melhor?",
        a: "MRR pra indie SaaS até $100K ARR. A visão de ARR entra em cena por volta de $250K quando planos anuais viram um mix significativo. A visão mensal é mais sensível a mudanças e surfa problemas mais rápido.",
      },
      {
        q: "Quanto churn vs aquisição deve contribuir pro crescimento de MRR?",
        a: "Pra um indie SaaS saudável a $10K MRR com 7% de churn mensal: ~$700 de churn mensal precisam ser substituídos antes de qualquer crescimento. A aquisição precisa fazer $1.200+/mês pra crescer 5%. Essa conta é por que reduzir churn muitas vezes ganha de gastar em aquisição.",
      },
    ],
    sourceNote:
      "Faixa baseada no relatório benchmark 2024 de SaaS da ProfitWell, na pesquisa indie SaaS do Lenny Rachitsky e em dados observados pelo founder em 41 teardowns. Exclui empresas com financiamento de venture cujo perfil de crescimento é estruturalmente diferente.",
  },
  {
    slug: "average-order-value",
    metric: "valor médio do pedido (AOV)",
    metaTitle: "Benchmarks de Average Order Value (Indie SaaS + Info Products)",
    metaDescription:
      "O AOV de indie SaaS fica em $9-$99/mês pra assinaturas e $27-$497 pra produtos de info. A presença do Stack Slide move o AOV mais que testes de preço.",
    aeoAnswer:
      "O AOV de assinatura pra indie SaaS fica entre $9 e $99 mensais pra produtos self-serve e $99 a $999 pra tiers assistidos por vendas. O AOV de produtos de info fica entre $27 e $497 pra compras únicas. A presença do Stack Slide na pricing page move o AOV 30% a 80% mais que qualquer otimização de price point.",
    bands: [
      {
        label: "Underperforming",
        range: "Menos de $19/mês assinatura / Menos de $27 produto de info",
        diagnosis:
          "O preço está abaixo do valor entregue. Ou não tem Stack Slide na página (então o preço está sem âncora e baixo) ou a oferta em si está construída de menos. Adicione Stack primeiro, suba o preço depois.",
      },
      {
        label: "Typical range",
        range: "$19-$99/mês assinatura / $27-$497 produto de info",
        diagnosis:
          "Pricing saudável pra indie SaaS. A presença do Stack Slide e mecânicas de OTO podem subir o AOV dentro dessa banda. Testes de preço além dessa banda exigem mudanças no stack da oferta.",
      },
      {
        label: "Outperforming",
        range: "Mais de $99/mês assinatura / Mais de $497 produto de info",
        diagnosis:
          "Positioning premium (nicho de especialidade, founder de alta confiança) ou fechamento assistido por vendas. Self-serve nesse preço exige trabalho excepcional de Stack Slide.",
      },
    ],
    drivers: [
      "Presença do Stack Slide na pricing page (o driver dominante)",
      "Disponibilidade de planos anuais (clientes anuais têm AOV 8 a 12x maior)",
      "Taxa de aceite do OTO depois da compra inicial",
      "Especificidade do nicho (especialista > generalista em pricing power)",
      "Sinal de confiança do founder (founder nomeado, prova datada)",
    ],
    misreadings: [
      "Ler o AOV entre tiers de pricing misturados sem segmentar. Self-serve e assistido por vendas têm baselines diferentes.",
      "Comparar com AOV de SaaS público. A maioria do SaaS público é enterprise; baselines indie são 5 a 50x mais baixos.",
      "Baixar o preço pra consertar a conversão quando o diagnóstico é o stack da oferta. Preço mais baixo não conserta valor sem âncora.",
    ],
    faqs: [
      {
        q: "Devo subir meus preços?",
        a: "Quase sempre sim pra indie SaaS abaixo de $49/mês. O preço raramente é o blocker de conversão; o Stack Slide é. A maioria dos founders deve subir preço 30% a 50% E adicionar um Stack Slide simultaneamente. A conversão geralmente se mantém, o AOV pula.",
      },
      {
        q: "Como sei se meu preço está baixo demais?",
        a: "Três sinais: clientes não pechincham (preço baixo), clientes não churnam por razões de preço (baixo), e sua margem bruta não banca trabalho full-time (definitivamente baixo). Se os três são verdadeiros, suba o preço.",
      },
      {
        q: "Devo oferecer planos anuais com desconto?",
        a: "Quase sempre. Planos anuais churnam 3 a 5x menos que mensais, então o desconto se paga em retenção. 15% a 25% off pra anual é a faixa padrão; descontos mais profundos (40%+) costumam atrair price-shoppers e não compõem.",
      },
    ],
    sourceNote:
      "Faixa baseada em benchmarks SaaS da ProfitWell, relatórios de economia de criadores da ConvertKit e dados observados pelo founder. Exclui SaaS enterprise e empresas growth-stage com financiamento de venture.",
  },
  {
    slug: "customer-acquisition-cost",
    metric: "custo de aquisição de cliente (CAC)",
    metaTitle: "Benchmarks de Customer Acquisition Cost (Indie SaaS)",
    metaDescription:
      "O CAC de indie SaaS fica em $30-$300 pra self-serve e $500-$3.000 pra assistido por vendas. A razão LTV:CAC importa mais que o número absoluto.",
    aeoAnswer:
      "O custo de aquisição de clientes pra indie SaaS fica entre $30 e $300 pra produtos self-serve e $500 a $3.000 pra tiers assistidos por vendas. O CAC absoluto importa menos que a razão LTV:CAC (alvo 3:1 ou melhor). Indie SaaS com canais fortes de orgânico / conteúdo / referral costumam rodar CAC abaixo de $50.",
    bands: [
      {
        label: "Underperforming",
        range: "LTV:CAC abaixo de 2:1",
        diagnosis:
          "A aquisição é não-lucrativa ou marginalmente lucrativa. Ou o CAC está alto demais ou o LTV está baixo demais (churn alto, expansão baixa). Os dois são consertáveis; o diagnóstico deve ser qual alavanca.",
      },
      {
        label: "Typical range",
        range: "LTV:CAC entre 2:1 e 5:1",
        diagnosis:
          "Unit economics saudáveis. A maioria dos indie SaaS opera aqui. Otimizações em retenção (subindo LTV) e mix de canais (baixando CAC) compõem a razão.",
      },
      {
        label: "Outperforming",
        range: "LTV:CAC acima de 5:1",
        diagnosis:
          "Aquisição dominada por orgânico ou retenção excepcional. O risco é subinvestir em aquisição. A maioria dos operadores com 5:1+ provavelmente deveria gastar mais em crescimento.",
      },
    ],
    drivers: [
      "Mix de canais (orgânico > referral > pago)",
      "Força da marca (CAC menor pro mesmo volume)",
      "Precisão do ICP (melhor encaixe = custo de aquisição menor)",
      "Movimento de vendas (self-serve mais barato que assistido por vendas)",
      "Taxa de conversão em cada passo do funnel",
    ],
    misreadings: [
      'Ler "CAC blendado" sem separar pago de orgânico. São estruturas de custo diferentes.',
      "Calcular CAC sem incluir o tempo do founder. Indie SaaS costuma subcontar o CAC real porque horas do founder não são precificadas.",
      "Comparar CAC entre categorias de SaaS sem normalizar. B2C, SMB e mid-market rodam baselines diferentes.",
    ],
    faqs: [
      {
        q: "Qual um bom período de payback?",
        a: "Abaixo de 12 meses pra indie SaaS, abaixo de 18 meses como teto absoluto. Acima de 18 meses, o negócio está financiando aquisição com capital, não com cash flow. A maioria dos indie SaaS deve mirar payback de 6 a 9 meses.",
      },
      {
        q: "Devo rodar ads pagos?",
        a: "Só depois dos canais orgânicos e de referral estarem saturados E a razão LTV:CAC banca. A maioria dos indie SaaS roda ads pagos cedo demais, antes do funnel estar convertendo bem. Conserte o funnel primeiro; escale com pago depois.",
      },
      {
        q: "Como baixo o CAC?",
        a: "Três alavancas: melhor targeting (CPC mais baixo, conversão mais alta), melhores landing pages (conversão mais alta) e diversificação de canais (menos dependência do canal mais caro). O frame Brunson diz: o funnel está upstream do canal.",
      },
    ],
    sourceNote:
      "Faixa baseada no State of Startups da First Round Capital, no BVP State of Cloud da Bessemer e em dados observados pelo founder. Bandas indie SaaS são aproximadamente 1/5 a 1/20 dos benchmarks com financiamento de venture.",
  },
  {
    slug: "lifetime-value",
    metric: "valor de tempo de vida do cliente (LTV)",
    metaTitle: "Benchmarks de Customer Lifetime Value (Indie SaaS)",
    metaDescription:
      "O LTV de indie SaaS fica em $200-$2.000 pra SMB self-serve e $5.000-$50.000 pra B2B mid-market. A conta do LTV é altamente sensível à taxa de churn.",
    aeoAnswer:
      "O LTV de indie SaaS fica entre $200 e $2.000 pra produtos SMB self-serve e entre $5.000 e $50.000 pra tiers B2B mid-market. O cálculo do LTV é extremamente sensível à taxa de churn usada — uma mudança de 1 ponto percentual no churn mensal desloca o LTV 20% a 40%. Use LTV baseado em cohort onde possível.",
    bands: [
      {
        label: "Underperforming",
        range: "Menos de $200 SMB / Menos de $5.000 B2B mid-market",
        diagnosis:
          "Ou o AOV está baixo demais (problema de price-stack) ou a taxa de churn está alta demais (problema de positioning ou ativação). O LTV é o output; os inputs são as alavancas.",
      },
      {
        label: "Typical range",
        range: "$200-$2.000 SMB / $5.000-$50.000 B2B mid-market",
        diagnosis:
          "LTV padrão de indie SaaS. Trabalho composto sobre AOV (Stack Slide, OTO, planos anuais) e retenção (ativação, reengajamento) move a banda.",
      },
      {
        label: "Outperforming",
        range: "Mais de $2.000 SMB / Mais de $50.000 B2B mid-market",
        diagnosis:
          "Positioning premium, receita de expansão alta ou nicho de especialidade. Verifique a conta do LTV contra a retenção real do cohort, não projeções modeladas.",
      },
    ],
    drivers: [
      "AOV (o input que carrega peso)",
      "Taxa de churn mensal (mudanças pequenas compõem massivamente)",
      "Mix de planos anuais (sobe AOV e reduz churn simultaneamente)",
      "Receita de expansão (upsells ao longo do tempo)",
      "Formato da curva de retenção do cohort",
    ],
    misreadings: [
      "Usar um único número de churn mensal pra projetar LTV. Curvas de churn reais são não lineares; churn early-cohort é mais alto que o de estado estável.",
      "Projetar LTV a partir de cohorts com menos de 12 meses. A conta é instável em dados curtos.",
      "Comparar LTV com CAC sem normalizar pelo tamanho do ciclo de venda. Ciclos longos inflam o LTV aparente injustamente.",
    ],
    faqs: [
      {
        q: "Como calculo o LTV corretamente?",
        a: 'Baseado em cohort, não plano. Pega um cohort de clientes do mês X, acompanha a retenção mensal, projeta pra um horizonte de 24 meses, multiplica pelo AOV. Evite o atalho "1 / taxa de churn" pra indie SaaS — assume churn plano, que não é verdade.',
      },
      {
        q: "Qual uma boa razão LTV:CAC?",
        a: "3:1 mínimo, 5:1 saudável, acima de 7:1 significa que você provavelmente deveria investir mais em aquisição. Abaixo de 3:1 significa que o negócio é não lucrativo por cliente; o conserto é ou baixar CAC ou subir LTV.",
      },
      {
        q: "Como anual vs mensal impactam o LTV?",
        a: "Significativamente. Planos anuais churnam 3 a 5x menos que mensais. Um cliente em mensal pode churnar a 7%/mês (LTV ~14 meses); o mesmo cliente em anual churna a 25%/ano (LTV ~4 anos). Planos anuais são a maior alavanca de LTV disponível.",
      },
    ],
    sourceNote:
      "Faixa baseada na pesquisa 2024 de retenção SaaS da ProfitWell e na faixa observada pelo founder em teardowns. Cálculos de LTV baseados em cohort recomendados ao invés de projeções planas 1/churn.",
  },
  {
    slug: "free-to-paid-conversion",
    metric: "conversão de free pra pago",
    metaTitle: "Conversão média de Free pra Paid (Freemium SaaS)",
    metaDescription:
      "A conversão free-pra-pago de freemium SaaS fica em 1% a 4% pra freemium amplo e 5% a 15% pra modelos product-led acotados.",
    aeoAnswer:
      "A conversão free-pra-pago pra freemium SaaS fica entre 1% e 4% pra modelos de freemium amplo e 5% a 15% pra modelos product-led acotados (onde o tier grátis é gateado pra um caso de uso específico). A diferença é estrutural: freemium amplo atrai usuários que nunca precisam upgradear; freemium product-led acotado força a decisão de upgrade num momento específico.",
    bands: [
      {
        label: "Underperforming",
        range: "Menos de 1%",
        diagnosis:
          "O tier grátis dá de graça o caso de uso que carrega peso. Usuários free não têm razão pra upgradear porque já estão pegando o que vieram buscar. Restrinja o tier grátis ou mude o trigger de upgrade.",
      },
      {
        label: "Typical range",
        range: "1% a 4% (freemium amplo) / 5% a 15% (PLG acotado)",
        diagnosis:
          "Conversão freemium padrão. O tier grátis está fazendo trabalho de aquisição; o tier pago está estruturado pro cohort que bate um limite específico ou quer uma feature específica.",
      },
      {
        label: "Outperforming",
        range: "Mais de 4% (amplo) / Mais de 15% (PLG acotado)",
        diagnosis:
          'O tier grátis está muito limitado (forçando upgrade antes) ou o tier pago resolve um problema "preciso disso agora". Verifique que o tier grátis ainda entrega valor pros não-upgraders.',
      },
    ],
    drivers: [
      "Onde o tier grátis termina (o driver dominante)",
      "Especificidade da value proposition do tier pago",
      "Prompts de upgrade dentro do produto (timing importa mais que copy)",
      "Soap Opera Sequence por email pra usuários free",
      "Outreach liderado pelo founder pra usuários free de alta intenção",
    ],
    misreadings: [
      "Ler free-pra-pago isoladamente. O funnel total de aquisição importa: quantos usuários free você adquiriu pra conseguir as conversões pagas?",
      'Confundir "product-led growth" (PLG) com "freemium". São modelos diferentes; PLG costuma usar um free trial, não um tier grátis permanente.',
      "Baixar o preço do tier pago pra consertar conversão. Quase nunca funciona. A decisão de upgrade é sobre a linha entre free e pago, não sobre o preço do pago.",
    ],
    faqs: [
      {
        q: "Devo oferecer freemium?",
        a: "Só se o tier grátis adquire significativamente mais barato que as alternativas E o caminho de free pra pago é estruturalmente claro. A maioria dos indie SaaS não deveria oferecer freemium — o tier grátis come tempo de suporte do founder sem adquirir upgraders numa taxa significativa.",
      },
      {
        q: "Qual o limite certo do tier grátis?",
        a: "Apertado o suficiente pra que 5% a 15% dos usuários regulares batam mensalmente. Mais frouxo e a conversão cai; mais apertado e o tier grátis não adquire. Itere no limite, não no preço.",
      },
      {
        q: "Devo notificar os usuários quando batem o limite do tier grátis?",
        a: 'Sim, com um caminho de upgrade específico. "Você bateu seu limite grátis — upgradeie pra continuar" converte 5% a 20% das notificações disparadas. Prompts suaves ("considere upgradear") convertem perto de zero.',
      },
    ],
    sourceNote:
      "Faixa baseada na pesquisa benchmark PLG do Lenny Rachitsky, no relatório anual PLG da OpenView Partners e na faixa observada pelo founder em teardowns de indie SaaS.",
  },
  {
    slug: "refund-rate",
    metric: "taxa de reembolso",
    metaTitle: "Taxa média de reembolso de SaaS (Indie Benchmarks)",
    metaDescription:
      "Taxas de reembolso de indie SaaS dentro da janela de garantia ficam em 2% a 8%. Acima de 8% significa quebra de confiança; abaixo de 2% significa que a garantia não é usada como ferramenta de venda.",
    aeoAnswer:
      "Taxas de reembolso de indie SaaS dentro da janela de garantia ficam entre 2% e 8% das compras. Abaixo de 2% normalmente significa que a garantia não está sendo usada como ferramenta de venda (deveria ser visível e proeminente o suficiente pra ser reclamada às vezes). Acima de 8% sugere uma quebra de confiança: o produto ou o onboarding não estão entregando o que a página de vendas prometeu.",
    bands: [
      {
        label: "Underperforming",
        range: "Mais de 8% dentro da janela de garantia",
        diagnosis:
          "O produto ou o onboarding não casam com a promessa da página de vendas. Leia 5 a 10 razões de reembolso. O padrão costuma ser um gap específico de feature ou um mismatch de expectativa.",
      },
      {
        label: "Typical range",
        range: "2% a 8% dentro da janela de garantia",
        diagnosis:
          "Taxa de reembolso saudável. A garantia está fazendo trabalho (visível o suficiente pra ser ferramenta de venda) e o produto está entregando o suficiente pra reter a maior parte dos compradores.",
      },
      {
        label: "Outperforming",
        range: "Menos de 2% dentro da janela de garantia",
        diagnosis:
          "Ou a garantia não está visível (a maioria dos compradores não sabe que pode reclamar — ferramenta de venda desperdiçada) ou o produto é excepcional. Verifique expondo a garantia com mais destaque por uma semana.",
      },
    ],
    drivers: [
      "Precisão da página de vendas (prometer demais impulsiona reembolsos)",
      "Clareza do onboarding (usuários confusos pedem reembolso)",
      "Timing do momento de ativação",
      "Visibilidade da garantia (exibida com destaque = mais reclamos mas mais vendas)",
      "Fricção do processo de reembolso (alguma fricção é saudável)",
    ],
    misreadings: [
      'Tratar taxa baixa de reembolso como "boa" sem checar a visibilidade da garantia. Uma garantia escondida está desperdiçada.',
      "Ler a taxa de reembolso sem separar por fonte de tráfego. Reembolsos sobre tráfego frio rodam mais alto que morno.",
      "Reduzir os termos da garantia (janela menor, condições mais estreitas) pra baixar a taxa de reembolso. Isso costuma matar a conversão mais do que poupar reembolsos.",
    ],
    faqs: [
      {
        q: "Devo ter uma garantia de devolução do dinheiro?",
        a: "Quase sempre sim. O lift de conversão de uma garantia visível pesa mais que o custo de reembolso em quase todo cenário de indie SaaS. Janela de 30 dias pra assinaturas mensais, 60 a 90 dias pra compras únicas.",
      },
      {
        q: "O processo de reembolso deve ser um clique ou exigir contato?",
        a: "Um clique pra low-ticket ($1 a $49), contato exigido pra alto ticket ($100+). Um clique sinaliza confiança e previne a sensação de armadilha; o contato exigido pega malentendidos genuínos e recupera alguns reembolsos via outreach do founder.",
      },
      {
        q: "Como sei se minha taxa de reembolso está alta demais?",
        a: "Acima de 8% dentro da janela de garantia é o limiar de alerta. Leia as razões de reembolso. Se 50%+ cita o mesmo issue (gap específico de feature, confusão de onboarding), conserte essa causa raiz. Ajustes de marketing não consertam problemas de encaixe do produto.",
      },
    ],
    sourceNote:
      "Faixa baseada na pesquisa de reembolso da ProfitWell e em dados observados de indie SaaS em 41 teardowns. Fortemente moderada pelo tamanho da janela de garantia e pela categoria do produto.",
  },
  {
    slug: "cold-email-reply-rate",
    metric: "taxa de resposta de cold email",
    metaTitle: "Taxa média de resposta de cold email (Founder Outreach)",
    metaDescription:
      "Taxas de resposta de cold email grau founder ficam em 5% a 15% pra envios muito targeteados. Abaixo de 5% significa genérico; acima de 15% costuma ser warm-adjacente.",
    aeoAnswer:
      "Taxas de resposta de cold email pra outreach grau founder ficam entre 5% e 15% pra envios muito targeteados (estilo Dream 100). Abaixo de 5% quase sempre significa copy genérico ou targeting genérico. Acima de 15% normalmente significa que a lista é warm-adjacente (conexões mútuas, interações prévias ou sinais de timing relevantes).",
    bands: [
      {
        label: "Underperforming",
        range: "Menos de 5%",
        diagnosis:
          "Ou o targeting é genérico (a lista não é de fato Dream 100) ou o copy é genérico (poderia ser mandado pra qualquer um). A especificidade nas duas direções é o conserto.",
      },
      {
        label: "Typical range",
        range: "5% a 15%",
        diagnosis:
          "Outreach saudável de founder. O targeting é específico, o copy menciona algo que o destinatário pode verificar que é real (a empresa dele, o trabalho dele, a declaração pública dele) e o ask é claro.",
      },
      {
        label: "Outperforming",
        range: "Mais de 15%",
        diagnosis:
          "Outreach warm-adjacente. Conexões mútuas, eventos públicos recentes sobre o destinatário, ou contexto de timing perfeito. Verifique antes de tratar como baseline de cold email.",
      },
    ],
    drivers: [
      "Especificidade da linha de abertura (verificável, específica)",
      "Contexto mútuo (referência, evento compartilhado, declaração pública)",
      "Especificidade do subject line",
      "Tamanho (abaixo de 100 palavras quase sempre ganha)",
      "Ask claro (o que especificamente você quer que eles façam?)",
    ],
    misreadings: [
      "Ler a taxa de resposta em cohorts misturados. Outreach Dream 100 e outreach SDR em massa são mundos diferentes.",
      "Contar autoreplies e out-of-office como respostas. São ruído.",
      "Otimizar o passo errado da sequência. A qualidade do primeiro email domina; follow-ups podem subir a taxa de resposta 30% a 50% mas não consertam um primeiro email quebrado.",
    ],
    faqs: [
      {
        q: "Quantos follow-ups devo mandar?",
        a: "Dois a três. O primeiro email pega 60% a 70% do total de respostas. Cada follow-up soma 10% a 20% em cima. Além de três follow-ups, as respostas caem perto de zero e a irritação sobe.",
      },
      {
        q: "Qual o melhor subject line pra cold outreach de founder?",
        a: 'Específico e curto. "Pergunta sobre [coisa específica que fizeram]" ganha de "Pergunta rápida". 5 a 7 palavras, minúsculas, sem clickbait. Taxas de resposta caem 30% a 50% em subject lines clickbait.',
      },
      {
        q: "Devo usar uma ferramenta como Apollo ou Hunter pra outreach?",
        a: "Pra achar o endereço, sim. Pra mandar o email, mande manualmente pra outreach de alto valor (Dream 100). Ferramentas de envio em massa sacrificam deliverability e taxa de resposta por volume; a conta raramente fecha pra founders indie.",
      },
    ],
    sourceNote:
      "Faixa baseada nos benchmarks publicados de Lemlist e Reply.io, mais a faixa observada pelo founder em outreach Dream 100. Exclui outreach SDR em massa que tem baselines estruturalmente diferentes.",
  },
  {
    slug: "saas-trial-length",
    metric: "duração do trial de SaaS",
    metaTitle: "Duração ótima do trial de SaaS (Indie Benchmarks)",
    metaDescription:
      "A duração ótima do trial de SaaS é 7-14 dias pra self-serve, 14-30 dias pra complexidade moderada, 30+ dias só pra enterprise. Trials mais longos reduzem ativação.",
    aeoAnswer:
      "A duração ótima do trial é 7 a 14 dias pra SaaS self-serve, 14 a 30 dias pra produtos de complexidade moderada, e 30 dias ou mais só pra ferramentas enterprise. Trials mais longos contraintuitivamente reduzem a ativação: usuários adiam a decisão e o trial termina sem um momento aha.",
    bands: [
      {
        label: "Underperforming",
        range: "Menos de 7 dias pra SaaS de complexidade moderada / Mais de 30 dias pra self-serve",
        diagnosis:
          "Ou curto demais (usuários não conseguem chegar à ativação) ou longo demais (a decisão é adiada). Case a duração do trial com o tempo até ativação.",
      },
      {
        label: "Typical range",
        range: "7-14 dias self-serve / 14-30 dias moderado / 30+ dias enterprise",
        diagnosis:
          "Encaixe saudável entre duração do trial e complexidade do produto. A maioria dos usuários decide nas primeiras 48 horas independente da duração.",
      },
      {
        label: "Outperforming",
        range: "Trial de $1 independente da duração",
        diagnosis:
          "Trial de $1 pré-qualifica usuários sérios e converte a 3 a 4x a taxa de free trials. A conta costuma funcionar mesmo contando a taxa de reembolso.",
      },
    ],
    drivers: [
      "Tempo até ativação no produto (a restrição subjacente)",
      "Tipo de trial ($1 vs free)",
      "Design do fluxo de onboarding (guiado > self-serve > nada)",
      "Sequência de email de fim de trial",
      "Outreach liderado pelo founder pra SaaS de alto ticket",
    ],
    misreadings: [
      'Estender a duração do trial pra "ajudar os usuários a decidir". A decisão acontece nas primeiras 48 horas independente da duração.',
      "Comparar durações de trial entre categorias sem normalizar complexidade. SaaS simples em 30 dias sub-converte; enterprise em 7 dias sub-converte.",
      "Ler a taxa de ativação sem separar por cohort. Power users ativam rápido; usuários casuais podem precisar de follow-up independente da duração.",
    ],
    faqs: [
      {
        q: "Devo estender um trial que não ativou?",
        a: 'Uma vez, com outreach liderado pelo founder. "Vi que você não fez X ainda — posso ajudar?" converte 10% a 25%. Extensão automática sem outreach quase nunca converte; o usuário já perdeu o interesse.',
      },
      {
        q: "Devo exigir um cartão de crédito pro trial?",
        a: "Trials com cartão exigido convertem 3 a 4x mais alto por trial mas adquirem 50% a 70% menos trials. A conversão líquida costuma ser mais alta com cartão exigido. Pra maioria dos indie SaaS, cartão exigido é a melhor escolha.",
      },
      {
        q: "Qual o balanço certo entre free trial e free tier?",
        a: "Free trial pra produtos com tempo-até-valor claro (abaixo de 14 dias). Free tier pra produtos com revelação de valor adiada (ferramentas colaborativas, bibliotecas de conteúdo). Não ofereça os dois a menos que tenha um diferenciador claro entre eles.",
      },
    ],
    sourceNote:
      "Faixa baseada no relatório benchmark PLG da OpenView Partners, na pesquisa de onboarding do Lenny Rachitsky e em dados observados pelo founder em teardowns de indie SaaS.",
  },
  {
    slug: "page-time-to-interactive",
    metric: "tempo da página até interativa",
    metaTitle: "Benchmarks de Page Time-to-Interactive (Core Web Vitals)",
    metaDescription:
      "Tempo até interativa saudável pra páginas de marketing de indie SaaS é abaixo de 3,5s no mobile. Acima de 5s, a conversão cai com cada segundo adicional.",
    aeoAnswer:
      "Tempo até interativa saudável pra páginas de marketing de indie SaaS é abaixo de 3,5 segundos no mobile (dispositivo de gama média, conexão 4G). Acima de 5 segundos, a taxa de conversão cai 5% a 15% por cada segundo adicional. O limiar do Core Web Vitals do Google (Interaction to Next Paint abaixo de 200ms) é o piso de SEO, não o teto de conversão.",
    bands: [
      {
        label: "Underperforming",
        range: "Mais de 5s mobile",
        diagnosis:
          "A página está pesada com scripts de terceiros (analytics, widgets de chat, fonts), imagens não otimizadas ou JavaScript que bloqueia o render. Cada conserto tipicamente corta 0,3 a 1,0 segundo.",
      },
      {
        label: "Typical range",
        range: "1,5s a 3,5s mobile",
        diagnosis:
          "Tempo de carregamento saudável. Páginas de marketing padrão de Next.js / Vercel hospedadas ficam aqui com otimização mínima. Piso de SEO é cumprido.",
      },
      {
        label: "Outperforming",
        range: "Abaixo de 1,5s mobile",
        diagnosis:
          "Arquitetura static-first, otimização de imagens, sem JS de terceiros. Os benefícios de conversão são reais mas decrescentes abaixo de 2 segundos.",
      },
    ],
    drivers: [
      "JavaScript de terceiros (o maior custo de performance)",
      "Formato e tamanho da imagem (formatos next-gen, tamanho correto)",
      "Estratégia de carregamento de fonts (system fonts > pré-carregadas > async)",
      "Recursos que bloqueiam o render",
      "Configuração de hosting e CDN",
    ],
    misreadings: [
      "Otimizar pra desktop quando o gargalo é mobile. A maior parte do tráfego de indie SaaS é 60% a 80% mobile.",
      "Perseguir scores perfeitos de Lighthouse. O score não se correlaciona diretamente com conversão; o tempo real até interativa sim.",
      "Adicionar ferramentas de terceiros (analytics, chat, A/B test) sem medir o custo de performance.",
    ],
    faqs: [
      {
        q: "A velocidade da página afeta o SEO?",
        a: "Sim, marginalmente. Os Core Web Vitals do Google (LCP, INP, CLS) entram nos rankings. A maioria dos indie SaaS vê impacto SEO na margem; a razão maior pra otimizar é a taxa direta de conversão.",
      },
      {
        q: "Next.js é rápido o suficiente out of the box?",
        a: "Sim pra páginas de marketing. Static generation (ou App Router server components) na Vercel fica abaixo de 2s de tempo até interativa mobile sem nenhum trabalho de otimização. A dívida de performance se acumula a partir de scripts de terceiros adicionados e imagens não otimizadas.",
      },
      {
        q: "Devo remover minhas ferramentas de analytics pra melhorar a velocidade?",
        a: "Não. PostHog, GA4 e ferramentas similares custam 100 a 300ms no primeiro paint, o que é aceitável. Remova só o tracking duplicado (a maioria dos sites tem 3 a 5 ferramentas de analytics redundantes carregadas simultaneamente).",
      },
    ],
    sourceNote:
      "Faixa baseada nos benchmarks de Core Web Vitals do Google, case studies publicados no web.dev e performance observada de sites de marketing de indie SaaS. Medição mobile-first.",
  },
  {
    slug: "bounce-rate",
    metric: "taxa de rejeição",
    metaTitle: "Taxa média de rejeição (Páginas de marketing Indie SaaS)",
    metaDescription:
      "Taxas de rejeição de páginas de marketing de indie SaaS ficam em 40% a 70%. Abaixo de 40% em tráfego frio normalmente significa que o scroll-tracking está quebrando a medição.",
    aeoAnswer:
      "Taxas de rejeição de páginas de marketing de indie SaaS ficam entre 40% e 70% em tráfego frio. Abaixo de 40% em tráfego frio normalmente significa que o scroll-tracking ou os eventos de engajamento estão disparando falsamente (inflando a qualidade da sessão artificialmente). Acima de 70% indica tráfego Wrong Person ou mismatch conteúdo-tráfego.",
    bands: [
      {
        label: "Underperforming",
        range: "Mais de 70% em tráfego frio",
        diagnosis:
          "O tráfego não casa com o frame da página. Ou o canal de aquisição precisa nichar ou o título da página precisa filtrar tráfego melhor. Cheque a landing page por fonte.",
      },
      {
        label: "Typical range",
        range: "40% a 70% em tráfego frio",
        diagnosis:
          "Taxa de rejeição saudável pra páginas de marketing. O disparo de eventos de engajamento (scroll, click, interação com formulário) marca sessões engajadas e clarifica o sinal.",
      },
      {
        label: "Outperforming",
        range: "Menos de 40% em tráfego frio",
        diagnosis:
          "Normalmente um artefato de medição (eventos de engajamento falsos). Em tráfego frio, rejeição sub-40% é incomum e vale verificar contra o tempo na página.",
      },
    ],
    drivers: [
      "Audience-page fit (o driver dominante)",
      "Velocidade de carregamento da página (páginas lentas rejeitam mais)",
      "Especificidade do título (clareza da mensagem above the fold)",
      "Design mobile-first (60% a 80% do tráfego é mobile)",
      "Tracking de eventos de engajamento (muda a rejeição medida, não a real)",
    ],
    misreadings: [
      'Tratar a taxa de rejeição do GA4 igual a do GA Universal. O GA4 chama de "taxa de engajamento" e usa lógica diferente. Os números não são diretamente comparáveis.',
      "Ler a taxa de rejeição sem separar por fonte. Tráfego direto, orgânico, pago e referral têm baselines diferentes.",
      "Tentar baixar a rejeição adicionando eventos de scroll-tracking. Isso muda a medição, não o comportamento subjacente.",
    ],
    faqs: [
      {
        q: "Taxa de rejeição alta é sempre ruim?",
        a: "Não. Intenção de uma página só (alguém googla seu nome pra achar seu email de contato) gera rejeição legitimamente alta. A métrica importa em contexto: rejeição alta numa landing page projetada pra exploração multi-página é problema; rejeição alta numa página de contato não é.",
      },
      {
        q: "Como baixo a taxa de rejeição?",
        a: "Três alavancas: melhor match tráfego-página (a alavanca dominante), carregamento de página mais rápido e mensagem above the fold mais clara. Não tente baixar a rejeição prendendo os usuários na página — isso é UX adversária.",
      },
      {
        q: "Devo trackear tempo na página em vez de rejeição?",
        a: "Os dois. Tempo na página é mais sensível mas também mais barulhento. Rejeição é um sinal direcional estável. A combinação conta a história real: rejeição baixa + tempo na página baixo é contraditório e indica problemas de medição.",
      },
    ],
    sourceNote:
      "Faixa baseada em analytics observados de sites de marketing indie SaaS em 41 teardowns e validada contra benchmarks publicados pela ContentSquare e Hotjar pra páginas de marketing SaaS.",
  },
  {
    slug: "first-customer-time",
    metric: "tempo até o primeiro cliente pagante",
    metaTitle: "Tempo até o primeiro cliente pagante (Indie SaaS Benchmarks)",
    metaDescription:
      "O tempo-até-primeiro-cliente de indie SaaS fica entre 3 e 16 semanas pós-launch. Mais rápido que 3 semanas normalmente significa warm-network; mais lento que 16 semanas sugere problema de positioning.",
    aeoAnswer:
      "O tempo do launch até o primeiro cliente pagante pra indie SaaS fica entre 3 e 16 semanas. Mais rápido que 3 semanas quase sempre significa que o cliente veio da rede warm do founder, não de aquisição fria. Mais lento que 16 semanas sugere um problema de positioning ou encaixe do produto que o diagnóstico pode surfar.",
    bands: [
      {
        label: "Underperforming",
        range: "Mais de 16 semanas pós-launch sem cliente pagante",
        diagnosis:
          "A camada de marketing não está compondo. Quase sempre um diagnóstico de Wrong Person (o positioning atrai o cohort errado) ou um diagnóstico de Weak Offer (a conta preço-valor não fecha). O diagnóstico surfa qual.",
      },
      {
        label: "Typical range",
        range: "3 a 16 semanas pós-launch",
        diagnosis:
          "Timeline normal de indie SaaS até o primeiro cliente. O funnel está fazendo algum trabalho; refinos movem a agulha. Outreach liderado pelo founder pra rede warm normalmente acelera os primeiros 2 a 5 clientes.",
      },
      {
        label: "Outperforming",
        range: "Menos de 3 semanas pós-launch",
        diagnosis:
          "Quase sempre venda warm-network. Verifique: o cliente é alguém que você conhecia antes do launch? Se sim, o relógio de aquisição fria ainda não começou de verdade.",
      },
    ],
    drivers: [
      "Outreach pra rede warm (o driver dominante no começo)",
      "Encaixe produto-positioning",
      "Visibilidade do pricing no site de marketing",
      "Movimento de vendas liderado pelo founder (fechamento manual, sem automação)",
      "Seleção do canal de aquisição",
    ],
    misreadings: [
      "Contar pagamentos de amigos e família como conversões de tráfego frio. Não são.",
      'Comparar com histórias públicas de "primeiro cliente em 24 horas". Viés de sobrevivência.',
      "Ler o tempo até o primeiro cliente sem separar B2C de B2B. Ciclos de venda B2B são estruturalmente mais longos.",
    ],
    faqs: [
      {
        q: "Quanto tempo devo esperar antes de declarar meu SaaS quebrado?",
        a: "12 a 16 semanas pós-launch com zero clientes pagantes adquiridos a frio é o limiar de alerta. Abaixo disso, você ainda está na janela normal de primeiro-cliente de indie SaaS. Acima disso, o diagnóstico quase sempre encontra um problema upstream consertável.",
      },
      {
        q: "Devo contatar minha rede warm pro primeiro cliente?",
        a: 'Sim, quase sempre. Os primeiros 2 a 5 clientes devem vir de outreach warm. Isso não é "trapacear" a métrica — é como quase todo indie SaaS bem-sucedido começa. Aquisição fria compõe depois que o cohort warm é esgotado.',
      },
      {
        q: "E se eu não tenho rede warm?",
        a: "Construa uma antes de lançar, sendo útil numa comunidade específica por 60 a 90 dias. O padrão Dream 100 de Brunson formaliza isso: nomeie 100 pessoas específicas no seu cohort alvo, seja útil pra elas, depois venda. Aquisição fria sem raízes de rede warm leva 2 a 4x mais.",
      },
    ],
    sourceNote:
      "Faixa baseada em launches observados de indie SaaS pelo dataset de teardowns do founder e validada contra dados públicos de timelines no IndieHackers.",
  },
  {
    slug: "annual-vs-monthly-discount",
    metric: "desconto anual vs mensal",
    metaTitle: "Desconto ótimo anual vs mensal (Pricing SaaS)",
    metaDescription:
      "O desconto ótimo anual-vs-mensal fica em 15% a 25% pra indie SaaS. Descontos mais profundos atraem price-shoppers; mais superficiais não mudam comportamento.",
    aeoAnswer:
      'O desconto ótimo anual-vs-mensal pra indie SaaS fica entre 15% e 25%. Mais superficial (abaixo de 10%) não muda o comportamento de compra em direção a anual; mais profundo (acima de 35%) atrai price-shoppers que tratam o desconto como o valor em vez do compromisso anual. O enquadramento "dois meses grátis" (16,7% de desconto) é um sweet spot comum.',
    bands: [
      {
        label: "Underperforming",
        range: "Menos de 10% de desconto anual ou mais de 35% de desconto anual",
        diagnosis:
          "O desconto superficial falha em incentivar a escolha anual; o desconto profundo atrai o cohort errado e danifica o LTV do cliente anual. Re-ancore na banda de 15% a 25%.",
      },
      {
        label: "Typical range",
        range: "15% a 25% de desconto anual",
        diagnosis:
          'Desconto anual saudável. Os clientes se auto-selecionam pra anual quando o desconto parece economia real sem gritar "isca de price-shopper".',
      },
      {
        label: "Outperforming",
        range: 'Enquadramento "dois meses grátis" (16,7%)',
        diagnosis:
          'Enquadramento específico que ganha de descontos percentuais genéricos. "Dois meses grátis" é concreto e fácil de imaginar; "17% off" é abstrato. Mesma conta, melhor conversão.',
      },
    ],
    drivers: [
      "Enquadramento do desconto (meses-grátis vs percentual)",
      "Visibilidade do plano anual (default pra anual ou toggle?)",
      "Alinhamento de reversão de risco (garantia equivalente pra anual)",
      "Consistência do desconto tier-por-tier",
      "Política de cancelamento no anual (proporcional ou não)",
    ],
    misreadings: [
      "Tratar a conversão anual como o objetivo. O objetivo real é LTV. Anuais muito descontados reduzem o LTV vs caminhos mensal-e-depois-upgrade.",
      "A/B testar a profundidade do desconto sem considerar o cohort atraído. O cohort do desconto de 25% e o do 40% se comportam diferente a longo prazo.",
      "Mostrar só pricing anual por default. Esconder mensal danifica a confiança; visibilidade por toggle ganha.",
    ],
    faqs: [
      {
        q: "O anual deve ser o default ou só uma opção?",
        a: 'Toggle visível, mensal por default pra maioria dos indie SaaS. Esconder mensal danifica a confiança ("o que estão escondendo?"). "Economize 17% com anual" como toggle claramente visível ganha pra SaaS self-serve abaixo de $99/mês.',
      },
      {
        q: "Devo oferecer reembolsos por cancelamento em planos anuais?",
        a: "Reembolsos proporcionais nos primeiros 30 dias; sem reembolsos depois. Isso protege contra quebra de confiança (o comprador deve poder escapar se não funcionar) sem habilitar abuso (devolver o plano anual no mês 11).",
      },
      {
        q: "Qual a forma certa de subir clientes mensais pra anual?",
        a: 'Depois deles estarem mensais por 60 a 90 dias. Antes é cedo demais (não formaram hábito); depois perde momentum. A Soap Opera Sequence pode incluir uma "oferta de upgrade pra anual" no dia 75 com um desconto incremental pequeno acima da tarifa anual padrão.',
      },
    ],
    sourceNote:
      "Faixa baseada na pesquisa 2024 de pricing SaaS da ProfitWell, nos benchmarks de pricing da OpenView e na faixa observada pelo founder em teardowns de pricing de indie SaaS.",
  },
];

// ----- Sanity check ---------------------------------------------------------

const _shapeCheck: BenchmarkTranslation = BENCHMARK_ENTRIES_PT_BR[0]!;
void _shapeCheck;
