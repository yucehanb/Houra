import { Navbar } from '@/components/layout/Navbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-900">
            <Navbar />
            {/* Navbar yüksekliği kadar boşluk */}
            <main className="md:pt-20 pb-20 md:pb-8 px-4 max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    )
}
