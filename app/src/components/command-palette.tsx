'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  BookOpen,
  Zap,
  HelpCircle,
  LogOut,
  FileText,
  MessageCircle,
  Settings,
  Command as CommandIcon,
} from 'lucide-react'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  shortcut?: string
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [isMounted])

  const handleNavigate = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  const handleSignOut = async () => {
    setOpen(false)
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const navigationItems: NavItem[] = [
    { label: 'Dashboard', href: '/playbook', icon: <LayoutDashboard className="mr-2 h-4 w-4" /> },
    { label: 'Onboarding', href: '/onboarding', icon: <Zap className="mr-2 h-4 w-4" /> },
    { label: 'Affiliate', href: '/affiliate', icon: <MessageCircle className="mr-2 h-4 w-4" /> },
    { label: 'Verified Builder', href: '/playbook/verified', icon: <Settings className="mr-2 h-4 w-4" /> },
    { label: 'Playbook', href: '/playbook', icon: <BookOpen className="mr-2 h-4 w-4" /> },
  ]

  const actionItems: NavItem[] = [
    { label: 'Run a new diagnostic', href: '/diagnostic', icon: <Zap className="mr-2 h-4 w-4" /> },
  ]

  const helpItems: NavItem[] = [
    { label: 'FAQ', href: '/faq.md', icon: <HelpCircle className="mr-2 h-4 w-4" /> },
    { label: 'Editorial policy', href: '/editorial-policy.md', icon: <FileText className="mr-2 h-4 w-4" /> },
    {
      label: 'Contact founder',
      href: 'mailto:maryan@unlocksaas.com',
      icon: <MessageCircle className="mr-2 h-4 w-4" />,
    },
  ]

  if (!isMounted) return null

  return (
    <>
      {/* Floating trigger pill */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 hidden rounded-full bg-secondary px-3 py-2 text-xs text-secondary-foreground shadow-sm transition-all hover:shadow-md md:inline-flex items-center gap-2"
        aria-label="Open command palette"
      >
        <CommandIcon className="h-3 w-3" />
        <span>⌘K</span>
      </button>

      {/* Command palette dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search commands..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Navigation">
            {navigationItems.map((item) => (
              <CommandItem
                key={item.href}
                value={item.label.toLowerCase()}
                onSelect={() => handleNavigate(item.href)}
              >
                {item.icon}
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Quick Actions">
            {actionItems.map((item) => (
              <CommandItem
                key={item.href}
                value={item.label.toLowerCase()}
                onSelect={() => handleNavigate(item.href)}
              >
                {item.icon}
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Help">
            {helpItems.map((item) => {
              if (item.href.startsWith('mailto:')) {
                return (
                  <CommandItem
                    key={item.href}
                    value={item.label.toLowerCase()}
                    onSelect={() => {
                      setOpen(false)
                      window.location.href = item.href
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </CommandItem>
                )
              }
              return (
                <CommandItem
                  key={item.href}
                  value={item.label.toLowerCase()}
                  onSelect={() => handleNavigate(item.href)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </CommandItem>
              )
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Account">
            <CommandItem value="sign-out" onSelect={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>

        {/* Footer hint */}
        <div className="border-t px-3 py-2 text-xs text-muted-foreground">
          ↑↓ navigate · ↵ select · esc close
        </div>
      </CommandDialog>
    </>
  )
}
