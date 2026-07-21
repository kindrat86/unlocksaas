# Crunchbase — submission copy

> Pre-filled copy for the Crunchbase company profile creation at
> https://www.crunchbase.com/contribute/start (requires a registered
> Crunchbase user account).

## Strategic note

Crunchbase is a primary Knowledge Graph data feed — Google's KG ingests
Crunchbase organization data for entity disambiguation. A populated
Crunchbase listing is closer to a Wikidata Q-URL in leverage than to a
generic social profile. The DA is 90+.

Submission is not automatic. Crunchbase reviews new profiles manually.
Turnaround is typically 1–7 days. The operator receives an email when
the listing goes live.

## Required fields

### Organization name

```
Unlock SaaS
```

### Website

```
https://unlocksaas.com
```

### Founded date

```
2026-05-17
```

### Short description (250 chars max)

```
Unlock SaaS is a playbook that turns an already-shipped SaaS into a verified paying customer in 60 days, or the founder is refunded. Built for non-engineer founders shipping with AI tools.
```

### Long description (for the About section)

Paste from `/press` canonical description (the 200-word block under
"Descriptions" → "200 words").

### Logo

Use the press-kit logo from `/press/logo` — the SVG version (not raster).
Crunchbase requires a square logo, minimum 400×400px.

### Headquarters

Enter the real physical address if one exists. Do not fabricate a HQ.

### Social links

- X: https://x.com/unlocksaas (or the actual handle)
- LinkedIn: https://www.linkedin.com/in/... (the founder's profile)
- GitHub: https://github.com/... (the org or founder profile)
- Indie Hackers: https://www.indiehackers.com/... (the founder profile)

### Industries (select 3–5)

- Software
- Internet
- Information Technology & Services
- Marketing & Advertising
- SaaS (if available as a tag)

### Founders

Name: Maryan
Role: Founder
Description: Solo founder. Marketer by trade. Built the playbook from his
own launch failures before shipping it as a product.

## After approval

1. Wait for the Crunchbase approval email. The URL will be in the format:
   `https://www.crunchbase.com/organization/unlock-saas`

2. Verify the page resolves (not 404).

3. Set the env var on Vercel:
   ```bash
   vercel env add NEXT_PUBLIC_UNLOCKSAAS_CRUNCHBASE_URL production preview
   # paste: https://www.crunchbase.com/organization/unlock-saas
   ```

4. Verify the URL appears in the Organization JSON-LD `sameAs` array at
   `/.well-known/entity.jsonld`.

## Verification checklist

- [ ] Profile submitted at https://www.crunchbase.com/contribute/start
- [ ] Approval email received
- [ ] `NEXT_PUBLIC_UNLOCKSAAS_CRUNCHBASE_URL` set on Vercel
- [ ] Redeploy triggered
- [ ] Organization.sameAs includes the Crunchbase URL
- [ ] /press/listings page shows "Live" badge
