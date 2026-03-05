'use client'

import { use, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

declare global {
    interface Window {
        JitsiMeetExternalAPI: any
    }
}

export default function VideoRoomPage({ params }: { params: Promise<{ roomName: string }> }) {
    const { roomName } = use(params)
    const router = useRouter()
    const currentUser = useAuthStore(s => s.user)

    const jitsiContainerRef = useRef<HTMLDivElement>(null)
    const apiRef = useRef<any>(null)
    const [status, setStatus] = useState<'loading' | 'joined' | 'error' | 'left'>('loading')

    useEffect(() => {
        let isCurrent = true
        const scriptId = 'jitsi-external-api'

        const loadJitsiScript = () => {
            return new Promise<void>((resolve, reject) => {
                if (window.JitsiMeetExternalAPI) {
                    resolve()
                    return
                }

                const script = document.createElement('script')
                script.id = scriptId
                script.src = 'https://meet.ffmuc.net/libs/external_api.min.js'
                script.async = true
                script.onload = () => resolve()
                script.onerror = () => reject(new Error('Jitsi script yüklenemedi.'))
                document.body.appendChild(script)
            })
        }

        const initJitsi = async () => {
            try {
                await loadJitsiScript()
                if (!isCurrent || !jitsiContainerRef.current) return

                const domain = 'meet.ffmuc.net'
                const options = {
                    roomName: roomName.replace(/[^a-zA-Z0-9-]/g, ''),
                    width: '100%',
                    height: '100%',
                    parentNode: jitsiContainerRef.current,
                    userInfo: {
                        displayName: currentUser?.full_name || 'Kullanıcı'
                    },
                    configOverwrite: {
                        startWithAudioMuted: false,
                        startWithVideoMuted: false,
                        enableWelcomePage: false,
                        prejoinPageEnabled: false,
                        prejoinConfig: { enabled: false },
                        requireDisplayName: false,
                        disableDeepLinking: true,
                        p2p: { enabled: true },
                    },
                    interfaceConfigOverwrite: {
                        // TILE_VIEW_DEFAULT: true,
                    },
                }

                const api = new window.JitsiMeetExternalAPI(domain, options)
                apiRef.current = api

                // API yüklendiği an loader'ı kaldıralım ki Jitsi'nin kendi butonları (Join/Host) tıklanabilsin.
                if (isCurrent) setStatus('joined')

                api.addEventListeners({
                    videoConferenceJoined: () => {
                        console.log('Jitsi: Joined.')
                        if (isCurrent) setStatus('joined')
                    },
                    videoConferenceLeft: () => {
                        if (isCurrent) {
                            setStatus('left')
                            router.back()
                        }
                    },
                    readyToClose: () => {
                        if (isCurrent) router.back()
                    }
                })

            } catch (err: any) {
                console.error('Jitsi initialization error:', err)
                if (isCurrent) setStatus('error')
            }
        }

        initJitsi()

        return () => {
            isCurrent = false
            if (apiRef.current) {
                apiRef.current.dispose()
                apiRef.current = null
            }
        }
    }, [roomName, router, currentUser])

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
            {/* Next.js Dev Overlay gizleme */}
            <style dangerouslySetInnerHTML={{
                __html: `
                [data-nextjs-dialog-overlay],
                [data-nextjs-toast-wrapper] { 
                    display: none !important; 
                }
            ` }} />

            {/* Üst Bar */}
            <div className="absolute top-0 left-0 w-full p-4 flex items-center z-[120] bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <button
                    onClick={() => router.back()}
                    className="pointer-events-auto flex items-center gap-2 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 px-4 py-2 rounded-xl backdrop-blur-md transition-all border border-white/10"
                >
                    <ArrowLeft className="w-4 h-4" /> Sohbet'e Dön
                </button>
            </div>

            {/* Durum UI (Sadece loading anında) */}
            {status === 'loading' && (
                <div className="text-center absolute z-[115] bg-slate-950 p-10 rounded-3xl border border-white/5">
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                    <p className="text-purple-100 font-medium text-lg">Bağlantı Kuruluyor...</p>
                </div>
            )}

            {status === 'error' && (
                <div className="text-center absolute z-[115] bg-red-950/50 border border-red-500/30 p-8 rounded-2xl max-w-sm backdrop-blur-md">
                    <p className="text-red-400 font-bold mb-2">Bağlantı Hatası</p>
                    <p className="text-red-300/80 text-sm">Görüşme servisine bağlanılamadı.</p>
                </div>
            )}

            {/* Jitsi Video Container - Her zaman görünür */}
            <div
                ref={jitsiContainerRef}
                className="w-full h-full relative z-[100] opacity-100"
            />
        </div>
    )
}
