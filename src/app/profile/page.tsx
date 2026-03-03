import type { Metadata } from 'next'
import { ProfileView } from '@/components/profile/ProfileView'

export const metadata: Metadata = {
    title: 'Profilim | HOURA',
    description: 'Profilini düzenle, yeteneklerini ve ihtiyaçlarını güncelle.',
}

export default function ProfilePage() {
    return <ProfileView />
}
