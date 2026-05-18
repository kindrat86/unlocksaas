/**
 * Brazilian Portuguese (pt-BR) translation of FAQ_ENTRIES.
 *
 * Status: pending-review (see src/lib/i18n/registry.ts).
 * Source: src/lib/faq-data.ts FAQ_ENTRIES (en-US canonical).
 * Translation by: Claude (sales@sipiteno.com session, 2026-05-18).
 *
 * Editorial notes for founder review
 * ----------------------------------
 * - Locale: pt-BR explicitly. The Brazilian indie SaaS audience is the
 *   dream-customer target (workbook 08 §3). Peninsular Portuguese (pt-PT)
 *   has different idioms and would mis-target.
 * - Voice: Reluctant Hero, plain register. "Você" throughout (not "tu"),
 *   matching Brazilian standard for business writing.
 * - Untranslated brand-glossary terms (English in-source): Stripe, Hacker
 *   News, Indie Hackers, Slack, Playbook, Dream 100, Hook Story Offer,
 *   Reluctant Hero, Big Domino, framework, outreach, webhook, dashboard,
 *   launch post, milestones, founder. These anchor the DefinedTermSet
 *   entity in src/lib/seo/entity.ts.
 * - Numbers + Daniil Khanin attribution: verbatim.
 *
 * Approval lock: until registry approval, /pt-BR/faq is noindex + omitted
 * from sitemap.
 */

import type { FaqEntry } from "@/lib/faq-data";

export const FAQ_ENTRIES_PT_BR: FaqEntry[] = [
  {
    category: "Tempo",
    q: "Não tenho tempo para mais um framework.",
    a: "Eu entendo. Você já leu os livros, viu os breakdowns no YouTube, entrou em dois grupos de Slack. Nada disso fechou um cliente. O Playbook não é um framework — o framework está enterrado dentro do motor. Você responde 3 a 5 perguntas por passo, o motor monta o trabalho, e você executa a ação que ele te diz para executar. No Passo 7 ou o Stripe dispara com sua primeira venda, ou a garantia dispara e você recebe os $98 de volta. Isso aqui não se lê. Isso aqui se termina.",
  },
  {
    category: "Táticas",
    q: "Já fiz entrevistas com clientes e não ajudou.",
    a: "A maioria dos founders que diz isso fez duas entrevistas, recebeu feedback educado e concluiu que o mercado estava errado. Seja honesto sobre o que \"tentei\" significa. O Playbook força 20 ações de outreach registradas antes da garantia poder disparar — esse é o piso. Se você completar 20 e nenhum cobramento do Stripe entrar, a oferta estava errada, e o reembolso te diz isso de graça. A maioria dos founders nunca chega aos 20. É por isso que a maioria ainda não sabe o que está realmente quebrado.",
  },
  {
    category: "Sinal",
    q: "Aplauso sem pagamento significa que meu mercado está morto.",
    a: "Um founder no Indie Hackers (Daniil Khanin) postou recentemente: 10.947 signups, 90 pagantes, nove anos. Ele escreveu \"Eu sou ruim de vender. Nove anos de prova.\" Isso não é um mercado morto. Isso é um motor de vendas ausente. O Playbook assume que as pessoas que batem palma no seu launch post não são as pessoas que pagam — e te força a ir atrás das que pagam, com outreach registrado que o motor rastreia. Se 20 das conversas certas ainda não produzirem um cobramento, a garantia dispara.",
  },
  {
    category: "Preço",
    q: "$49/mês é muito sem ter receita ainda.",
    a: "Dois cafés por semana. E o teto da sua exposição é $98, não $49. Se o Playbook não produzir um cobramento verificado no Stripe em 60 dias E você completou os milestones dentro do produto, você recebe os $98 de volta. A maioria dos founders para quem eu construí isso gasta mais de $98/mês em ferramentas que nem abrem. Essa é a única ferramenta com um contrato: ela se paga no seu dashboard do Stripe, ou se paga de volta na sua conta bancária.",
  },
  {
    category: "Identidade",
    q: "Eu já consigo ver o caminho. Só preciso executar.",
    a: "Então executa. Abre o Stripe agora. Se você cobrou um cliente novo nos últimos 14 dias, fecha essa aba. Se não cobrou, o caminho que você consegue ver é o mesmo caminho que você está vendo há seis meses — e ainda está aqui lendo FAQs. O Playbook não te vende um plano novo. Ele executa o plano que você já escreveu e nunca terminou. A prova de que funciona é o cobramento do Stripe que ele produz, não o dashboard que ele mostra.",
  },
  {
    category: "DIY",
    q: "Eu não poderia construir isso sozinho?",
    a: "Poderia. Provavelmente em três fins de semana. Enquanto você está construindo, você não está rodando o funnel — que é exatamente a doença que o Playbook trata. O webhook do Stripe como prova, o picker do Dream 100 alimentado pelo seu workbook travado, o pushback do motor que te espelha sua própria evitação, a lógica de reembolso de 60 dias — você terminaria isso em um mês. E durante esse mês, zero outreach. Você seria um founder que escolheu lançar mais uma ferramenta que ninguém paga. Isso não é uma decisão de ferramenta. Isso é uma história.",
  },
  {
    category: "Fluxo de trabalho",
    q: "Mesmo que funcione, vai ficar ao lado do meu workflow real.",
    a: "Justo. A maioria das ferramentas faz isso. É por isso que o outreach é enviado de dentro do Playbook, não copiado e colado para outra aba — e por isso o webhook do Stripe dispara dentro do Playbook quando seu primeiro cliente paga. Esses são os dois eventos que importam na fase pós-launch. Se os dois moram em outro lugar, mata a ferramenta. Os dois moram aqui. O Playbook não é uma aba que você abre. É a sala onde você faz o trabalho por 60 dias.",
  },
  {
    category: "Risco de preço",
    q: "O preço vai subir depois? Eu fico travado nos $49?",
    a: "$49/mês é o único preço do Core. Se eu introduzir uma opção anual ou um tier Pro, sua mensalidade continua $49 até você escolher mudar. Não tem desconto de startup com data de vencimento, não tem cobrança por uso, não tem \"seu time cresceu, agora são $149.\" O preço é o preço.",
  },
];

const _shapeCheck: FaqEntry = FAQ_ENTRIES_PT_BR[0]!;
void _shapeCheck;
