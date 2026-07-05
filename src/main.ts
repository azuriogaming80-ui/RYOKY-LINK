// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 🎨 Import global des thèmes RYOKY 
// Placé ici pour garantir que les variables CSS et polices sont injectées 
// dans le DOM avant le premier rendu de Vue (Zéro FOUC).
import './styles/ryoky-theme.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')