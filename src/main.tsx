import { createRoot } from 'react-dom/client'
import { DesktopShell } from './desktop-shell'
import { LanguageProvider } from './i18n'
import { ThemeProvider } from './theme'
import { AppErrorBoundary } from './error-boundary'
import './style.css'
import './shell.css'

createRoot(document.getElementById('root')!).render(<AppErrorBoundary><ThemeProvider><LanguageProvider><DesktopShell /></LanguageProvider></ThemeProvider></AppErrorBoundary>)
