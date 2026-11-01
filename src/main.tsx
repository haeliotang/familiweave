import { createRoot } from 'react-dom/client'
import { DesktopShell } from './desktop-shell'
import './style.css'
import './shell.css'

createRoot(document.getElementById('root')!).render(<DesktopShell />)
