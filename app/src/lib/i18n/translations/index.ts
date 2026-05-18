/**
 * Locale resolver for content datasets.
 *
 * Each translated page imports its data through this resolver rather than
 * statically importing a per-locale file. The page component stays
 * locale-agnostic; adding a new locale = adding one translation file +
 * one case below + one row in registry.ts.
 *
 * Brunson Hard-Rule: when no translation file exists for a requested
 * locale, the resolver falls back to en-US source data. Callers MUST
 * gate the render on the registry — the resolver does not check
 * approval state.
 */

import type { Locale } from "@/lib/i18n/locales";
import { FAQ_ENTRIES, type FaqEntry } from "@/lib/faq-data";
import { FAQ_ENTRIES_ES } from "./faq.es";
import { FAQ_ENTRIES_PT_BR } from "./faq.pt-br";

export function getFaqEntries(locale: Locale): FaqEntry[] {
  switch (locale) {
    case "es":
      return FAQ_ENTRIES_ES;
    case "pt-BR":
      return FAQ_ENTRIES_PT_BR;
    case "en-US":
    default:
      return FAQ_ENTRIES;
  }
}

/**
 * Per-locale page chrome strings. Every key required for every locale —
 * TypeScript enforces parity at build time.
 */
export interface PageChromeFaq {
  breadcrumbHome: string;
  breadcrumbFaq: string;
  headline: string;
  lede: string;
  ledeDisclosure: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaPrimary: string;
  ctaSecondary: string;
  footerAttribution: string;
  seoTitle: string;
  seoDescription: string;
}

export const PAGE_CHROME_FAQ: Record<Locale, PageChromeFaq> = {
  "en-US": {
    breadcrumbHome: "Home",
    breadcrumbFaq: "FAQ",
    headline:
      "Every objection answered. Each one sourced from a real founder.",
    lede:
      "These are the eight questions post-launch pre-revenue founders actually raise — about price, time, identity, DIY temptation, and whether praise without payment means the market is dead. They are not the questions a marketer would write. They are the ones I have read, in those words, in public Indie Hackers and Hacker News threads.",
    ledeDisclosure:
      "Every answer is the same answer I would give in a DM. Nothing here is rewritten to sell harder.",
    ctaTitle: "Still have a question that is not here?",
    ctaDescription:
      "The fastest way to get a specific answer about your own page is to run the free 90-second diagnostic. If you would rather just see the product, the $1 Starter is the same destination — just compressed.",
    ctaPrimary: "Run the free diagnostic",
    ctaSecondary: "Start the Playbook for $1",
    footerAttribution:
      "All quotes attributed to public Indie Hackers / Hacker News threads sourced in strategy/dollar-objections.md.",
    seoTitle: "FAQ — Every objection answered in the founder's exact words",
    seoDescription:
      "The eight objections post-launch pre-revenue founders actually raise about Unlock SaaS — price, time, identity, DIY, signal — answered in the same language they were asked in.",
  },
  es: {
    breadcrumbHome: "Inicio",
    breadcrumbFaq: "Preguntas frecuentes",
    headline:
      "Cada objeción respondida. Cada una sacada de un founder real.",
    lede:
      "Estas son las ocho preguntas que los founders post-launch que aún no facturan realmente plantean — sobre precio, tiempo, identidad, la tentación del DIY, y si los aplausos sin pagos significan que el mercado está muerto. No son preguntas que escribiría un marketer. Son las que leí, en esas palabras, en hilos públicos de Indie Hackers y Hacker News.",
    ledeDisclosure:
      "Cada respuesta es la misma respuesta que daría en un DM. Nada acá está reescrito para vender más fuerte.",
    ctaTitle: "¿Todavía tenés una pregunta que no está acá?",
    ctaDescription:
      "La forma más rápida de obtener una respuesta específica sobre tu propia página es correr el diagnóstico gratis de 90 segundos. Si preferís solo ver el producto, el Starter de $1 es el mismo destino — solo que comprimido.",
    ctaPrimary: "Correr el diagnóstico gratis",
    ctaSecondary: "Empezar el Playbook por $1",
    footerAttribution:
      "Todas las citas atribuidas a hilos públicos de Indie Hackers / Hacker News fuentes en strategy/dollar-objections.md.",
    seoTitle:
      "Preguntas frecuentes — Cada objeción respondida en las palabras del founder",
    seoDescription:
      "Las ocho objeciones que los founders post-launch pre-revenue realmente plantean sobre Unlock SaaS — precio, tiempo, identidad, DIY, señal — respondidas en el mismo lenguaje en que se hicieron.",
  },
  "pt-BR": {
    breadcrumbHome: "Início",
    breadcrumbFaq: "Perguntas frequentes",
    headline:
      "Cada objeção respondida. Cada uma vinda de um founder real.",
    lede:
      "Essas são as oito perguntas que founders pós-launch ainda sem receita realmente fazem — sobre preço, tempo, identidade, a tentação do DIY, e se aplauso sem pagamento significa que o mercado está morto. Não são perguntas que um marketer escreveria. São as que eu li, com essas palavras, em threads públicas do Indie Hackers e Hacker News.",
    ledeDisclosure:
      "Cada resposta é a mesma resposta que eu daria em uma DM. Nada aqui foi reescrito para vender mais forte.",
    ctaTitle: "Ainda tem uma pergunta que não está aqui?",
    ctaDescription:
      "A forma mais rápida de obter uma resposta específica sobre sua própria página é rodar o diagnóstico gratuito de 90 segundos. Se você preferir só ver o produto, o Starter de $1 é o mesmo destino — só que comprimido.",
    ctaPrimary: "Rodar o diagnóstico gratuito",
    ctaSecondary: "Começar o Playbook por $1",
    footerAttribution:
      "Todas as citações atribuídas a threads públicas do Indie Hackers / Hacker News fontes em strategy/dollar-objections.md.",
    seoTitle:
      "Perguntas frequentes — Cada objeção respondida nas palavras do founder",
    seoDescription:
      "As oito objeções que founders pós-launch sem receita realmente fazem sobre o Unlock SaaS — preço, tempo, identidade, DIY, sinal — respondidas na mesma linguagem em que foram feitas.",
  },
} as const;

export function getFaqChrome(locale: Locale): PageChromeFaq {
  return PAGE_CHROME_FAQ[locale] ?? PAGE_CHROME_FAQ["en-US"];
}

/**
 * Per-locale page chrome strings for /contact.
 *
 * /contact is pure chrome – no list entries, just structured copy. Brand
 * glossary preservation rules from faq.es.ts / faq.pt-br.ts apply
 * verbatim: Unlock SaaS, Stripe, Playbook, Starter, customer portal,
 * Wrong Person, Weak Offer, Weak Belief, partnership stay English in
 * every locale. Email address (maryan@unlocksaas.com) is identity, not
 * translatable.
 *
 * Voice: Reluctant Hero (workbook 02 §3). Plain register, no marketing
 * puffery. Spanish is neutral LATAM (no 'vosotros'). Portuguese is
 * Brazilian (não peninsular). Numbers and pricing in USD ($1, $49, 60
 * days, ninety seconds) preserved across locales.
 *
 * TypeScript enforces key parity across all three locales at build.
 */
export interface PageChromeContact {
  breadcrumbHome: string;
  breadcrumbContact: string;
  pageLabel: string;
  headline: string;
  lede: string;
  emailHeading: string;
  emailHelp: string;
  stuckHeading: string;
  stuckP1: string;
  stuckCta: string;
  refundHeading: string;
  refundP: string;
  pressHeading: string;
  pressP: string;
  relatedLabel: string;
  relatedAbout: string;
  relatedPrivacy: string;
  relatedTerms: string;
  seoTitle: string;
  seoDescription: string;
}

export const PAGE_CHROME_CONTACT: Record<Locale, PageChromeContact> = {
  "en-US": {
    breadcrumbHome: "Unlock SaaS",
    breadcrumbContact: "Contact",
    pageLabel: "Contact",
    headline: "One inbox. One human. Real replies.",
    lede:
      "There is no ticket system pretending to be a person. The address below is mine. I read every message.",
    emailHeading: "Email",
    emailHelp:
      "Diagnostic questions, refund requests, partnership notes, press – same address. Replies usually within one business day. If you don’t hear back within three, send a nudge – sometimes the spam filter eats things.",
    stuckHeading: "If you’re stuck",
    stuckP1:
      "The fastest path to an answer is usually the free diagnostic. Paste your live product page and you get a labeled diagnosis in about ninety seconds – Wrong Person, Weak Offer, or Weak Belief – plus the specific door that fixes it.",
    stuckCta: "Take the free diagnostic →",
    refundHeading: "If you bought and want to cancel or refund",
    refundP:
      "You can cancel a Playbook subscription from the Stripe customer portal linked inside the product, or by emailing the address above. The 60-day money-back guarantee on the Playbook and a standard refund on the $1 Starter are both honored by replying to any purchase email or writing fresh.",
    pressHeading: "If you’re a journalist or podcaster",
    pressP:
      "Same address. Put the publication, the angle, and a deadline in the subject line. I prioritize anything tied to a real publication date over generic interview requests.",
    relatedLabel: "Related",
    relatedAbout: "About Maryan",
    relatedPrivacy: "Privacy",
    relatedTerms: "Terms",
    seoTitle: "Contact – Unlock SaaS",
    seoDescription:
      "One inbox, one human, real replies. Email maryan@unlocksaas.com. Diagnostic, refund, partnership, press – all the same address.",
  },
  es: {
    breadcrumbHome: "Unlock SaaS",
    breadcrumbContact: "Contacto",
    pageLabel: "Contacto",
    headline: "Una bandeja. Un humano. Respuestas reales.",
    lede:
      "No hay un sistema de tickets que finja ser una persona. La dirección de abajo es la mía. Leo cada mensaje.",
    emailHeading: "Email",
    emailHelp:
      "Preguntas del diagnóstico, pedidos de reembolso, notas de partnership, prensa – la misma dirección. Las respuestas suelen llegar dentro de un día hábil. Si no tenés noticias en tres, mandá un recordatorio – a veces el filtro de spam se come las cosas.",
    stuckHeading: "Si estás atascado",
    stuckP1:
      "El camino más rápido a una respuesta suele ser el diagnóstico gratis. Pegá la URL de tu producto en vivo y recibís un diagnóstico etiquetado en unos noventa segundos – Wrong Person, Weak Offer o Weak Belief – más la puerta específica que lo arregla.",
    stuckCta: "Hacé el diagnóstico gratis →",
    refundHeading: "Si compraste y querés cancelar o pedir reembolso",
    refundP:
      "Podés cancelar una suscripción del Playbook desde el customer portal de Stripe enlazado dentro del producto, o escribiendo a la dirección de arriba. La garantía de devolución a 60 días del Playbook y el reembolso estándar del Starter de $1 se honran respondiendo a cualquier email de compra o escribiendo de cero.",
    pressHeading: "Si sos periodista o podcaster",
    pressP:
      "La misma dirección. Poné la publicación, el ángulo y un deadline en el asunto. Le doy prioridad a cualquier cosa atada a una fecha de publicación real por encima de pedidos genéricos de entrevista.",
    relatedLabel: "Relacionado",
    relatedAbout: "Sobre Maryan",
    relatedPrivacy: "Privacidad",
    relatedTerms: "Términos",
    seoTitle: "Contacto – Unlock SaaS",
    seoDescription:
      "Una bandeja, un humano, respuestas reales. Escribí a maryan@unlocksaas.com. Diagnóstico, reembolso, partnership, prensa – todo a la misma dirección.",
  },
  "pt-BR": {
    breadcrumbHome: "Unlock SaaS",
    breadcrumbContact: "Contato",
    pageLabel: "Contato",
    headline: "Uma caixa. Um humano. Respostas reais.",
    lede:
      "Não tem um sistema de tickets fingindo ser uma pessoa. O endereço abaixo é meu. Eu leio cada mensagem.",
    emailHeading: "Email",
    emailHelp:
      "Perguntas sobre o diagnóstico, pedidos de reembolso, notas de partnership, imprensa – o mesmo endereço. As respostas costumam chegar em até um dia útil. Se não tiver retorno em três, manda um lembrete – às vezes o filtro de spam come as coisas.",
    stuckHeading: "Se você está travado",
    stuckP1:
      "O caminho mais rápido para uma resposta costuma ser o diagnóstico gratuito. Cola a URL do seu produto no ar e em uns noventa segundos você recebe um diagnóstico rotulado – Wrong Person, Weak Offer ou Weak Belief – mais a porta específica que resolve.",
    stuckCta: "Fazer o diagnóstico gratuito →",
    refundHeading: "Se você comprou e quer cancelar ou pedir reembolso",
    refundP:
      "Você pode cancelar uma assinatura do Playbook pelo customer portal do Stripe que fica linkado dentro do produto, ou escrevendo para o endereço acima. A garantia de devolução de 60 dias do Playbook e o reembolso padrão do Starter de $1 são honrados respondendo qualquer email de compra ou escrevendo do zero.",
    pressHeading: "Se você é jornalista ou podcaster",
    pressP:
      "O mesmo endereço. Coloca a publicação, o ângulo e um deadline no assunto. Eu dou prioridade pra qualquer coisa atada a uma data real de publicação em vez de pedidos genéricos de entrevista.",
    relatedLabel: "Relacionado",
    relatedAbout: "Sobre Maryan",
    relatedPrivacy: "Privacidade",
    relatedTerms: "Termos",
    seoTitle: "Contato – Unlock SaaS",
    seoDescription:
      "Uma caixa, um humano, respostas reais. Escreva pra maryan@unlocksaas.com. Diagnóstico, reembolso, partnership, imprensa – tudo no mesmo endereço.",
  },
} as const;

export function getContactChrome(locale: Locale): PageChromeContact {
  return PAGE_CHROME_CONTACT[locale] ?? PAGE_CHROME_CONTACT["en-US"];
}

/**
 * Per-locale page chrome strings for /repeatable (Rung 2 spec page).
 *
 * Brand glossary preservation (stays English in every locale):
 *   Unlock SaaS, Playbook, Core, Starter, Rung 1, Rung 2, Rung 3,
 *   Dream 100, Attractive Character, Outreach Room, Reluctant Hero,
 *   Product 1, Product 2, Stripe, value ladder, dream customer,
 *   outreach, prefill, lock, clone, warmth flags, patterns, self-serve,
 *   coaching, tier, waitlist, countdown, carry-over.
 *
 * Numbers and pricing preserved verbatim in USD: $1, $49/mo, $149/mo,
 * 60-day, 90-day. The strategy file path
 * `strategy/decisions/rung-2-repeatable-revenue.md` renders as an
 * untranslated <code> element, so chrome doesn't carry it.
 *
 * Voice: Reluctant Hero. Same neutral LATAM Spanish (no 'vosotros') and
 * Brazilian Portuguese (não peninsular) discipline as the rest of the
 * registry. TypeScript enforces key parity across all three locales.
 */
export interface PageChromeRepeatable {
  topLabel: string;
  headline: string;
  lede: string;
  whatItIsHeading: string;
  whatItIsP1: string;
  whatItIsP2: string;
  whatItIsNotHeading: string;
  whatItIsNotItems: readonly [string, string, string, string];
  gatesHeading: string;
  gatesIntro: string;
  gatesItems: readonly [string, string, string];
  priceHeading: string;
  priceP: string;
  ctaIntro: string;
  ctaPrimary: string;
  ctaSecondaryPre: string;
  ctaSecondaryLink: string;
  ctaSecondaryPost: string;
  signoff: string;
  seoTitle: string;
  seoDescription: string;
}

export const PAGE_CHROME_REPEATABLE: Record<Locale, PageChromeRepeatable> = {
  "en-US": {
    topLabel: "Rung 2 – The Repeatable Revenue Layer",
    headline: "The next yes, published before I am ready to sell it.",
    lede:
      "This is the layer of the value ladder that sits above $49/mo Core. It is spec'd, not shipped. The build is gated on three paying Core customers completing the full Playbook loop. Until then this page is a public commitment – not a waitlist, not a countdown.",
    whatItIsHeading: "What it is",
    whatItIsP1:
      "Once the Playbook gets you to your first paying customer on Product 1, the most expensive thing you can do is start Product 2 from zero. Re-define the dream customer. Re-write the offer. Re-build the outreach list. Re-discover which Dream 100 targets actually convert. That is a week of avoidance dressed up as productive work – the exact disease the Playbook treats.",
    whatItIsP2:
      "The Repeatable Revenue Layer carries the assets you earned on Product 1 forward into Product 2, automatically: dream customer pre-fill, Attractive Character lock, outreach template clone, Dream 100 with warmth flags, Stripe pattern library. Same Playbook, same guarantee mechanic, with a 90-day window for Product 2's first paying customer.",
    whatItIsNotHeading: "What it is not",
    whatItIsNotItems: [
      "Not a course. Same anti-guru rule as Core.",
      "Not a coaching tier. Self-serve only.",
      "Not a community-only upsell. The Outreach Room stays at Core.",
      "Not an agency / unlimited-products tier. That is Rung 3, still deferred.",
    ],
    gatesHeading: "Hard activation gates",
    gatesIntro: "I refuse to ship this before:",
    gatesItems: [
      "Three paying Core customers have completed the full Playbook loop (Step 1 → Step 7 → First Paying Customer Verified). Carry-over assumptions are unvalidated below three.",
      "At least one Core customer has asked, unprompted, for a next layer. No supply without demand signal.",
      "I have personally run Product 2 through the imagined carry-over flow on myself. The Reluctant Hero rule: never hand a customer a path I have not walked.",
    ],
    priceHeading: "Target price",
    priceP:
      "$149/mo. 60-day guarantee mechanic with a 90-day window for Product 2's first paying customer. Full spec lives in",
    ctaIntro: "Rung 2 is the door that opens AFTER you walk through Rung 1.",
    ctaPrimary: "Start at the $49 Core Playbook",
    ctaSecondaryPre: "Or take the",
    ctaSecondaryLink: "$1 Starter",
    ctaSecondaryPost: "and earn your way to this page.",
    signoff: "– Maryan",
    seoTitle: "The Repeatable Revenue Layer – Rung 2 | Unlock SaaS",
    seoDescription:
      "What ships after your first paying customer: a self-serve layer that carries dream customer, Attractive Character, outreach, and Stripe pattern across Product 2. Spec published; build gated on three Core customer cycles.",
  },
  es: {
    topLabel: "Rung 2 – La Capa de Ingresos Repetibles",
    headline:
      "El próximo sí, publicado antes de que esté listo para venderlo.",
    lede:
      "Esta es la capa de la value ladder que se ubica arriba del Core de $49/mes. Está especificada, no lanzada. El build está bloqueado por tres clientes Core pagos que completen el loop entero del Playbook. Hasta entonces esta página es un compromiso público – no una waitlist, no un countdown.",
    whatItIsHeading: "Qué es",
    whatItIsP1:
      "Una vez que el Playbook te lleva a tu primer cliente que paga en Product 1, lo más caro que podés hacer es empezar Product 2 desde cero. Redefinir al dream customer. Reescribir la oferta. Reconstruir la lista de outreach. Redescubrir qué targets del Dream 100 realmente convierten. Eso es una semana de evitación disfrazada de trabajo productivo – la enfermedad exacta que el Playbook trata.",
    whatItIsP2:
      "La Repeatable Revenue Layer lleva los assets que ganaste en Product 1 hacia Product 2, en automático: prefill del dream customer, lock del Attractive Character, clon de templates de outreach, Dream 100 con warmth flags, biblioteca de patterns de Stripe. El mismo Playbook, el mismo mecanismo de garantía, con una ventana de 90 días para el primer cliente que paga de Product 2.",
    whatItIsNotHeading: "Qué no es",
    whatItIsNotItems: [
      "No es un curso. La misma regla anti-guru del Core.",
      "No es un tier de coaching. Solo self-serve.",
      "No es un upsell solo-comunidad. La Outreach Room queda en el Core.",
      "No es un tier de agencia / productos ilimitados. Eso es Rung 3, todavía diferido.",
    ],
    gatesHeading: "Compuertas de activación duras",
    gatesIntro: "Me niego a lanzar esto antes de:",
    gatesItems: [
      "Que tres clientes Core pagos hayan completado el loop entero del Playbook (Paso 1 → Paso 7 → Primer Cliente que Paga Verificado). Las suposiciones de carry-over no están validadas por debajo de tres.",
      "Que al menos un cliente Core haya pedido, sin que se lo provoquen, una capa siguiente. No hay oferta sin señal de demanda.",
      "Que yo haya corrido personalmente Product 2 a través del flujo de carry-over imaginado, en mí mismo. La regla Reluctant Hero: nunca le entrego a un cliente un camino que yo no caminé.",
    ],
    priceHeading: "Precio objetivo",
    priceP:
      "$149/mes. Mecanismo de garantía de 60 días con una ventana de 90 días para el primer cliente que paga de Product 2. El spec completo vive en",
    ctaIntro:
      "Rung 2 es la puerta que se abre DESPUÉS de que cruzás Rung 1.",
    ctaPrimary: "Empezá en el Playbook Core de $49",
    ctaSecondaryPre: "O hacé el",
    ctaSecondaryLink: "Starter de $1",
    ctaSecondaryPost: "y ganate el paso a esta página.",
    signoff: "– Maryan",
    seoTitle: "La Capa de Ingresos Repetibles – Rung 2 | Unlock SaaS",
    seoDescription:
      "Lo que se lanza después de tu primer cliente que paga: una capa self-serve que lleva al dream customer, el Attractive Character, el outreach y el patrón de Stripe a través de Product 2. Spec publicado; build bloqueado por tres ciclos de clientes Core.",
  },
  "pt-BR": {
    topLabel: "Rung 2 – A Camada de Receita Repetível",
    headline:
      "O próximo sim, publicado antes de eu estar pronto para vender.",
    lede:
      "Essa é a camada da value ladder que fica acima do Core de $49/mês. Está especificada, não lançada. O build está travado por três clientes Core pagantes completarem o loop inteiro do Playbook. Até lá essa página é um compromisso público – não uma waitlist, não um countdown.",
    whatItIsHeading: "O que é",
    whatItIsP1:
      "Quando o Playbook te leva ao seu primeiro cliente pagante no Product 1, a coisa mais cara que você pode fazer é começar o Product 2 do zero. Redefinir o dream customer. Reescrever a oferta. Reconstruir a lista de outreach. Redescobrir quais targets do Dream 100 realmente convertem. Isso é uma semana de evitação disfarçada de trabalho produtivo – a doença exata que o Playbook trata.",
    whatItIsP2:
      "A Repeatable Revenue Layer carrega os assets que você ganhou no Product 1 para o Product 2, automaticamente: prefill do dream customer, lock do Attractive Character, clone de templates de outreach, Dream 100 com warmth flags, biblioteca de patterns do Stripe. O mesmo Playbook, o mesmo mecanismo de garantia, com uma janela de 90 dias para o primeiro cliente pagante do Product 2.",
    whatItIsNotHeading: "O que não é",
    whatItIsNotItems: [
      "Não é um curso. A mesma regra anti-guru do Core.",
      "Não é um tier de coaching. Só self-serve.",
      "Não é um upsell só-comunidade. A Outreach Room fica no Core.",
      "Não é um tier de agência / produtos ilimitados. Isso é Rung 3, ainda adiado.",
    ],
    gatesHeading: "Travas de ativação duras",
    gatesIntro: "Eu me recuso a lançar isso antes de:",
    gatesItems: [
      "Três clientes Core pagantes terem completado o loop inteiro do Playbook (Passo 1 → Passo 7 → Primeiro Cliente Pagante Verificado). Suposições de carry-over não são validadas abaixo de três.",
      "Pelo menos um cliente Core ter pedido, sem provocação, uma camada seguinte. Não tem oferta sem sinal de demanda.",
      "Eu mesmo ter rodado o Product 2 pelo fluxo de carry-over imaginado, em mim mesmo. A regra Reluctant Hero: nunca entrego pra um cliente um caminho que eu não andei.",
    ],
    priceHeading: "Preço alvo",
    priceP:
      "$149/mês. Mecanismo de garantia de 60 dias com uma janela de 90 dias para o primeiro cliente pagante do Product 2. O spec completo mora em",
    ctaIntro:
      "O Rung 2 é a porta que abre DEPOIS que você atravessa o Rung 1.",
    ctaPrimary: "Começar no Playbook Core de $49",
    ctaSecondaryPre: "Ou faça o",
    ctaSecondaryLink: "Starter de $1",
    ctaSecondaryPost: "e ganhe o passo até essa página.",
    signoff: "– Maryan",
    seoTitle: "A Camada de Receita Repetível – Rung 2 | Unlock SaaS",
    seoDescription:
      "O que é lançado depois do seu primeiro cliente pagante: uma camada self-serve que carrega o dream customer, o Attractive Character, o outreach e o padrão do Stripe pelo Product 2. Spec publicado; build travado por três ciclos de clientes Core.",
  },
} as const;

export function getRepeatableChrome(locale: Locale): PageChromeRepeatable {
  return PAGE_CHROME_REPEATABLE[locale] ?? PAGE_CHROME_REPEATABLE["en-US"];
}
