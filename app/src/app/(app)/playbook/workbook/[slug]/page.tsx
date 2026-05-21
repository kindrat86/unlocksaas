/**
 * /playbook/workbook/[slug] — Workbook viewer for Playbook Coach citations.
 *
 * Renders one of the 10 Brunson strategy workbooks for logged-in members.
 * Access is implicitly gated by the /playbook layout (which redirects
 * anonymous visitors to /login and non-buyers to /starter).
 *
 * The content comes from the workbooks-bundle generated at build time from
 * strategy/workbooks/*.md so no runtime filesystem reads are needed.
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { WORKBOOKS } from '@/lib/workbooks-bundle'

type Params = { slug: string }

export async function generateStaticParams(): Promise<Params[]> {
  return WORKBOOKS.map((wb) => ({ slug: wb.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const wb = WORKBOOKS.find((w) => w.slug === slug)
  if (!wb) return {}
  return {
    title: `Workbook ${wb.number}: ${wb.title} | UnlockSaaS Playbook`,
    robots: { index: false },
  }
}

/**
 * Minimal markdown-to-JSX renderer for workbook content.
 * Handles: headings (# ## ###), bold (**), horizontal rules (---), tables,
 * blockquotes (>), bullet lists (- ), and code blocks (```).
 * Keeps it simple -- the workbooks are structured markdown, not arbitrary HTML.
 */
function WorkbookContent({ markdown }: { markdown: string }) {
  const lines = markdown.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0
  let key = 0

  function nextKey() { return String(key++) }

  function renderInline(text: string): React.ReactNode {
    // Bold: **text**
    const parts = text.split(/(\*\*[^*]+\*\*)/)
    return parts.map((p, idx) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={idx}>{p.slice(2, -2)}</strong>
        : p
    )
  }

  while (i < lines.length) {
    const line = lines[i]

    // Headings
    if (line.startsWith('### ')) {
      elements.push(<h3 key={nextKey()} className="text-base font-semibold mt-6 mb-2">{renderInline(line.slice(4))}</h3>)
      i++; continue
    }
    if (line.startsWith('## ')) {
      elements.push(<h2 key={nextKey()} className="text-lg font-bold mt-8 mb-3 border-b pb-1">{renderInline(line.slice(3))}</h2>)
      i++; continue
    }
    if (line.startsWith('# ')) {
      elements.push(<h1 key={nextKey()} className="text-2xl font-bold mb-6">{renderInline(line.slice(2))}</h1>)
      i++; continue
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={nextKey()} className="my-6 border-border" />)
      i++; continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={nextKey()} className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-3">
          {renderInline(line.slice(2))}
        </blockquote>
      )
      i++; continue
    }

    // Code block
    if (line.startsWith('```')) {
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      elements.push(
        <pre key={nextKey()} className="bg-muted rounded-lg p-4 text-xs overflow-x-auto my-4 font-mono">
          <code>{codeLines.join('\n')}</code>
        </pre>
      )
      i++; continue
    }

    // Bullet list item
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: React.ReactNode[] = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(<li key={i}>{renderInline(lines[i].slice(2))}</li>)
        i++
      }
      elements.push(<ul key={nextKey()} className="list-disc list-inside space-y-1 my-3 text-sm">{items}</ul>)
      continue
    }

    // Simple table (| col | col |)
    if (line.startsWith('|')) {
      const rows: string[][] = []
      while (i < lines.length && lines[i].startsWith('|')) {
        if (!/^\|[-: |]+\|$/.test(lines[i])) {
          rows.push(lines[i].split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => c.trim()))
        }
        i++
      }
      if (rows.length > 0) {
        const [head, ...body] = rows
        elements.push(
          <div key={nextKey()} className="overflow-x-auto my-4">
            <table className="w-full text-sm border-collapse border border-border rounded-lg overflow-hidden">
              <thead className="bg-muted">
                <tr>{head.map((c, ci) => <th key={ci} className="px-3 py-2 text-left font-semibold border-b border-border">{renderInline(c)}</th>)}</tr>
              </thead>
              <tbody>
                {body.map((row, ri) => (
                  <tr key={ri} className="even:bg-muted/30">
                    {row.map((c, ci) => <td key={ci} className="px-3 py-2 border-b border-border last:border-0">{renderInline(c)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
      continue
    }

    // Empty line
    if (line.trim() === '') {
      i++; continue
    }

    // Paragraph
    elements.push(
      <p key={nextKey()} className="text-sm leading-relaxed my-2 text-foreground/90">
        {renderInline(line)}
      </p>
    )
    i++
  }

  return <>{elements}</>
}

export default async function WorkbookPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const wb = WORKBOOKS.find((w) => w.slug === slug)
  if (!wb) notFound()

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back nav */}
      <Link
        href="/playbook"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Playbook
      </Link>

      {/* Workbook badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium mb-4">
        Workbook {wb.number} of 10
      </div>

      {/* Content */}
      <article className="prose-sm max-w-none">
        <WorkbookContent markdown={wb.content} />
      </article>

      {/* Footer nav */}
      <div className="flex justify-between mt-12 pt-6 border-t">
        {wb.number > 1 && (
          <Link
            href={`/playbook/workbook/${WORKBOOKS[wb.number - 2].slug}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Previous workbook
          </Link>
        )}
        <div className="flex-1" />
        {wb.number < 10 && (
          <Link
            href={`/playbook/workbook/${WORKBOOKS[wb.number].slug}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Next workbook &rarr;
          </Link>
        )}
      </div>
    </div>
  )
}
