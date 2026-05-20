/**
 * Spanish (es) translation of the Brunson glossary.
 *
 * Status: pending-review (see src/lib/i18n/registry.ts).
 * Source: src/lib/glossary.ts GLOSSARY (en-US canonical) +
 *         src/lib/seo/entity.ts DEFINED_TERMS (short definitions).
 * Translation by: Claude (sales@sipiteno.com session, 2026-05-20).
 *
 * Editorial notes for founder review
 * ----------------------------------
 * - Voice: Reluctant Hero (workbook 02 §3). Plain register, no startup-
 *   marketing buzzwords. Neutral Latin American Spanish (no 'vosotros',
 *   no peninsular idioms) — same discipline as faq.es.ts.
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
 * - Display headings (term names) stay in English because they are
 *   Brunson canonical names. Spanish appears in the prose around them.
 *
 * - Overlay shape: this file translates only the textual fields. The
 *   structural fields (slug, category, relatedTerms, appearsIn) live in
 *   the canonical and are spliced in by getGlossaryEntries(). Cross-link
 *   drift is therefore impossible by construction.
 *
 * - Approval lock: until the registry flips to `status: "approved"`,
 *   /es/glossary and /es/glossary/<slug> render with noindex and are
 *   omitted from the sitemap.
 */

export interface GlossaryTranslation {
  /** Must match a slug in the canonical GLOSSARY. */
  slug: string;
  /**
   * Translated short definition – overrides DEFINED_TERMS entry for this
   * locale only. Used in card headers, hero subhead, and JSON-LD
   * DefinedTerm.description (with inLanguage flipped to the locale).
   */
  shortDefinition: string;
  longDefinition: string;
  whyItMatters: string;
  howToApply: readonly string[];
  example: string;
  commonConfusions?: ReadonlyArray<{ term: string; difference: string }>;
  faqs: ReadonlyArray<{ q: string; a: string }>;
}

export const GLOSSARY_ES: ReadonlyArray<GlossaryTranslation> = [
  // ---- Hook layer ----------------------------------------------------------
  {
    slug: "hook",
    shortDefinition:
      "La promesa de apertura de la página más su movida de polaridad: nombra el resultado que el lector quiere y nombra a quién la página no le habla, todo en los primeros tres segundos.",
    longDefinition:
      "Un Hook es la promesa de apertura de la página más su movida de polaridad. La promesa nombra el resultado; la movida de polaridad nombra a quién la página no le habla. Las dos cosas tienen que dispararse en los primeros tres segundos porque esa es la ventana antes de que un visitante frío decida si sigue leyendo.",
    whyItMatters:
      "Los founders post-launch que aún no facturan casi siempre tienen un problema de Hook antes de tener un problema de producto. La página above the fold describe el producto en lugar de capturar al lector correcto. Arreglar el Hook suele ser una edición de una tarde que duplica el tiempo en página; reconstruir features lleva semanas y rara vez mueve la línea.",
    howToApply: [
      "Reemplazá el titular tipo lista-de-features por el resultado que el dream customer quiere.",
      "Agregá una línea de polaridad en el subtítulo para que el lector equivocado se vaya a propósito.",
      "Cortá cada adjetivo que no cambie a quién le habla la página.",
      "Probá el titular leyendo solo los primeros tres segundos en voz alta — si suena como cualquier otra herramienta de la categoría, no es un Hook.",
    ],
    example:
      'El Hook de Unlock SaaS es "Your first paying customer in 60 days, or you do not pay." El resultado queda nombrado en la primera cláusula; la polaridad ("si todavía no lanzaste, esto no es para vos") se dispara inmediatamente debajo. Juntas filtran a la canonical audience en tres segundos.',
    commonConfusions: [
      {
        term: "Headline",
        difference:
          "Un headline son las palabras. Un Hook es la promesa más la movida de polaridad — un headline puede llevarlo, pero un Hook también incluye el subtítulo, el descalificador de polaridad y cualquier visual de apertura que se dispare dentro de los primeros tres segundos.",
      },
      {
        term: "Lead magnet",
        difference:
          "Un lead magnet es el cebo que se ofrece a cambio de un email. Un Hook es la promesa a nivel página que decide si el lector se detiene a considerar el lead magnet o no.",
      },
    ],
    faqs: [
      {
        q: "¿Cuál es la diferencia entre un Hook y un headline?",
        a: "El headline son las palabras literales arriba de la página. El Hook es la promesa de apertura completa más la movida de polaridad que se dispara junto a ella — subtítulo, descalificador y cualquier visual de apertura incluidos. Una página puede tener un headline aceptable y no tener Hook.",
      },
      {
        q: "¿Qué tan largo es el Hook?",
        a: "Tres segundos de lectura. Eso es aproximadamente el headline más el subtítulo más la línea de polaridad directamente debajo. Si el lector tiene que hacer scroll, el Hook ya falló.",
      },
      {
        q: "¿Un Hook puede ser una pregunta?",
        a: 'Sí, pero solo si la pregunta filtra al lector correcto. "¿Por qué tu línea de Stripe está plana?" es un Hook para un founder post-launch que aún no factura. "¿Querés más clientes?" no — no filtra a nadie.',
      },
    ],
  },
  {
    slug: "big-domino",
    shortDefinition:
      "La única afirmación que la página tiene que probar. Si el lector la acepta, todas las objeciones menores se vuelven irrelevantes; si la rechaza, ninguna cantidad de features o prueba social rescata la página.",
    longDefinition:
      "El Big Domino es la única afirmación que la página tiene que probar. Si el lector acepta esa única afirmación, cada objeción más chica se vuelve irrelevante; si la rechaza, ninguna cantidad de copy de features ni prueba social rescata la página. El framework de Russell Brunson para páginas de alto ticket está construido alrededor de esto: nombrá la única creencia, después gastá el resto de la página probándola.",
    whyItMatters:
      "La mayoría de las páginas planas de indie SaaS intentan probar diez cosas a la vez. La página es ruidosa sobre cada feature secundaria y silenciosa sobre la única creencia que realmente decide la venta. Nombrar el Big Domino en una oración es lo que le permite a un founder cortar la mitad de la página sin perder un solo comprador.",
    howToApply: [
      'Escribí el Big Domino como una oración: "Si creés X, vas a comprar."',
      "Auditá cada párrafo de la página. Si un párrafo no mueve al lector hacia X, cortalo.",
      "Poné el Big Domino above the fold, en la voz del founder — no en marketing-speak.",
      "Probá el Big Domino en tres conversaciones reales con el dream customer. Si no nombra una creencia que ya tienen a medias, reescribilo.",
    ],
    example:
      'El Big Domino de Unlock SaaS es: "El trabajo entre el producto lanzado y el primer cliente que paga es el trabajo que nadie te enseñó — y el Playbook lo hace." Aceptá eso, y el precio de $49/mes, la garantía a 60 días y la estructura de siete pasos dejan de ser objeciones.',
    faqs: [
      {
        q: "¿En qué se diferencia el Big Domino de una value proposition?",
        a: 'Una value prop describe lo que hace el producto. El Big Domino es la creencia previa que el lector tiene que aceptar antes de que cualquier value prop importe. "Reembolso a 60 días" es una value prop; "el trabajo que nadie te enseñó es lo que hace la diferencia" es el Big Domino sobre el que se apoya.',
      },
      {
        q: "¿Una página puede tener más de un Big Domino?",
        a: "No. El punto es justamente elegir la única creencia que, una vez aceptada, hace colapsar cada otra objeción. Dos Big Dominos son dos páginas — separalas en dos surfaces o una Soap Opera Sequence entre medio.",
      },
    ],
  },
  {
    slug: "reluctant-hero",
    shortDefinition:
      "Uno de los cuatro arquetipos de Attractive Character de Russell Brunson. El founder resolvió su propio problema primero, lo siguió resolviendo para amigos que le seguían pidiendo, y publica el playbook a regañadientes porque la demanda no se va.",
    longDefinition:
      "El Reluctant Hero es uno de los cuatro arquetipos de attractive character de Russell Brunson. El founder resolvió su propio problema primero, lo siguió resolviendo para amigos que le seguían pidiendo, y publica el playbook a regañadientes porque la demanda no se va. La reticencia es la palanca de credibilidad: un founder vendiendo un sistema que inventó para sí mismo se lee como honesto de una manera que un founder que arranca con \"vine a cambiar la industria\" nunca logra.",
    whyItMatters:
      'Los founders indie de SaaS están parados sobre capital de Reluctant Hero y no lo gastan. La página de about se lee como una bio corporativa cuando debería leerse como una confesión: "Construí esto para mí, después para tres amigos, después los amigos siguieron pidiendo." Esa única oración vale más que tres case studies que el founder todavía no tiene.',
    howToApply: [
      "Reescribí la página de about en primera persona, arrancando con el momento en que decidiste resolver el problema para vos mismo.",
      "Nombrá el momento en que te diste cuenta de que otra gente tenía el mismo problema — los tres amigos originales, el primer ping en Discord, el DM frío que hizo click.",
      'Tirá el pronombre "we" si sos un founder en solitario. Las páginas Reluctant Hero en solitario convierten; las páginas tipo "we believe" no.',
      "Mantené la reticencia a lo largo de la página de ventas: la oferta existe porque la audiencia siguió pidiendo, no porque el founder quería un exit de SaaS.",
    ],
    example:
      'La bio de Maryan en Unlock SaaS arranca con: "Built the playbook he uses for his own launch. Marketer by trade, not engineer." La página vende el mismo playbook con el que el founder está sacando su propio producto. El Reluctant Hero acá es estructural — el comprador no está pagando por teoría, está pagando por el sistema que el founder está usando ahora mismo.',
    faqs: [
      {
        q: "¿El Reluctant Hero es lo mismo que una founder story?",
        a: "La founder story es el contenido; el Reluctant Hero es un arquetipo específico a través del cual se puede contar esa founder story. Brunson nombra cuatro arquetipos (Reluctant Hero, Leader, Adventurer, Reporter). La mayoría de los founders indie de SaaS encajan mejor en Reluctant Hero porque shipearon para resolver su propio problema.",
      },
      {
        q: "¿Y si construí el producto bajo contrato para un cliente, no para mí?",
        a: 'Entonces tu historia de Reluctant Hero arranca con el cliente, no con vos: "Un amigo me pidió que construyera esto para su equipo; el equipo lo siguió usando; los amigos del equipo empezaron a pedirlo." La reticencia sigue siendo real — no saliste con la intención de construir un SaaS.',
      },
    ],
  },

  // ---- Story layer ---------------------------------------------------------
  {
    slug: "story",
    shortDefinition:
      "Todo lo que vive entre el Hook y el cierre. No es un recurso literario; es la pila de creencias que el lector tiene que aceptar, una recognición chica a la vez, antes de que la oferta aterrice.",
    longDefinition:
      'La Story es todo lo que vive entre el Hook y el cierre. No es un recurso literario; es la pila de creencias. Cada sección de la página es una recognición chica que el lector tiene que aceptar ("sí, esa es mi situación", "sí, eso es lo que intenté", "sí, ahí es donde falló") antes de que la oferta pueda aterrizar. Saltearse la pila de creencias y la oferta parece cara; construirla y la oferta parece barata.',
    whyItMatters:
      "La página plana de indie SaaS casi siempre tiene un Hook usable y una oferta real pero nada en el medio. El lector hace scroll por una pared de features buscando una razón para creer y no la encuentra. Construir la pila de creencias es lo que convierte una página que recibe shares pero no compradores en una página que recibe menos shares y una línea plana de Stripe que se inclina hacia arriba.",
    howToApply: [
      "Escribí cinco oraciones que describan la situación de hoy de tu dream customer, en sus palabras.",
      "Escribí tres oraciones que describan lo que ya probaron y por qué se trabó.",
      "Escribí una oración que nombre la falsa creencia sobre la que estaba construido todo lo que probaron.",
      "Reemplazá el medio de tu página de ventas con esas nueve oraciones antes de reintroducir la oferta.",
    ],
    example:
      "En /playbook-sales la sección del medio nombra las tres cosas que un founder post-launch ya probó (más features, más tráfico, consejos de AI co-founder) y la falsa creencia sobre la que descansa cada una. La oferta de abajo solo funciona porque esa pila de creencias se construye antes.",
    faqs: [
      {
        q: "¿La Story tiene que ser una historia personal?",
        a: 'No. La Story es la pila de creencias, no la autobiografía del founder. Una página puede construir creencia a través de case studies, comparaciones dimensionales, screenshots o un teardown de la página actual del lector — cualquier cosa que lo mueva por la secuencia de recogniciones chicas que termina en "esto es para mí."',
      },
      {
        q: "¿Qué tan larga debería ser la sección de Story?",
        a: "Lo que tarde en caminar al lector desde donde está hasta donde la oferta tiene sentido obvio. Para un SaaS de $49/mes con tráfico tibio eso suele ser de cinco a siete scrolls. Para tráfico frío puede ser el doble y todavía convertir.",
      },
    ],
  },
  {
    slug: "soap-opera-sequence",
    shortDefinition:
      "El patrón de indoctrinación de cinco emails de Russell Brunson. Un nuevo suscriptor recibe un email por día durante cinco días, estructurados alrededor de un cliffhanger de backstory que se resuelve en la oferta el día cinco.",
    longDefinition:
      "La Soap Opera Sequence (SOS) es el patrón de indoctrinación de cinco emails de Russell Brunson. Un nuevo suscriptor recibe un email por día durante cinco días, estructurados alrededor de un cliffhanger de backstory que se resuelve en la oferta el día cinco. Cada email deja un open loop deliberado para que el siguiente se sienta ganado, no empujado.",
    whyItMatters:
      "Los founders indie de SaaS shipean un formulario de signup y después no mandan nada por dos semanas. El suscriptor se olvida del producto antes de que el founder escriba el primer follow-up. Una SOS que funciona es la diferencia entre una lista que convierte al 1% y una lista que convierte al 8% sobre el mismo tráfico.",
    howToApply: [
      "Día 1: llegá con la backstory del founder y un open loop específico.",
      "Día 2: nombrá el momento en que cambió todo (la recognición).",
      "Día 3: nombrá al enemigo público — la falsa creencia que tiene la audiencia.",
      "Día 4: nombrá la epifanía — la creencia nueva que dio vuelta el resultado del founder.",
      "Día 5: abrí la oferta, condicionada a aceptar la creencia nueva.",
    ],
    example:
      "Unlock SaaS manda una SOS de cinco emails el día que un founder pide el diagnóstico gratis. El día 5 abre la oferta del Starter de $1. Los suscriptores que no abren el día 1 se sacan de la secuencia — la SOS solo corre para lectores que están leyendo activamente.",
    commonConfusions: [
      {
        term: "Seinfeld Email",
        difference:
          "La SOS es una secuencia fija de cinco emails de indoctrinación que se manda la primera semana. Los Seinfeld Emails son emails diarios que se mandan para siempre después de eso — historias slice-of-life que pivotan a un pitch suave.",
      },
    ],
    faqs: [
      {
        q: "¿La SOS tiene que ser exactamente de cinco emails?",
        a: "Cinco es la forma canónica de Brunson porque cada día mapea a un shift de creencia (backstory, recognición, enemigo, epifanía, oferta). Cuatro funciona si comprimís recognición y enemigo; seis solo funciona si tu audiencia es inusualmente paciente. Tres son demasiado pocos — la oferta aterriza antes de que la creencia esté construida.",
      },
      {
        q: "¿Cuándo mando la SOS?",
        a: "Disparala en una sola acción de alta intención: signup de free trial, descarga de lead magnet, finalización del diagnóstico, o entrada a una waitlist. No la dispares solo en signup de newsletter — ese tráfico no está suficientemente tibio para leer cinco días de Story.",
      },
    ],
  },
  {
    slug: "seinfeld-email",
    shortDefinition:
      'El patrón de email diario de Russell Brunson: una historia slice-of-life corta en la voz del founder que pivota a un pitch suave en las últimas líneas. "Seinfeld" porque la historia es sobre cualquier cosa en particular y el pitch aterriza porque la historia ya pagó por la atención del lector.',
    longDefinition:
      'El patrón de email diario de Russell Brunson: una historia slice-of-life corta en la voz del founder que pivota a un pitch suave en las últimas líneas. "Seinfeld" porque la historia es sobre cualquier cosa en particular — una conversación en un café, una caminata, un bug en el producto — y el pitch aterriza porque la historia ya pagó por la atención del lector.',
    whyItMatters:
      "La mayoría de los founders indie de SaaS no pueden sostener un schedule diario de emails porque tratan cada email como un anuncio de feature. Los Seinfeld Emails son sostenibles: el founder escribe a partir de lo que ya pasó hoy, y la cadencia diaria es la que compone la relación. Los emails diarios superan a las newsletters semanales en conversión-por-suscriptor por márgenes que los founders indie encuentran vergonzosos una vez que sacan la cuenta.",
    howToApply: [
      "Escribí el email sobre algo específico que pasó realmente hoy.",
      "Aterrizá la historia en 150 a 300 palabras.",
      "Pivotá a la oferta en las últimas dos o tres líneas, no en las primeras.",
      "Mandá diario por al menos 30 días antes de juzgar el canal.",
    ],
    example:
      "Unlock SaaS corre una corriente Seinfeld después de que termina la Soap Opera Sequence. Del día 6 en adelante, el founder manda un email diario sobre un momento real construyendo el producto o hablando con un cliente. El pitch en las últimas dos líneas apunta al diagnóstico, al Starter de $1 o al Playbook según la semana.",
    commonConfusions: [
      {
        term: "Soap Opera Sequence",
        difference:
          "La SOS es la indoctrinación fija de cinco emails en la primera semana. Los Seinfeld Emails corren después de eso, diarios, indefinidamente. Distinta cadencia, distinto propósito.",
      },
    ],
    faqs: [
      {
        q: "¿En qué se diferencia un Seinfeld Email de una newsletter regular?",
        a: "Una newsletter anuncia cosas. Un Seinfeld Email cuenta una sola historia slice-of-life específica y termina con un pitch suave. El modo newsletter entrena a los lectores a saltearlo; el modo Seinfeld los entrena a abrirlo porque la próxima historia siempre es nueva.",
      },
      {
        q: "¿Los emails diarios van a hacer que la gente se desuscriba?",
        a: "Sí, y ese es el punto. Los lectores equivocados se van; los correctos componen. Una lista de 800 lectores diarios que reconocen tu voz convierte más alto que una lista de 8.000 lectores semanales que apenas se acuerdan de haberse suscrito.",
      },
    ],
  },

  // ---- Offer layer ---------------------------------------------------------
  {
    slug: "offer",
    shortDefinition:
      "Lo que la página pide y lo que da a cambio, estructurado de modo que el valor percibido esté inequívocamente arriba del precio. Una oferta buena no es el producto; es el resultado del que el producto es el mecanismo de entrega, más la prueba de que el resultado va a llegar, más la reversión del downside del comprador.",
    longDefinition:
      "La Offer es lo que la página pide y lo que da a cambio, estructurada de modo que el valor percibido esté inequívocamente arriba del precio. Una oferta buena no es el producto; es el resultado del que el producto es el mecanismo de entrega, más la prueba de que el resultado va a llegar, más la reversión del downside del comprador.",
    whyItMatters:
      'La mayoría de las páginas de indie SaaS venden features y le llaman a eso una oferta. El lector ve "$49/mes por la herramienta X" y se pregunta si quiere la herramienta X — lo cual es la pregunta equivocada. Una oferta real hace que el comprador compare el precio con el resultado y la garantía con su downside; enmarcado así, el mismo producto convierte de dos a cinco veces más alto sobre tráfico idéntico.',
    howToApply: [
      'Reemplazá "comprá nuestro producto" por "obtené este resultado específico."',
      "Agregá una garantía o reversión que nombre el downside real del comprador.",
      "Itemizá lo que está incluido para que el valor percibido quede arriba del precio.",
      "Probá la oferta en tres conversaciones reales con el dream customer antes de mandarla a la página.",
    ],
    example:
      'La Offer de Unlock SaaS no es "$49/mes por una herramienta de SaaS." Es "primer cliente que paga en 60 días o te lo reembolsamos, con un cap duro de $98 sobre lo que podés llegar a perder." El producto es el mecanismo de entrega; la oferta es el resultado más la reversión.',
    faqs: [
      {
        q: "¿La oferta es lo mismo que el precio?",
        a: "No. El precio es un componente de una oferta; el resto son el resultado que recibe el comprador, la garantía que revierte su downside y el value stack itemizado que justifica el precio. Una página con solo un precio y sin reversión está vendiendo un producto, no una oferta.",
      },
      {
        q: "¿Cada página necesita una oferta?",
        a: "Cada página que pide dinero o un compromiso significativo (trial extendido, demo, postulación). Las páginas de contenido gratis no necesitan una oferta en ese sentido — la oferta es la página misma.",
      },
    ],
  },
  {
    slug: "value-ladder",
    shortDefinition:
      "Una secuencia ordenada de ofertas por las que el mismo cliente puede ir pasando a lo largo del tiempo, donde cada peldaño entrega estrictamente más valor que el anterior a un precio proporcional a la entrega.",
    longDefinition:
      "Una Value Ladder es una secuencia ordenada de ofertas por las que el mismo cliente puede ir pasando a lo largo del tiempo, donde cada peldaño entrega estrictamente más valor que el anterior a un precio proporcional a la entrega. La ladder es la hoja de ruta de productos del founder vista desde el lado del comprador: qué compran primero, qué compran después, qué compran cuando ya confían en vos.",
    whyItMatters:
      "Los founders indie de SaaS por default tienen un producto a un precio para todo el mundo. El resultado es un funnel binario — compradores o no-compradores — sin camino entre los dos. Una Value Ladder de dos peldaños ($1 de entrada, $49/mes core) duplica el mercado direccionable porque le da al lector frío un primer paso real que no requiere confiar todavía en el founder.",
    howToApply: [
      "Nombrá un peldaño de entrada que cueste casi nada y pruebe intención.",
      "Nombrá un peldaño core que entregue el resultado titular.",
      "Decidí si existe un tercer peldaño; no lo construyas hasta que el peldaño core tenga tres ciclos de cliente completados.",
      "Hacé cada peldaño legible en la página — el comprador debería saber en qué peldaño está y qué le compra el siguiente.",
    ],
    example:
      "La Value Ladder de Unlock SaaS son dos peldaños hoy: Starter de $1 (desbloquea los pasos 1 y 2 del Playbook) y Core de $49/mes (el Playbook completo de siete pasos). El Rung 3 (Repeatable Revenue) es un spec publicado en /repeatable; el build está bloqueado por tres ciclos de cliente del Core que completen — la ladder no crece hasta que el peldaño de abajo demuestre.",
    faqs: [
      {
        q: "¿Necesito un peldaño gratis en el fondo?",
        a: "A veces. Un peldaño gratis tiene sentido cuando el siguiente peldaño necesita confianza real (coaching de alto ticket, SaaS enterprise). Para un producto indie de $49/mes, un peldaño de $1 funciona mejor que uno gratis — pagar $1 es la señal de intención real más chica que un cliente puede dar, y Stripe la verifica.",
      },
      {
        q: "¿Cuántos peldaños son demasiados?",
        a: "Tres es el techo para un indie SaaS hasta que el peldaño core tenga al menos 20 ciclos de cliente completados. Más allá de eso, un cuarto peldaño tiene sentido si y solo si la audiencia lo pide sin que se lo provoquen. Agregar peldaños que la audiencia no pidió es como los productos indie se convierten en plataformas infladas.",
      },
    ],
  },
  {
    slug: "stack-slide",
    shortDefinition:
      "El patrón de revelación de la oferta que Russell Brunson popularizó en el Perfect Webinar. Cada entregable en la oferta se itemiza en su propia línea y se ancla a un precio standalone; el total de los anclajes se muestra explícitamente; después el precio real se revela como un descuento sobre ese total.",
    longDefinition:
      "El Stack Slide es el patrón de revelación de la oferta que Russell Brunson hizo famoso en el Perfect Webinar. Cada entregable en la oferta se itemiza en su propia línea y se ancla a un precio standalone; el total de los anclajes se muestra explícitamente; después el precio real se revela como un descuento sobre ese total. El punto no es engañar — el punto es que el comprador evalúe la oferta entera en vez de pelearse con la etiqueta de precio.",
    whyItMatters:
      "Las páginas que listan features sin anclarlas a valores standalone pierden al comprador frente a un solo número: el precio. Las páginas que stackean la oferta correctamente pierden la comparación de precio enteramente — el comprador está comparando el stack total contra su downside real, no la mensualidad contra la mensualidad de un competidor.",
    howToApply: [
      "Listá cada entregable en su propia línea.",
      "Anclá cada línea al valor standalone realista de ese entregable.",
      "Mostrá el total de los anclajes antes de revelar tu precio.",
      "Revelá el precio como un descuento sobre el total anclado, con el razonamiento en una oración.",
    ],
    example:
      "El stack de Unlock SaaS en /playbook-sales itemiza los siete pasos del Playbook, el diagnóstico, la línea de soporte del founder y la entrada en el Verified Builders directory, cada uno anclado a un precio standalone que el mercado de indie SaaS realmente cobra por esas cosas. El número de $49/mes aterriza como un descuento sobre ese total, no como una etiqueta de feature page.",
    faqs: [
      {
        q: "¿El Stack Slide es manipulador?",
        a: "Es manipulador solo si los precios anclados son fabricados. Si cada line item realmente costaría lo que anclás de un proveedor comparable, el stack es un servicio para el comprador — tendrían que ensamblar el mismo valor ellos mismos y pagar cada pieza por separado. Brunson Hard-Rule: nunca ancles a un precio que el mercado no cobra realmente.",
      },
      {
        q: "¿El Stack funciona para un producto de suscripción?",
        a: "Sí, pero los anclajes deberían ser equivalentes mensuales, no precios de por vida. Anclá cada entregable a su equivalente mensual honesto de un proveedor que compite, sumá esos, después revelá tu fee mensual como un descuento sobre la suma. El lector está comprando un mes, así que evalúa el stack mensualmente.",
      },
    ],
  },
  {
    slug: "perfect-webinar",
    shortDefinition:
      "El framework de Russell Brunson para vender una oferta de alto ticket a tráfico frío en una sola presentación uno-a-muchos. La estructura es fija: nombrá el Big Domino, caminá por tres secrets que lo prueben (vehicle, internal beliefs, external beliefs), stackeá la oferta y cerrá.",
    longDefinition:
      "El Perfect Webinar es el framework de Russell Brunson para vender una oferta de alto ticket a tráfico frío en una sola presentación uno-a-muchos. La estructura es fija: nombrá el Big Domino, caminá por tres secrets que lo prueben (vehicle, internal beliefs, external beliefs), stackeá la oferta y cerrá. Los founders indie de SaaS rara vez corren webinars literales, pero la forma del Perfect Webinar es la estructura canónica que su página de ventas debería seguir.",
    whyItMatters:
      "La mayoría de las páginas de ventas de indie SaaS están organizadas por categoría de feature. El Perfect Webinar las reorganiza por secuencia de creencias — exactamente lo que un lector frío realmente atraviesa camino a la compra. Los founders que reestructuran su página de ventas plana en la forma de un Perfect Webinar suelen ver lift de conversión sobre tráfico que ya estaban recibiendo.",
    howToApply: [
      "Abrí la página con la oración del Big Domino.",
      "Corré tres secciones, cada una un secret: vehicle (por qué esta categoría), internal beliefs (por qué vos podés hacerlo), external beliefs (por qué nada de afuera está en el camino).",
      "Aterrizá en el Stack Slide.",
      "Cerrá con la revelación del precio y la garantía.",
    ],
    example:
      "/playbook-sales sigue la forma del Perfect Webinar en una página de ventas en lugar de un webinar. Big Domino arriba, tres secciones de secret en el medio (por qué un Playbook le gana a un curso, por qué un founder no-engineer puede correrlo, por qué el tráfico no es el blocker), stack cerca del fondo, cierre refund-in-code al final.",
    faqs: [
      {
        q: "¿Tengo que correr un webinar literal?",
        a: "No. El Perfect Webinar es un template estructural — la forma de creencias que un lector frío tiene que atravesar. La misma forma funciona en una página de ventas, en un VSL, en una Soap Opera Sequence de cinco emails y en un webinar en vivo de 90 minutos. Elegí el formato que el dream customer realmente consume.",
      },
      {
        q: "¿Qué tan largo es un Perfect Webinar?",
        a: "En vivo: 60 a 90 minutos. En una página de ventas: lo que tarde en caminar los tres secrets y stackear la oferta — típicamente 10 a 20 scrolls para un producto de $49/mes, más largo para alto ticket.",
      },
    ],
  },

  // ---- Diagnostic layer ----------------------------------------------------
  {
    slug: "wrong-person",
    shortDefinition:
      'Una de las tres etiquetas de diagnóstico que Unlock SaaS devuelve cuando un founder pega la URL de su producto en vivo. "Wrong Person" se dispara cuando la oferta en la página está bien pero la página apunta a nadie en particular — copy genérico, visuales genéricos, lista de features genérica.',
    longDefinition:
      'Wrong Person es una de las tres etiquetas de diagnóstico que Unlock SaaS devuelve cuando un founder pega la URL de su producto en vivo. "Wrong Person" se dispara cuando la oferta en la página está bien pero la página apunta a nadie en particular — copy genérico, visuales genéricos, lista de features genérica. La página convertiría para alguien, pero no filtra por nadie, así que no convierte para ninguno.',
    whyItMatters:
      "La mayoría de las páginas planas de indie SaaS reciben este diagnóstico. Los founders creen que tienen un problema de features y doblan la apuesta en el roadmap de producto; el diagnóstico muestra que tienen un problema de nombrar la audiencia y un arreglo de una tarde.",
    howToApply: [
      "Nombrá a una persona específica, en un rol específico, en una empresa específica.",
      "Reescribí el Hook para hablarle directamente a esa persona.",
      "Agregá una línea de polaridad que nombre a quién no le habla la página.",
      "Volvé a correr el diagnóstico. Si seguís sacando Wrong Person, nombraste una persona-tipo, no una persona.",
    ],
    example:
      'Un resultado de diagnóstico Wrong Person para un SaaS de feedback collection llevó a renombrar la página de "Customer Feedback Made Easy" a "For solo SaaS founders who need three real interviews this week." Mismo producto, audiencia nombrada, conversión arriba sobre el tráfico que el founder ya tenía.',
    faqs: [
      {
        q: "¿En qué se diferencia Wrong Person de un target market malo?",
        a: 'Target market es una categoría ("founders indie de SaaS"). Wrong Person se dispara cuando la página apunta a una categoría en lugar de a una persona. El fix no es elegir una categoría distinta; es nombrar a un humano específico dentro de la categoría que ya elegiste.',
      },
      {
        q: "¿Un B2B SaaS puede caer en Wrong Person?",
        a: 'Sí — es el diagnóstico más común de B2B SaaS. Una página que dice "for teams" sin nombrar un rol, un tamaño de equipo, un stack tech o un workflow específico es Wrong Person por default.',
      },
    ],
  },
  {
    slug: "weak-offer",
    shortDefinition:
      "Etiqueta de diagnóstico que se dispara cuando la persona en la página está bien pero la oferta es una lista de features en lugar de un resultado. El lector sabe que es para él; simplemente no puede decir qué está comprando.",
    longDefinition:
      "Weak Offer es la etiqueta de diagnóstico que se dispara cuando la persona en la página está bien pero la oferta es una lista de features en lugar de un resultado. El lector sabe que es para él; simplemente no puede decir qué está comprando. Weak Offer es la segunda etiqueta más común y casi siempre coexiste con una garantía faltante o un stack faltante.",
    whyItMatters:
      "Weak Offer es el diagnóstico que los founders más empujan en contra porque la página tiene todas las features correctas. El diagnóstico no está diciendo que el producto está mal; está diciendo que la página le está pidiendo al lector que traduzca features a resultados, y la mayoría de los lectores no lo hacen.",
    howToApply: [
      "Reescribí el titular como un resultado, no como una feature.",
      "Agregá una garantía de una oración que nombre el downside real del comprador.",
      "Construí un Stack Slide que ancle cada entregable a un precio standalone.",
      "Volvé a correr el diagnóstico.",
    ],
    example:
      'Un diagnóstico sobre un clon de Linear para founders en solitario sacó Weak Offer. La sección de features era fuerte; el Hook decía "Project management for solo founders." Reescribirla a "Ship one feature a week on a calendar your future self can audit" más una garantía de devolución a 30 días puso el diagnóstico en verde.',
    faqs: [
      {
        q: "Si mi precio es competitivo, ¿puedo igual tener una Weak Offer?",
        a: "Sí. Weak Offer es sobre cómo está enmarcada la oferta, no qué tan barata es. Un producto bien-precio con una página de lista de features se lee como Weak Offer; un producto a precio promedio con una oferta stackeada y una garantía se lee como una oferta fuerte al mismo número.",
      },
      {
        q: "¿Una garantía siempre arregla Weak Offer?",
        a: "Una garantía más un titular result-named más un stack lo arregla. Una garantía sola, atornillada a una feature page sin tocar, es una nota al pie — los lectores la ven y la ignoran porque el resto de la página no ganó el read.",
      },
    ],
  },
  {
    slug: "weak-belief",
    shortDefinition:
      "Etiqueta de diagnóstico que se dispara cuando la persona y la oferta están bien pero la página no hace que el lector crea que la oferta va a funcionar para él específicamente. El lector se reconoce; entiende la oferta; simplemente no la cree.",
    longDefinition:
      "Weak Belief es la etiqueta de diagnóstico que se dispara cuando la persona y la oferta están bien pero la página no hace que el lector crea que la oferta va a funcionar para él específicamente. El lector se reconoce; entiende la oferta; simplemente no la cree. Weak Belief es la más rara de las tres etiquetas y la más difícil de arreglar — es el diagnóstico que requiere prueba social, screenshots, o una historia de Reluctant Hero que el founder quizás todavía no tenga.",
    whyItMatters:
      "Los founders con Weak Belief suelen estar más cerca de convertir de lo que creen. La página está haciendo el 80% del trabajo; el lector está leyendo hasta el fondo y rebotando. El fix es quirúrgico — una pieza de prueba real en la posición correcta del scroll — no una reescritura.",
    howToApply: [
      "Agregá una pieza de prueba real en la tercera posición del scroll: un screenshot del dashboard de Stripe de un cliente real, una cita de una conversación real, una grabación de pantalla del resultado pasando en vivo.",
      'Cortá cada palabra de hedge ("puede", "podría", "a menudo") y reemplazá por compromisos concretos.',
      "Agregá una historia de Reluctant Hero a la página de about y linkeá desde la página de ventas.",
      "Volvé a correr el diagnóstico.",
    ],
    example:
      "Un diagnóstico sobre una herramienta de analytics de nicho sacó Weak Belief. El fix fue agregar un screenshot anotado del dashboard de un usuario real arriba del pricing fold, más un Reluctant Hero de dos oraciones en la página de about. No se reescribió copy en otro lado; la conversión subió.",
    faqs: [
      {
        q: "Todavía no tengo screenshots de clientes — ¿qué prueba puedo usar?",
        a: "La prueba pre-revenue es prueba real: una grabación de pantalla del producto haciendo el resultado sobre tu propia data; una línea honesta sobre dónde está el producto en su ciclo de vida; una historia de Reluctant Hero; un beta user nombrado con permiso. Los testimonios fabricados no son prueba y fallan auditorías.",
      },
      {
        q: "¿Weak Belief es lo mismo que no tener case studies?",
        a: "Los case studies son una forma de prueba de creencia, pero no la única. Una grabación de pantalla, un screenshot anotado, un log de build-in-public transparente o una cita de un solo beta user nombrado cuentan todas. El diagnóstico mide si la creencia aterriza, no si existen case studies.",
      },
    ],
  },

  // ---- Audience layer ------------------------------------------------------
  {
    slug: "dream-100",
    shortDefinition:
      "La lista nombrada de los 100 humanos, publicaciones, comunidades o plataformas específicas donde el dream customer ya se reúne. El framework de Russell Brunson en Traffic Secrets — el punto de entrada para cada canal outbound.",
    longDefinition:
      "La Dream 100 es la lista nombrada de los 100 humanos, publicaciones, comunidades o plataformas específicas donde el dream customer ya se reúne. El framework de Russell Brunson en Traffic Secrets — el punto de entrada para cada canal outbound. La Dream 100 se nombra, no se segmenta: handles reales de Twitter, URLs reales de subreddits, nombres reales de podcasts, editores reales de newsletters.",
    whyItMatters:
      'Los founders indie de SaaS gastan meses "buscando su audiencia" cuando la audiencia ya se juntó en 100 lugares que podrían nombrar en una tarde. La Dream 100 obliga al founder a escribir la lista, que es lo que convierte la abstracta "audience research" en outreach concreto a la mañana siguiente.',
    howToApply: [
      "Pasá una tarde escribiendo 100 líneas específicas. Sin categorías — solo handles, URLs, nombres.",
      "Anotá cada línea con la primera movida más chica posible (responder un tweet, comentar en un episodio de podcast, escribirle al editor con una pregunta específica).",
      "Elegí cinco líneas por semana. Hacé la movida. Trackea respuestas.",
      "Reemplazá líneas que no van a ningún lado; mantené líneas que responden, aunque sea tibiamente.",
    ],
    example:
      "La Dream 100 de Maryan para Unlock SaaS incluye los Discords de indie SaaS que lee el dream customer, tres podcasts cuyos hosts shipearon con herramientas de AI, cuatro newsletters sobre la lucha post-launch, y founders nombrados que admiten públicamente líneas planas de Stripe. La lista no es aspiracional — cada línea está a un outbound de distancia.",
    faqs: [
      {
        q: "¿La Dream 100 tiene que ser exactamente 100?",
        a: "No, pero tiene que ser específica. Cincuenta entradas nombradas le ganan a mil categorías vagas. Brunson usa 100 porque por debajo de 30 un founder elige solo los targets fáciles y por arriba de 200 la lista deja de ser accionable. Elegí un número donde cada línea sea real y la próxima movida esté a un click.",
      },
      {
        q: "¿La Dream 100 es paga u orgánica?",
        a: "Mayormente orgánica para indie SaaS — respuestas directas, comentarios, DMs, postulaciones para ser invitado de podcast. Las jugadas pagas van encima de la misma lista (sponsorear las mismas newsletters, correr ads contra los mismos subreddits) pero la movida orgánica precede a la paga, siempre.",
      },
    ],
  },

  // ---- Editorial layer ----------------------------------------------------
  {
    slug: "verified-builder",
    shortDefinition:
      "Un founder cuyo primer cliente que paga fue confirmado vía la cuenta de Stripe conectada del founder — no auto-reportado, no por screenshot, no por testimonio. El Verified Builders directory en Unlock SaaS solo crece cuando el webhook de Stripe confirma el ciclo.",
    longDefinition:
      "Un Verified Builder es un founder cuyo primer cliente que paga fue confirmado vía la cuenta de Stripe conectada del founder — no auto-reportado, no por screenshot, no por testimonio. El Verified Builders directory en Unlock SaaS solo crece cuando el webhook de Stripe confirma el ciclo. El status de verificado es la unidad canónica de prueba social en el sitio.",
    whyItMatters:
      "La mayoría de los muros de testimonios en páginas de indie SaaS fallan auditorías porque son inverificables. El status de Verified Builder es lo opuesto: está enforzado en código, firmado por Stripe, y la entrada en el directory existe solo porque un cobro real entró. Eso lo convierte en la rara señal de prueba social que sobrevive tanto al escrutinio del comprador como a las Google Quality Rater Guidelines.",
    howToApply: [
      'Si estás corriendo tu propio SaaS, definí qué significa "cliente verificado" en tu dominio y enforzalo en código.',
      "Negate a publicar prueba social que tu sistema no puede verificar — claims rotos duelen más que muros vacíos.",
      "Atá cualquier directory de prueba social al mismo evento de verificación.",
      "Si todavía no podés verificar, shipea el empty state honesto y dejá que el sistema lo haga crecer.",
    ],
    example:
      "/builders renderiza solo a los founders cuyo webhook de Stripe confirmó al menos un cliente que paga en su cuenta conectada. Hasta que eso se dispare, no están en el directory — no existe un camino de auto-reporte.",
    faqs: [
      {
        q: "¿Por qué no dejar que los founders auto-reporten su primer cliente?",
        a: "Porque la prueba social auto-reportada falla auditorías de calidad y erosiona la confianza del comprador. El costo de correr un gate de verificación más apretado es un directory más chico; el beneficio es que cada línea del directory es incuestionable. Brunson Hard-Rule.",
      },
      {
        q: "¿Qué cuenta como un cliente verificado que paga?",
        a: "Un cobro real de Stripe en la cuenta conectada del founder, de un cliente que no es el founder mismo, que no se reembolsa dentro de la ventana de auditoría de siete días. Sin excepciones. El flujo del webhook está documentado en /editorial-policy.",
      },
    ],
  },
  {
    slug: "brunson-hard-rule",
    shortDefinition:
      "El estándar editorial bajo el que Unlock SaaS publica. Cada afirmación pública es independientemente verificable, fechada cuando el hecho subyacente puede cambiar y no fabricada. Ningún aggregateRating antes de que existan reviewers verificados; ningún conteo de testimonios antes de que existan testimonios.",
    longDefinition:
      "La Brunson Hard-Rule es el estándar editorial bajo el que Unlock SaaS publica. Cada afirmación pública es independientemente verificable, fechada cuando el hecho subyacente puede cambiar y no fabricada. Ningún aggregateRating antes de que existan reviewers verificados; ningún conteo de testimonios antes de que existan testimonios; ningún sameAs antes de que el founder sea dueño de la cuenta; ningún Q-ID de Wikidata antes de que una entrada real esté publicada. La regla nombra lo que NO vamos a hacer, no lo que sí.",
    whyItMatters:
      "Los founders pre-revenue están tentados de fabricar prueba social para verse creíbles. La Brunson Hard-Rule dice que no, y la disciplina compone: cada hecho del sitio es uno que un comprador puede verificar, que es lo que vuelve a los pocos hechos que SÍ publicamos desproporcionadamente creíbles. También hace que el sitio sobreviva la deduplicación de AI Overviews, la auditoría de quality rater de Google, y cualquier revisión futura impulsada por scraper que reciba el sitio.",
    howToApply: [
      "Auditá cada claim de prueba social en tu página. Si no podés probarlo desde una fuente pública, sacalo.",
      "Agregá una fecha Last Verified a cada claim que puede cambiar (precios, headcount, integrations).",
      "Publicá una política editorial que documente cómo obtenés fuentes, firmás y corregís claims.",
      "Cuando dudes, shipea el empty state honesto y dejá que el sistema crezca al slot.",
    ],
    example:
      "En Unlock SaaS, el JSON-LD del Playbook SoftwareApplication omite intencionalmente aggregateRating porque ningún reviewer verificado todavía publicó una review pública. El graph del schema tiene un agujero donde irían las reviews, y la omisión es la señal de auditoría: el día que aterriza una review real, el slot se llena.",
    faqs: [
      {
        q: "¿La Brunson Hard-Rule es una regla de Russell Brunson?",
        a: "No. El nombre es un guiño — los frameworks de Brunson son centrales al producto — pero la regla editorial es propia de Unlock SaaS. Es el inverso del error de funnel-marketing más común: fabricar prueba para verse más adelante de lo que estás.",
      },
      {
        q: "¿Esto frena el crecimiento?",
        a: "Sí, deliberadamente. El sitio hace crecer la prueba social a la velocidad a la que llega la prueba social real. El trade es una página que se ve más lenta a cambio de una página que sobrevive cada auditoría que Google, un LLM o un comprador atento puede correrle. Para un producto indie de menos de $100, el trade vale la pena; para productos de mayor ticket, no se puede no hacer.",
      },
    ],
  },
];

// ----- Sanity check ---------------------------------------------------------

const _shapeCheck: GlossaryTranslation = GLOSSARY_ES[0]!;
void _shapeCheck;
