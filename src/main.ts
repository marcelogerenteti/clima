import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Elemento #app não encontrado')
}

app.innerHTML = '<main aria-live="polite"></main>'
