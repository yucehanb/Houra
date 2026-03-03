import { Navbar } from '@/components/layout/Navbar'

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-900">
            <Navbar />
            <main className="md:pt-16 pb-16 md:pb-0 h-screen flex flex-col">
                {children}
            </main>
        </div>
    )
}
