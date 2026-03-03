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
            <div className="flex items-center gap-3 mb-2">
                <h1 className="text-white font-bold text-2xl">Yeni İlan Ver</h1>
            </div>
            <NewListingForm />
        </div>
    )
}
