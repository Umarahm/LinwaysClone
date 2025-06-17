'use client'

import * as React from 'react'

// Simple dark-mode only provider
export const ThemeProvider = React.memo(function ThemeProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add('dark')
    document.documentElement.setAttribute('data-theme', 'dark')
  }, [])

  return <>{children}</>
})

ThemeProvider.displayName = 'ThemeProvider'
