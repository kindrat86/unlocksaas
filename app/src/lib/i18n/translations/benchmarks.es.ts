/**
 * Spanish (es) translation of the indie SaaS benchmarks catalog.
 *
 * Status: pending-review (see src/lib/i18n/registry.ts).
 * Source: src/lib/benchmarks.ts BENCHMARK_ENTRIES (en-US canonical).
 * Translation by: Claude (sales@sipiteno.com session, 2026-05-20).
 *
 * Editorial notes for founder review
 * ----------------------------------
 * - Voice: Reluctant Hero (workbook 02 §3). Plain register, no startup-
 *   marketing buzzwords. Neutral Latin American Spanish (no 'vosotros',
 *   no peninsular idioms) — same discipline as faq.es.ts and
 *   glossary.es.ts.
 *
 * - Brand glossary preservation (stays English in every locale):
 *   "Stripe", "Playbook", "Brunson", "Hook", "Story", "Offer",
 *   "Stack Slide", "Soap Opera Sequence" (SOS), "Seinfeld Email",
 *   "Dream 100", "Perfect Webinar", "Wrong Person", "Weak Offer",
 *   "Weak Belief", "Verified Builder", "ICP", "PLG", "OTO",
 *   "Apple Mail Privacy Protection", "Core Web Vitals", "LCP", "INP",
 *   "CLS", "Lighthouse", "SPF", "DKIM", "DMARC", "founder",
 *   "outreach", "webhook", "dashboard", "framework", "milestones",
 *   "launch post", "Baymard Institute", "ConvertKit", "ProfitWell",
 *   "Lenny Rachitsky", "OpenView Partners", "Bessemer", "Apollo",
 *   "Hunter", "Lemlist", "Reply.io", "ContentSquare", "Hotjar",
 *   "Indie Hackers", "IndieHackers", "Hacker News", "Apple Pay",
 *   "Lovable", "Claude", "ChatGPT", "GA4", "Vercel", "Next.js",
 *   "PostHog", "Bubble", "v0", "Cursor", "Replit", "Bolt.new".
 *
 * - Pricing in USD verbatim: $1, $9, $19, $27, $49, $99, $149, $497,
 *   etc. Time windows (24h, 48h, 7 days, 30 days, 60 days, 90 days)
 *   preserved. Percent symbols preserved.
 *
 * - Discriminated union literals ("Underperforming", "Typical range",
 *   "Outperforming") MUST stay verbatim — they are TypeScript enum
 *   values that match the canonical BenchmarkEntry shape. The
 *   render-time chrome (PAGE_CHROME_BENCHMARKS) provides the localized
 *   display labels for those bands.
 *
 * - Overlay shape: this file translates only the textual fields. The
 *   structural fields (slug, drivers count, faqs count) match the
 *   canonical. The metric display name (e.g., "tasa de conversión de
 *   landing page") is locale-specific but slug stays English.
 *
 * - Approval lock: until the registry flips to `status: "approved"`,
 *   /es/benchmarks and /es/benchmarks/<slug> render with noindex and
 *   are omitted from the sitemap.
 */

export interface BenchmarkTranslation {
  /** Must match a slug in the canonical BENCHMARK_ENTRIES. */
  slug: string;
  /** Localized display name of the metric. */
  metric: string;
  metaTitle: string;
  metaDescription: string;
  /** Direct AEO answer paragraph (40-60 words). */
  aeoAnswer: string;
  bands: ReadonlyArray<{
    /** Verbatim literal — matches canonical discriminated union. */
    label: "Underperforming" | "Typical range" | "Outperforming";
    /** Localized numeric range. */
    range: string;
    /** Localized diagnosis. */
    diagnosis: string;
  }>;
  drivers: ReadonlyArray<string>;
  misreadings: ReadonlyArray<string>;
  faqs: ReadonlyArray<{ q: string; a: string }>;
  sourceNote: string;
}

export const BENCHMARK_ENTRIES_ES: ReadonlyArray<BenchmarkTranslation> = [
  {
    slug: "landing-page-conversion-rate",
    metric: "tasa de conversión de landing page",
    metaTitle: "Tasa de conversión promedio de landing page (SaaS)",
    metaDescription:
      "Las landing pages de indie SaaS convierten al 1% al 5% sobre tráfico frío. Debajo del 1% indica Wrong Person; arriba del 5% suele ser contaminación de audiencia tibia.",
    aeoAnswer:
      "Para landing pages de indie SaaS sobre tráfico frío, una tasa de conversión sana se ubica entre 1% y 5%. Debajo del 1% casi siempre apunta a un problema de Wrong Person (el tráfico no encaja con la oferta). Arriba del 5% sobre tráfico genuinamente frío suele indicar contaminación de audiencia tibia — la fuente no es tan fría como dice el dashboard.",
    bands: [
      {
        label: "Underperforming",
        range: "Menos del 1%",
        diagnosis:
          "Tráfico Wrong Person. La audiencia que visita no encaja con la oferta de la página. Arreglá la fuente de tráfico o el marco del titular antes de hacer cualquier A/B test.",
      },
      {
        label: "Typical range",
        range: "1% al 5%",
        diagnosis:
          "Conversión normal sobre tráfico frío. Los refinamientos (titular, prueba, copy del CTA) mueven dentro de esta banda; los cambios estructurales te mueven fuera de ella. Abajo del 2% es el piso de la banda, arriba del 4% es el techo.",
      },
      {
        label: "Outperforming",
        range: "Más del 5%",
        diagnosis:
          "Contaminación de audiencia tibia es la explicación más común. Verificá la fuente. Si es genuinamente frío, la página está haciendo el trabajo de una sales letter y la oferta está excepcionalmente bien enmarcada.",
      },
    ],
    drivers: [
      "Audience-page fit (el driver más grande, por 10x)",
      "Elemento de prueba above the fold (resultados verificados, credenciales del founder)",
      "Presencia y calidad del Stack Slide",
      "Visibilidad de la reversión de riesgo (términos de garantía arriba del CTA)",
      "Especificidad del titular (cohort nombrado + resultado nombrado)",
    ],
    misreadings: [
      "Leer la tasa de conversión antes de 200 visitantes calificados. El sample size es muy chico.",
      'Comparar tu tasa contra el "promedio de la industria" entre SaaS. Indie SaaS tiene una base distinta a enterprise.',
      "Optimizar el color del botón cuando el diagnóstico está a nivel del marco del titular.",
    ],
    faqs: [
      {
        q: "¿Cuál es una buena tasa de conversión para una pricing page de SaaS específicamente?",
        a: 'Las pricing pages convierten típicamente al 2% al 8% de los visitantes que llegan a ellas (no del tráfico total del sitio). La definición de conversión importa: "clickeó Buy" vs "completó el pago" difieren del 40% al 70%.',
      },
      {
        q: "¿Cómo sé si el problema es mi tráfico o mi página?",
        a: "Si la conversión está debajo del 1% pero el engagement (tiempo en página, scroll depth) está sano, la página está bien y el problema es el tráfico. Si el engagement también está débil (menos de 30 segundos, menos del 30% de scroll), el problema es la página.",
      },
      {
        q: "¿La definición de tasa de conversión incluye signups de free trial?",
        a: 'La convención varía. La definición Brunson cuenta el momento en que un comprador se compromete a algo irreversible (pago, llamada agendada). Los signups de free trial son "micro-conversiones" y convierten a tasas más altas (5% al 25%), pero la conversión paga es el número que carga el peso.',
      },
    ],
    sourceNote:
      "Rango basado en la data observada por el founder a través de 41 funnel teardowns de indie SaaS publicados entre enero y mayo de 2026, cruzado con benchmarks públicos del Baymard Institute y la encuesta 2024 de operadores indie de ConvertKit. Usar como ancla direccional, no como pronóstico.",
  },
  {
    slug: "checkout-completion-rate",
    metric: "tasa de finalización de checkout",
    metaTitle: "Tasa de finalización de checkout promedio (SaaS)",
    metaDescription:
      "La finalización de checkout de indie SaaS (click en Buy a pago exitoso) se ubica al 40% al 70% sobre tráfico frío. Debajo del 40% significa que la oferta se está relitigando en el checkout.",
    aeoAnswer:
      'La finalización de checkout sobre tráfico frío para indie SaaS (la conversión del click en "Buy" al pago exitoso) se ubica entre 40% y 70%. Debajo del 40% casi siempre significa que la oferta se está relitigando en el checkout — el precio no se ancló upstream. Arriba del 70% sobre tráfico frío suele significar que el precio es muy bajo para actuar como un ancla seria.',
    bands: [
      {
        label: "Underperforming",
        range: "Menos del 40%",
        diagnosis:
          'La oferta se está relitigando en el checkout. El precio no se ancló en la landing page, así que el comprador llega al checkout preguntando "¿vale la pena?" en lugar de "¿cómo pago?".',
      },
      {
        label: "Typical range",
        range: "40% al 70%",
        diagnosis:
          "Flujo de checkout sano. Las optimizaciones (Apple Pay, menos campos del formulario, layout mobile-first) mueven dentro de esta banda; los cambios a nivel oferta no son el cuello de botella.",
      },
      {
        label: "Outperforming",
        range: "Más del 70%",
        diagnosis:
          "El precio está sin anclar (bajo) o el tráfico está muy pre-vendido (referido tibio, cliente recurrente). Verificá que tu oferta esté valuada para el valor que realmente entregás.",
      },
    ],
    drivers: [
      "Visibilidad del precio en la página ANTES del botón Buy (driver enorme)",
      "Presencia del Stack Slide (configura el ancla de precio)",
      "Garantía expuesta en el paso de checkout mismo, no enterrada en la FAQ",
      "Cantidad de campos del formulario (cada campo extra arriba de 2 reduce la finalización 5% al 15%)",
      "Velocidad del checkout mobile (debajo de 60 segundos punta a punta)",
    ],
    misreadings: [
      'Confundir "cart abandonment" (carrito guardado no completado en 24 horas) con "checkout abandonment" (Buy clickeado, pago no completado en sesión). Son métricas distintas.',
      'Tratar la disponibilidad de Apple Pay como un "fix" cuando el diagnóstico está upstream en el enmarcado de la oferta.',
      "Leer la tasa de finalización sobre menos de 100 clicks en Buy. Hacen falta 200+ para que la tasa se estabilice.",
    ],
    faqs: [
      {
        q: "¿Apple Pay realmente sube la finalización de checkout?",
        a: "Sí, marginalmente. La disponibilidad de Apple Pay sube la finalización mobile en 5 a 15 puntos porcentuales sobre tráfico tibio. No arregla un diagnóstico de Weak Offer ni Weak Belief upstream. Agregalo después de arreglar las causas upstream.",
      },
      {
        q: "¿Cuánto importan realmente los campos del formulario?",
        a: 'Mucho. Cada campo del formulario arriba de email + payment reduce la finalización 5% al 15%. El campo "solo recolectá su dirección para envío" en un producto digital cuesta 10% al 20% de las finalizaciones. Sé despiadado.',
      },
      {
        q: "¿Por qué mi tasa de checkout B2B es tanto más baja que B2C?",
        a: "El checkout B2B suele involucrar un paso de procurement o una aprobación de un gerente, que estira el tiempo a finalización de minutos a semanas. El fix Brunson es exponer el camino procurement-friendly (factura, licencia multi-asiento) prominentemente para que el camino a finalización siga visible.",
      },
    ],
    sourceNote:
      "Rango basado en la investigación de cart-abandonment del Baymard Institute y el rango observado por el founder a través de 41 teardowns de indie SaaS. Baymard publica el promedio universal; el subset de indie SaaS corre 5 a 10 puntos arriba del baseline de ecommerce por mayor intencionalidad del tráfico.",
  },
  {
    slug: "tripwire-conversion-rate",
    metric: "tasa de conversión de tripwire",
    metaTitle: "Tasa de conversión promedio de tripwire (Ofertas de $1)",
    metaDescription:
      "La conversión de tripwire sobre tráfico frío se ubica al 3% al 12% para tripwires SaaS debajo de $10. Debajo del 3% se siente trampa; arriba del 12% filtra tire-kickers.",
    aeoAnswer:
      "La conversión de tripwire sobre tráfico frío para indie SaaS se ubica entre 3% y 12% para tripwires con precio debajo de $10. Debajo del 3% significa que la oferta se siente como una trampa (la cuenta no le cierra al comprador). Arriba del 12% suele significar que el tripwire está filtrando tire-kickers que no van a subir a la oferta core.",
    bands: [
      {
        label: "Underperforming",
        range: "Menos del 3%",
        diagnosis:
          'La promesa del tripwire es muy grande para su precio. El lector asume una trampa. Ajustá el tamaño de la promesa o agregá "una sola vez, sin suscripción" textual al botón de compra.',
      },
      {
        label: "Typical range",
        range: "3% al 12%",
        diagnosis:
          "Tripwire sano. La cuenta se siente honesta para el lector y convierte a una tasa que llena la parte de arriba de la value ladder.",
      },
      {
        label: "Outperforming",
        range: "Más del 12%",
        diagnosis:
          "El tripwire está convirtiendo tire-kickers. Revisá la tasa de conversión de tripwire a core. Si está debajo del 5%, el tripwire está filtrando al cohort equivocado.",
      },
    ],
    drivers: [
      "Ratio promesa-a-precio (el factor único que más carga peso)",
      'Texto explícito de "una sola vez, sin suscripción" en el botón de compra',
      "Camino natural-siguiente-paso hacia la oferta core",
      "Velocidad de entrega (debajo de 90 segundos del pago al acceso)",
      "Visibilidad de la política de reembolso",
    ],
    misreadings: [
      "Leer la conversión del tripwire en aislamiento. La métrica que importa es tripwire-a-core, no tripwire-a-cualquiera.",
      "Bajar el precio para arreglar la conversión cuando el diagnóstico es que se siente trampa. Un precio más bajo no arregla un problema de cuenta-que-parece-fake.",
      "Comparar la conversión del tripwire con la conversión de la landing page. Son distintos pasos del funnel con baselines distintos.",
    ],
    faqs: [
      {
        q: "¿Cuál es el precio correcto para un tripwire?",
        a: "$1 a $7 si la promesa es una sola cosa terminada y acotada. $7 a $27 si la promesa es un compromiso de varios días. Arriba de $27 la oferta ya no es un tripwire y debería estar valuada como una oferta core.",
      },
      {
        q: "¿El tripwire debería tener un upsell?",
        a: "Casi siempre. La tasa de toma del OTO en un tripwire es típicamente 15% al 35%, que muchas veces supera la facturación del front-end. Un tripwire sin OTO está dejando más dinero sobre la mesa que el tripwire mismo genera.",
      },
      {
        q: "¿Qué tasa de conversión de tripwire-a-core debería esperar?",
        a: "5% al 15% de los compradores de tripwire suben a la oferta core dentro de 30 días. Debajo del 5% significa que la ladder está rota (sin natural-next-step). Arriba del 15% suele significar que el tripwire era redundante — los compradores hubieran comprado el core directamente.",
      },
    ],
    sourceNote:
      "Rango basado en la data observada por el founder a través de 41 teardowns de indie SaaS y validado contra los patrones Brunson de tripwire documentados en DotCom Secrets. Usar como ancla direccional específicamente para indie SaaS; los tripwires de ecommerce (trial de producto físico) corren baselines distintos.",
  },
  {
    slug: "email-open-rate",
    metric: "tasa de apertura de email",
    metaTitle: "Tasa de apertura de email promedio (Founder SaaS)",
    metaDescription:
      "Las tasas de apertura sobre lista comprometida para emails de founder indie SaaS se ubican al 30% al 55%. Debajo del 30% casi siempre es deliverability, no subject lines.",
    aeoAnswer:
      "Las tasas de apertura sobre lista comprometida para emails de founder indie SaaS se ubican entre 30% y 55%. Debajo del 30% casi siempre es un problema de deliverability (alineación de SPF/DKIM/DMARC o envíos a la cola desinteresada), no un problema de subject line. Arriba del 55% suele significar que la lista es chica y está muy curada.",
    bands: [
      {
        label: "Underperforming",
        range: "Menos del 30%",
        diagnosis:
          "Problema de deliverability primero. Pasá el dominio de envío por mail-tester.com. Un puntaje debajo de 8/10 indica desalineación de SPF, DKIM o DMARC. Arreglá eso antes de tocar subject lines.",
      },
      {
        label: "Typical range",
        range: "30% al 55%",
        diagnosis:
          "Tasa de apertura sana. Los refinamientos del subject line y los cambios de nombre del sender mueven dentro de esta banda. Debajo del 40% sugiere espacio para mejorar la especificidad del subject; arriba del 50% es excelente para la madurez de una lista fría.",
      },
      {
        label: "Outperforming",
        range: "Más del 55%",
        diagnosis:
          "Lista chica y muy curada, o cohort tibio (suscriptores pagos, clientes recientes). Verificá por segmento: los suscriptores adquiridos en frío no deberían abrir al 55%+ consistentemente.",
      },
    ],
    drivers: [
      "Deliverability (alineación de SPF/DKIM/DMARC) — el driver dominante debajo del 30%",
      "Nombre del sender (nombre del founder le gana al nombre de la marca por 15% al 40%)",
      "Especificidad del subject line (entregable específico le gana al enmarcado vago de newsletter)",
      "Higiene de la lista (enviar solo al segmento comprometido)",
      "Frecuencia de envío (2 a 4 por semana es el sweet spot)",
    ],
    misreadings: [
      "Apple Mail Privacy Protection infla las tasas de apertura en 20 a 40 puntos porcentuales sobre listas iOS-pesadas. Tratá las aperturas de Apple Mail como tal vez-aperturas, no como aperturas.",
      "Leer la tasa de apertura sin la tasa de click. La tasa de click es la métrica que carga peso; las aperturas son ruidosas.",
      "Optimizar subject lines cuando el diagnóstico es deliverability. Los subject lines mueven aperturas 5 a 15 puntos porcentuales; la deliverability las mueve 30 a 50.",
    ],
    faqs: [
      {
        q: "¿Por qué mis tasas de apertura están bajando aunque mi contenido es el mismo?",
        a: "Casi siempre por envejecimiento de la lista. Los suscriptores se vuelven dormidos a lo largo de meses; mandarles a suscriptores dormidos lastima la deliverability, que suprime las aperturas en la cola comprometida. Segmentá afuera a los suscriptores dormidos (sin aperturas en 90 días) y mandá solo al segmento comprometido por 2 semanas.",
      },
      {
        q: "¿Debería mandar desde mi propio nombre o desde el nombre de mi marca?",
        a: '"Maryan de Unlock SaaS" le gana a "Unlock SaaS Team" por 15% al 40% en aperturas. El lector compra la relación antes de comprar la marca.',
      },
      {
        q: "¿Qué tan precisa es la inflación de tasa de apertura de Apple?",
        a: "Difícil de medir con precisión, pero la mayoría de los operadores ven tasas de apertura iOS 20 a 40 puntos porcentuales más altas que las lecturas reales (Apple precarga las imágenes sin importar si el usuario abrió el email). Tratá la tasa de click como la señal de engagement honesta.",
      },
    ],
    sourceNote:
      "Rango basado en los benchmarks 2024 de creadores indie de ConvertKit y validado contra la data observada por el founder en operaciones de newsletter personales. Excluye la inflación por Apple Mail Privacy Protection donde sea posible.",
  },
  {
    slug: "email-click-rate",
    metric: "tasa de click de email",
    metaTitle: "Tasa de click de email promedio (Founder SaaS)",
    metaDescription:
      "Las tasas de click sobre lista comprometida para emails de founder indie SaaS se ubican al 3% al 12%. Debajo del 3% significa que el CTA no está atado a un resultado específico del lector.",
    aeoAnswer:
      "Las tasas de click-through para emails de founder indie SaaS se ubican entre 3% y 12% de las aperturas. Debajo del 3% casi siempre significa que el CTA no está atado a un resultado específico del lector. Arriba del 12% suele significar cohort tibio (suscriptores pagos, clientes recientes) o un email de Soap Opera Sequence donde el click es parte del arco narrativo.",
    bands: [
      {
        label: "Underperforming",
        range: "Menos del 3%",
        diagnosis:
          'El CTA es genérico ("mirá esto", "más info"). Un copy de CTA específico atado a un resultado del lector mueve esta banda al instante.',
      },
      {
        label: "Typical range",
        range: "3% al 12%",
        diagnosis:
          "Tasa de click sana. El email está haciendo el trabajo y el CTA es lo suficientemente específico para actuar. Los refinamientos (posición del link, botón vs texto, línea P.S.) mueven dentro de esta banda.",
      },
      {
        label: "Outperforming",
        range: "Más del 12%",
        diagnosis:
          "Cohort tibio o payoff de arco narrativo. El click penúltimo de un email Soap Opera puede pegar 20%+ porque la secuencia armó momentum.",
      },
    ],
    drivers: [
      'Especificidad del CTA (atado al resultado del lector le gana a "más info")',
      "Posición del link (above the fold, más uno cerca del final)",
      "Línea P.S. (subutilizada; muchas veces el elemento más clickeado)",
      "Plain-text vs HTML (plain-text suele superar al HTML pesado)",
      "Posición en la secuencia (los emails más tardíos en la secuencia suelen tener tasas de click más altas)",
    ],
    misreadings: [
      "Leer la tasa de click sin separar por posición en la secuencia. Los emails 3 y 4 de la Soap Opera deberían clickear más alto que el email 1.",
      'Confundir "click rate" (clicks por entregado) con "click-to-open rate" (clicks por apertura). Esta última suele ser 2 a 3x la primera.',
      "Optimizar el color del botón cuando el diagnóstico es el copy del CTA.",
    ],
    faqs: [
      {
        q: "¿Debería incluir más o menos links por email?",
        a: "Menos, casi siempre. Un CTA primario más un link P.S. al mismo destino le gana a tres links que compiten. La excepción es un email curado tipo \"lo mejor de la semana\" donde el formato mismo promete múltiples links.",
      },
      {
        q: "¿Los botones son mejores que los links de texto?",
        a: "Los botones suelen superar a los links de texto 1.5 a 2x sobre la misma oferta. La excepción es en el patrón del Seinfeld Email donde un email casual del founder se lee más auténtico con un solo link de texto. Casá el formato con la voz del email.",
      },
      {
        q: "¿Cómo mejoro los clicks en una lista plana?",
        a: "Casi siempre upstream: mejorá la tasa de apertura primero (deliverability + nombre del sender), después refiná el CTA. Una tasa de click plana sobre una lista con tasa de apertura del 20% es difícil de diagnosticar porque el sample es muy chico.",
      },
    ],
    sourceNote:
      "Rango basado en los benchmarks 2024 de operadores indie de ConvertKit para creadores con 1.000 a 25.000 suscriptores. Validado contra la data observada por el founder en Soap Opera Sequence y Seinfeld Email.",
  },
  {
    slug: "trial-to-paid-conversion",
    metric: "conversión de trial a pago",
    metaTitle: "Conversión promedio de trial a pago (SaaS)",
    metaDescription:
      "La conversión de trial a pago de indie SaaS se ubica al 8% al 25% para free trials y al 30% al 60% para trials de $1. La activación es el driver dominante.",
    aeoAnswer:
      'La conversión de trial a pago para indie SaaS se ubica entre 8% y 25% para free trials y entre 30% y 60% para trials de $1 (donde el usuario ya entró una tarjeta). El driver dominante es el momento de activación en la primera sesión, no el follow-up por email. Un usuario que llega a un momento "aha" en la sesión uno convierte a 2 a 4x la tasa de uno que no.',
    bands: [
      {
        label: "Underperforming",
        range: "Menos del 8% (free trial) / Menos del 30% (trial de $1)",
        diagnosis:
          "El momento de activación no está construido en el flujo del trial. El usuario se registra, mira alrededor y rebota antes de llegar al punto donde el valor es obvio.",
      },
      {
        label: "Typical range",
        range: "8% al 25% (free trial) / 30% al 60% (trial de $1)",
        diagnosis:
          "Conversión de trial sana. Los refinamientos al flujo de onboarding y las mejoras al momento de activación componen acá. El follow-up por email juega un rol de soporte.",
      },
      {
        label: "Outperforming",
        range: "Más del 25% (free trial) / Más del 60% (trial de $1)",
        diagnosis:
          "Cohort de trial muy pre-vendido (referido tibio, usuario recurrente) o un producto cuyo valor se revela en la primera sesión por diseño.",
      },
    ],
    drivers: [
      "Tiempo a activación (el momento de valor obvio en la sesión uno)",
      "Tipo de trial (trial de $1 vs free trial — la brecha es de 3 a 4x)",
      "Diseño del flujo de onboarding (guiado > self-serve > nada)",
      "Soap Opera Sequence por email durante el trial",
      "Outreach liderado por el founder para SaaS de alto ticket ($99+/mes)",
    ],
    misreadings: [
      "Leer la conversión del trial sin separar usuarios activados vs no activados. La conversión de los activados suele ser 5 a 10x la de los no activados.",
      "Optimizar el email de fin de trial cuando el diagnóstico es la activación. El email es late game; la activación es la primera movida.",
      "Comparar la conversión del free trial contra la conversión del trial de $1. La brecha de 4x es estructural, no optimizable.",
    ],
    faqs: [
      {
        q: "¿Debería usar un trial de $1 o un free trial?",
        a: "Depende del ICP. El trial de $1 pre-califica compradores serios y convierte a 3 a 4x la tasa; el free trial tira la red más ancha y trae más usuarios de trial. Para SaaS de alto ticket ($49+/mes), el trial de $1 casi siempre gana en calidad de cohort.",
      },
      {
        q: "¿Qué tan largo debería ser el trial?",
        a: "7 días para SaaS simple, 14 días para complejidad moderada, 30 días para herramientas enterprise. Los trials más largos no aumentan la conversión — aumentan el porcentaje de usuarios que nunca activan. La mayoría de los usuarios deciden dentro de las primeras 48 horas sin importar la duración del trial.",
      },
      {
        q: "¿Debería extender un trial que no activó?",
        a: 'Una vez, con outreach liderado por el founder. "Veo que te registraste pero no hiciste X todavía — ¿te puedo ayudar?" convierte al 10% al 25% sobre trials no activados. La extensión automática sin outreach casi nunca convierte; el usuario ya perdió el interés.',
      },
    ],
    sourceNote:
      "Rango basado en múltiples benchmarks públicos de indie SaaS (encuesta PMF de Lenny Rachitsky, reporte de SaaS metrics de ProfitWell) y la data observada por el founder a través de 41 teardowns. El rango del trial de $1 está sesgado hacia implementaciones de value ladder Brunson.",
  },
  {
    slug: "saas-churn-rate",
    metric: "tasa de churn de SaaS",
    metaTitle: "Tasa de churn mensual promedio de SaaS (Indie)",
    metaDescription:
      "El churn mensual de indie SaaS se ubica al 5% al 12% para SMB y al 3% al 7% para B2B mid-market. La desagregación por cohort importa más que el número titular.",
    aeoAnswer:
      "El churn mensual para indie SaaS se ubica entre 5% y 12% para productos enfocados a SMB y 3% al 7% para B2B mid-market. El número titular es casi siempre engañoso — la desagregación por cohort (pago vs free trial, mensual vs anual, ICP-fit vs ICP-miss) cuenta la historia real. Un churn titular del 10% que esconde un churn ICP-miss del 25% es un problema de positioning, no un problema de producto.",
    bands: [
      {
        label: "Underperforming",
        range: "Más del 12% mensual (SMB) / Más del 7% mensual (B2B mid-market)",
        diagnosis:
          "El positioning atrae signups del wrong-fit (lo más común) o el momento de activación no es suficientemente fuerte para retener. Revisá el churn de los primeros 30 días por separado del churn de estado estable.",
      },
      {
        label: "Typical range",
        range: "5% al 12% mensual (SMB) / 3% al 7% mensual (B2B)",
        diagnosis:
          "Churn normal de indie SaaS. Las optimizaciones en emails de retención, prompts de upgrade y flujos de re-activación componen acá. El trabajo de ICP-fit te saca de la banda.",
      },
      {
        label: "Outperforming",
        range: "Menos del 5% mensual (SMB) / Menos del 3% mensual (B2B)",
        diagnosis:
          "Encaje excelente. Suele ser un mix de clientes pesado en anual (los planes anuales churnean 3 a 5x menos que mensuales) o un producto cuyo valor se revela con el tiempo y crea costo de cambio.",
      },
    ],
    drivers: [
      "Encaje con el ICP (el driver dominante, por lejos)",
      "Mix de planes anual vs mensual (anual churnea 3 a 5x menos)",
      "Activación de primeros 30 días (predice el churn de estado estable)",
      "Campañas de re-activación para usuarios dormidos",
      "Encaje honesto de precio (downgrades > cancelaciones totales)",
    ],
    misreadings: [
      "Mirar el churn titular mensual sin separar cohorts. Los clientes anuales, los mensuales y los convertidos desde trial tienen baselines distintos.",
      "Confundir churn voluntario (cancelaciones) con churn involuntario (pagos fallidos). El churn involuntario se arregla con lógica de retry, no con trabajo de retención.",
      'Leer el churn después de 30 días como un número "arreglable". Los primeros 30 días son activación; el churn de estado estable es la métrica de retención.',
    ],
    faqs: [
      {
        q: "¿Debería enfocarme en reducir churn o en aumentar adquisición?",
        a: "Si el churn mensual está arriba del 10%, reducí churn primero. La adquisición a un balde con agujeros es no rentable. Debajo del 7%, la adquisición compone. El patrón de value ladder Brunson dice: el back-end (retención, upsell) paga por el front-end (adquisición), no al revés.",
      },
      {
        q: "¿Cuál es la mejor forma de reducir churn voluntario?",
        a: "Los flujos pre-cancelación que ofrecen pausa, downgrade o ayuda específica por caso de uso convierten 20% al 40% de las cancelaciones. El driver dominante es si el usuario llegó al momento de activación; los usuarios que nunca activaron cancelan y no se salvan con un flujo pre-cancel.",
      },
      {
        q: "¿Cuánto del churn es involuntario (pagos fallidos)?",
        a: "Típicamente 20% al 40% del churn total es involuntario (tarjeta rechazada, vencida, etc.). Una lógica de retry inteligente (múltiples intentos en 7 días) recupera 50% al 70% del churn involuntario. Esto es trabajo de infraestructura de alto ROI, no trabajo de retención.",
      },
    ],
    sourceNote:
      "Rango basado en los benchmarks 2024 de SaaS de ProfitWell, la encuesta PMF de Lenny Rachitsky y el rango observado por el founder a través de teardowns. Las bandas SMB y B2B mid-market son aproximadamente inversas al tamaño del deal.",
  },
  {
    slug: "webinar-show-up-rate",
    metric: "tasa de asistencia a webinar",
    metaTitle: "Tasa promedio de asistencia a webinar (Benchmarks en vivo)",
    metaDescription:
      "Las tasas de asistencia a webinars en vivo se ubican al 25% al 50% de las inscripciones. Debajo del 25% significa que el título prometió de más; arriba del 50% significa juego pesado de recordatorios.",
    aeoAnswer:
      "Las tasas de asistencia a webinars en vivo para indie SaaS se ubican entre 25% y 50% de las inscripciones. Debajo del 25% suele significar que la página de inscripción prometió más de lo que el contenido entrega. Arriba del 50% casi siempre significa una secuencia de recordatorios pesada (3+ toques en las 48 horas previas al evento) más un calendar block.",
    bands: [
      {
        label: "Underperforming",
        range: "Menos del 25%",
        diagnosis:
          "La página de inscripción prometió más de lo que el webinar entrega. El inscripto decide no aparecer entre la inscripción y el vivo. Revisá el match entre título y contenido.",
      },
      {
        label: "Typical range",
        range: "25% al 50%",
        diagnosis:
          "Tasa de asistencia sana. La secuencia de recordatorios (2 a 3 emails, un SMS para alto ticket) mueve esta banda. El calendar block en la página de inscripción ayuda en la mitad superior.",
      },
      {
        label: "Outperforming",
        range: "Más del 50%",
        diagnosis:
          "Juego pesado de recordatorios, inscripción paga, o llamada de calificación pre-evento. Común para webinars de oferta de alto ticket ($1K+).",
      },
    ],
    drivers: [
      "Secuencia de recordatorios (el driver movible más grande)",
      "Calendar block en la página de inscripción",
      "Match título-contenido (prometer de más hunde la asistencia)",
      "Encaje del horario con la audiencia",
      "Disponibilidad de replay (paradójicamente, SIN replay = mayor asistencia)",
    ],
    misreadings: [
      "Leer la tasa de asistencia sin considerar el comportamiento del replay-viewer. Los viewers de replay y los asistentes en vivo son cohorts distintos.",
      "Comparar la asistencia de webinar gratuito con la asistencia de webinar pago. Los webinars pagos corren 60% al 85% de asistencia; los gratuitos 25% al 50%.",
      'Tratar la baja asistencia como un problema de "subject line". Casi siempre es un problema de promesa vs entrega.',
    ],
    faqs: [
      {
        q: "¿Debería ofrecer replay?",
        a: "Sí, con vencimiento de 48 horas. Sin replay maximiza la asistencia en vivo; el replay ilimitado la hunde. La ventana de replay de 48 horas es el patrón del Perfect Webinar de Brunson — preserva la urgencia sin castigar conflictos razonables de agenda.",
      },
      {
        q: "¿Cuál es el mejor día y horario para un webinar?",
        a: "Para B2C, noches de día de semana (19-21h local). Para B2B, martes o miércoles a la mañana (10-12h local). Evitá lunes a la mañana (catch-up de calendario) y viernes a la tarde (cognitive offload). El horario mueve la asistencia 5 a 15 puntos porcentuales.",
      },
      {
        q: "¿Cuántos emails de recordatorio debería mandar?",
        a: 'Tres: uno a las 24 horas, uno a la hora previa, uno en "estamos arrancando ahora". Un recordatorio por SMS a la hora previa puede subir la asistencia otros 5 a 10 puntos porcentuales si la audiencia optó en SMS. Más de tres recordatorios entrenan a la audiencia a ignorarlos.',
      },
    ],
    sourceNote:
      "Rango basado en implementaciones del Perfect Webinar de Brunson y el rango observado por el founder a través de webinars de coaching de alto ticket. Las bandas de webinar gratuito asumen inscripción genuinamente gratuita (sin gating de email más allá del formulario).",
  },
  {
    slug: "saas-mrr-growth-rate",
    metric: "tasa de crecimiento de MRR de SaaS",
    metaTitle: "Tasa promedio de crecimiento mensual de MRR (SaaS Indie)",
    metaDescription:
      "El crecimiento mensual de MRR de indie SaaS se ubica al 5% al 15% en MRR de $1K-$10K y al 3% al 8% en $10K-$100K. El crecimiento se desacelera con la escala.",
    aeoAnswer:
      "El crecimiento mensual de MRR para indie SaaS se ubica al 5% al 15% durante la etapa de $1K-$10K, 3% al 8% durante $10K-$100K, y 1% al 4% arriba de $100K MRR. La desaceleración es estructural — la misma cantidad de clientes nuevos representa un porcentaje de crecimiento más chico cuando el MRR escala. Compuesto al 5%/mes rinde ~80% YoY.",
    bands: [
      {
        label: "Underperforming",
        range: "Menos del 5%/mes en $1K-$10K MRR / Menos del 3%/mes en $10K-$100K MRR",
        diagnosis:
          "La adquisición se estancó o el churn se está comiendo las altas de clientes nuevos. Mirá el MRR neto-nuevo (nuevo menos churneado) y el MRR bruto-nuevo por separado.",
      },
      {
        label: "Typical range",
        range: "5% al 15%/mes en $1K-$10K / 3% al 8%/mes en $10K-$100K",
        diagnosis:
          "Crecimiento sano de indie SaaS. El funnel está componiendo. Los clientes nuevos cubren el churn más suman MRR neto. Rango operativo estándar.",
      },
      {
        label: "Outperforming",
        range: "Más del 15%/mes en $1K-$10K / Más del 8%/mes en $10K-$100K",
        diagnosis:
          "Crecimiento caliente. Mecánicas virales, partnership-driven o tailwind estacional. Verificá sostenibilidad antes de tratarlo como el nuevo baseline.",
      },
    ],
    drivers: [
      "MRR neto-nuevo vs MRR bruto-nuevo (la diferencia es churn)",
      "Mix de planes anuales (anual suaviza la volatilidad del crecimiento)",
      "Diversificación de canales de adquisición (un canal = un riesgo)",
      "Ingreso de expansión (upgrades de clientes existentes)",
      "Retención por cohort (mejor retención = el MRR compone)",
    ],
    misreadings: [
      "Leer el crecimiento de MRR sin separar MRR nuevo de MRR de expansión. Son drivers distintos.",
      "Comparar con benchmarks de empresas SaaS públicas. Bessemer y ProfitWell publican números muy sesgados a empresas con financiamiento. Los baselines indie son distintos.",
      "Tratar la volatilidad mes-a-mes como una tendencia. El MRR de SaaS es ruidoso a escala indie; el promedio móvil de 3 meses es más útil.",
    ],
    faqs: [
      {
        q: "¿Cuánto tarda en ir de $1K a $10K MRR?",
        a: "Al 10% de crecimiento mensual, ~24 meses. Al 15%, ~16 meses. Al 5%, ~48 meses. La mayoría de los indie SaaS tardan 18 a 36 meses de $1K a $10K. La varianza está dominada por la velocidad de encaje con el ICP, no por el ritmo de envío de features.",
      },
      {
        q: "¿El crecimiento de MRR es la métrica correcta o es mejor ARR?",
        a: "MRR para indie SaaS hasta $100K ARR. La vista de ARR entra en juego alrededor de $250K cuando los planes anuales se vuelven un mix significativo. La vista mensual es más sensible a cambios y surfacea problemas más rápido.",
      },
      {
        q: "¿Cuánto deberían contribuir churn vs adquisición al crecimiento de MRR?",
        a: "Para un indie SaaS sano a $10K MRR con 7% de churn mensual: ~$700 de churn mensual hay que reemplazar antes de cualquier crecimiento. La adquisición tiene que hacer $1.200+/mes para crecer 5%. Esta cuenta es por qué reducir churn muchas veces le gana a gastar en adquisición.",
      },
    ],
    sourceNote:
      "Rango basado en el reporte benchmark 2024 de SaaS de ProfitWell, la encuesta indie SaaS de Lenny Rachitsky y la data observada por el founder a través de 41 teardowns. Excluye empresas con financiamiento de venture cuyo perfil de crecimiento es estructuralmente distinto.",
  },
  {
    slug: "average-order-value",
    metric: "valor promedio de orden (AOV)",
    metaTitle: "Benchmarks de Average Order Value (Indie SaaS + Info Products)",
    metaDescription:
      "El AOV de indie SaaS se ubica entre $9-$99/mes en suscripciones y $27-$497 para productos de info. La presencia del Stack Slide mueve el AOV más que los tests de precio.",
    aeoAnswer:
      "El AOV de suscripción para indie SaaS se ubica entre $9 y $99 mensuales para productos self-serve y $99 a $999 para tiers asistidos por ventas. El AOV de productos de info se ubica entre $27 y $497 para compras únicas. La presencia del Stack Slide en la página de pricing mueve el AOV 30% al 80% más que cualquier optimización de price point.",
    bands: [
      {
        label: "Underperforming",
        range: "Menos de $19/mes en suscripción / Menos de $27 en producto de info",
        diagnosis:
          "El precio está debajo del valor que se entrega. O no hay Stack Slide en la página (así que el precio está sin anclar y bajo) o la oferta misma está construida de menos. Agregá Stack primero, subí el precio segundo.",
      },
      {
        label: "Typical range",
        range: "$19-$99/mes en suscripción / $27-$497 en producto de info",
        diagnosis:
          "Pricing sano para indie SaaS. La presencia del Stack Slide y las mecánicas de OTO pueden subir el AOV dentro de esta banda. Los tests de precio más allá de esta banda requieren cambios al stack de oferta.",
      },
      {
        label: "Outperforming",
        range: "Más de $99/mes en suscripción / Más de $497 en producto de info",
        diagnosis:
          "Positioning premium (nicho de especialidad, founder de alta confianza) o cierre asistido por ventas. Self-serve a este precio requiere trabajo excepcional de Stack Slide.",
      },
    ],
    drivers: [
      "Presencia del Stack Slide en la pricing page (el driver dominante)",
      "Disponibilidad de planes anuales (los clientes anuales tienen 8 a 12x más AOV)",
      "Tasa de toma del OTO después de la compra inicial",
      "Especificidad del nicho (especialista > generalista en pricing power)",
      "Señal de confianza del founder (founder nombrado, prueba fechada)",
    ],
    misreadings: [
      "Leer el AOV entre tiers de pricing mixtos sin segmentar. Self-serve y asistido por ventas tienen baselines distintos.",
      "Comparar con AOV de SaaS público. La mayoría del SaaS público es enterprise; los baselines indie son 5 a 50x más bajos.",
      "Bajar el precio para arreglar la conversión cuando el diagnóstico es el stack de oferta. Un precio más bajo no arregla el valor sin anclar.",
    ],
    faqs: [
      {
        q: "¿Debería subir mis precios?",
        a: "Casi siempre sí para indie SaaS debajo de $49/mes. El precio rara vez es el blocker de conversión; el Stack Slide sí. La mayoría de los founders deberían subir el precio 30% al 50% Y agregar un Stack Slide simultáneamente. La conversión típicamente se sostiene, el AOV salta.",
      },
      {
        q: "¿Cómo sé si mi precio está demasiado bajo?",
        a: "Tres señales: los clientes no regatean (el precio está bajo), los clientes no churnean por razones de precio (bajo), y tu margen bruto no banca trabajo full-time (definitivamente bajo). Si las tres son verdaderas, subí el precio.",
      },
      {
        q: "¿Debería ofrecer planes anuales con descuento?",
        a: "Casi siempre. Los planes anuales churnean 3 a 5x menos que los mensuales, así que el descuento se paga solo en retención. 15% al 25% off para anual es el rango estándar; descuentos más profundos (40%+) suelen atraer price-shoppers y no componen.",
      },
    ],
    sourceNote:
      "Rango basado en benchmarks SaaS de ProfitWell, reportes de economía de creadores de ConvertKit y la data observada por el founder. Excluye SaaS enterprise y empresas growth-stage con financiamiento de venture.",
  },
  {
    slug: "customer-acquisition-cost",
    metric: "costo de adquisición de cliente (CAC)",
    metaTitle: "Benchmarks de Customer Acquisition Cost (Indie SaaS)",
    metaDescription:
      "El CAC de indie SaaS se ubica entre $30-$300 para self-serve y $500-$3.000 para asistido por ventas. La ratio LTV:CAC importa más que el número absoluto.",
    aeoAnswer:
      "El costo de adquisición de clientes para indie SaaS se ubica entre $30 y $300 para productos self-serve y $500 a $3.000 para tiers asistidos por ventas. El CAC absoluto importa menos que la ratio LTV:CAC (objetivo 3:1 o mejor). Los indie SaaS con canales fuertes orgánicos / contenido / referidos suelen correr CAC debajo de $50.",
    bands: [
      {
        label: "Underperforming",
        range: "LTV:CAC debajo de 2:1",
        diagnosis:
          "La adquisición no es rentable o es marginalmente rentable. O el CAC está muy alto o el LTV está muy bajo (churn alto, expansión baja). Las dos son arreglables; el diagnóstico debería ser cuál palanca.",
      },
      {
        label: "Typical range",
        range: "LTV:CAC entre 2:1 y 5:1",
        diagnosis:
          "Unit economics sanos. La mayoría de los indie SaaS operan acá. Las optimizaciones en retención (subir LTV) y mix de canales (bajar CAC) componen la ratio.",
      },
      {
        label: "Outperforming",
        range: "LTV:CAC arriba de 5:1",
        diagnosis:
          "Adquisición dominada por orgánico o retención excepcional. El riesgo es invertir de menos en adquisición. La mayoría de los operadores con 5:1+ probablemente deberían estar gastando más en crecimiento.",
      },
    ],
    drivers: [
      "Mix de canales (orgánico > referido > pago)",
      "Fuerza de marca (menor CAC por el mismo volumen)",
      "Precisión del ICP (mejor encaje = menor costo de adquisición)",
      "Modelo de ventas (self-serve más barato que asistido por ventas)",
      "Tasa de conversión en cada paso del funnel",
    ],
    misreadings: [
      'Leer "CAC blendeado" sin separar pago de orgánico. Son estructuras de costo distintas.',
      "Calcular el CAC sin incluir el tiempo del founder. Los indie SaaS suelen subcontar el CAC real porque las horas del founder no están precio-adas.",
      "Comparar CAC entre categorías de SaaS sin normalizar. B2C, SMB y mid-market corren baselines distintos.",
    ],
    faqs: [
      {
        q: "¿Cuál es un buen periodo de payback?",
        a: "Debajo de 12 meses para indie SaaS, debajo de 18 meses como el techo absoluto. Arriba de 18 meses, el negocio está financiando adquisición fuera de capital, no de cash flow. La mayoría de los indie SaaS deberían apuntar a payback de 6 a 9 meses.",
      },
      {
        q: "¿Debería correr ads pagos?",
        a: "Solo después de que los canales orgánicos y de referidos estén saturados Y la ratio LTV:CAC lo banca. La mayoría de los indie SaaS corren ads pagos demasiado temprano, antes de que el funnel esté convirtiendo bien. Arreglá el funnel primero; escalá con pago segundo.",
      },
      {
        q: "¿Cómo bajo el CAC?",
        a: "Tres palancas: mejor targeting (menor CPC, mayor conversión), mejores landing pages (mayor conversión) y diversificación de canales (menos dependencia del canal más caro). El frame Brunson dice: el funnel está upstream del canal.",
      },
    ],
    sourceNote:
      "Rango basado en el State of Startups de First Round Capital, el BVP State of Cloud de Bessemer y la data observada por el founder. Las bandas indie SaaS son aproximadamente 1/5 a 1/20 de los benchmarks con financiamiento de venture.",
  },
  {
    slug: "lifetime-value",
    metric: "valor de tiempo de vida del cliente (LTV)",
    metaTitle: "Benchmarks de Customer Lifetime Value (Indie SaaS)",
    metaDescription:
      "El LTV de indie SaaS se ubica entre $200-$2.000 para SMB self-serve y $5.000-$50.000 para B2B mid-market. La matemática del LTV es muy sensible a la tasa de churn.",
    aeoAnswer:
      "El LTV de indie SaaS se ubica entre $200 y $2.000 para productos SMB self-serve y entre $5.000 y $50.000 para tiers B2B mid-market. El cálculo del LTV es extremadamente sensible a la tasa de churn usada — un cambio de 1 punto porcentual en el churn mensual desplaza el LTV 20% al 40%. Usá LTV basado en cohort donde sea posible.",
    bands: [
      {
        label: "Underperforming",
        range: "Menos de $200 SMB / Menos de $5.000 B2B mid-market",
        diagnosis:
          "O el AOV está muy bajo (problema de price-stack) o la tasa de churn está muy alta (problema de positioning o activación). El LTV es el output; los inputs son las palancas.",
      },
      {
        label: "Typical range",
        range: "$200-$2.000 SMB / $5.000-$50.000 B2B mid-market",
        diagnosis:
          "LTV estándar de indie SaaS. El trabajo compuesto sobre AOV (Stack Slide, OTO, planes anuales) y retención (activación, re-engagement) mueve la banda.",
      },
      {
        label: "Outperforming",
        range: "Más de $2.000 SMB / Más de $50.000 B2B mid-market",
        diagnosis:
          "Positioning premium, ingreso de expansión alto o nicho de especialidad. Verificá la matemática del LTV contra la retención real del cohort, no proyecciones modeladas.",
      },
    ],
    drivers: [
      "AOV (el input que carga peso)",
      "Tasa de churn mensual (cambios chicos componen masivamente)",
      "Mix de planes anuales (sube AOV y reduce churn simultáneamente)",
      "Ingreso de expansión (upsells a lo largo del tiempo)",
      "Forma de la curva de retención del cohort",
    ],
    misreadings: [
      "Usar un solo número de churn mensual para proyectar LTV. Las curvas de churn reales son no lineales; el churn early-cohort es más alto que el de estado estable.",
      "Proyectar LTV desde cohorts de menos de 12 meses. La matemática es inestable sobre data corta.",
      "Comparar LTV contra CAC sin normalizar por largo de ciclo de venta. Los ciclos largos inflan el LTV aparente injustamente.",
    ],
    faqs: [
      {
        q: "¿Cómo calculo el LTV correctamente?",
        a: 'Basado en cohort, no plano. Tomá un cohort de clientes del mes X, trackeá su retención mensual, proyectá a un horizonte de 24 meses, multiplicá por AOV. Evitá el atajo "1 / tasa de churn" para indie SaaS — asume churn plano, que no es verdad.',
      },
      {
        q: "¿Cuál es una buena ratio LTV:CAC?",
        a: "3:1 mínimo, 5:1 sana, arriba de 7:1 significa que probablemente deberías invertir más en adquisición. Debajo de 3:1 significa que el negocio no es rentable por cliente; el fix es o bajar CAC o subir LTV.",
      },
      {
        q: "¿Cómo impactan anual vs mensual al LTV?",
        a: "Significativamente. Los planes anuales churnean 3 a 5x menos que los mensuales. Un cliente en mensual puede churnear al 7%/mes (LTV ~14 meses); el mismo cliente en anual churnea al 25%/año (LTV ~4 años). Los planes anuales son la movida de LTV de mayor palanca disponible.",
      },
    ],
    sourceNote:
      "Rango basado en la investigación de retención SaaS 2024 de ProfitWell y el rango observado por el founder a través de teardowns. Se recomiendan cálculos de LTV basados en cohort en lugar de proyecciones planas 1/churn.",
  },
  {
    slug: "free-to-paid-conversion",
    metric: "conversión de free a pago",
    metaTitle: "Conversión promedio de Free a Paid (Freemium SaaS)",
    metaDescription:
      "La conversión free-a-pago de freemium SaaS se ubica al 1% al 4% para freemium amplio y 5% al 15% para modelos product-led acotados.",
    aeoAnswer:
      "La conversión free-a-pago para freemium SaaS se ubica entre 1% y 4% para modelos de freemium amplio y 5% al 15% para modelos product-led acotados (donde el tier gratis está gateado a un caso de uso específico). La brecha es estructural: el freemium amplio atrae usuarios que nunca necesitan upgradear; el freemium product-led acotado fuerza la decisión de upgrade en un momento específico.",
    bands: [
      {
        label: "Underperforming",
        range: "Menos del 1%",
        diagnosis:
          "El tier gratis regala el caso de uso que carga peso. Los usuarios free no tienen razón para upgradear porque ya están consiguiendo lo que vinieron a buscar. Restringí el tier gratis o cambiá el trigger de upgrade.",
      },
      {
        label: "Typical range",
        range: "1% al 4% (freemium amplio) / 5% al 15% (PLG acotado)",
        diagnosis:
          "Conversión freemium estándar. El tier gratis está haciendo trabajo de adquisición; el tier pago está estructurado para el cohort que pega un límite específico o quiere una feature específica.",
      },
      {
        label: "Outperforming",
        range: "Más del 4% (amplio) / Más del 15% (PLG acotado)",
        diagnosis:
          'El tier gratis está muy limitado (forzando upgrade antes) o el tier pago resuelve un problema específico de "lo necesito ahora". Verificá que el tier gratis siga entregando valor a los no-upgraders.',
      },
    ],
    drivers: [
      "Dónde termina el tier gratis (el driver dominante)",
      "Especificidad de la value proposition del tier pago",
      "Prompts de upgrade dentro del producto (el timing importa más que el copy)",
      "Soap Opera Sequence por email a usuarios free",
      "Outreach liderado por el founder para usuarios free de alta intención",
    ],
    misreadings: [
      "Leer free-a-pago en aislamiento. El funnel total de adquisición importa: ¿cuántos usuarios free adquiriste para conseguir las conversiones pagas?",
      'Confundir "product-led growth" (PLG) con "freemium". Son modelos distintos; PLG suele usar un free trial, no un tier gratis permanente.',
      "Bajar el precio del tier pago para arreglar la conversión. Casi nunca funciona. La decisión de upgrade es sobre la línea entre free y pago, no sobre el precio del pago.",
    ],
    faqs: [
      {
        q: "¿Debería ofrecer freemium directamente?",
        a: "Solo si el tier gratis adquiere significativamente más barato que las alternativas Y el camino de free a pago es estructuralmente claro. La mayoría de los indie SaaS no deberían ofrecer freemium — el tier gratis se come tiempo de soporte del founder sin adquirir upgraders a una tasa significativa.",
      },
      {
        q: "¿Cuál es el límite correcto del tier gratis?",
        a: "Lo suficientemente apretado para que el 5% al 15% de los usuarios regulares lo peguen mensualmente. Más holgado y la conversión cae; más apretado y el tier gratis no adquiere. Iterá sobre el límite, no sobre el precio.",
      },
      {
        q: "¿Debería notificar a los usuarios cuando pegan el límite del tier gratis?",
        a: 'Sí, con un camino de upgrade específico. "Pegaste tu límite gratis — upgradeá para seguir" convierte al 5% al 20% de las notificaciones disparadas. Los prompts suaves ("considerá upgradear") convierten cerca de cero.',
      },
    ],
    sourceNote:
      "Rango basado en la encuesta benchmark PLG de Lenny Rachitsky, el reporte anual PLG de OpenView Partners y el rango observado por el founder a través de teardowns de indie SaaS.",
  },
  {
    slug: "refund-rate",
    metric: "tasa de reembolso",
    metaTitle: "Tasa de reembolso promedio de SaaS (Indie Benchmarks)",
    metaDescription:
      "Las tasas de reembolso de indie SaaS dentro de la ventana de garantía se ubican al 2% al 8%. Arriba del 8% significa quiebre de confianza; debajo del 2% significa que la garantía no se usa como herramienta de venta.",
    aeoAnswer:
      "Las tasas de reembolso de indie SaaS dentro de la ventana de garantía se ubican entre 2% y 8% de las compras. Debajo del 2% suele significar que la garantía no se está usando como herramienta de venta (debería ser visible y prominente lo suficiente como para ser reclamada a veces). Arriba del 8% sugiere un quiebre de confianza: el producto o el onboarding no están entregando lo que la página de ventas prometió.",
    bands: [
      {
        label: "Underperforming",
        range: "Más del 8% dentro de la ventana de garantía",
        diagnosis:
          "El producto o el onboarding no coinciden con la promesa de la página de ventas. Leé 5 a 10 razones de reembolso. El patrón suele ser un gap específico de feature o un mismatch de expectativa.",
      },
      {
        label: "Typical range",
        range: "2% al 8% dentro de la ventana de garantía",
        diagnosis:
          "Tasa de reembolso sana. La garantía está haciendo trabajo (visible lo suficiente como para ser una herramienta de venta) y el producto está entregando lo suficiente como para retener a la mayoría de los compradores.",
      },
      {
        label: "Outperforming",
        range: "Menos del 2% dentro de la ventana de garantía",
        diagnosis:
          "O la garantía no es visible (la mayoría de los compradores no saben que la pueden reclamar — herramienta de venta desperdiciada) o el producto es excepcional. Verificá exponiendo la garantía más prominentemente por una semana.",
      },
    ],
    drivers: [
      "Precisión de la página de ventas (prometer de más impulsa reembolsos)",
      "Claridad del onboarding (usuarios confundidos piden reembolso)",
      "Timing del momento de activación",
      "Visibilidad de la garantía (mostrada prominentemente = más reclamos pero más ventas)",
      "Fricción del proceso de reembolso (algo de fricción es sano)",
    ],
    misreadings: [
      'Tratar la tasa baja de reembolso como "buena" sin chequear la visibilidad de la garantía. Una garantía escondida está desperdiciada.',
      "Leer la tasa de reembolso sin separar por fuente de tráfico. Los reembolsos sobre tráfico frío corren más alto que tibio.",
      "Reducir los términos de garantía (ventana más corta, condiciones más estrechas) para bajar la tasa de reembolso. Esto suele matar la conversión más que ahorrar reembolsos.",
    ],
    faqs: [
      {
        q: "¿Debería tener una garantía de devolución del dinero?",
        a: "Casi siempre sí. El lift de conversión de una garantía visible pesa más que el costo de reembolso en casi todo escenario de indie SaaS. Ventana de 30 días para suscripciones mensuales, 60 a 90 días para compras únicas.",
      },
      {
        q: "¿El proceso de reembolso debería ser un click o requerir contacto?",
        a: "Un click para low-ticket ($1 a $49), contacto requerido para alto ticket ($100+). Un click señala confianza y previene la sensación de trampa; el contacto requerido captura malentendidos genuinos y recupera algunos reembolsos vía outreach del founder.",
      },
      {
        q: "¿Cómo sé si mi tasa de reembolso está demasiado alta?",
        a: "Arriba del 8% dentro de la ventana de garantía es el umbral de alerta. Leé las razones de reembolso. Si el 50%+ cita el mismo issue (gap específico de feature, confusión de onboarding), arreglá esa causa raíz. Los tweaks de marketing no arreglan problemas de encaje del producto.",
      },
    ],
    sourceNote:
      "Rango basado en la investigación de reembolsos de ProfitWell y la data observada de indie SaaS a través de 41 teardowns. Muy moderado por el largo de la ventana de garantía y la categoría del producto.",
  },
  {
    slug: "cold-email-reply-rate",
    metric: "tasa de respuesta de cold email",
    metaTitle: "Tasa de respuesta promedio de cold email (Founder Outreach)",
    metaDescription:
      "Las tasas de respuesta de cold email grado founder se ubican al 5% al 15% para envíos muy targeteados. Debajo del 5% significa genérico; arriba del 15% suele ser warm-adyacente.",
    aeoAnswer:
      "Las tasas de respuesta de cold email para outreach grado founder se ubican entre 5% y 15% para envíos muy targeteados (estilo Dream 100). Debajo del 5% casi siempre significa copy genérico o targeting genérico. Arriba del 15% suele significar que la lista es warm-adyacente (conexiones mutuas, interacciones previas o señales de timing relevantes).",
    bands: [
      {
        label: "Underperforming",
        range: "Menos del 5%",
        diagnosis:
          "O el targeting es genérico (la lista no es realmente Dream 100) o el copy es genérico (podría mandárselo a cualquiera). La especificidad en ambas direcciones es el fix.",
      },
      {
        label: "Typical range",
        range: "5% al 15%",
        diagnosis:
          "Outreach de founder sano. El targeting es específico, el copy menciona algo que el recipiente puede verificar que es real (su empresa, su trabajo, su declaración pública) y el ask es claro.",
      },
      {
        label: "Outperforming",
        range: "Más del 15%",
        diagnosis:
          "Outreach warm-adyacente. Conexiones mutuas, eventos públicos recientes sobre el recipiente, o contexto de timing perfecto. Verificá antes de tratarlo como baseline de cold email.",
      },
    ],
    drivers: [
      "Especificidad de la línea de apertura (verificable, específica)",
      "Contexto mutuo (referente, evento compartido, declaración pública)",
      "Especificidad del subject line",
      "Largo (debajo de 100 palabras casi siempre gana)",
      "Ask claro (¿qué querés específicamente que hagan?)",
    ],
    misreadings: [
      "Leer la tasa de respuesta a través de cohorts mixtos. El outreach Dream 100 y el outreach SDR masivo son mundos distintos.",
      "Contar autoreplies y out-of-office como respuestas. Son ruido.",
      "Optimizar el paso equivocado de la secuencia. La calidad del primer email domina; los follow-ups pueden subir la tasa de respuesta 30% al 50% pero no arreglan un primer email roto.",
    ],
    faqs: [
      {
        q: "¿Cuántos follow-ups debería mandar?",
        a: "Dos a tres. El primer email recibe el 60% al 70% del total de respuestas. Cada follow-up suma 10% al 20% encima. Más allá de tres follow-ups, las respuestas caen cerca de cero y la irritación sube.",
      },
      {
        q: "¿Cuál es el mejor subject line para cold outreach de founder?",
        a: 'Específico y corto. "Pregunta sobre [cosa específica que hicieron]" le gana a "Pregunta rápida". 5 a 7 palabras, en minúsculas, sin clickbait. Las tasas de respuesta caen 30% al 50% en subject lines clickbait.',
      },
      {
        q: "¿Debería usar una herramienta como Apollo o Hunter para outreach?",
        a: "Para encontrar la dirección, sí. Para mandar el email, mandá manualmente para outreach de alto valor (Dream 100). Las herramientas de envío masivo sacrifican deliverability y tasa de respuesta por volumen; la cuenta rara vez funciona para founders indie.",
      },
    ],
    sourceNote:
      "Rango basado en los benchmarks publicados de Lemlist y Reply.io, más el rango observado por el founder en outreach Dream 100. Excluye outreach SDR masivo que tiene baselines estructuralmente distintos.",
  },
  {
    slug: "saas-trial-length",
    metric: "duración del trial de SaaS",
    metaTitle: "Duración óptima del trial de SaaS (Indie Benchmarks)",
    metaDescription:
      "La duración óptima del trial de SaaS es 7-14 días para self-serve, 14-30 días para complejidad moderada, 30+ días solo para enterprise. Trials más largos reducen activación.",
    aeoAnswer:
      "La duración óptima del trial es 7 a 14 días para SaaS self-serve, 14 a 30 días para productos de complejidad moderada y 30 días o más solo para herramientas enterprise. Los trials más largos contraintuitivamente reducen la activación: los usuarios postergan la decisión y el trial termina sin un momento aha.",
    bands: [
      {
        label: "Underperforming",
        range: "Menos de 7 días para SaaS de complejidad moderada / Más de 30 días para self-serve",
        diagnosis:
          "O muy corto (los usuarios no pueden llegar a la activación) o muy largo (la decisión se posterga). Encajá la duración del trial con el tiempo a activación.",
      },
      {
        label: "Typical range",
        range: "7-14 días self-serve / 14-30 días moderado / 30+ días enterprise",
        diagnosis:
          "Encaje sano entre duración del trial y complejidad del producto. La mayoría de los usuarios deciden en las primeras 48 horas sin importar la duración.",
      },
      {
        label: "Outperforming",
        range: "Trial de $1 sin importar la duración",
        diagnosis:
          "El trial de $1 pre-califica usuarios serios y convierte a 3 a 4x la tasa de los free trials. La cuenta suele funcionar incluso contando la tasa de reembolso.",
      },
    ],
    drivers: [
      "Tiempo a activación en el producto (la restricción subyacente)",
      "Tipo de trial ($1 vs free)",
      "Diseño del flujo de onboarding (guiado > self-serve > nada)",
      "Secuencia de email de fin de trial",
      "Outreach liderado por el founder para SaaS de alto ticket",
    ],
    misreadings: [
      'Extender la duración del trial para "ayudar a los usuarios a decidir". La decisión pasa en las primeras 48 horas sin importar la duración.',
      "Comparar duraciones de trial entre categorías sin normalizar la complejidad. SaaS simple a 30 días sub-convierte; enterprise a 7 días sub-convierte.",
      "Leer la tasa de activación sin separar por cohort. Los power users activan rápido; los usuarios casuales pueden necesitar follow-up sin importar la duración.",
    ],
    faqs: [
      {
        q: "¿Debería extender un trial que no activó?",
        a: 'Una vez, con outreach liderado por el founder. "Veo que no hiciste X todavía — ¿te puedo ayudar?" convierte al 10% al 25%. La extensión automática sin outreach casi nunca convierte; el usuario ya perdió el interés.',
      },
      {
        q: "¿Debería requerir una tarjeta de crédito para el trial?",
        a: "Los trials con tarjeta requerida convierten 3 a 4x más alto por trial pero adquieren 50% al 70% menos trials. La conversión neta suele ser más alta con tarjeta requerida. Para la mayoría de los indie SaaS, tarjeta requerida es la mejor elección.",
      },
      {
        q: "¿Cuál es el balance correcto entre free trial y free tier?",
        a: "Free trial para productos con tiempo-a-valor claro (debajo de 14 días). Free tier para productos con revelación de valor diferida (herramientas colaborativas, bibliotecas de contenido). No ofrezcas las dos a menos que tengas un diferenciador claro entre ellas.",
      },
    ],
    sourceNote:
      "Rango basado en el reporte benchmark PLG de OpenView Partners, la investigación de onboarding de Lenny Rachitsky y la data observada por el founder a través de teardowns de indie SaaS.",
  },
  {
    slug: "page-time-to-interactive",
    metric: "tiempo de página a interactivo",
    metaTitle: "Benchmarks de Page Time-to-Interactive (Core Web Vitals)",
    metaDescription:
      "El tiempo a interactivo sano para páginas de marketing de indie SaaS es debajo de 3,5s en mobile. Más allá de 5s, la conversión cae con cada segundo agregado.",
    aeoAnswer:
      "El tiempo a interactivo sano para páginas de marketing de indie SaaS es debajo de 3,5 segundos en mobile (dispositivo de gama media, conexión 4G). Más allá de 5 segundos, la tasa de conversión cae 5% al 15% por cada segundo adicional. El umbral de Core Web Vitals de Google (Interaction to Next Paint debajo de 200ms) es el piso de SEO, no el techo de conversión.",
    bands: [
      {
        label: "Underperforming",
        range: "Más de 5s mobile",
        diagnosis:
          "La página está pesada con scripts de terceros (analytics, widgets de chat, fonts), imágenes sin optimizar o JavaScript que bloquea el render. Cada fix típicamente corta 0,3 a 1,0 segundos.",
      },
      {
        label: "Typical range",
        range: "1,5s a 3,5s mobile",
        diagnosis:
          "Tiempo de carga sano. Las páginas de marketing estándar de Next.js / Vercel hosted se ubican acá con optimización mínima. El piso de SEO se cumple.",
      },
      {
        label: "Outperforming",
        range: "Debajo de 1,5s mobile",
        diagnosis:
          "Arquitectura static-first, optimización de imágenes, sin JS de terceros. Los beneficios de conversión son reales pero decrecientes debajo de 2 segundos.",
      },
    ],
    drivers: [
      "JavaScript de terceros (el costo de performance más grande)",
      "Formato y tamaño de imagen (formatos next-gen, tamaño correcto)",
      "Estrategia de carga de fonts (system fonts > precargadas > async)",
      "Recursos que bloquean el render",
      "Configuración de hosting y CDN",
    ],
    misreadings: [
      "Optimizar para desktop cuando el cuello de botella es mobile. La mayoría del tráfico de indie SaaS es 60% al 80% mobile.",
      "Perseguir scores perfectos de Lighthouse. El score no se correlaciona directamente con conversión; el tiempo real a interactivo sí.",
      "Agregar herramientas de terceros (analytics, chat, A/B test) sin medir el costo de performance.",
    ],
    faqs: [
      {
        q: "¿La velocidad de página afecta el SEO?",
        a: "Sí, marginalmente. Los Core Web Vitals de Google (LCP, INP, CLS) entran en los rankings. La mayoría de los indie SaaS ven impacto SEO al margen; la razón más grande para optimizar es la tasa directa de conversión.",
      },
      {
        q: "¿Next.js es lo suficientemente rápido out of the box?",
        a: "Sí para páginas de marketing. Static generation (o App Router server components) sobre Vercel se ubica debajo de 2s de tiempo a interactivo mobile sin ningún trabajo de optimización. La deuda de performance se acumula desde scripts de terceros agregados e imágenes sin optimizar.",
      },
      {
        q: "¿Debería sacar mis herramientas de analytics para mejorar la velocidad?",
        a: "No. PostHog, GA4 y herramientas similares cuestan 100 a 300ms en el primer paint, que es aceptable. Sacá solo el tracking duplicado (la mayoría de los sitios tienen 3 a 5 herramientas de analytics redundantes cargadas simultáneamente).",
      },
    ],
    sourceNote:
      "Rango basado en los benchmarks de Core Web Vitals de Google, case studies publicados en web.dev y performance observada de sitios de marketing de indie SaaS. Medición mobile-first.",
  },
  {
    slug: "bounce-rate",
    metric: "tasa de rebote",
    metaTitle: "Tasa de rebote promedio (Páginas de marketing Indie SaaS)",
    metaDescription:
      "Las tasas de rebote de páginas de marketing de indie SaaS se ubican al 40% al 70%. Debajo del 40% sobre tráfico frío suele significar que el scroll-tracking está rompiendo la medición.",
    aeoAnswer:
      "Las tasas de rebote de páginas de marketing de indie SaaS se ubican entre 40% y 70% sobre tráfico frío. Debajo del 40% sobre tráfico frío suele significar que el scroll-tracking o los eventos de engagement están disparando falsamente (inflando la calidad de sesión artificialmente). Arriba del 70% indica tráfico Wrong Person o mismatch contenido-tráfico.",
    bands: [
      {
        label: "Underperforming",
        range: "Más del 70% sobre tráfico frío",
        diagnosis:
          "El tráfico no encaja con el marco de la página. O el canal de adquisición necesita nichificarse o el titular de la página necesita filtrar tráfico mejor. Revisá la landing page por fuente.",
      },
      {
        label: "Typical range",
        range: "40% al 70% sobre tráfico frío",
        diagnosis:
          "Tasa de rebote sana para páginas de marketing. El disparo de eventos de engagement (scroll, click, interacción con formulario) marca sesiones comprometidas y clarifica la señal.",
      },
      {
        label: "Outperforming",
        range: "Menos del 40% sobre tráfico frío",
        diagnosis:
          "Suele ser un artefacto de medición (eventos de engagement falsos). Sobre tráfico frío, rebote sub-40% es inusual y vale la pena verificar contra el tiempo en página.",
      },
    ],
    drivers: [
      "Audience-page fit (el driver dominante)",
      "Velocidad de carga de página (las páginas lentas rebotan más)",
      "Especificidad del titular (claridad del mensaje above the fold)",
      "Diseño mobile-first (60% al 80% del tráfico es mobile)",
      "Tracking de eventos de engagement (cambia el rebote medido, no el real)",
    ],
    misreadings: [
      'Tratar la tasa de rebote de GA4 igual que la de GA Universal. GA4 le llama "tasa de engagement" y usa lógica distinta. Los números no son directamente comparables.',
      "Leer la tasa de rebote sin separar por fuente. Tráfico directo, orgánico, pago y referido tienen baselines distintos.",
      "Tratar de bajar el rebote agregando eventos de scroll-tracking. Eso cambia la medición, no el comportamiento subyacente.",
    ],
    faqs: [
      {
        q: "¿La tasa de rebote alta siempre es mala?",
        a: "No. La intención de una sola página (alguien googlea tu nombre para encontrar tu email de contacto) genera rebote legítimamente alto. La métrica importa en contexto: rebote alto en una landing page diseñada para exploración multi-página es un problema; rebote alto en una página de contacto no.",
      },
      {
        q: "¿Cómo bajo la tasa de rebote?",
        a: "Tres palancas: mejor match tráfico-página (la palanca dominante), carga de página más rápida y mensaje above the fold más claro. No trates de bajar el rebote atrapando a los usuarios en la página — eso es UX adversaria.",
      },
      {
        q: "¿Debería trackear tiempo en página en lugar de rebote?",
        a: "Ambos. El tiempo en página es más sensible pero también más ruidoso. El rebote es una señal direccional estable. La combinación cuenta la historia real: rebote bajo + tiempo en página bajo es contradictorio e indica problemas de medición.",
      },
    ],
    sourceNote:
      "Rango basado en analytics observados de sitios de marketing indie SaaS a través de 41 teardowns y validado contra benchmarks publicados por ContentSquare y Hotjar para páginas de marketing SaaS.",
  },
  {
    slug: "first-customer-time",
    metric: "tiempo al primer cliente que paga",
    metaTitle: "Tiempo al primer cliente pago (Indie SaaS Benchmarks)",
    metaDescription:
      "El tiempo-al-primer-cliente de indie SaaS se ubica entre 3 y 16 semanas post-launch. Más rápido que 3 semanas suele significar warm-network; más lento que 16 semanas sugiere problema de positioning.",
    aeoAnswer:
      "El tiempo del launch al primer cliente que paga para indie SaaS se ubica entre 3 y 16 semanas. Más rápido que 3 semanas casi siempre significa que el cliente vino de la red warm del founder, no de adquisición fría. Más lento que 16 semanas sugiere un problema de positioning o encaje del producto que el diagnóstico puede surfacear.",
    bands: [
      {
        label: "Underperforming",
        range: "Más de 16 semanas post-launch sin un cliente que paga",
        diagnosis:
          "La capa de marketing no está componiendo. Casi siempre un diagnóstico de Wrong Person (el positioning atrae al cohort equivocado) o un diagnóstico de Weak Offer (la cuenta precio-valor no cierra). El diagnóstico surfaces cuál.",
      },
      {
        label: "Typical range",
        range: "3 a 16 semanas post-launch",
        diagnosis:
          "Timeline normal de indie SaaS al primer cliente. El funnel está haciendo algo de trabajo; los refinamientos mueven la aguja. El outreach liderado por el founder a la red warm suele acelerar los primeros 2 a 5 clientes.",
      },
      {
        label: "Outperforming",
        range: "Menos de 3 semanas post-launch",
        diagnosis:
          "Casi siempre venta warm-network. Verificá: ¿el cliente es alguien que conocías antes del launch? Si sí, el reloj de adquisición fría todavía no arrancó realmente.",
      },
    ],
    drivers: [
      "Outreach a la red warm (el driver dominante en lo temprano)",
      "Encaje producto-positioning",
      "Visibilidad del pricing en el sitio de marketing",
      "Modelo de venta liderado por el founder (cierre manual, sin automatización)",
      "Selección del canal de adquisición",
    ],
    misreadings: [
      "Contar pagos de amigos y familia como conversiones de tráfico frío. No lo son.",
      'Comparar con historias públicas de "primer cliente en 24 horas". Sesgo de supervivencia.',
      "Leer el tiempo al primer cliente sin separar B2C de B2B. Los ciclos de venta B2B son estructuralmente más largos.",
    ],
    faqs: [
      {
        q: "¿Cuánto debería esperar antes de declarar mi SaaS roto?",
        a: "12 a 16 semanas post-launch con cero clientes pagos adquiridos en frío es el umbral de alerta. Debajo de eso, todavía estás en la ventana normal de primer-cliente de indie SaaS. Arriba de eso, el diagnóstico casi siempre encuentra un issue upstream arreglable.",
      },
      {
        q: "¿Debería contactar a mi red warm para el primer cliente?",
        a: 'Sí, casi siempre. Los primeros 2 a 5 clientes deberían venir de outreach warm. Esto no es "trampear" la métrica — es cómo casi todo indie SaaS exitoso arranca. La adquisición fría compone después de agotar el cohort warm.',
      },
      {
        q: "¿Y si no tengo red warm?",
        a: "Construí una antes de lanzar, siendo útil en una comunidad específica por 60 a 90 días. El patrón Dream 100 de Brunson formaliza esto: nombrá 100 personas específicas en tu cohort objetivo, sé útil para ellas, después vendéles. La adquisición fría sin raíces de red warm tarda 2 a 4x más.",
      },
    ],
    sourceNote:
      "Rango basado en launches observados de indie SaaS a través del dataset de teardowns del founder y validado contra data pública de timelines en IndieHackers.",
  },
  {
    slug: "annual-vs-monthly-discount",
    metric: "descuento anual vs mensual",
    metaTitle: "Descuento óptimo anual vs mensual (Pricing SaaS)",
    metaDescription:
      "El descuento óptimo anual-vs-mensual se ubica al 15% al 25% para indie SaaS. Descuentos más profundos atraen price-shoppers; más superficiales no cambian comportamiento.",
    aeoAnswer:
      'El descuento óptimo anual-vs-mensual para indie SaaS se ubica entre 15% y 25%. Más superficial (debajo del 10%) no cambia el comportamiento de compra hacia anual; más profundo (arriba del 35%) atrae price-shoppers que tratan el descuento como el valor en lugar del compromiso anual. El encuadre "dos meses gratis" (16,7% de descuento) es un sweet spot común.',
    bands: [
      {
        label: "Underperforming",
        range: "Menos del 10% de descuento anual o más del 35% de descuento anual",
        diagnosis:
          "El descuento superficial falla en incentivar la elección anual; el descuento profundo atrae al cohort equivocado y daña el LTV del cliente anual. Re-anclá en la banda del 15% al 25%.",
      },
      {
        label: "Typical range",
        range: "15% al 25% de descuento anual",
        diagnosis:
          'Descuento anual sano. Los clientes se auto-seleccionan a anual cuando el descuento se siente como ahorro real sin gritar "carnada de price-shopper".',
      },
      {
        label: "Outperforming",
        range: 'Encuadre "dos meses gratis" (16,7%)',
        diagnosis:
          'Encuadre específico que le gana a descuentos porcentuales genéricos. "Dos meses gratis" es concreto y fácil de imaginar; "17% off" es abstracto. Misma cuenta, mejor conversión.',
      },
    ],
    drivers: [
      "Encuadre del descuento (meses-gratis vs porcentaje)",
      "Visibilidad del plan anual (¿default a anual o toggle?)",
      "Alineación de reversión de riesgo (garantía equivalente para anual)",
      "Consistencia del descuento tier-por-tier",
      "Política de cancelación en anual (proporcional o no)",
    ],
    misreadings: [
      "Tratar la conversión anual como el objetivo. El objetivo real es LTV. Los anuales muy descontados reducen el LTV vs caminos mensual-y-después-upgrade.",
      "A/B testear la profundidad del descuento sin considerar el cohort atraído. El cohort del 25% de descuento y el cohort del 40% de descuento se comportan distinto a largo plazo.",
      "Mostrar solo pricing anual por default. Esconder mensual daña la confianza; la visibilidad por toggle gana.",
    ],
    faqs: [
      {
        q: "¿Anual debería ser el default o solo una opción?",
        a: 'Toggle visible, mensual por default para la mayoría de los indie SaaS. Esconder mensual daña la confianza ("¿qué están escondiendo?"). "Ahorrá 17% con anual" como toggle claramente visible gana para SaaS self-serve debajo de $99/mes.',
      },
      {
        q: "¿Debería ofrecer reembolsos por cancelación en planes anuales?",
        a: "Reembolsos proporcionales dentro de los primeros 30 días; sin reembolsos después. Esto protege contra quiebre de confianza (el comprador debería poder escapar si no funciona) sin habilitar abuso (devolver el plan anual en el mes 11).",
      },
      {
        q: "¿Cuál es la forma correcta de subir clientes mensuales a anual?",
        a: 'Después de que estuvieron mensual por 60 a 90 días. Antes es muy pronto (no formaron hábito); después pierde momentum. La Soap Opera Sequence puede incluir una "oferta de upgrade a anual" en el día 75 con un descuento incremental chico arriba de la tasa anual estándar.',
      },
    ],
    sourceNote:
      "Rango basado en la investigación de pricing 2024 de SaaS de ProfitWell, los benchmarks de pricing de OpenView y el rango observado por el founder a través de teardowns de pricing de indie SaaS.",
  },
];

// ----- Sanity check ---------------------------------------------------------

const _shapeCheck: BenchmarkTranslation = BENCHMARK_ENTRIES_ES[0]!;
void _shapeCheck;
