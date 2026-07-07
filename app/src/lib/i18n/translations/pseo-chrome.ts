/**
 * Page chrome for the 8 pSEO clusters whose locale-aware shells exist under
 * `app/[locale]/{cluster}/page.tsx` and `app/[locale]/{cluster}/[slug]/page.tsx`:
 *
 *   - /alternatives-to
 *   - /vs (cluster key is still `compare` internally – the URL hub was
 *         renamed 2026-05-21 to match Google's `[A] vs [B]` keyword shape,
 *         but the translation lookup key stays stable so existing rows
 *         don't need re-translation)
 *   - /category
 *   - /funnel-teardown
 *   - /pricing-teardown
 *   - /answers
 *   - /why-isnt-my
 *   - /for
 *
 * Status: pending-review (see src/lib/i18n/registry.ts rows added 2026-05-21).
 * Source: en-US chrome strings inlined verbatim from the existing
 * `app/[locale]/{cluster}/page.tsx` and `[slug]/page.tsx` shells.
 * Translation by: Claude (sales@sipiteno.com session, 2026-05-21, autonomous
 * directive from founder to expand i18n coverage to the big pSEO clusters).
 *
 * Editorial notes for founder review
 * ----------------------------------
 * - Voice: Reluctant Hero (workbook 02 §3). Plain register, no startup-
 *   marketing buzzwords. Neutral Latin American Spanish (no `vosotros`,
 *   no peninsular idioms). Brazilian Portuguese (não peninsular).
 * - Untranslated brand-glossary terms (deliberate preservation – they are
 *   DefinedTerm entity anchors in `src/lib/seo/entity.ts`):
 *   Unlock SaaS, Playbook, Starter, Stripe, Indie Hackers, Hacker News,
 *   ChatGPT, founder, post-launch, pre-revenue, diagnostic, SaaS,
 *   webhook, dashboard, framework, milestones, launch post, outreach,
 *   Wrong Person, Weak Offer, Weak Belief, Hook, Story, Offer, Big Domino,
 *   Soap Opera Sequence, Reluctant Hero, Dream 100, Verified Builder,
 *   ShipFast, Lovable, One Funnel Away Challenge, Starter Story.
 * - Pricing in USD ($1 Starter, $49/mo Core, $98 cap, 60-day guarantee)
 *   preserved verbatim in both locales.
 * - Slug-level data (alt.oneLine, teardown.summary, etc.) is NOT translated
 *   in this change set – stays in English. The amber "Pending founder
 *   review" banner discloses this on every preview URL. Per-slug overlays
 *   ship when individual clusters get founder-approved.
 *
 * Approval lock: until each `(path, locale)` row flips to
 * `status: "approved"` in `src/lib/i18n/registry.ts`, the routes render
 * with noindex and are omitted from sitemap + hreflang.
 */

import type { Locale } from "@/lib/i18n/locales";

// ---------------------------------------------------------------------------
// Shared chrome – CTAs and banners reused across all 8 pSEO clusters.
// One record, 3 locales, drift-free.
// ---------------------------------------------------------------------------

export interface PageChromePseoShared {
  breadcrumbHome: string;
  hubCtaHeading: string;
  hubCtaBody: string;
  hubCtaPrimary: string;
  hubCtaSecondary: string;
  detailCtaHeading: string;
  detailCtaBody: string;
  detailCtaPrimary: string;
  pendingBannerTitle: string;
  pendingBannerHubBody: string;
  pendingBannerDetailBody: string;
  detailEnglishCalloutSuffix: string;
}

export const PAGE_CHROME_PSEO_SHARED: Partial<Record<Locale, PageChromePseoShared>> = {
  "en-US": {
    breadcrumbHome: "Home",
    hubCtaHeading: "Not sure if Unlock SaaS is right for you?",
    hubCtaBody: "The 90-second diagnostic answers that.",
    hubCtaPrimary: "Get the free diagnostic",
    hubCtaSecondary: "Start with $1",
    detailCtaHeading: "Run the diagnostic on your own page",
    detailCtaBody:
      "The 90-second diagnostic labels what is broken on your offer.",
    detailCtaPrimary: "Get the free diagnostic",
    pendingBannerTitle: "Pending founder review",
    pendingBannerHubBody:
      "This locale-prefixed URL is in preview while the localized overlay is being finalized. Content shown reflects the canonical English source.",
    pendingBannerDetailBody:
      "This locale-prefixed URL is in preview while the localized overlay is being finalized. The complete English version is published at the canonical link below.",
    detailEnglishCalloutSuffix:
      "When the localized overlay for this slug ships, the full content renders here in your locale.",
  },
  es: {
    breadcrumbHome: "Inicio",
    hubCtaHeading: "¿No estás seguro si Unlock SaaS es para vos?",
    hubCtaBody: "El diagnóstico de 90 segundos te lo responde.",
    hubCtaPrimary: "Hacer el diagnóstico gratis",
    hubCtaSecondary: "Empezar por $1",
    detailCtaHeading: "Corré el diagnóstico en tu propia página",
    detailCtaBody:
      "El diagnóstico de 90 segundos etiqueta qué está roto en tu oferta.",
    detailCtaPrimary: "Hacer el diagnóstico gratis",
    pendingBannerTitle: "En revisión por el founder",
    pendingBannerHubBody:
      "Esta URL con prefijo de idioma está en preview mientras se finaliza la traducción. El contenido mostrado refleja la fuente canónica en inglés.",
    pendingBannerDetailBody:
      "Esta URL con prefijo de idioma está en preview mientras se finaliza la traducción. La versión completa en inglés está publicada en el enlace canónico abajo.",
    detailEnglishCalloutSuffix:
      "Cuando se publique la traducción de este slug, el contenido completo se renderiza acá en tu idioma.",
  },
  "pt": {
    breadcrumbHome: "Início",
    hubCtaHeading: "Não tem certeza se Unlock SaaS é pra você?",
    hubCtaBody: "O diagnóstico de 90 segundos responde isso.",
    hubCtaPrimary: "Fazer o diagnóstico gratuito",
    hubCtaSecondary: "Começar por $1",
    detailCtaHeading: "Rode o diagnóstico na sua própria página",
    detailCtaBody:
      "O diagnóstico de 90 segundos rotula o que está quebrado na sua oferta.",
    detailCtaPrimary: "Fazer o diagnóstico gratuito",
    pendingBannerTitle: "Em revisão do founder",
    pendingBannerHubBody:
      "Essa URL com prefixo de idioma está em preview enquanto a tradução é finalizada. O conteúdo mostrado reflete a fonte canônica em inglês.",
    pendingBannerDetailBody:
      "Essa URL com prefixo de idioma está em preview enquanto a tradução é finalizada. A versão completa em inglês está publicada no link canônico abaixo.",
    detailEnglishCalloutSuffix:
      "Quando a tradução desse slug for publicada, o conteúdo completo renderiza aqui no seu idioma.",
  },
} as const;

export function getPseoSharedChrome(locale: Locale): PageChromePseoShared {
  return (PAGE_CHROME_PSEO_SHARED[locale] ?? PAGE_CHROME_PSEO_SHARED["en-US"] as any) as PageChromePseoShared;
}

// ---------------------------------------------------------------------------
// Per-cluster chrome – cluster-specific eyebrow, headline, lede, breadcrumb
// label, "browse all" / "read more" labels, detail page English-callout copy.
// ---------------------------------------------------------------------------

export interface PageChromePseoCluster {
  seoTitle: string;
  seoDescription: string;
  breadcrumbHub: string;
  hubEyebrow: string;
  hubHeadline: string;
  hubLede: string;
  hubListAriaLabel: string;
  hubReadMoreLabel: string;
  detailEnglishCalloutTitle: string;
  detailEnglishCalloutBody: string;
  detailCtaSecondary: string;
}

type ClusterKey =
  | "alternatives-to"
  | "compare"
  | "category"
  | "funnel-teardown"
  | "pricing-teardown"
  | "answers"
  | "should-i"
  | "why-isnt-my"
  | "for";

type ClusterChromeMap = Record<
  ClusterKey,
  Partial<Record<Locale, PageChromePseoCluster>>
>;

export const PAGE_CHROME_PSEO: ClusterChromeMap = {
  // -------------------------------------------------------------------------
  // /alternatives-to
  // -------------------------------------------------------------------------
  "alternatives-to": {
    "en-US": {
      seoTitle:
        "Honest Alternatives to Unlock SaaS – and Why Most Are Different Products",
      seoDescription:
        "Side-by-side comparisons against ShipFast, Lovable, the One Funnel Away Challenge, Starter Story, and other tools the typical post-launch pre-revenue SaaS founder evaluates. Honest framing, no slag.",
      breadcrumbHub: "Alternatives",
      hubEyebrow: "Honest comparisons",
      hubHeadline:
        "Most “alternatives” are not alternatives. They are different products.",
      hubLede:
        "Unlock SaaS is the playbook that produces a Stripe-verified first paying customer for a SaaS you already shipped, in 60 days, or you do not pay. Below are the tools founders in that exact spot already evaluate.",
      hubListAriaLabel: "Comparison list",
      hubReadMoreLabel: "Read the full comparison →",
      detailEnglishCalloutTitle: "Full comparison in English",
      detailEnglishCalloutBody:
        "The full comparison – capability table, honest verdict, FAQ, and related alternatives – is published in English at the canonical URL:",
      detailCtaSecondary: "All comparisons",
    },
    es: {
      seoTitle:
        "Alternativas honestas a Unlock SaaS – y por qué la mayoría son productos distintos",
      seoDescription:
        "Comparaciones lado a lado con ShipFast, Lovable, One Funnel Away Challenge, Starter Story y otras herramientas que el founder de SaaS post-launch pre-revenue típico evalúa. Encuadre honesto, sin desprestigios.",
      breadcrumbHub: "Alternativas",
      hubEyebrow: "Comparaciones honestas",
      hubHeadline:
        "La mayoría de las «alternativas» no son alternativas. Son productos distintos.",
      hubLede:
        "Unlock SaaS es el playbook que produce un primer cliente que paga, verificado en Stripe, para un SaaS que ya lanzaste, en 60 días, o no pagás. Abajo están las herramientas que los founders en ese punto exacto ya evalúan.",
      hubListAriaLabel: "Lista de comparaciones",
      hubReadMoreLabel: "Leer la comparación completa →",
      detailEnglishCalloutTitle: "Comparación completa en inglés",
      detailEnglishCalloutBody:
        "La comparación completa – tabla de capacidades, veredicto honesto, FAQ y alternativas relacionadas – está publicada en inglés en la URL canónica:",
      detailCtaSecondary: "Todas las comparaciones",
    },
    "pt": {
      seoTitle:
        "Alternativas honestas ao Unlock SaaS – e por que a maioria são produtos diferentes",
      seoDescription:
        "Comparações lado a lado com ShipFast, Lovable, One Funnel Away Challenge, Starter Story e outras ferramentas que o founder típico de SaaS pós-launch sem receita avalia. Enquadre honesto, sem detratar.",
      breadcrumbHub: "Alternativas",
      hubEyebrow: "Comparações honestas",
      hubHeadline:
        "A maioria das “alternativas” não são alternativas. São produtos diferentes.",
      hubLede:
        "Unlock SaaS é o playbook que produz um primeiro cliente pagante, verificado no Stripe, pra um SaaS que você já lançou, em 60 dias, ou você não paga. Abaixo estão as ferramentas que os founders nesse ponto exato já avaliam.",
      hubListAriaLabel: "Lista de comparações",
      hubReadMoreLabel: "Ler a comparação completa →",
      detailEnglishCalloutTitle: "Comparação completa em inglês",
      detailEnglishCalloutBody:
        "A comparação completa – tabela de capacidades, veredito honesto, FAQ e alternativas relacionadas – está publicada em inglês na URL canônica:",
      detailCtaSecondary: "Todas as comparações",
    },
  },
  // -------------------------------------------------------------------------
  // /vs (cluster key `compare` retained internally – see header comment)
  // -------------------------------------------------------------------------
  compare: {
    "en-US": {
      seoTitle: "Head-to-head SaaS comparisons – tool A vs tool B",
      seoDescription:
        "Honest dimension-by-dimension comparisons between the SaaS tools founders evaluate side by side. Capabilities, pricing anchors, who each is for.",
      breadcrumbHub: "Compare",
      hubEyebrow: "Head-to-head",
      hubHeadline: "Pick the right tool. Stop hopping between tabs.",
      hubLede:
        "Each comparison below lays out the dimensions that actually matter for a post-launch pre-revenue SaaS founder: who the tool is for, what it does that the other does not, and where it falls short. No slag, no fake reviews.",
      hubListAriaLabel: "Head-to-head comparison list",
      hubReadMoreLabel: "Read the full head-to-head →",
      detailEnglishCalloutTitle: "Full head-to-head in English",
      detailEnglishCalloutBody:
        "The full head-to-head – capability matrix, pricing anchors, verdict, FAQ – is published in English at the canonical URL:",
      detailCtaSecondary: "All comparisons",
    },
    es: {
      seoTitle: "Comparaciones de SaaS mano a mano – herramienta A vs herramienta B",
      seoDescription:
        "Comparaciones honestas dimensión por dimensión entre las herramientas SaaS que los founders evalúan lado a lado. Capacidades, anclas de precio, para quién es cada una.",
      breadcrumbHub: "Comparar",
      hubEyebrow: "Mano a mano",
      hubHeadline: "Elegí la herramienta correcta. Dejá de saltar entre pestañas.",
      hubLede:
        "Cada comparación de abajo expone las dimensiones que realmente importan para un founder de SaaS post-launch pre-revenue: para quién es la herramienta, qué hace que la otra no hace, y dónde se queda corta. Sin desprestigios, sin reseñas falsas.",
      hubListAriaLabel: "Lista de comparaciones mano a mano",
      hubReadMoreLabel: "Leer la comparación completa →",
      detailEnglishCalloutTitle: "Comparación mano a mano completa en inglés",
      detailEnglishCalloutBody:
        "La comparación mano a mano completa – matriz de capacidades, anclas de precio, veredicto, FAQ – está publicada en inglés en la URL canónica:",
      detailCtaSecondary: "Todas las comparaciones",
    },
    "pt": {
      seoTitle: "Comparações de SaaS frente a frente – ferramenta A vs ferramenta B",
      seoDescription:
        "Comparações honestas dimensão por dimensão entre as ferramentas SaaS que founders avaliam lado a lado. Capacidades, âncoras de preço, pra quem cada uma é.",
      breadcrumbHub: "Comparar",
      hubEyebrow: "Frente a frente",
      hubHeadline: "Escolha a ferramenta certa. Pare de pular entre abas.",
      hubLede:
        "Cada comparação abaixo expõe as dimensões que realmente importam pra um founder de SaaS pós-launch sem receita: pra quem é a ferramenta, o que ela faz que a outra não faz, e onde ela falha. Sem detratar, sem reviews falsos.",
      hubListAriaLabel: "Lista de comparações frente a frente",
      hubReadMoreLabel: "Ler a comparação completa →",
      detailEnglishCalloutTitle: "Comparação frente a frente completa em inglês",
      detailEnglishCalloutBody:
        "A comparação frente a frente completa – matriz de capacidades, âncoras de preço, veredito, FAQ – está publicada em inglês na URL canônica:",
      detailCtaSecondary: "Todas as comparações",
    },
  },
  // -------------------------------------------------------------------------
  // /category
  // -------------------------------------------------------------------------
  category: {
    "en-US": {
      seoTitle: "SaaS category roundups – the honest landscape per niche",
      seoDescription:
        "Curated category landscapes: who plays in this space, what the typical founder is actually picking between, and what each product is honestly for.",
      breadcrumbHub: "Categories",
      hubEyebrow: "Category roundups",
      hubHeadline: "The honest landscape, one category at a time.",
      hubLede:
        "Each roundup names the products in the category, what each one is honestly for, and which of them a post-launch pre-revenue founder should consider. No paid placements. No invented rankings.",
      hubListAriaLabel: "Category list",
      hubReadMoreLabel: "Read the full roundup →",
      detailEnglishCalloutTitle: "Full roundup in English",
      detailEnglishCalloutBody:
        "The full category roundup – product map, honest verdicts, related teardowns – is published in English at the canonical URL:",
      detailCtaSecondary: "All categories",
    },
    es: {
      seoTitle:
        "Resúmenes de categorías SaaS – el panorama honesto por nicho",
      seoDescription:
        "Panoramas de categoría curados: quién juega en este espacio, entre qué está eligiendo realmente el founder típico, y para qué es honestamente cada producto.",
      breadcrumbHub: "Categorías",
      hubEyebrow: "Resúmenes por categoría",
      hubHeadline: "El panorama honesto, una categoría a la vez.",
      hubLede:
        "Cada resumen nombra los productos de la categoría, para qué es honestamente cada uno, y a cuáles debería considerar un founder post-launch pre-revenue. Sin colocaciones pagas. Sin rankings inventados.",
      hubListAriaLabel: "Lista de categorías",
      hubReadMoreLabel: "Leer el resumen completo →",
      detailEnglishCalloutTitle: "Resumen completo en inglés",
      detailEnglishCalloutBody:
        "El resumen completo de la categoría – mapa de productos, veredictos honestos, teardowns relacionados – está publicado en inglés en la URL canónica:",
      detailCtaSecondary: "Todas las categorías",
    },
    "pt": {
      seoTitle: "Resumos de categorias SaaS – o panorama honesto por nicho",
      seoDescription:
        "Panoramas de categoria curados: quem joga nesse espaço, entre o que o founder típico está de fato escolhendo, e pra que cada produto é honestamente.",
      breadcrumbHub: "Categorias",
      hubEyebrow: "Resumos por categoria",
      hubHeadline: "O panorama honesto, uma categoria por vez.",
      hubLede:
        "Cada resumo nomeia os produtos da categoria, pra que cada um é honestamente, e quais deles um founder pós-launch sem receita deveria considerar. Sem colocações pagas. Sem rankings inventados.",
      hubListAriaLabel: "Lista de categorias",
      hubReadMoreLabel: "Ler o resumo completo →",
      detailEnglishCalloutTitle: "Resumo completo em inglês",
      detailEnglishCalloutBody:
        "O resumo completo da categoria – mapa de produtos, vereditos honestos, teardowns relacionados – está publicado em inglês na URL canônica:",
      detailCtaSecondary: "Todas as categorias",
    },
  },
  // -------------------------------------------------------------------------
  // /funnel-teardown
  // -------------------------------------------------------------------------
  "funnel-teardown": {
    "en-US": {
      seoTitle: "Funnel teardowns – Hook / Story / Offer on real SaaS pages",
      seoDescription:
        "Honest Hook / Story / Offer teardowns of real SaaS funnels. What works, what is missing, what the founder probably believes that the page does not prove.",
      breadcrumbHub: "Funnel teardowns",
      hubEyebrow: "Hook · Story · Offer",
      hubHeadline:
        "What the page is selling, vs what the visitor is actually asked to believe.",
      hubLede:
        "Each teardown runs the same triage: Wrong Person / Weak Offer / Weak Belief. The page is either selling the wrong thing, to the wrong person, with weak proof – or one of those is fine. The teardown labels which.",
      hubListAriaLabel: "Funnel teardown list",
      hubReadMoreLabel: "Read the full teardown →",
      detailEnglishCalloutTitle: "Full teardown in English",
      detailEnglishCalloutBody:
        "The full Hook / Story / Offer teardown – with Wrong Person / Weak Offer / Weak Belief labels and related pricing teardown – is published in English at the canonical URL:",
      detailCtaSecondary: "All teardowns",
    },
    es: {
      seoTitle:
        "Teardowns de funnel – Hook / Story / Offer en páginas SaaS reales",
      seoDescription:
        "Teardowns honestos Hook / Story / Offer de funnels SaaS reales. Qué funciona, qué falta, qué probablemente cree el founder que la página no prueba.",
      breadcrumbHub: "Teardowns de funnel",
      hubEyebrow: "Hook · Story · Offer",
      hubHeadline:
        "Qué está vendiendo la página, contra lo que al visitante se le pide creer.",
      hubLede:
        "Cada teardown corre la misma triage: Wrong Person / Weak Offer / Weak Belief. La página o está vendiendo lo equivocado, a la persona equivocada, con prueba débil – o una de esas está bien. El teardown etiqueta cuál.",
      hubListAriaLabel: "Lista de teardowns de funnel",
      hubReadMoreLabel: "Leer el teardown completo →",
      detailEnglishCalloutTitle: "Teardown completo en inglés",
      detailEnglishCalloutBody:
        "El teardown Hook / Story / Offer completo – con etiquetas Wrong Person / Weak Offer / Weak Belief y el teardown de precio relacionado – está publicado en inglés en la URL canónica:",
      detailCtaSecondary: "Todos los teardowns",
    },
    "pt": {
      seoTitle:
        "Teardowns de funnel – Hook / Story / Offer em páginas SaaS reais",
      seoDescription:
        "Teardowns honestos Hook / Story / Offer de funnels SaaS reais. O que funciona, o que está faltando, o que o founder provavelmente acredita que a página não prova.",
      breadcrumbHub: "Teardowns de funnel",
      hubEyebrow: "Hook · Story · Offer",
      hubHeadline:
        "O que a página está vendendo, contra o que o visitante é pedido pra acreditar.",
      hubLede:
        "Cada teardown roda a mesma triagem: Wrong Person / Weak Offer / Weak Belief. A página ou está vendendo a coisa errada, pra pessoa errada, com prova fraca – ou uma dessas está OK. O teardown rotula qual.",
      hubListAriaLabel: "Lista de teardowns de funnel",
      hubReadMoreLabel: "Ler o teardown completo →",
      detailEnglishCalloutTitle: "Teardown completo em inglês",
      detailEnglishCalloutBody:
        "O teardown Hook / Story / Offer completo – com rótulos Wrong Person / Weak Offer / Weak Belief e o teardown de preço relacionado – está publicado em inglês na URL canônica:",
      detailCtaSecondary: "Todos os teardowns",
    },
  },
  // -------------------------------------------------------------------------
  // /pricing-teardown
  // -------------------------------------------------------------------------
  "pricing-teardown": {
    "en-US": {
      seoTitle:
        "Pricing teardowns – tier structure, anchors, and pricing mechanics",
      seoDescription:
        "Honest pricing teardowns of real SaaS products: tier ladder, anchor moves, free-trial mechanics, what the price is selling that the page is not.",
      breadcrumbHub: "Pricing teardowns",
      hubEyebrow: "Pricing mechanics",
      hubHeadline:
        "The pricing page says one thing. The pricing mechanic says another.",
      hubLede:
        "Each teardown maps the tier ladder, the anchor move, the free-trial mechanic, and the gap between what the price implies and what the page promises. Pricing is a belief mechanism; this is how it actually moves.",
      hubListAriaLabel: "Pricing teardown list",
      hubReadMoreLabel: "Read the full pricing teardown →",
      detailEnglishCalloutTitle: "Full pricing teardown in English",
      detailEnglishCalloutBody:
        "The full pricing teardown – tier map, anchor analysis, mechanic breakdown, related funnel teardown – is published in English at the canonical URL:",
      detailCtaSecondary: "All pricing teardowns",
    },
    es: {
      seoTitle:
        "Teardowns de precio – estructura de tiers, anclas y mecánicas de precio",
      seoDescription:
        "Teardowns honestos de precio de productos SaaS reales: escalera de tiers, movidas de ancla, mecánicas de free trial, qué vende el precio que la página no vende.",
      breadcrumbHub: "Teardowns de precio",
      hubEyebrow: "Mecánicas de precio",
      hubHeadline:
        "La página de precio dice una cosa. La mecánica de precio dice otra.",
      hubLede:
        "Cada teardown mapea la escalera de tiers, la movida de ancla, la mecánica de free trial, y la brecha entre lo que el precio implica y lo que la página promete. El precio es un mecanismo de creencia; así es como se mueve realmente.",
      hubListAriaLabel: "Lista de teardowns de precio",
      hubReadMoreLabel: "Leer el teardown de precio completo →",
      detailEnglishCalloutTitle: "Teardown de precio completo en inglés",
      detailEnglishCalloutBody:
        "El teardown de precio completo – mapa de tiers, análisis de ancla, desglose de mecánica, teardown de funnel relacionado – está publicado en inglés en la URL canónica:",
      detailCtaSecondary: "Todos los teardowns de precio",
    },
    "pt": {
      seoTitle:
        "Teardowns de preço – estrutura de tiers, âncoras e mecânicas de preço",
      seoDescription:
        "Teardowns honestos de preço de produtos SaaS reais: escada de tiers, jogadas de âncora, mecânicas de free trial, o que o preço vende que a página não vende.",
      breadcrumbHub: "Teardowns de preço",
      hubEyebrow: "Mecânicas de preço",
      hubHeadline:
        "A página de preço diz uma coisa. A mecânica de preço diz outra.",
      hubLede:
        "Cada teardown mapeia a escada de tiers, a jogada de âncora, a mecânica de free trial, e o gap entre o que o preço implica e o que a página promete. Preço é um mecanismo de crença; é assim que ele de fato se move.",
      hubListAriaLabel: "Lista de teardowns de preço",
      hubReadMoreLabel: "Ler o teardown de preço completo →",
      detailEnglishCalloutTitle: "Teardown de preço completo em inglês",
      detailEnglishCalloutBody:
        "O teardown de preço completo – mapa de tiers, análise de âncora, desmembramento de mecânica, teardown de funnel relacionado – está publicado em inglês na URL canônica:",
      detailCtaSecondary: "Todos os teardowns de preço",
    },
  },
  // -------------------------------------------------------------------------
  // /answers
  // -------------------------------------------------------------------------
  answers: {
    "en-US": {
      seoTitle: "Answers – direct answers to founder questions",
      seoDescription:
        "Direct answers to the specific questions post-launch pre-revenue SaaS founders ask. Two to four sentences, no fluff, no upsell on every paragraph.",
      breadcrumbHub: "Answers",
      hubEyebrow: "Direct answers",
      hubHeadline: "The answer first. Context after.",
      hubLede:
        "Each entry is one specific founder question and the direct answer in two to four sentences. No fluff, no upsell on every paragraph. If the answer needs more, the supporting bullets follow.",
      hubListAriaLabel: "Answer list",
      hubReadMoreLabel: "Read the full answer →",
      detailEnglishCalloutTitle: "Full answer in English",
      detailEnglishCalloutBody:
        "The full answer – with supporting bullets and related questions – is published in English at the canonical URL:",
      detailCtaSecondary: "All answers",
    },
    es: {
      seoTitle: "Respuestas – respuestas directas a preguntas de founders",
      seoDescription:
        "Respuestas directas a las preguntas específicas que hacen los founders de SaaS post-launch pre-revenue. Dos a cuatro oraciones, sin relleno, sin upsell en cada párrafo.",
      breadcrumbHub: "Respuestas",
      hubEyebrow: "Respuestas directas",
      hubHeadline: "La respuesta primero. El contexto después.",
      hubLede:
        "Cada entrada es una pregunta específica de un founder y la respuesta directa en dos a cuatro oraciones. Sin relleno, sin upsell en cada párrafo. Si la respuesta necesita más, los bullets de apoyo siguen.",
      hubListAriaLabel: "Lista de respuestas",
      hubReadMoreLabel: "Leer la respuesta completa →",
      detailEnglishCalloutTitle: "Respuesta completa en inglés",
      detailEnglishCalloutBody:
        "La respuesta completa – con bullets de apoyo y preguntas relacionadas – está publicada en inglés en la URL canónica:",
      detailCtaSecondary: "Todas las respuestas",
    },
    "pt": {
      seoTitle: "Respostas – respostas diretas a perguntas de founders",
      seoDescription:
        "Respostas diretas pras perguntas específicas que founders de SaaS pós-launch sem receita fazem. Duas a quatro frases, sem enrolação, sem upsell em cada parágrafo.",
      breadcrumbHub: "Respostas",
      hubEyebrow: "Respostas diretas",
      hubHeadline: "A resposta primeiro. O contexto depois.",
      hubLede:
        "Cada entrada é uma pergunta específica de um founder e a resposta direta em duas a quatro frases. Sem enrolação, sem upsell em cada parágrafo. Se a resposta precisar de mais, os bullets de apoio seguem.",
      hubListAriaLabel: "Lista de respostas",
      hubReadMoreLabel: "Ler a resposta completa →",
      detailEnglishCalloutTitle: "Resposta completa em inglês",
      detailEnglishCalloutBody:
        "A resposta completa – com bullets de apoio e perguntas relacionadas – está publicada em inglês na URL canônica:",
      detailCtaSecondary: "Todas as respostas",
    },
  },
  // -------------------------------------------------------------------------
  // /should-i
  // -------------------------------------------------------------------------
  "should-i": {
    "en-US": {
      seoTitle: "Should I…? – binary verdicts on founder decisions",
      seoDescription:
        "Yes / no / depends / not-yet verdicts on the decisions post-launch pre-revenue SaaS founders actually face. One verdict, two to four sentences of reasoning, supporting bullets. No hedging.",
      breadcrumbHub: "Should I…?",
      hubEyebrow: "Founder decisions, direct verdicts",
      hubHeadline: "The verdict first. The reasoning after.",
      hubLede:
        "Each entry is one specific decision a founder faces with a single binary verdict – yes, no, depends, or not-yet – plus the reasoning in two to four sentences. Built to be quotable by AI assistants and useful as a mid-build gut check.",
      hubListAriaLabel: "Decision list",
      hubReadMoreLabel: "Read the full verdict →",
      detailEnglishCalloutTitle: "Full verdict in English",
      detailEnglishCalloutBody:
        "The full verdict – with supporting bullets and related decisions – is published in English at the canonical URL:",
      detailCtaSecondary: "All decisions",
    },
    es: {
      seoTitle: "¿Debería…? – veredictos binarios para decisiones de founders",
      seoDescription:
        "Veredictos sí / no / depende / todavía no para las decisiones que los founders de SaaS post-launch pre-revenue enfrentan en realidad. Un veredicto, dos a cuatro oraciones de razonamiento, bullets de apoyo. Sin hedging.",
      breadcrumbHub: "¿Debería…?",
      hubEyebrow: "Decisiones de founders, veredictos directos",
      hubHeadline: "El veredicto primero. El razonamiento después.",
      hubLede:
        "Cada entrada es una decisión específica que enfrenta un founder con un único veredicto binario – sí, no, depende o todavía no – más el razonamiento en dos a cuatro oraciones. Pensado para que asistentes de IA lo citen y para usarse como chequeo rápido a mitad de build.",
      hubListAriaLabel: "Lista de decisiones",
      hubReadMoreLabel: "Leer el veredicto completo →",
      detailEnglishCalloutTitle: "Veredicto completo en inglés",
      detailEnglishCalloutBody:
        "El veredicto completo – con bullets de apoyo y decisiones relacionadas – está publicado en inglés en la URL canónica:",
      detailCtaSecondary: "Todas las decisiones",
    },
    "pt": {
      seoTitle: "Devo…? – vereditos binários pra decisões de founders",
      seoDescription:
        "Vereditos sim / não / depende / ainda não pras decisões que founders de SaaS pós-launch sem receita realmente enfrentam. Um veredito, duas a quatro frases de raciocínio, bullets de apoio. Sem enrolação.",
      breadcrumbHub: "Devo…?",
      hubEyebrow: "Decisões de founders, vereditos diretos",
      hubHeadline: "O veredito primeiro. O raciocínio depois.",
      hubLede:
        "Cada entrada é uma decisão específica que um founder enfrenta com um único veredito binário – sim, não, depende ou ainda não – mais o raciocínio em duas a quatro frases. Feito pra ser citado por assistentes de IA e usado como check rápido no meio do build.",
      hubListAriaLabel: "Lista de decisões",
      hubReadMoreLabel: "Ler o veredito completo →",
      detailEnglishCalloutTitle: "Veredito completo em inglês",
      detailEnglishCalloutBody:
        "O veredito completo – com bullets de apoio e decisões relacionadas – está publicado em inglês na URL canônica:",
      detailCtaSecondary: "Todas as decisões",
    },
  },
  // -------------------------------------------------------------------------
  // /why-isnt-my
  // -------------------------------------------------------------------------
  "why-isnt-my": {
    "en-US": {
      seoTitle:
        "Why isn’t my … – funnel-element triage in the founder’s own words",
      seoDescription:
        "Specific founder question (“why isn’t my landing page converting?”, “why isn’t my checkout completing?”) answered with Wrong Person / Weak Offer / Weak Belief triage applied to one funnel element.",
      breadcrumbHub: "Why isn’t my…",
      hubEyebrow: "Funnel element triage",
      hubHeadline: "Pick the element that is not working. Get the triage.",
      hubLede:
        "Each page applies the same Wrong Person / Weak Offer / Weak Belief triage to one specific funnel element. Not generic advice – a labeled diagnosis of what is most likely broken and what to test first.",
      hubListAriaLabel: "Funnel element triage list",
      hubReadMoreLabel: "Read the full triage →",
      detailEnglishCalloutTitle: "Full triage in English",
      detailEnglishCalloutBody:
        "The full triage – with the Wrong Person / Weak Offer / Weak Belief labels and the test plan – is published in English at the canonical URL:",
      detailCtaSecondary: "All triages",
    },
    es: {
      seoTitle:
        "¿Por qué mi … no funciona? – triage por elemento del funnel en las palabras del founder",
      seoDescription:
        "Pregunta específica del founder («¿por qué mi landing no convierte?», «¿por qué mi checkout no se completa?») respondida con triage Wrong Person / Weak Offer / Weak Belief aplicada a un elemento del funnel.",
      breadcrumbHub: "¿Por qué mi…?",
      hubEyebrow: "Triage por elemento de funnel",
      hubHeadline:
        "Elegí el elemento que no está funcionando. Recibí el triage.",
      hubLede:
        "Cada página aplica la misma triage Wrong Person / Weak Offer / Weak Belief a un elemento específico del funnel. No es consejo genérico – es un diagnóstico etiquetado de qué está roto con más probabilidad y qué testear primero.",
      hubListAriaLabel: "Lista de triages por elemento de funnel",
      hubReadMoreLabel: "Leer el triage completo →",
      detailEnglishCalloutTitle: "Triage completo en inglés",
      detailEnglishCalloutBody:
        "El triage completo – con las etiquetas Wrong Person / Weak Offer / Weak Belief y el plan de test – está publicado en inglés en la URL canónica:",
      detailCtaSecondary: "Todos los triages",
    },
    "pt": {
      seoTitle:
        "Por que meu … não funciona – triagem por elemento de funnel nas palavras do founder",
      seoDescription:
        "Pergunta específica do founder (“por que minha landing não converte?”, “por que meu checkout não completa?”) respondida com triagem Wrong Person / Weak Offer / Weak Belief aplicada a um elemento do funnel.",
      breadcrumbHub: "Por que meu…?",
      hubEyebrow: "Triagem por elemento de funnel",
      hubHeadline:
        "Escolha o elemento que não está funcionando. Receba a triagem.",
      hubLede:
        "Cada página aplica a mesma triagem Wrong Person / Weak Offer / Weak Belief a um elemento específico do funnel. Não é conselho genérico – é um diagnóstico rotulado do que está mais provavelmente quebrado e o que testar primeiro.",
      hubListAriaLabel: "Lista de triagens por elemento de funnel",
      hubReadMoreLabel: "Ler a triagem completa →",
      detailEnglishCalloutTitle: "Triagem completa em inglês",
      detailEnglishCalloutBody:
        "A triagem completa – com os rótulos Wrong Person / Weak Offer / Weak Belief e o plano de teste – está publicada em inglês na URL canônica:",
      detailCtaSecondary: "Todas as triagens",
    },
  },
  // -------------------------------------------------------------------------
  // /for
  // -------------------------------------------------------------------------
  for: {
    "en-US": {
      seoTitle: "Unlock SaaS for … – product + niche targeting",
      seoDescription:
        "“Unlock SaaS for [niche]” pages that name the specific founder profile, the specific funnel problem at their stage, and what the Playbook produces for that profile in 60 days.",
      breadcrumbHub: "For",
      hubEyebrow: "Niche targeting",
      hubHeadline: "Pick the profile. Read what the Playbook does for it.",
      hubLede:
        "Each page names the specific founder profile, the specific funnel problem at their stage, and what the 60-day Playbook produces for that profile. If your profile is not listed, the diagnostic still works.",
      hubListAriaLabel: "Niche profile list",
      hubReadMoreLabel: "Read the full profile →",
      detailEnglishCalloutTitle: "Full profile in English",
      detailEnglishCalloutBody:
        "The full profile – with funnel-stage diagnosis and 60-day expectation – is published in English at the canonical URL:",
      detailCtaSecondary: "All profiles",
    },
    es: {
      seoTitle: "Unlock SaaS para … – producto + targeting por nicho",
      seoDescription:
        "Páginas «Unlock SaaS para [nicho]» que nombran el perfil específico de founder, el problema específico de funnel en su etapa, y qué produce el Playbook para ese perfil en 60 días.",
      breadcrumbHub: "Para",
      hubEyebrow: "Targeting por nicho",
      hubHeadline: "Elegí el perfil. Leé qué hace el Playbook para él.",
      hubLede:
        "Cada página nombra el perfil específico de founder, el problema específico de funnel en su etapa, y qué produce el Playbook de 60 días para ese perfil. Si tu perfil no está listado, el diagnóstico igual funciona.",
      hubListAriaLabel: "Lista de perfiles por nicho",
      hubReadMoreLabel: "Leer el perfil completo →",
      detailEnglishCalloutTitle: "Perfil completo en inglés",
      detailEnglishCalloutBody:
        "El perfil completo – con diagnóstico por etapa de funnel y expectativa a 60 días – está publicado en inglés en la URL canónica:",
      detailCtaSecondary: "Todos los perfiles",
    },
    "pt": {
      seoTitle: "Unlock SaaS pra … – produto + targeting por nicho",
      seoDescription:
        "Páginas “Unlock SaaS pra [nicho]” que nomeiam o perfil específico de founder, o problema específico de funnel no estágio dele, e o que o Playbook produz pra esse perfil em 60 dias.",
      breadcrumbHub: "Pra",
      hubEyebrow: "Targeting por nicho",
      hubHeadline: "Escolha o perfil. Leia o que o Playbook faz por ele.",
      hubLede:
        "Cada página nomeia o perfil específico de founder, o problema específico de funnel no estágio dele, e o que o Playbook de 60 dias produz pra esse perfil. Se seu perfil não está listado, o diagnóstico ainda funciona.",
      hubListAriaLabel: "Lista de perfis por nicho",
      hubReadMoreLabel: "Ler o perfil completo →",
      detailEnglishCalloutTitle: "Perfil completo em inglês",
      detailEnglishCalloutBody:
        "O perfil completo – com diagnóstico por estágio de funnel e expectativa de 60 dias – está publicado em inglês na URL canônica:",
      detailCtaSecondary: "Todos os perfis",
    },
  },
} as const;

export function getPseoClusterChrome(
  cluster: ClusterKey,
  locale: Locale,
): PageChromePseoCluster {
  return (
    PAGE_CHROME_PSEO[cluster][locale] ?? PAGE_CHROME_PSEO[cluster]["en-US"]
  ) as any;
}

export type { ClusterKey };
