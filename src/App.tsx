import { useState, useEffect, useCallback } from 'react'
import type { QRType } from '@/types/qr'
import type { QRGeneratorOptions } from '@/hooks/useQRGenerator'
import type QRCodeStyling from 'qr-code-styling'
// useDebounce removed — forms already debounce internally

import {
  URLForm, TextForm, WiFiForm, VCardForm, EmailForm,
  SMSForm, WhatsAppForm, CryptoForm, CalendarForm, GeoForm,
} from '@/components/types'
import QRPreview from '@/components/QRPreview'
import QRCustomizer from '@/components/QRCustomizer'
import DownloadOptions from '@/components/DownloadOptions'

type CustomizationOptions = Omit<QRGeneratorOptions, 'data'>

const DEFAULT_OPTIONS: CustomizationOptions = {
  width: 300,
  fgColor: '#000000',
  bgColor: '#ffffff',
  gradientType: 'none',
  logo: null,
  logoSize: 0.2,
  cornerStyle: 'square',
  dotStyle: 'square',
  errorCorrection: 'M',
  margin: 4,
}

const TABS: { type: QRType; label: string; icon: string }[] = [
  { type: 'url', label: 'URL', icon: '\u{1F517}' },
  { type: 'text', label: 'Text', icon: '\u{1F4DD}' },
  { type: 'wifi', label: 'WiFi', icon: '\u{1F4F6}' },
  { type: 'vcard', label: 'Contact', icon: '\u{1F464}' },
  { type: 'email', label: 'Email', icon: '\u2709\uFE0F' },
  { type: 'sms', label: 'SMS', icon: '\u{1F4AC}' },
  { type: 'whatsapp', label: 'WhatsApp', icon: '\u{1F4F1}' },
  { type: 'crypto', label: 'Crypto', icon: '\u20BF' },
  { type: 'calendar', label: 'Calendar', icon: '\u{1F4C5}' },
  { type: 'geo', label: 'Location', icon: '\u{1F4CD}' },
]

function App() {
  const [activeTab, setActiveTab] = useState<QRType>('url')
  const [payload, setPayload] = useState('')
  const [qrOptions, setQrOptions] = useState<CustomizationOptions>(DEFAULT_OPTIONS)
  const [qrInstance, setQrInstance] = useState<QRCodeStyling | null>(null)
  const [customizerOpen, setCustomizerOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode')
      if (saved !== null) return saved === 'true'
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  // Forms already debounce at 150ms, no extra debounce needed

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', String(darkMode))
  }, [darkMode])

  const handleTabChange = useCallback((tab: QRType) => {
    setActiveTab(tab)
    setPayload('')
  }, [])

  const handlePayloadChange = useCallback((value: string) => {
    setPayload(value)
  }, [])

  const handleQrInstanceReady = useCallback((instance: QRCodeStyling | null) => {
    setQrInstance(instance)
  }, [])

  function renderForm() {
    const props = { onChange: handlePayloadChange }
    switch (activeTab) {
      case 'url': return <URLForm {...props} />
      case 'text': return <TextForm {...props} />
      case 'wifi': return <WiFiForm {...props} />
      case 'vcard': return <VCardForm {...props} />
      case 'email': return <EmailForm {...props} />
      case 'sms': return <SMSForm {...props} />
      case 'whatsapp': return <WhatsAppForm {...props} />
      case 'crypto': return <CryptoForm {...props} />
      case 'calendar': return <CalendarForm {...props} />
      case 'geo': return <GeoForm {...props} />
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              QR Generator
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Free QR codes. No limits. No BS.
            </p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Tab Bar */}
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="overflow-x-auto scrollbar-hide -mb-px">
            <div className="flex gap-1 min-w-max py-2">
              {TABS.map((tab) => (
                <button
                  key={tab.type}
                  onClick={() => handleTabChange(tab.type)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200
                    ${activeTab === tab.type
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <span className="text-base leading-none">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
          {/* Form Card */}
          <div className="lg:col-start-1 lg:row-start-1">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
              <div key={activeTab} className="animate-fade-in">
                {renderForm()}
              </div>
            </div>
          </div>

          {/* QR Preview (sticky on desktop, second on mobile) */}
          <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-6 lg:self-start">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
              <QRPreview
                payload={payload}
                options={qrOptions}
                onInstanceReady={handleQrInstanceReady}
              />
            </div>
          </div>

          {/* Customizer (collapsible) */}
          <div className="lg:col-start-1 lg:row-start-2">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <button
                onClick={() => setCustomizerOpen(!customizerOpen)}
                className="w-full flex items-center justify-between px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Customize QR Code
                </span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${customizerOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {customizerOpen && (
                <div className="px-6 pb-6 animate-fade-in">
                  <QRCustomizer options={qrOptions} onChange={setQrOptions} />
                </div>
              )}
            </div>
          </div>

          {/* Download Options */}
          <div className="lg:col-span-2 lg:row-start-3">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
              <DownloadOptions qrInstance={qrInstance} disabled={!payload} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400">
          <p className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            100% client-side. Your data never leaves your browser.
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}

export default App
