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
