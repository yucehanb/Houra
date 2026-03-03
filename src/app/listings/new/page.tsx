import type { Metadata } from 'next'
import { NewListingForm } from '@/components/listings/NewListingForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Yeni İlan | HOURA',
    description: 'Yeni bir hizmet ilanı oluştur ve zaman kredisi kazan.',
}

export default function NewListingPage() {
    return (
        <div className="space-y-6 pt-2">
            <div className="flex items-center gap-3">
                <Link href="/listings" className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors group">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    İlanlarım
                </Link>
                <span className="text-slate-600">/</span>
                <h1 className="text-white font-semibold">Yeni İlan</h1>
            </div>
            <NewListingForm />
        </div>
    )
}
