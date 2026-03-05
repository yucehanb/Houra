import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST() {
    try {
        // Jitsi Meet için çok daha rastgele bir oda ismi üretelim.
        // Prefix kullanmamak çakışma ihtimalini azaltır.
        const roomName = crypto.randomUUID().replace(/-/g, '')

        // Jitsi'nin public instance'ı için URL (opsiyonel, frontend kendisi de kurabilir)
        const roomUrl = `https://meet.jit.si/${roomName}`

        return NextResponse.json({
            url: roomUrl,
            name: roomName
        })
    } catch (error: any) {
        console.error('Error creating Jitsi room:', error)
        return NextResponse.json(
            { error: 'Görüşme hazırlanamadı.' },
            { status: 500 }
        )
    }
}
