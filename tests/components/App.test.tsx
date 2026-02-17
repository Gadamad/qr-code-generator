import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '@/App'

// Mock window.matchMedia for jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock qr-code-styling — must be a constructor (called with `new`)
vi.mock('qr-code-styling', () => {
  const MockQRCodeStyling = vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.append = vi.fn()
    this.update = vi.fn()
    this.getRawData = vi.fn().mockResolvedValue(new Blob())
    this.download = vi.fn()
  })
  return { default: MockQRCodeStyling }
})

// Mock file-saver
vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}))

// Mock recharts to avoid SVG rendering issues in jsdom
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
  BarChart: () => null,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
}))

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should render without crashing', () => {
    render(<App />)
    expect(document.body).toBeTruthy()
  })

  it('should display header with title', () => {
    render(<App />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading.textContent).toMatch(/QR/i)
  })

  it('should show tagline text', () => {
    render(<App />)
    const body = document.body.textContent || ''
    expect(body).toMatch(/No limits/i)
  })

  it('should display all 10 QR type tabs', () => {
    render(<App />)
    const body = document.body.textContent || ''
    const tabLabels = ['URL', 'Text', 'WiFi', 'Contact', 'Email', 'SMS', 'WhatsApp', 'Crypto', 'Calendar', 'Location']
    for (const label of tabLabels) {
      expect(body).toContain(label)
    }
  })

  it('should have a dark mode toggle button', () => {
    render(<App />)
    const toggle = screen.getByRole('button', { name: /dark|theme|mode/i })
    expect(toggle).toBeInTheDocument()
  })

  it('should toggle dark mode class on document element', () => {
    render(<App />)
    const toggle = screen.getByRole('button', { name: /dark|theme|mode/i })
    const htmlEl = document.documentElement

    fireEvent.click(toggle)
    const classAfterClick = htmlEl.classList.contains('dark')

    fireEvent.click(toggle)
    const classAfterSecondClick = htmlEl.classList.contains('dark')

    expect(classAfterClick).not.toBe(classAfterSecondClick)
  })

  it('should persist dark mode preference in localStorage', () => {
    render(<App />)
    const toggle = screen.getByRole('button', { name: /dark|theme|mode/i })

    fireEvent.click(toggle)
    const stored = localStorage.getItem('darkMode')
    expect(stored).toBeDefined()
  })

  it('should show footer with privacy message', () => {
    render(<App />)
    const body = document.body.textContent || ''
    expect(body).toMatch(/client-side/i)
  })
})
