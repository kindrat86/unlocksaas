'use client'

/**
 * ChatSidebar — Playbook Coach chat panel.
 *
 * A floating, toggleable chat panel mounted in the /playbook layout.
 * Uses AI SDK v6 useChat (from @ai-sdk/react) with DefaultChatTransport
 * pointing at /api/chat.
 *
 * Desktop: fixed right-side drawer (w-96), slides in over content.
 * Mobile: bottom sheet (full width, 70vh).
 *
 * Citations in assistant messages are rendered as clickable links --
 * the model returns markdown links like [Workbook 04: Title](/playbook/workbook/slug)
 * which we parse and render inline.
 */

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, BookOpen } from 'lucide-react'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Minimal markdown-link renderer. Converts [text](href) into <a> tags.
 * Only handles the citation format the model is instructed to emit.
 */
function renderWithLinks(text: string): React.ReactNode[] {
  const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g
  const parts: React.ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null

  while ((match = LINK_RE.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index))
    }
    parts.push(
      <a
        key={match.index}
        href={match[2]}
        className="inline-flex items-center gap-1 text-xs font-medium underline underline-offset-2 text-primary hover:text-primary/80 transition-colors"
        aria-label={`Open ${match[1]}`}
      >
        <BookOpen className="h-3 w-3 shrink-0" />
        {match[1]}
      </a>
    )
    last = match.index + match[0].length
  }

  if (last < text.length) {
    parts.push(text.slice(last))
  }

  return parts
}

// ---------------------------------------------------------------------------
// Suggested prompts shown on empty state
// ---------------------------------------------------------------------------

const SUGGESTED_PROMPTS = [
  'Why is my hook score low?',
  'What should I fix first?',
  'Help me rewrite my hero headline.',
  'What does Week 1 of my 30-day plan look like?',
  'Explain the Value Ladder for my situation.',
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ChatSidebar() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  // Auto-scroll to latest message
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  const isLoading = status === 'submitted' || status === 'streaming'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || isLoading) return
    sendMessage({ text })
    setInput('')
  }

  function handleSuggested(prompt: string) {
    if (isLoading) return
    sendMessage({ text: prompt })
  }

  return (
    <>
      {/* FAB trigger button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-foreground px-4 py-3 text-sm font-medium text-background shadow-lg hover:bg-foreground/90 transition-all hover:scale-105 active:scale-95"
          aria-label="Open Playbook Coach"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Ask the Coach</span>
        </button>
      )}

      {/* Backdrop -- mobile only */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 sm:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Chat panel */}
      <div
        className={`
          fixed z-50 flex flex-col bg-card border shadow-xl transition-transform duration-300 ease-in-out
          bottom-0 left-0 right-0 h-[70vh] rounded-t-2xl border-t
          sm:bottom-6 sm:right-6 sm:left-auto sm:top-auto sm:h-[600px] sm:w-96 sm:rounded-2xl sm:border
          ${open ? 'translate-y-0' : 'translate-y-full sm:translate-y-full sm:translate-x-0'}
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Playbook Coach"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Playbook Coach</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-md p-1 hover:bg-accent transition-colors"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
          {messages.length === 0 && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ask anything about your Playbook steps, your diagnostic, or Brunson frameworks. Answers are grounded in your 10 strategy workbooks.
              </p>
              <div className="space-y-2">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Suggested
                </p>
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSuggested(prompt)}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg border border-border hover:bg-accent transition-colors leading-relaxed"
                    disabled={isLoading}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed
                  ${message.role === 'user'
                    ? 'bg-foreground text-background rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                  }
                `}
              >
                {message.parts.map((part, i) =>
                  part.type === 'text' ? (
                    <span key={i} className="whitespace-pre-wrap">
                      {renderWithLinks(part.text)}
                    </span>
                  ) : null
                )}
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-sm px-3 py-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="px-4 py-3 border-t shrink-0 flex items-end gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e as unknown as React.FormEvent)
              }
            }}
            placeholder="Ask the Coach..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 min-h-[38px] max-h-32"
            style={{ height: 'auto' }}
            disabled={isLoading}
            aria-label="Message input"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="shrink-0 rounded-xl bg-foreground p-2 text-background hover:bg-foreground/90 transition-colors disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </>
  )
}
