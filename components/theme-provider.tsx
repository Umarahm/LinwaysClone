'use client'

import * as React from 'react'

// Enhanced theme provider supporting both light and dark modes
export const ThemeProvider = React.memo(function ThemeProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    // Check for saved theme preference or default to dark mode
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark) || savedTheme === null

    if (shouldUseDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'light')
    }

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark')
          localStorage.setItem('theme', isDark ? 'dark' : 'light')
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  return <>{children}</>
})

ThemeProvider.displayName = 'ThemeProvider'
