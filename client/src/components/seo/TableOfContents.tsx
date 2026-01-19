import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, List } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface TOCItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
  className?: string
}

export function TableOfContents({ content, className = '' }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [activeId, setActiveId] = useState<string>('')
  const [items, setItems] = useState<TOCItem[]>([])

  useEffect(() => {
    const headings: TOCItem[] = []
    const lines = content.split('\n')
    
    lines.forEach((line, index) => {
      if (line.startsWith('# ')) {
        headings.push({
          id: `heading-${index}`,
          text: line.slice(2).trim(),
          level: 1
        })
      } else if (line.startsWith('## ')) {
        headings.push({
          id: `heading-${index}`,
          text: line.slice(3).trim(),
          level: 2
        })
      } else if (line.startsWith('### ')) {
        headings.push({
          id: `heading-${index}`,
          text: line.slice(4).trim(),
          level: 3
        })
      }
    })

    setItems(headings)
  }, [content])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0% -35% 0%' }
    )

    items.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [items])

  const handleClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (items.length < 3) {
    return null
  }

  return (
    <div className={`bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <List className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">Table of Contents</span>
          <span className="text-sm text-muted-foreground">({items.length} sections)</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ul className="px-4 pb-4 space-y-1">
              {items.map((item) => (
                <li
                  key={item.id}
                  style={{ paddingLeft: `${(item.level - 1) * 16}px` }}
                >
                  <button
                    onClick={() => handleClick(item.id)}
                    className={`w-full text-left py-1.5 px-3 rounded-lg text-sm transition-colors ${
                      activeId === item.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {item.text}
                  </button>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  )
}
