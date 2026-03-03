'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Check, ChevronRight, ChevronLeft, Clock, Tag, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORIES } from '@/types'
import { useListingsStore } from '@/store/listingsStore'
import { useAuthStore } from '@/store/authStore'
import { createClient } from '@/lib/supabase/client'

const listingSchema = z.object({
    title: z.string().min(5, 'En az 5 karakter giriniz').max(80, 'En fazla 80 karakter'),
    category: z.string().min(1, 'Kategori seçiniz'),
    type: z.enum(['offer', 'request']),
    duration_hrs: z.number().min(0.5, 'En az 0.5 saat').max(24, 'En fazla 24 saat'),
    description: z.string().min(20, 'En az 20 karakter giriniz').max(800, 'En fazla 800 karakter'),
    tags: z.array(z.string()).max(5, 'En fazla 5 etiket'),
})

type ListingFormData = z.infer<typeof listingSchema>

const STEPS = [
    { id: 1, label: 'Temel Bilgiler' },
    { id: 2, label: 'Detaylar' },
    { id: 3, label: 'Önizleme' },
]

const DURATION_OPTIONS = [0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10]

export function NewListingForm() {
    const router = useRouter()
    const { addListing, createListing } = useListingsStore()

    const [step, setStep] = useState(1)
    const [tagInput, setTagInput] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const form = useForm<ListingFormData>({
        resolver: zodResolver(listingSchema),
        defaultValues: { title: '', category: '', type: 'offer', duration_hrs: 1, description: '', tags: [] },
        mode: 'onChange',
    })

    const { register, watch, setValue, trigger, formState: { errors } } = form
    const values = watch()

    const addTag = () => {
        const trimmed = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
        if (trimmed && !values.tags.includes(trimmed) && values.tags.length < 5) {
            setValue('tags', [...values.tags, trimmed])
            setTagInput('')
        }
    }
    const removeTag = (tag: string) => setValue('tags', values.tags.filter(t => t !== tag))

    const goNext = async () => {
        const fields: (keyof ListingFormData)[] = step === 1 ? ['title', 'category', 'type'] : ['duration_hrs', 'description']
        const valid = await trigger(fields)
        if (valid) setStep(s => s + 1)
    }

    const { user } = useAuthStore()
    const supabase = createClient()

    const handleSubmit = async () => {
        if (!user) {
            router.push('/login')
            return
        }

        setIsSubmitting(true)
        setSubmitError(null)

        try {
            // 15 saniyelik bir zaman aşımı ekleyelim (Supabase bazen geç dönebiliyor)
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('İstek zaman aşımına uğradı (15s).')), 15000)
            )

            const insertPromise = createListing({
                user_id: user.id,
                title: values.title,
                description: values.description,
                category: values.category,
                type: values.type,
                duration_hrs: values.duration_hrs,
                tags: values.tags,
                status: 'active',
            })

            await Promise.race([insertPromise, timeoutPromise])

            setSubmitted(true)
            setTimeout(() => router.push('/dashboard'), 1500)
        } catch (err: any) {
            console.error('İlan yayınlanırken hata oluştu:', err)
            setSubmitError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (submitted) {
        return (
            <div className="text-center py-20 max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-white text-xl font-bold mb-2">İlan Yayınlandı!</h2>
                <p className="text-slate-400 text-sm">Keşfet sayfasına yönlendiriliyorsunuz…</p>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Step göstergesi */}
            <div className="flex items-center gap-2 mb-8">
                {STEPS.map((s, idx) => (
                    <div key={s.id} className="flex items-center gap-2">
                        <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300',
                            step > s.id ? 'bg-purple-600 text-white' : step === s.id ? 'bg-purple-600/20 border-2 border-purple-500 text-purple-300' : 'bg-white/5 border border-white/10 text-slate-500'
                        )}>
                            {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                        </div>
                        <span className={cn('text-sm font-medium hidden sm:block', step === s.id ? 'text-white' : 'text-slate-500')}>{s.label}</span>
                        {idx < STEPS.length - 1 && <div className={cn('flex-1 h-px w-8 mx-1 transition-colors', step > s.id ? 'bg-purple-500/50' : 'bg-white/10')} />}
                    </div>
                ))}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                {/* ── STEP 1 ─────────────────────── */}
                {step === 1 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h2 className="text-white text-lg font-bold mb-1">Temel Bilgiler</h2>
                            <p className="text-slate-400 text-sm">Ne sunmak veya bulmak istiyorsun?</p>
                        </div>
                        <div>
                            <label className="text-slate-300 text-sm font-medium mb-2 block">İlan Türü</label>
                            <div className="grid grid-cols-2 gap-3">
                                {([['offer', '✦ Sunuyorum', 'Bir yeteneğini veya hizmetini sun'] as const,
                                ['request', '⟐ Arıyorum', 'Bir hizmet veya yardım ara'] as const]).map(([val, label, sub]) => (
                                    <button key={val} type="button" onClick={() => setValue('type', val)}
                                        className={cn('p-4 rounded-xl border text-left transition-all',
                                            values.type === val ? 'bg-purple-600/15 border-purple-500/50 text-purple-300' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/8'
                                        )}>
                                        <p className="font-semibold text-sm">{label}</p>
                                        <p className="text-xs mt-0.5 opacity-70">{sub}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-slate-300 text-sm font-medium mb-2 block">Başlık <span className="text-red-400">*</span></label>
                            <input {...register('title')} placeholder="Örn: React & Next.js Mentörlük"
                                className={cn('w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all',
                                    errors.title ? 'border-red-500/50' : 'border-white/10 focus:border-purple-500/50'
                                )} />
                            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
                        </div>
                        <div>
                            <label className="text-slate-300 text-sm font-medium mb-2 block">Kategori <span className="text-red-400">*</span></label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map(cat => (
                                    <button key={cat} type="button" onClick={() => setValue('category', cat)}
                                        className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                                            values.category === cat ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                        )}>
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>}
                        </div>
                    </div>
                )}

                {/* ── STEP 2 ─────────────────────── */}
                {step === 2 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h2 className="text-white text-lg font-bold mb-1">Detaylar</h2>
                            <p className="text-slate-400 text-sm">Süre, açıklama ve etiketleri belirt.</p>
                        </div>
                        <div>
                            <label className="text-slate-300 text-sm font-medium mb-2 block">
                                <Clock className="inline w-3.5 h-3.5 mr-1 text-purple-400" />
                                Kaç saat kredi?
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {DURATION_OPTIONS.map(d => (
                                    <button key={d} type="button" onClick={() => setValue('duration_hrs', d)}
                                        className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                                            values.duration_hrs === d ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                        )}>
                                        {d} saat
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-slate-300 text-sm font-medium mb-2 block">Açıklama <span className="text-red-400">*</span></label>
                            <textarea {...register('description')} rows={4} placeholder="Hizmetini veya ihtiyacını ayrıntılı anlat…"
                                className={cn('w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none',
                                    errors.description ? 'border-red-500/50' : 'border-white/10 focus:border-purple-500/50'
                                )} />
                            <div className="flex justify-between mt-1">
                                {errors.description ? <p className="text-red-400 text-xs">{errors.description.message}</p> : <span />}
                                <p className="text-slate-600 text-xs">{values.description.length}/800</p>
                            </div>
                        </div>
                        <div>
                            <label className="text-slate-300 text-sm font-medium mb-2 block">
                                <Tag className="inline w-3.5 h-3.5 mr-1 text-purple-400" />
                                Etiketler <span className="text-slate-500 font-normal">(maks. 5)</span>
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                                    placeholder="etiket yaz, Enter'a bas"
                                    className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" />
                                <button type="button" onClick={addTag} className="px-3 py-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-sm hover:bg-purple-600/30 transition-all">Ekle</button>
                            </div>
                            {values.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {values.tags.map(tag => (
                                        <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs rounded-lg">
                                            #{tag}
                                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── STEP 3 Önizleme ────────────── */}
                {step === 3 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h2 className="text-white text-lg font-bold mb-1">Önizleme</h2>
                            <p className="text-slate-400 text-sm">İlanın böyle görünecek — onaylıyor musunuz?</p>
                        </div>
                        <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-5 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <h3 className="text-white font-semibold text-base leading-snug">{values.title}</h3>
                                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', values.type === 'offer' ? 'bg-purple-500/15 text-purple-300' : 'bg-sky-500/15 text-sky-300')}>
                                        {values.type === 'offer' ? '✦ Sunuyor' : '⟐ Arıyor'}
                                    </span>
                                    <span className="px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400">{values.category}</span>
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">{values.description}</p>
                            <div className="flex items-center gap-1.5 text-purple-300 text-sm font-semibold">
                                <Clock className="w-3.5 h-3.5" /> {values.duration_hrs} saat kredi
                            </div>
                            {values.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {values.tags.map(tag => (
                                        <span key={tag} className="px-2.5 py-0.5 bg-purple-500/10 text-purple-400 text-xs rounded-lg border border-purple-500/20">#{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Hata Mesajı */}
                {submitError && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
                        <p className="text-red-400 text-sm font-medium">{submitError}</p>
                    </div>
                )}

                {/* Navigasyon */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    {step > 1 ? (
                        <button type="button" onClick={() => setStep(s => s - 1)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">
                            <ChevronLeft className="w-4 h-4" /> Geri
                        </button>
                    ) : <div />}
                    {step < 3 ? (
                        <button type="button" onClick={goNext}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-purple-500/20">
                            İleri <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button type="button" onClick={handleSubmit} disabled={isSubmitting}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-purple-500/20">
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            {isSubmitting ? 'Yayınlanıyor…' : 'Yayınla'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
