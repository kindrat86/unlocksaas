/**
 * /founders-in/[city] pSEO catalog – geo founder-community landers.
 *
 * Why this cluster exists
 * -----------------------
 * Greg Isenberg's 2026 distribution overlay (see
 * memory/project_unlocksaas_isenberg_playbook.md) calls out community-as-moat
 * and content-franchise plays as the durable layer over Brunson conversion
 * mechanics. The geo cluster targets the long-tail search shape
 * "saas founders in <city>" / "indie hackers <city>" / "where do micro-saas
 * founders hang out <city>" – queries that are low-volume per city but
 * compound to a meaningful surface at 20+ cities.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *  - No invented meetup names. "Where founders gather" lists generic
 *    discovery tactics (Indie Hackers city tags, Meetup.com searches,
 *    geo-search on X) plus a small set of high-confidence named venues
 *    where verifiable. No fabricated Slack workspaces, no invented
 *    counts ("500+ founders in city X"), no synthesized testimonials.
 *  - The diagnostic CTA is identical across every city page – same
 *    product, same offer. The city framing is intro context, not
 *    geo-segmented pricing or geo-segmented promises.
 *  - Honest scope signal: at zero IRL meetup activity, each page reads
 *    "discovery tactics for finding the local scene" rather than
 *    "the local scene is X, Y, Z." When operator-led IRL events spin
 *    up, those rows extend per-city without invalidating the framing.
 */

export interface CityEntry {
  /** URL slug, kebab-case. */
  slug: string;
  /** Display name, "City, Region" or "City, Country" for non-US. */
  displayName: string;
  /** Short city name on its own (used in body copy). */
  city: string;
  /** Country display name. */
  country: string;
  /** Region/state where useful (e.g. "California"); empty string when not. */
  region: string;
  /** IANA timezone identifier. */
  timezone: string;
  /** UTC-offset label for human display (covers DST where applicable). */
  utcOffsetLabel: string;
  /** SEO meta title, under 60 chars. */
  metaTitle: string;
  /** SEO meta description, under 160 chars. */
  metaDescription: string;
  /** Hero subhead, ~30 words. */
  heroSubhead: string;
  /** One paragraph on the local micro-SaaS scene's character (honest, not boastful). */
  sceneIntro: string;
  /** One paragraph on the local pain angle that resonates in this city. */
  localPainAngle: string;
  /** Discovery tactics for finding local founders – generic + high-confidence named venues only. */
  whereToFind: ReadonlyArray<string>;
  /** Cross-timezone collaboration window when working with the dominant remote market. */
  timeWindowForCrossTzWork: string;
  /** Related cities (slugs) for in-cluster cross-linking. */
  relatedCities: ReadonlyArray<string>;
  /** ISO date last verified. */
  lastVerified: string;
}

const VERIFIED = "2026-05-22";

export const CITY_ENTRIES: ReadonlyArray<CityEntry> = [
  {
    slug: "san-francisco",
    displayName: "San Francisco, CA",
    city: "San Francisco",
    country: "United States",
    region: "California",
    timezone: "America/Los_Angeles",
    utcOffsetLabel: "UTC-08 (UTC-07 DST)",
    metaTitle: "Micro-SaaS Founders in San Francisco",
    metaDescription:
      "Indie founders building post-launch pre-revenue SaaS in San Francisco. Where the local scene meets, plus the free Hook / Story / Offer diagnostic.",
    heroSubhead:
      "Built for indie founders building micro-SaaS in San Francisco whose launch went flat. Same diagnostic, same Playbook, with the local scene's distribution context in mind.",
    sceneIntro:
      "San Francisco is the densest founder market on earth. The indie cohort is the small minority inside a venture-saturated city, and that asymmetry shows up in their pain: cost of living anchors expectations to VC-stage numbers, but most micro-SaaS revenue lives a full ladder rung below that. The Brunson Hook / Story / Offer triage is calibrated for that exact gap.",
    localPainAngle:
      "Many SF founders carry a VC-rate burn baseline ($4k+ rent, $6k+ if there's a partner) while running an indie product that needs to clear $10k MRR before it pays for the city. The flat Stripe line hits harder here because the runway math is unforgiving.",
    whereToFind: [
      "Indie Hackers community city tag for San Francisco (filter the IH front page by location)",
      "Meetup.com search: \"indie hackers san francisco\", \"saas san francisco\", \"bootstrappers san francisco\"",
      "X / Twitter geo search: \"saas founder\" near:\"San Francisco\" within:50mi",
      "SoMa and Mission coworking spaces during weekday afternoons; the founder cohort skews to deep-work blocks, not morning standups",
      "Y Combinator alumni groups (even for non-YC founders, the network spans both venture and indie cohorts)",
    ],
    timeWindowForCrossTzWork:
      "Cross-team work with European partners sits in your 7am–10am window; East Coast US overlap runs 6am–2pm. Asia-Pacific overlap is essentially evenings 6pm onward.",
    relatedCities: ["los-angeles", "seattle", "portland", "new-york"],
    lastVerified: VERIFIED,
  },
  {
    slug: "new-york",
    displayName: "New York, NY",
    city: "New York",
    country: "United States",
    region: "New York",
    timezone: "America/New_York",
    utcOffsetLabel: "UTC-05 (UTC-04 DST)",
    metaTitle: "Micro-SaaS Founders in New York",
    metaDescription:
      "Indie founders building post-launch pre-revenue SaaS in New York. Where the local scene meets, plus the free Hook / Story / Offer diagnostic.",
    heroSubhead:
      "Built for indie founders building micro-SaaS in New York whose launch went flat. Same diagnostic, same Playbook, with the local scene's distribution context in mind.",
    sceneIntro:
      "New York's indie SaaS scene punches above its visible weight. The visible startup conversation is venture and fintech-heavy, but the bootstrapped cohort is real and active – often founders who came from agency, media, or finance backgrounds and now build for those verticals. The Hook / Story / Offer frame slots cleanly into that pattern.",
    localPainAngle:
      "Many NYC founders have a strong network and existing client relationships from prior roles, but get stuck running founder-led services that don't compound. The frequent diagnosis: a service business with a SaaS coat of paint. The diagnostic separates the two.",
    whereToFind: [
      "Indie Hackers community city tag for New York",
      "Meetup.com search: \"indie hackers new york\", \"bootstrappers nyc\", \"saas founders new york\"",
      "X / Twitter geo search: \"saas founder\" near:\"New York\" within:25mi",
      "Brooklyn-based coworking spaces (the indie cohort skews east of Manhattan during weekdays)",
      "Local newsletters from operators like Web Smith, Lenny Rachitsky readers, and the NY Tech alumni network",
    ],
    timeWindowForCrossTzWork:
      "European partners overlap 9am–noon EST; West Coast overlap runs noon–8pm. Asia-Pacific is essentially asynchronous from NYC.",
    relatedCities: ["boston", "toronto", "miami", "chicago"],
    lastVerified: VERIFIED,
  },
  {
    slug: "austin",
    displayName: "Austin, TX",
    city: "Austin",
    country: "United States",
    region: "Texas",
    timezone: "America/Chicago",
    utcOffsetLabel: "UTC-06 (UTC-05 DST)",
    metaTitle: "Micro-SaaS Founders in Austin",
    metaDescription:
      "Indie founders building post-launch pre-revenue SaaS in Austin. Where the local scene meets, plus the free Hook / Story / Offer diagnostic.",
    heroSubhead:
      "Built for indie founders building micro-SaaS in Austin whose launch went flat. Same diagnostic, same Playbook, with the local scene's distribution context in mind.",
    sceneIntro:
      "Austin's indie SaaS density grew sharply in the post-2020 founder migration. The cohort tilts younger, more remote-native, and more comfortable mixing build-in-public with content marketing than the older coastal scenes. Capital Factory anchors the visible startup activity but most indie cohort meeting happens in smaller informal circles.",
    localPainAngle:
      "Austin founders often have lower cost-of-living runway than coastal peers, which removes urgency – and that's its own trap. The flat Stripe line drags on for months because the rent isn't the alarm. The diagnostic is the calendar alarm.",
    whereToFind: [
      "Indie Hackers community city tag for Austin",
      "Meetup.com search: \"indie hackers austin\", \"saas austin\", \"founders austin\"",
      "Capital Factory events (broad SaaS / startup mix, includes some indie cohort)",
      "X / Twitter geo search: \"saas founder\" near:\"Austin\" within:30mi",
      "South Congress and East Austin coworking spaces (cohort skews to flexible, non-corporate venues)",
    ],
    timeWindowForCrossTzWork:
      "European partners overlap 8am–11am CST; both coasts of the US are reachable through the workday. Strong default timezone for cross-US remote work.",
    relatedCities: ["denver", "miami", "los-angeles", "san-francisco"],
    lastVerified: VERIFIED,
  },
  {
    slug: "miami",
    displayName: "Miami, FL",
    city: "Miami",
    country: "United States",
    region: "Florida",
    timezone: "America/New_York",
    utcOffsetLabel: "UTC-05 (UTC-04 DST)",
    metaTitle: "Micro-SaaS Founders in Miami",
    metaDescription:
      "Indie founders building post-launch pre-revenue SaaS in Miami. Where the local scene meets, plus the free Hook / Story / Offer diagnostic.",
    heroSubhead:
      "Built for indie founders building micro-SaaS in Miami whose launch went flat. Same diagnostic, same Playbook, with the local scene's distribution context in mind.",
    sceneIntro:
      "Miami's founder scene grew fast in the 2020–2023 migration cycle and has settled into a more diverse mix than its early crypto-heavy framing. The indie cohort is real, English-Spanish bilingual is common, and the LATAM-bridge angle is a genuine asset – many founders sell into LATAM markets while based stateside.",
    localPainAngle:
      "Miami founders frequently chase market trends rather than building from a specific identified pain. The diagnostic surfaces a Wrong Person diagnosis often: the page reads to a different audience than the one actually buying. Naming that gap is the unlock.",
    whereToFind: [
      "Indie Hackers community city tag for Miami",
      "Meetup.com search: \"indie hackers miami\", \"saas miami\", \"latam founders miami\"",
      "X / Twitter geo search: \"saas founder\" near:\"Miami\" within:25mi",
      "Brickell and Wynwood coworking spaces – indie cohort splits between the two depending on lifestyle preference",
      "LATAM-focused founder communities (eFounders, Latitud) often have Miami-based members",
    ],
    timeWindowForCrossTzWork:
      "LATAM markets overlap most of the workday. European partners overlap 9am–noon EST. West Coast overlap runs noon–8pm.",
    relatedCities: ["new-york", "austin", "los-angeles"],
    lastVerified: VERIFIED,
  },
  {
    slug: "los-angeles",
    displayName: "Los Angeles, CA",
    city: "Los Angeles",
    country: "United States",
    region: "California",
    timezone: "America/Los_Angeles",
    utcOffsetLabel: "UTC-08 (UTC-07 DST)",
    metaTitle: "Micro-SaaS Founders in Los Angeles",
    metaDescription:
      "Indie founders building post-launch pre-revenue SaaS in Los Angeles. Where the local scene meets, plus the free Hook / Story / Offer diagnostic.",
    heroSubhead:
      "Built for indie founders building micro-SaaS in Los Angeles whose launch went flat. Same diagnostic, same Playbook, with the local scene's distribution context in mind.",
    sceneIntro:
      "Los Angeles's founder scene is geographically distributed in a way that few coastal cities match – Santa Monica, Venice, Silver Lake, Pasadena, and Long Beach all carry small founder clusters and none of them dominate. The indie SaaS cohort is creator-economy-adjacent, often selling tools into media, entertainment, or content businesses.",
    localPainAngle:
      "LA founders who came out of the creator economy often try to scale the same content engine that built their audience – and discover that audience attention doesn't auto-convert to recurring revenue. The diagnostic surfaces the Weak Offer diagnosis frequently.",
    whereToFind: [
      "Indie Hackers community city tag for Los Angeles",
      "Meetup.com search: \"indie hackers los angeles\", \"saas la\", \"founders los angeles\"",
      "X / Twitter geo search: \"saas founder\" near:\"Los Angeles\" within:30mi",
      "Santa Monica and Venice coworking spaces (the indie cohort skews west-side during weekdays)",
      "Creator-economy adjacent groups (On Deck, Late Checkout community members) often include LA-based founders",
    ],
    timeWindowForCrossTzWork:
      "European overlap is your 7am–10am window. East Coast US overlap runs 6am–2pm. Asia-Pacific overlap arrives evening 6pm onward.",
    relatedCities: ["san-francisco", "seattle", "austin", "portland"],
    lastVerified: VERIFIED,
  },
  {
    slug: "seattle",
    displayName: "Seattle, WA",
    city: "Seattle",
    country: "United States",
    region: "Washington",
    timezone: "America/Los_Angeles",
    utcOffsetLabel: "UTC-08 (UTC-07 DST)",
    metaTitle: "Micro-SaaS Founders in Seattle",
    metaDescription:
      "Indie founders building post-launch pre-revenue SaaS in Seattle. Where the local scene meets, plus the free Hook / Story / Offer diagnostic.",
    heroSubhead:
      "Built for indie founders building micro-SaaS in Seattle whose launch went flat. Same diagnostic, same Playbook, with the local scene's distribution context in mind.",
    sceneIntro:
      "Seattle's indie SaaS cohort tilts heavily toward technical founders – often ex-Microsoft, ex-Amazon, ex-cloud-vendor engineers building developer tools, infrastructure SaaS, or B2B vertical software. The strength is engineering depth; the gap, predictably, is positioning and offer framing.",
    localPainAngle:
      "Seattle's technical-founder cohort often over-invests in product quality and under-invests in offer clarity. The product is excellent; the homepage describes features instead of outcomes. The diagnostic almost always surfaces a Wrong Person or Weak Offer diagnosis for this cohort.",
    whereToFind: [
      "Indie Hackers community city tag for Seattle",
      "Meetup.com search: \"indie hackers seattle\", \"saas seattle\", \"bootstrappers seattle\"",
      "X / Twitter geo search: \"saas founder\" near:\"Seattle\" within:25mi",
      "Capitol Hill and South Lake Union coworking spaces (cohort skews toward smaller independent venues, not the larger downtown chains)",
      "Ex-Microsoft and ex-Amazon alumni networks (LinkedIn groups include indie founders building B2B SaaS)",
    ],
    timeWindowForCrossTzWork:
      "European overlap is your 7am–10am window. East Coast US overlap runs 6am–2pm. Asia-Pacific overlap arrives evening 6pm onward.",
    relatedCities: ["san-francisco", "portland", "vancouver", "los-angeles"],
    lastVerified: VERIFIED,
  },
  {
    slug: "boston",
    displayName: "Boston, MA",
    city: "Boston",
    country: "United States",
    region: "Massachusetts",
    timezone: "America/New_York",
    utcOffsetLabel: "UTC-05 (UTC-04 DST)",
    metaTitle: "Micro-SaaS Founders in Boston",
    metaDescription:
      "Indie founders building post-launch pre-revenue SaaS in Boston. Where the local scene meets, plus the free Hook / Story / Offer diagnostic.",
    heroSubhead:
      "Built for indie founders building micro-SaaS in Boston whose launch went flat. Same diagnostic, same Playbook, with the local scene's distribution context in mind.",
    sceneIntro:
      "Boston's founder scene is anchored by deep university and biotech networks but the indie SaaS cohort tilts toward education, B2B vertical, and academic-tooling markets. The cohort is smaller than NYC's but the network density per founder is unusually high.",
    localPainAngle:
      "Boston founders frequently sell into academic or institutional buyers and price for those buyers' decision cycles – which means 90+ day sales loops that mask whether the offer itself is broken. The diagnostic shortens that feedback loop to 90 seconds on the landing page.",
    whereToFind: [
      "Indie Hackers community city tag for Boston",
      "Meetup.com search: \"indie hackers boston\", \"saas boston\", \"bootstrappers boston\"",
      "X / Twitter geo search: \"saas founder\" near:\"Boston\" within:25mi",
      "Cambridge coworking spaces near Kendall Square and Harvard Square",
      "MIT and Harvard alumni founder groups (mixed venture and indie cohorts but both surfaces are useful)",
    ],
    timeWindowForCrossTzWork:
      "European partners overlap 9am–noon EST; West Coast overlap runs noon–8pm. Asia-Pacific is essentially asynchronous.",
    relatedCities: ["new-york", "toronto", "chicago"],
    lastVerified: VERIFIED,
  },
  {
    slug: "denver",
    displayName: "Denver, CO",
    city: "Denver",
    country: "United States",
    region: "Colorado",
    timezone: "America/Denver",
    utcOffsetLabel: "UTC-07 (UTC-06 DST)",
    metaTitle: "Micro-SaaS Founders in Denver",
    metaDescription:
      "Indie founders building post-launch pre-revenue SaaS in Denver. Where the local scene meets, plus the free Hook / Story / Offer diagnostic.",
    heroSubhead:
      "Built for indie founders building micro-SaaS in Denver whose launch went flat. Same diagnostic, same Playbook, with the local scene's distribution context in mind.",
    sceneIntro:
      "Denver's founder scene grew on the back of the 2020–2022 remote migration. The cohort skews mid-career, often refugees from coastal hubs, and the lifestyle-first framing shows up in product choices – many Denver indie founders build for the outdoor, lifestyle, or wellness verticals.",
    localPainAngle:
      "Denver's lifestyle-first founder profile often delays the hard offer work. The product ships; the launch is gentle; the Stripe line is flat for many quarters before anyone names it a problem. The diagnostic names it on day one.",
    whereToFind: [
      "Indie Hackers community city tag for Denver",
      "Meetup.com search: \"indie hackers denver\", \"saas denver\", \"bootstrappers colorado\"",
      "X / Twitter geo search: \"saas founder\" near:\"Denver\" within:30mi",
      "RiNo and LoDo coworking spaces (cohort skews north/east of downtown)",
      "Boulder spillover – the Boulder startup scene is small but networked with Denver",
    ],
    timeWindowForCrossTzWork:
      "European overlap 8am–11am MST. Both US coasts reachable within standard hours. Asia-Pacific arrives evenings.",
    relatedCities: ["austin", "portland", "san-francisco"],
    lastVerified: VERIFIED,
  },
  {
    slug: "chicago",
    displayName: "Chicago, IL",
    city: "Chicago",
    country: "United States",
    region: "Illinois",
    timezone: "America/Chicago",
    utcOffsetLabel: "UTC-06 (UTC-05 DST)",
    metaTitle: "Micro-SaaS Founders in Chicago",
    metaDescription:
      "Indie founders building post-launch pre-revenue SaaS in Chicago. Where the local scene meets, plus the free Hook / Story / Offer diagnostic.",
    heroSubhead:
      "Built for indie founders building micro-SaaS in Chicago whose launch went flat. Same diagnostic, same Playbook, with the local scene's distribution context in mind.",
    sceneIntro:
      "Chicago's indie SaaS scene tilts B2B-heavy: financial services tooling, logistics, HR tech, and trade-vertical software. Less visible than the coasts but the per-founder revenue density is unusually strong because the cohort sells into Midwest enterprise buyers who pay properly.",
    localPainAngle:
      "Chicago founders often have strong outbound conversion when they land meetings but get stuck on top-of-funnel because their site reads B2B-formal in markets that increasingly buy from category creators. The diagnostic catches the tone mismatch.",
    whereToFind: [
      "Indie Hackers community city tag for Chicago",
      "Meetup.com search: \"indie hackers chicago\", \"saas chicago\", \"b2b founders chicago\"",
      "X / Twitter geo search: \"saas founder\" near:\"Chicago\" within:30mi",
      "West Loop and River North coworking spaces (cohort skews to those neighborhoods over The Loop proper)",
      "Built In Chicago and 1871 ecosystem events (mixed but useful for indie cohort discovery)",
    ],
    timeWindowForCrossTzWork:
      "European overlap 8am–11am CST. Both US coasts reachable within standard hours. Asia-Pacific essentially asynchronous.",
    relatedCities: ["new-york", "boston", "austin", "toronto"],
    lastVerified: VERIFIED,
  },
  {
    slug: "portland",
    displayName: "Portland, OR",
    city: "Portland",
    country: "United States",
    region: "Oregon",
    timezone: "America/Los_Angeles",
    utcOffsetLabel: "UTC-08 (UTC-07 DST)",
    metaTitle: "Micro-SaaS Founders in Portland",
    metaDescription:
      "Indie founders building post-launch pre-revenue SaaS in Portland. Where the local scene meets, plus the free Hook / Story / Offer diagnostic.",
    heroSubhead:
      "Built for indie founders building micro-SaaS in Portland whose launch went flat. Same diagnostic, same Playbook, with the local scene's distribution context in mind.",
    sceneIntro:
      "Portland's founder scene is smaller and tighter than its larger Pacific Northwest cousin. The cohort is design-heavy, often ex-agency, and the product mix skews toward creative-professional tools, design SaaS, and craft-vertical software.",
    localPainAngle:
      "Portland founders often have outstanding visual and brand work but soft offer framing. The site looks beautiful; the offer reads vague. The diagnostic separates the design surface from the conversion surface.",
    whereToFind: [
      "Indie Hackers community city tag for Portland",
      "Meetup.com search: \"indie hackers portland\", \"saas portland\", \"design founders portland\"",
      "X / Twitter geo search: \"saas founder\" near:\"Portland\" within:25mi",
      "Northwest Portland and the Pearl District coworking spaces",
      "Design-adjacent founder groups (Dribbble-network spillover, agency-alumni circles)",
    ],
    timeWindowForCrossTzWork:
      "European overlap is your 7am–10am window. East Coast US overlap runs 6am–2pm. Asia-Pacific evenings.",
    relatedCities: ["seattle", "san-francisco", "los-angeles"],
    lastVerified: VERIFIED,
  },
  {
    slug: "toronto",
    displayName: "Toronto, ON",
    city: "Toronto",
    country: "Canada",
    region: "Ontario",
    timezone: "America/Toronto",
    utcOffsetLabel: "UTC-05 (UTC-04 DST)",
    metaTitle: "Micro-SaaS Founders in Toronto",
    metaDescription:
      "Indie founders building post-launch pre-revenue SaaS in Toronto. Where the local scene meets, plus the free Hook / Story / Offer diagnostic.",
    heroSubhead:
      "Built for indie founders building micro-SaaS in Toronto whose launch went flat. Same diagnostic, same Playbook, with the local scene's distribution context in mind.",
    sceneIntro:
      "Toronto's indie SaaS cohort is one of North America's most consistent. The MaRS-anchored visible scene is venture-heavy, but the bootstrapped cohort beneath it is large, networked, and unusually patient with build cycles. The cohort skews technical and immigrant-founder-heavy, with strong India-Canada and Europe-Canada talent corridors.",
    localPainAngle:
      "Toronto founders frequently sell into the US market from Canada and get tripped up by currency framing and US-tailored positioning. The diagnostic surfaces positioning gaps that look invisible from a Toronto perspective.",
    whereToFind: [
      "Indie Hackers community city tag for Toronto",
      "Meetup.com search: \"indie hackers toronto\", \"saas toronto\", \"bootstrappers toronto\"",
      "X / Twitter geo search: \"saas founder\" near:\"Toronto\" within:30mi",
      "Queen West and King West coworking spaces; the indie cohort splits between downtown core and east-end Leslieville",
      "MaRS Discovery District ecosystem events (mixed venture and indie cohorts)",
    ],
    timeWindowForCrossTzWork:
      "European partners overlap 9am–noon EST; West Coast US overlap runs noon–8pm. Strong default cross-border to NYC.",
    relatedCities: ["new-york", "boston", "vancouver", "chicago"],
    lastVerified: VERIFIED,
  },
  {
    slug: "vancouver",
    displayName: "Vancouver, BC",
    city: "Vancouver",
    country: "Canada",
    region: "British Columbia",
    timezone: "America/Vancouver",
    utcOffsetLabel: "UTC-08 (UTC-07 DST)",
    metaTitle: "Micro-SaaS Founders in Vancouver",
    metaDescription:
      "Indie founders building post-launch pre-revenue SaaS in Vancouver. Where the local scene meets, plus the free Hook / Story / Offer diagnostic.",
    heroSubhead:
      "Built for indie founders building micro-SaaS in Vancouver whose launch went flat. Same diagnostic, same Playbook, with the local scene's distribution context in mind.",
    sceneIntro:
      "Vancouver's founder scene is smaller than Toronto's but tilts more lifestyle-first. The indie SaaS cohort overlaps heavily with the remote-work and digital-nomad communities, with a sub-cohort of cross-border founders splitting time between Vancouver and Seattle.",
    localPainAngle:
      "Vancouver founders frequently target US-market buyers from a Canadian base and underprice in CAD-to-USD framings out of caution. The diagnostic surfaces under-priced offers as a common pattern for this cohort.",
    whereToFind: [
      "Indie Hackers community city tag for Vancouver",
      "Meetup.com search: \"indie hackers vancouver\", \"saas vancouver\", \"bootstrappers vancouver\"",
      "X / Twitter geo search: \"saas founder\" near:\"Vancouver\" within:30mi",
      "Gastown and Mount Pleasant coworking spaces (cohort splits between the two neighborhoods)",
      "Cross-border Seattle-Vancouver founder meetups (occasional but worth tracking)",
    ],
    timeWindowForCrossTzWork:
      "European overlap is your 7am–10am window. East Coast US overlap runs 6am–2pm. Asia-Pacific evenings.",
    relatedCities: ["seattle", "toronto", "san-francisco", "portland"],
    lastVerified: VERIFIED,
  },
  {
    slug: "london",
    displayName: "London, UK",
    city: "London",
    country: "United Kingdom",
    region: "England",
    timezone: "Europe/London",
    utcOffsetLabel: "UTC+00 (UTC+01 BST)",
    metaTitle: "Micro-SaaS Founders in London",
    metaDescription:
      "Indie founders building post-launch pre-revenue SaaS in London. Where the local scene meets, plus the free Hook / Story / Offer diagnostic.",
    heroSubhead:
      "Built for indie founders building micro-SaaS in London whose launch went flat. Same diagnostic, same Playbook, with the local scene's distribution context in mind.",
    sceneIntro:
      "London is Europe's largest founder city and the indie SaaS cohort inside it is correspondingly large. The visible scene is venture and fintech-heavy, but the bootstrapped layer is mature and well-networked, with strong cross-pollination between fintech, B2B SaaS, and creator-economy verticals.",
    localPainAngle:
      "London founders often price in GBP for a globally-USD-anchored buyer pool, which creates avoidable friction. Beyond currency, the diagnostic surfaces a frequent Wrong Person diagnosis: pages tuned to UK-English buyer vocabulary that confuses the larger US buyer market.",
    whereToFind: [
      "Indie Hackers community city tag for London",
      "Meetup.com search: \"indie hackers london\", \"saas london\", \"bootstrappers london\"",
      "X / Twitter geo search: \"saas founder\" near:\"London\" within:25mi",
      "Shoreditch, Soho, and King's Cross coworking spaces; the indie cohort skews to east London during weekdays",
      "SaaStock London and similar annual conferences (mixed venture and indie cohorts)",
    ],
    timeWindowForCrossTzWork:
      "East Coast US partners overlap 2pm–6pm GMT; West Coast US overlap arrives 4pm–8pm. EU markets fully overlap. Asia-Pacific overlaps early mornings.",
    relatedCities: ["dublin", "amsterdam", "berlin", "paris"],
    lastVerified: VERIFIED,
  },
  {
    slug: "berlin",
    displayName: "Berlin, Germany",
    city: "Berlin",
    country: "Germany",
    region: "Berlin",
    timezone: "Europe/Berlin",
    utcOffsetLabel: "UTC+01 (UTC+02 CEST)",
    metaTitle: "Micro-SaaS Founders in Berlin",
    metaDescription:
      "Indie founders building post-launch pre-revenue SaaS in Berlin. Where the local scene meets, plus the free Hook / Story / Offer diagnostic.",
    heroSubhead:
      "Built for indie founders building micro-SaaS in Berlin whose launch went flat. Same diagnostic, same Playbook, with the local scene's distribution context in mind.",
    sceneIntro:
      "Berlin's indie SaaS cohort is one of Europe's deepest. The technical-founder density is high, English is the operating language across most of the cohort, and the build-in-public culture is mature. The cohort sells globally by default and rarely tries to sell into the German-language market exclusively.",
    localPainAngle:
      "Berlin founders often have outstanding product engineering but distribution-light positioning. The product is precise; the homepage describes the product, not the outcome. The diagnostic almost always surfaces a Weak Offer diagnosis for this cohort.",
    whereToFind: [
      "Indie Hackers community city tag for Berlin",
      "Meetup.com search: \"indie hackers berlin\", \"saas berlin\", \"bootstrappers berlin\"",
      "X / Twitter geo search: \"saas founder\" near:\"Berlin\" within:25mi",
      "Mitte, Kreuzberg, and Neukölln coworking spaces; the cohort skews to Kreuzberg and the eastern districts",
      "Factory Berlin and similar startup hubs; mixed venture and indie but useful for adjacency",
    ],
    timeWindowForCrossTzWork:
      "East Coast US overlaps 3pm–6pm CET; West Coast arrives 5pm–8pm. Asia-Pacific overlaps early mornings 7am–10am CET.",
    relatedCities: ["amsterdam", "london", "paris", "copenhagen"],
    lastVerified: VERIFIED,
  },
  {
    slug: "paris",
    displayName: "Paris, France",
    city: "Paris",
    country: "France",
    region: "Île-de-France",
    timezone: "Europe/Paris",
    utcOffsetLabel: "UTC+01 (UTC+02 CEST)",
    metaTitle: "Micro-SaaS Founders in Paris",
    metaDescription:
      "Indie founders building post-launch pre-revenue SaaS in Paris. Where the local scene meets, plus the free Hook / Story / Offer diagnostic.",
    heroSubhead:
      "Built for indie founders building micro-SaaS in Paris whose launch went flat. Same diagnostic, same Playbook, with the local scene's distribution context in mind.",
    sceneIntro:
      "Paris's indie SaaS cohort grew sharply since Station F opened and the broader La French Tech push gathered momentum. The technical density is real; the indie sub-cohort tilts toward B2B verticals, design and creative SaaS, and increasingly AI-tooling startups. Most of the cohort sells in English by default but has French-market option-value.",
    localPainAngle:
      "Paris founders sometimes try to serve both the French-language market and the global English market with a single homepage, and the page reads under-tuned to either. The diagnostic forces the choice.",
    whereToFind: [
      "Indie Hackers community city tag for Paris",
      "Meetup.com search: \"indie hackers paris\", \"saas paris\", \"bootstrappers paris\"",
      "X / Twitter geo search: \"saas founder\" near:\"Paris\" within:25mi",
      "Station F is the visible startup hub; the indie cohort meets in smaller venues across the 2nd, 9th, and 11th arrondissements",
      "La French Tech ecosystem events (mixed venture and indie cohorts)",
    ],
    timeWindowForCrossTzWork:
      "East Coast US overlaps 3pm–6pm CET; West Coast arrives 5pm–8pm. Asia-Pacific overlaps early mornings 7am–10am CET.",
    relatedCities: ["london", "amsterdam", "berlin", "barcelona"],
    lastVerified: VERIFIED,
  },
  {
    slug: "amsterdam",
    displayName: "Amsterdam, Netherlands",
    city: "Amsterdam",
    country: "Netherlands",
    region: "North Holland",
    timezone: "Europe/Amsterdam",
    utcOffsetLabel: "UTC+01 (UTC+02 CEST)",
    metaTitle: "Micro-SaaS Founders in Amsterdam",
    metaDescription:
      "Indie founders building post-launch pre-revenue SaaS in Amsterdam. Where the local scene meets, plus the free Hook / Story / Offer diagnostic.",
    heroSubhead:
      "Built for indie founders building micro-SaaS in Amsterdam whose launch went flat. Same diagnostic, same Playbook, with the local scene's distribution context in mind.",
    sceneIntro:
      "Amsterdam's indie SaaS cohort is small but per-founder strong. English is the default working language. The cohort tilts toward B2B SaaS, developer tools, and increasingly e-commerce-vertical software. Geographic proximity to London and Berlin keeps the cross-city flow constant.",
    localPainAngle:
      "Amsterdam founders often have polished European-market offers that under-translate to US-buyer expectations on guarantees, urgency, and direct-response framing. The diagnostic surfaces those translation gaps cleanly.",
    whereToFind: [
      "Indie Hackers community city tag for Amsterdam",
      "Meetup.com search: \"indie hackers amsterdam\", \"saas amsterdam\", \"bootstrappers netherlands\"",
      "X / Twitter geo search: \"saas founder\" near:\"Amsterdam\" within:25mi",
      "De Pijp, Oud-West, and the Canal District coworking spaces",
      "TNW Conference annual ecosystem (mixed venture and indie cohorts; useful for adjacency)",
    ],
    timeWindowForCrossTzWork:
      "East Coast US overlaps 3pm–6pm CET; West Coast arrives 5pm–8pm. Asia-Pacific overlaps early mornings 7am–10am CET.",
    relatedCities: ["berlin", "london", "copenhagen", "paris"],
    lastVerified: VERIFIED,
  },
  {
    slug: "lisbon",
    displayName: "Lisbon, Portugal",
    city: "Lisbon",
    country: "Portugal",
    region: "Lisbon",
    timezone: "Europe/Lisbon",
    utcOffsetLabel: "UTC+00 (UTC+01 WEST)",
    metaTitle: "Micro-SaaS Founders in Lisbon",
    metaDescription:
      "Indie founders building post-launch pre-revenue SaaS in Lisbon. Where the local scene meets, plus the free Hook / Story / Offer diagnostic.",
    heroSubhead:
      "Built for indie founders building micro-SaaS in Lisbon whose launch went flat. Same diagnostic, same Playbook, with the local scene's distribution context in mind.",
    sceneIntro:
      "Lisbon's founder scene exploded after 2020 with the digital-nomad and tax-incentive driven migration. The cohort is unusually international – German, French, Brazilian, and US founders all show up – and the indie SaaS density is real. Web Summit anchors the annual visibility moment but day-to-day activity is community-driven.",
    localPainAngle:
      "Lisbon-based founders often have low monthly burn (relative to their target buyer market in the US) and that comfort delays the offer-tightening work. The flat Stripe line is survivable at Lisbon costs; the diagnostic surfaces that the offer needs the same work regardless.",
    whereToFind: [
      "Indie Hackers community city tag for Lisbon",
      "Meetup.com search: \"indie hackers lisbon\", \"saas lisbon\", \"nomad founders portugal\"",
      "X / Twitter geo search: \"saas founder\" near:\"Lisbon\" within:25mi",
      "Cais do Sodré, Príncipe Real, and LX Factory coworking spaces; the nomad-overlap cohort is strongest here",
      "Web Summit ecosystem (Nov annual) and surrounding side events",
    ],
    timeWindowForCrossTzWork:
      "East Coast US overlaps 2pm–6pm WET; West Coast arrives 4pm–8pm. Brazil and LATAM markets overlap from mid-afternoon. Asia-Pacific arrives early mornings.",
    relatedCities: ["barcelona", "london", "dublin", "athens"],
    lastVerified: VERIFIED,
  },
  {
    slug: "barcelona",
    displayName: "Barcelona, Spain",
    city: "Barcelona",
    country: "Spain",
    region: "Catalonia",
    timezone: "Europe/Madrid",
    utcOffsetLabel: "UTC+01 (UTC+02 CEST)",
    metaTitle: "Micro-SaaS Founders in Barcelona",
    metaDescription:
      "Indie founders building post-launch pre-revenue SaaS in Barcelona. Where the local scene meets, plus the free Hook / Story / Offer diagnostic.",
    heroSubhead:
      "Built for indie founders building micro-SaaS in Barcelona whose launch went flat. Same diagnostic, same Playbook, with the local scene's distribution context in mind.",
    sceneIntro:
      "Barcelona's indie SaaS cohort is smaller than Madrid's in raw founder count but punches above its weight in lifestyle and international-mix terms. The cohort overlaps with the Lisbon-style nomad scene and tilts toward e-commerce SaaS, design tooling, and B2B verticals.",
    localPainAngle:
      "Barcelona founders sometimes serve both the Spanish-language and English markets without choosing, and the homepage reads under-tuned to either. The diagnostic forces the segmentation.",
    whereToFind: [
      "Indie Hackers community city tag for Barcelona",
      "Meetup.com search: \"indie hackers barcelona\", \"saas barcelona\", \"bootstrappers spain\"",
      "X / Twitter geo search: \"saas founder\" near:\"Barcelona\" within:25mi",
      "Eixample, Poblenou, and Gràcia coworking spaces; the indie cohort skews to Poblenou (the 22@ tech district)",
      "Mobile World Congress satellite ecosystem (Feb-March; mixed venture and indie)",
    ],
    timeWindowForCrossTzWork:
      "East Coast US overlaps 3pm–6pm CET; West Coast arrives 5pm–8pm. LATAM Spanish-speaking markets overlap from mid-afternoon. Asia-Pacific arrives early mornings.",
    relatedCities: ["lisbon", "paris", "berlin", "amsterdam"],
    lastVerified: VERIFIED,
  },
  {
    slug: "dublin",
    displayName: "Dublin, Ireland",
    city: "Dublin",
    country: "Ireland",
    region: "Leinster",
    timezone: "Europe/Dublin",
    utcOffsetLabel: "UTC+00 (UTC+01 IST)",
    metaTitle: "Micro-SaaS Founders in Dublin",
    metaDescription:
      "Indie founders building post-launch pre-revenue SaaS in Dublin. Where the local scene meets, plus the free Hook / Story / Offer diagnostic.",
    heroSubhead:
      "Built for indie founders building micro-SaaS in Dublin whose launch went flat. Same diagnostic, same Playbook, with the local scene's distribution context in mind.",
    sceneIntro:
      "Dublin's founder scene is shaped by the gravity of Stripe, Intercom, HubSpot's Dublin office, and the broader Silicon Docks ecosystem. The indie SaaS cohort is small but operator-heavy – many founders are ex-Stripe, ex-Intercom, or ex-large-SaaS engineers building B2B tools they wish they'd had inside those companies.",
    localPainAngle:
      "Dublin founders frequently over-invest in product polish (their reference standard is Stripe-quality) and under-invest in offer framing. The site reads professional; the offer reads ambiguous. The diagnostic catches the imbalance.",
    whereToFind: [
      "Indie Hackers community city tag for Dublin",
      "Meetup.com search: \"indie hackers dublin\", \"saas dublin\", \"bootstrappers ireland\"",
      "X / Twitter geo search: \"saas founder\" near:\"Dublin\" within:25mi",
      "Silicon Docks (Grand Canal area) and Camden Street coworking spaces",
      "Stripe-alumni, Intercom-alumni, and HubSpot-alumni networks (LinkedIn groups include indie founders building B2B SaaS)",
    ],
    timeWindowForCrossTzWork:
      "East Coast US overlaps 2pm–6pm GMT; West Coast arrives 4pm–8pm. EU markets fully overlap. Asia-Pacific arrives early mornings.",
    relatedCities: ["london", "amsterdam", "lisbon"],
    lastVerified: VERIFIED,
  },
  {
    slug: "athens",
    displayName: "Athens, Greece",
    city: "Athens",
    country: "Greece",
    region: "Attica",
    timezone: "Europe/Athens",
    utcOffsetLabel: "UTC+02 (UTC+03 EEST)",
    metaTitle: "Micro-SaaS Founders in Athens",
    metaDescription:
      "Indie founders building post-launch pre-revenue SaaS in Athens. Where the local scene meets, plus the free Hook / Story / Offer diagnostic.",
    heroSubhead:
      "Built for indie founders building micro-SaaS in Athens whose launch went flat. Same diagnostic, same Playbook, with the local scene's distribution context in mind.",
    sceneIntro:
      "Athens's indie SaaS cohort is small but growing, fueled by the digital-nomad migration, returning-diaspora founders, and the broader Greek tech revival that's followed Beat (acquired by FreeNow) and other home-grown exits. The cohort sells globally by default – the Greek-language market alone is too small for SaaS economics – and tilts technical.",
    localPainAngle:
      "Athens-based founders often have very low cost-of-living burn relative to their US-anchored target buyers, which removes time pressure and lets the flat Stripe line persist longer than it should. The diagnostic creates the missing urgency.",
    whereToFind: [
      "Indie Hackers community city tag for Athens (smaller but real)",
      "Meetup.com search: \"indie hackers athens\", \"saas athens\", \"startup athens\"",
      "X / Twitter geo search: \"saas founder\" near:\"Athens\" within:25mi",
      "Kolonaki, Pangrati, and Kifisia coworking spaces; the tech cohort spreads across central districts and northern suburbs",
      "Found.ation, The Cube Athens, and similar tech hub ecosystems (mixed venture and indie cohorts)",
    ],
    timeWindowForCrossTzWork:
      "East Coast US overlaps 4pm–7pm EET (Athens time); West Coast arrives 6pm–9pm. EU markets overlap morning to mid-afternoon. Asia-Pacific arrives early mornings.",
    relatedCities: ["lisbon", "barcelona", "tel-aviv", "berlin"],
    lastVerified: VERIFIED,
  },
  {
    slug: "copenhagen",
    displayName: "Copenhagen, Denmark",
    city: "Copenhagen",
    country: "Denmark",
    region: "Capital Region",
    timezone: "Europe/Copenhagen",
    utcOffsetLabel: "UTC+01 (UTC+02 CEST)",
    metaTitle: "Micro-SaaS Founders in Copenhagen",
    metaDescription:
      "Indie founders building post-launch pre-revenue SaaS in Copenhagen. Where the local scene meets, plus the free Hook / Story / Offer diagnostic.",
    heroSubhead:
      "Built for indie founders building micro-SaaS in Copenhagen whose launch went flat. Same diagnostic, same Playbook, with the local scene's distribution context in mind.",
    sceneIntro:
      "Copenhagen's indie SaaS cohort is small and tightly networked. English is the operating default. The cohort tilts toward design-driven products, B2B vertical SaaS, and increasingly climate-tech-adjacent tooling, with strong cross-pollination across the Nordic capitals.",
    localPainAngle:
      "Copenhagen founders frequently ship beautifully designed products with under-developed offer language. The visual surface is exceptional; the conversion surface lags. The diagnostic separates them.",
    whereToFind: [
      "Indie Hackers community city tag for Copenhagen",
      "Meetup.com search: \"indie hackers copenhagen\", \"saas copenhagen\", \"nordic founders\"",
      "X / Twitter geo search: \"saas founder\" near:\"Copenhagen\" within:25mi",
      "Vesterbro, Nørrebro, and central Copenhagen coworking spaces",
      "Cross-Nordic founder communities and TechBBQ ecosystem (annual, mixed cohorts)",
    ],
    timeWindowForCrossTzWork:
      "East Coast US overlaps 3pm–6pm CET; West Coast arrives 5pm–8pm. Asia-Pacific overlaps early mornings.",
    relatedCities: ["amsterdam", "berlin", "london"],
    lastVerified: VERIFIED,
  },
  {
    slug: "tel-aviv",
    displayName: "Tel Aviv, Israel",
    city: "Tel Aviv",
    country: "Israel",
    region: "Tel Aviv District",
    timezone: "Asia/Jerusalem",
    utcOffsetLabel: "UTC+02 (UTC+03 IDT)",
    metaTitle: "Micro-SaaS Founders in Tel Aviv",
    metaDescription:
      "Indie founders building post-launch pre-revenue SaaS in Tel Aviv. Where the local scene meets, plus the free Hook / Story / Offer diagnostic.",
    heroSubhead:
      "Built for indie founders building micro-SaaS in Tel Aviv whose launch went flat. Same diagnostic, same Playbook, with the local scene's distribution context in mind.",
    sceneIntro:
      "Tel Aviv carries one of the world's densest per-capita technical founder pools. The visible scene is overwhelmingly venture-backed and B2B-cybersecurity-heavy, but the indie SaaS cohort underneath is real and unusually operator-heavy – many founders are ex-unit-8200, ex-large-SaaS, or ex-cybersecurity engineers building B2B vertical tools.",
    localPainAngle:
      "Tel Aviv founders often have outstanding technical depth and weak direct-response framing. The product is precise; the homepage reads like a feature spec instead of an outcome promise. The diagnostic surfaces the gap on the first scroll.",
    whereToFind: [
      "Indie Hackers community city tag for Tel Aviv",
      "Meetup.com search: \"indie hackers tel aviv\", \"saas tel aviv\", \"bootstrappers israel\"",
      "X / Twitter geo search: \"saas founder\" near:\"Tel Aviv\" within:25mi",
      "Rothschild Boulevard area and Florentin coworking spaces; the cohort skews central Tel Aviv",
      "Israeli tech ecosystem events (mixed venture and indie; useful for adjacency and networking)",
    ],
    timeWindowForCrossTzWork:
      "East Coast US overlaps 4pm–7pm Israel time; West Coast arrives 6pm–9pm. EU markets overlap most of the day. Asia-Pacific arrives early mornings.",
    relatedCities: ["athens", "london", "berlin"],
    lastVerified: VERIFIED,
  },
  {
    slug: "singapore",
    displayName: "Singapore",
    city: "Singapore",
    country: "Singapore",
    region: "",
    timezone: "Asia/Singapore",
    utcOffsetLabel: "UTC+08",
    metaTitle: "Micro-SaaS Founders in Singapore",
    metaDescription:
      "Indie founders building post-launch pre-revenue SaaS in Singapore. Where the local scene meets, plus the free Hook / Story / Offer diagnostic.",
    heroSubhead:
      "Built for indie founders building micro-SaaS in Singapore whose launch went flat. Same diagnostic, same Playbook, with the local scene's distribution context in mind.",
    sceneIntro:
      "Singapore's indie SaaS cohort is the regional hub for South-East Asian and global-English founders. The visible scene is fintech and venture-heavy; the bootstrapped cohort is smaller but globally networked, with strong India-Singapore and Australia-Singapore talent corridors.",
    localPainAngle:
      "Singapore founders often serve the SEA regional market and the global English market with one homepage. The page reads ambiguous to both. The diagnostic forces the choice of which buyer to anchor the page to.",
    whereToFind: [
      "Indie Hackers community city tag for Singapore",
      "Meetup.com search: \"indie hackers singapore\", \"saas singapore\", \"bootstrappers sea\"",
      "X / Twitter geo search: \"saas founder\" near:\"Singapore\" within:25mi",
      "Tanjong Pagar, Telok Ayer, and Outram coworking spaces",
      "SaaSBOOMi Singapore chapter and broader Asian SaaS communities",
    ],
    timeWindowForCrossTzWork:
      "Asia-Pacific markets overlap most of the workday. India overlaps 11am–8pm SGT. EU markets overlap late afternoon to evening. US Pacific arrives essentially overnight.",
    relatedCities: ["bangalore", "sydney"],
    lastVerified: VERIFIED,
  },
  {
    slug: "sydney",
    displayName: "Sydney, Australia",
    city: "Sydney",
    country: "Australia",
    region: "New South Wales",
    timezone: "Australia/Sydney",
    utcOffsetLabel: "UTC+10 (UTC+11 AEDT)",
    metaTitle: "Micro-SaaS Founders in Sydney",
    metaDescription:
      "Indie founders building post-launch pre-revenue SaaS in Sydney. Where the local scene meets, plus the free Hook / Story / Offer diagnostic.",
    heroSubhead:
      "Built for indie founders building micro-SaaS in Sydney whose launch went flat. Same diagnostic, same Playbook, with the local scene's distribution context in mind.",
    sceneIntro:
      "Sydney's indie SaaS cohort sits in the long shadow of Atlassian and Canva, which means the technical talent ecosystem and customer-research instincts are both strong. The cohort is mostly remote-native, sells into the US market by default, and accepts that the bulk of working hours don't overlap the dominant buyer timezone.",
    localPainAngle:
      "Sydney founders often serve US buyers from a timezone that's effectively 16+ hours offset, which means async writing has to do the conversion work that real-time conversation does for stateside founders. The diagnostic catches under-tuned writing fast.",
    whereToFind: [
      "Indie Hackers community city tag for Sydney",
      "Meetup.com search: \"indie hackers sydney\", \"saas sydney\", \"bootstrappers australia\"",
      "X / Twitter geo search: \"saas founder\" near:\"Sydney\" within:30mi",
      "Surry Hills, Newtown, and the CBD coworking spaces",
      "Atlassian, Canva, and SafetyCulture alumni networks include many indie founders",
    ],
    timeWindowForCrossTzWork:
      "US Pacific overlaps 7am–10am AEDT (Sydney morning). US Eastern overlaps 10am–1pm. EU is essentially asynchronous; SEA markets overlap most of the day.",
    relatedCities: ["singapore", "bangalore"],
    lastVerified: VERIFIED,
  },
  {
    slug: "bangalore",
    displayName: "Bangalore, India",
    city: "Bangalore",
    country: "India",
    region: "Karnataka",
    timezone: "Asia/Kolkata",
    utcOffsetLabel: "UTC+05:30",
    metaTitle: "Micro-SaaS Founders in Bangalore",
    metaDescription:
      "Indie founders building post-launch pre-revenue SaaS in Bangalore. Where the local scene meets, plus the free Hook / Story / Offer diagnostic.",
    heroSubhead:
      "Built for indie founders building micro-SaaS in Bangalore whose launch went flat. Same diagnostic, same Playbook, with the local scene's distribution context in mind.",
    sceneIntro:
      "Bangalore is one of the world's largest indie SaaS founder cities by volume. The SaaSBOOMi community is mature, the cohort is overwhelmingly technical, and the cross-border sell-into-the-US pattern is well-established. Zoho, Freshworks, and Chargebee alumni networks alone account for a substantial chunk of the new-founder pipeline.",
    localPainAngle:
      "Bangalore founders often build excellent products with US-buyer-misaligned homepages – the page reads professional but uses framing that resonates with Indian enterprise buyers more than US SMB buyers. The diagnostic surfaces the US-buyer translation gap.",
    whereToFind: [
      "Indie Hackers community city tag for Bangalore",
      "SaaSBOOMi community (the canonical Indian SaaS founder community, with strong Bangalore presence)",
      "Meetup.com search: \"indie hackers bangalore\", \"saas bangalore\", \"product hunt bangalore\"",
      "X / Twitter geo search: \"saas founder\" near:\"Bangalore\" within:25mi",
      "Koramangala, Indiranagar, and HSR Layout coworking spaces; the cohort spans those three areas",
    ],
    timeWindowForCrossTzWork:
      "US Eastern overlaps 6pm–10pm IST; US Pacific arrives 9pm–midnight IST. EU markets overlap mid-afternoon onward. SEA overlaps morning to early afternoon.",
    relatedCities: ["singapore", "sydney"],
    lastVerified: VERIFIED,
  },
];

export const CITY_SLUGS = CITY_ENTRIES.map((e) => e.slug);

export function getCityBySlug(slug: string): CityEntry | undefined {
  return CITY_ENTRIES.find((e) => e.slug === slug);
}
