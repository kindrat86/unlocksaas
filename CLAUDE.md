# unlocksaas.com — граблі та правила

## Деплой
- Через vercel CLI (НЕ git-інтеграцію): `vercel deploy --prod --archive=tgz` — без --archive=tgz деплой ламається
- Git author = `sales@sipiteno.com`

## Критичні граблі
- 07-23 катастрофічний брейк: елементи `.reveal` були НЕВИДИМІ (анімація не тригерилась) — після будь-яких CSS/JS правок скріншот-перевірка, що весь контент видно без скролу-тригерів
- Архітектура LOCAL-FIRST: підписки НЕ через Supabase — engine → Resend SOS з hello@unlocksaas.com; локальна база ~/.unlocksaas/funnel.db (hourly launchd)
- Checkout = waitlist, це навмисно
- postbuild-csp скрипт виставляє frame-ancestors * для embed-віджетів (4 калькулятори embeddable) — не ламати при змінах CSP
