/**
 * Spanish (es) translation of FAQ_ENTRIES.
 *
 * Status: pending-review (see src/lib/i18n/registry.ts).
 * Source: src/lib/faq-data.ts FAQ_ENTRIES (en-US canonical).
 * Translation by: Claude (sales@sipiteno.com session, 2026-05-18).
 *
 * Editorial notes for founder review
 * ----------------------------------
 * - Voice: Reluctant Hero (workbook 02 §3). Plain register, no startup-
 *   marketing buzzwords. Neutral Latin American Spanish (no 'vosotros',
 *   no peninsular idioms) because the dream customer audience distributes
 *   across MX/AR/CO/CL/ES.
 *
 * - Untranslated terms (deliberate brand-glossary preservation):
 *   "Stripe", "Hacker News", "Indie Hackers", "Slack", "Playbook",
 *   "Dream 100", "Hook Story Offer", "Reluctant Hero", "Big Domino",
 *   "founder", "launch post", "outreach", "webhook", "dashboard",
 *   "framework", "milestones" stay in English. These are the brand
 *   DefinedTermSet entity anchors in src/lib/seo/entity.ts.
 *
 * - Numbers stay numeric: $49/mo, $98, 20 outreach, 60 days, Daniil
 *   Khanin's 10,947 signups / 90 paid / 9 years.
 *
 * Approval lock: until the registry flips to `status: "approved"`, the
 * /es/faq route renders with noindex and is omitted from the sitemap.
 */

import type { FaqEntry } from "@/lib/faq-data";

export const FAQ_ENTRIES_ES: FaqEntry[] = [
  {
    category: "Tiempo",
    q: "No tengo tiempo para otro framework más.",
    a: "Te entiendo. Ya leíste los libros, viste los breakdowns en YouTube, te metiste en dos grupos de Slack. Nada de eso te trajo un cliente. El Playbook no es un framework — el framework está enterrado dentro del motor. Respondés 3 a 5 preguntas por paso, el motor arma el trabajo, y vos hacés la acción que te dice que hagas. Para el Paso 7 o te llega un ping de Stripe con tu primera venta, o se dispara la garantía y te devolvemos los $98. Esto no se lee. Se termina.",
  },
  {
    category: "Tácticas",
    q: "Ya hice entrevistas con clientes y no me ayudaron.",
    a: "La mayoría de los founders que dicen esto hicieron dos entrevistas, recibieron feedback amable, y concluyeron que el mercado estaba mal. Sé honesto con qué significa \"intenté\". El Playbook obliga a 20 acciones de outreach registradas antes de que se pueda disparar la garantía — ese es el piso. Si completás 20 y no entra un cobro de Stripe, la oferta estaba mal, y el reembolso te lo dice gratis. La mayoría de los founders nunca llegan a 20. Por eso la mayoría todavía no sabe qué está realmente roto.",
  },
  {
    category: "Señal",
    q: "Aplausos sin pagos significa que mi mercado está muerto.",
    a: "Un founder en Indie Hackers (Daniil Khanin) acaba de publicar: 10.947 signups, 90 pagos, nueve años. Escribió \"Soy malo vendiendo. Nueve años de prueba.\" Eso no es un mercado muerto. Eso es un motor de ventas ausente. El Playbook asume que la gente que aplaude tu launch post no es la gente que paga — y te obliga a ir a buscar a los que sí pagan, con outreach registrado que el motor rastrea. Si 20 de las conversaciones correctas no producen un cobro, se dispara la garantía.",
  },
  {
    category: "Precio",
    q: "$49/mes es mucho cuando todavía no facturo nada.",
    a: "Dos cafés a la semana. Y el tope de tu exposición es $98, no $49. Si el Playbook no produce un cobro verificado en Stripe en 60 días Y vos completaste los milestones del producto, te devolvemos los $98. La mayoría de los founders para los que construí esto gastan más de $98/mes en herramientas que ni abren. Esta es la única herramienta con un contrato: se paga sola en tu dashboard de Stripe, o se devuelve sola a tu cuenta bancaria.",
  },
  {
    category: "Identidad",
    q: "Ya veo el camino. Solo necesito ejecutar.",
    a: "Entonces ejecutá. Abrí Stripe ahora mismo. Si cobraste un cliente nuevo en los últimos 14 días, cerrá esta pestaña. Si no lo hiciste, el camino que ves es el mismo camino que venís viendo hace seis meses — y todavía estás acá leyendo FAQs. El Playbook no te vende un plan nuevo. Ejecuta el plan que ya escribiste y nunca terminaste. La prueba de que funciona es el cobro de Stripe que produce, no el dashboard que muestra.",
  },
  {
    category: "DIY",
    q: "¿No podría construir esto yo mismo?",
    a: "Sí. Probablemente en tres fines de semana. Mientras lo estás construyendo, no estás corriendo el funnel — que es exactamente la enfermedad que el Playbook trata. El webhook de Stripe como prueba, el selector de Dream 100 alimentado por tu workbook bloqueado, el pushback del motor que te refleja tu propia evitación, la lógica de reembolso a 60 días — todo eso lo terminarías en un mes. Y durante ese mes, cero outreach. Serías un founder que eligió construir una herramienta más que nadie paga. Eso no es una decisión de herramienta. Eso es un cuento.",
  },
  {
    category: "Flujo de trabajo",
    q: "Aunque funcione, va a quedar al costado de mi workflow real.",
    a: "Justo. La mayoría de las herramientas hacen eso. Por eso el outreach se envía desde adentro del Playbook, no copiado y pegado a otra pestaña — y por eso el webhook de Stripe se dispara dentro del Playbook cuando tu primer cliente paga. Esos son los dos eventos que importan en la etapa post-launch. Si los dos viven en otro lado, matá la herramienta. Los dos viven acá. El Playbook no es una pestaña que abrís. Es el cuarto en el que hacés el trabajo durante 60 días.",
  },
  {
    category: "Riesgo de precio",
    q: "¿El precio va a subir después? ¿Quedo bloqueado en $49?",
    a: "$49/mes es el único precio del Core. Si introduzco una opción anual o un tier Pro, tu mensualidad sigue siendo $49 hasta que vos elijas cambiarla. No hay vencimiento de descuento de startup, no hay medición por uso, no hay \"tu equipo creció así que ahora son $149.\" El precio es el precio.",
  },
];

const _shapeCheck: FaqEntry = FAQ_ENTRIES_ES[0]!;
void _shapeCheck;
