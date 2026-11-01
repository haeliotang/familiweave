import { createRoot } from 'react-dom/client'
import { DesktopShell } from './desktop-shell'
import { LanguageProvider } from './i18n'
import { ThemeProvider } from './theme'
import './style.css'
import './shell.css'

createRoot(document.getElementById('root')!).render(<ThemeProvider><LanguageProvider><DesktopShell /></LanguageProvider></ThemeProvider>)
