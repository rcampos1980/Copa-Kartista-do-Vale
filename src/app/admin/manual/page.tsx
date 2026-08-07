import { MenuAdmin } from '@/components/MenuAdmin'
import { Manual } from './Manual'

export default function ManualPage() {
  return (
    <main className="min-h-screen px-4 py-8 md:px-10 md:py-12">
      <header className="mb-8">
        <p className="text-sm uppercase tracking-widest text-accent font-display">
          Administração
        </p>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
          Como operar o site
        </h1>
      </header>

      <MenuAdmin />

      <Manual />
    </main>
  )
}
