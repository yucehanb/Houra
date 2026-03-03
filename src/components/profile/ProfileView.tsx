'use client'

import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Edit2, Check, X, Clock, Star, MapPin, Award, Tag, Zap, Camera, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORIES } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { createClient } from '@/lib/supabase/client'

const profileSchema = z.object({
    full_name: z.string().min(2, 'En az 2 karakter').max(50, 'En fazla 50 karakter'),
    bio: z.string().max(300, 'En fazla 300 karakter').optional(),
    city: z.string().max(50, 'En fazla 50 karakter').optional(),
    skills: z.array(z.string()),
    needs: z.array(z.string()),
})

type ProfileFormData = z.infer<typeof profileSchema>

const EMPTY_PROFILE = {
    id: '',
    full_name: '',
    avatar_url: null as string | null,
    bio: '',
    city: '',
    credits: 0,
    rating_avg: null as number | null,
    rating_count: 0,
    skills: [] as string[],
    needs: [] as string[],
    created_at: '',
}

const MOCK_REVIEWS: any[] = []

function AvatarLarge({ name, avatarUrl, onUpload, isUploading }: { name: string, avatarUrl?: string | null, onUpload?: (file: File) => void, isUploading?: boolean }) {
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && onUpload) {
            onUpload(file)
        }
    }

    return (
        <div className="relative group flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-500/30 overflow-hidden">
                {avatarUrl ? (
                    <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                    initials
                )}
            </div>
            {onUpload && (
                <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => inputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-800 border border-white/20 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
                >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-purple-400" /> : <Camera className="w-4 h-4 text-slate-300 group-hover:text-white" />}
                </button>
            )}
            <input type="file" accept="image/*" className="hidden" ref={inputRef} onChange={handleFileChange} />
        </div>
    )
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={cn('w-3.5 h-3.5', i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600')} />
            ))}
        </div>
    )
}

export function ProfileView() {
    const authUser = useAuthStore(s => s.user)
    const setAuthUser = useAuthStore(s => s.setUser)
    const supabase = createClient()

    // Helper to get only the first name
    const getFirstName = (fullName: string) => {
        if (!fullName) return ''
        return fullName.split(' ')[0]
    }

    const [isEditing, setIsEditing] = useState(false)
    const [profile, setProfile] = useState(() => {
        if (authUser) {
            return {
                ...EMPTY_PROFILE,
                ...authUser,
                full_name: getFirstName(authUser.full_name)
            }
        }
        return EMPTY_PROFILE
    })

    const [isSaving, setIsSaving] = useState(false)
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [skillInput, setSkillInput] = useState('')
    const [needInput, setNeedInput] = useState('')

    const fetchProfile = async () => {
        setIsLoading(true)
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession()
            if (sessionError) throw sessionError

            const id = authUser?.id || session?.user?.id

            if (id && session) {
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', id)
                    .single()

                if (data && !error) {
                    const profileData = {
                        ...EMPTY_PROFILE,
                        ...data,
                        full_name: data.full_name || getFirstName(session.user.user_metadata?.full_name || '')
                    }
                    setProfile(profileData as any)
                    setAuthUser(data as any)

                    reset({
                        full_name: profileData.full_name,
                        bio: data.bio ?? '',
                        city: data.city ?? '',
                        skills: data.skills || [],
                        needs: data.needs || [],
                    })
                } else if (session.user) {
                    // Kullanıcı var ama tabloda kaydı yoksa
                    const newUserProfile = {
                        ...EMPTY_PROFILE,
                        id: session.user.id,
                        full_name: getFirstName(session.user.user_metadata?.full_name || session.user.user_metadata?.name || ''),
                    }
                    setProfile(newUserProfile as any)
                    reset({
                        full_name: newUserProfile.full_name,
                        bio: '',
                        city: '',
                        skills: [],
                        needs: [],
                    })
                }
            }
        } catch (err) {
            console.error('Error fetching profile:', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchProfile()
    }, [])

    // Update local profile state when authUser changes from AuthProvider
    useEffect(() => {
        if (authUser) {
            setProfile(prev => ({
                ...EMPTY_PROFILE,
                ...authUser,
                full_name: prev.full_name || getFirstName(authUser.full_name) // Preserve edited name if any, but default to first name
            }))
        }
    }, [authUser])

    const form = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: profile.full_name,
            bio: profile.bio ?? '',
            city: profile.city ?? '',
            skills: profile.skills,
            needs: profile.needs,
        },
    })

    const { register, watch, setValue, handleSubmit, reset, formState: { errors } } = form
    const values = watch()

    const addSkill = () => {
        const v = skillInput.trim()
        if (v && !values.skills.includes(v) && values.skills.length < 8) {
            setValue('skills', [...values.skills, v])
            setSkillInput('')
        }
    }
    const removeSkill = (s: string) => setValue('skills', values.skills.filter(x => x !== s))
    const addNeed = () => {
        const v = needInput.trim()
        if (v && !values.needs.includes(v) && values.needs.length < 8) {
            setValue('needs', [...values.needs, v])
            setNeedInput('')
        }
    }
    const removeNeed = (n: string) => setValue('needs', values.needs.filter(x => x !== n))

    const onSave = async (data: ProfileFormData) => {
        setIsSaving(true)

        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession()
            if (sessionError) throw sessionError

            const realUserId = authUser?.id || session?.user?.id

            if (realUserId) {
                const { error } = await supabase.from('users').upsert({
                    id: realUserId,
                    full_name: data.full_name,
                    bio: data.bio ?? null,
                    city: data.city ?? null,
                    skills: data.skills,
                    needs: data.needs,
                })

                if (error) {
                    throw error
                }

                // Başarılıysa veriyi tekrar çek
                await fetchProfile()
                setIsEditing(false)
            } else {
                alert('Oturum bulunamadı, değişiklikler kaydedilemedi.')
            }
        } catch (err: any) {
            console.error('Save error:', err)
            alert('Profil kaydedilirken bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'))
        } finally {
            setIsSaving(false)
        }
    }

    const uploadAvatar = async (file: File) => {
        setIsUploadingAvatar(true)
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession()
            if (sessionError) throw sessionError

            const realUserId = authUser?.id || session?.user?.id
            if (!realUserId) {
                alert('Oturum bulunamadı. Lütfen tekrar giriş yapın.')
                return
            }

            const fileExt = file.name.split('.').pop()
            const fileName = `${realUserId}-${Math.random()}.${fileExt}`
            const filePath = `${realUserId}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true })

            if (uploadError) {
                console.error('Storage upload error:', uploadError)
                throw new Error(`Dosya yüklenemedi: ${uploadError.message}`)
            }

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            const avatarUrlWithTime = `${publicUrl}?t=${Date.now()}`

            const { error: updateError } = await supabase
                .from('users')
                .upsert({
                    id: realUserId,
                    avatar_url: avatarUrlWithTime,
                })

            if (updateError) throw updateError

            if (authUser) {
                setAuthUser({ ...authUser, avatar_url: avatarUrlWithTime })
            }
            setProfile(p => ({ ...p, avatar_url: avatarUrlWithTime }))

        } catch (err: any) {
            console.error('Avatar upload error:', err)
            alert(err.message || 'Fotoğraf yüklenirken bir hata oluştu.')
        } finally {
            setIsUploadingAvatar(false)
        }
    }

    const onCancel = () => {
        reset()
        setIsEditing(false)
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                <p className="text-slate-400 animate-pulse text-sm">Profil yükleniyor…</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 pt-2">
            {/* ── Profil Kartı ──────────────────── */}
            <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6">
                {/* Dekoratif */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                    {isEditing ? (
                        /* ── Edit Formu ── */
                        <form onSubmit={handleSubmit(onSave)} className="space-y-5">
                            <div className="flex items-start gap-4 mb-2">
                                <AvatarLarge name={values.full_name || profile.full_name} avatarUrl={profile.avatar_url} onUpload={uploadAvatar} isUploading={isUploadingAvatar} />
                                <div className="flex-1 space-y-3">
                                    <div>
                                        <label className="text-slate-400 text-xs font-medium mb-1.5 block">İsim Soyisim</label>
                                        <input
                                            {...register('full_name')}
                                            className={cn(
                                                'w-full px-3 py-2.5 rounded-xl bg-white/5 border text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all',
                                                errors.full_name ? 'border-red-500/50' : 'border-white/10 focus:border-purple-500/50'
                                            )}
                                        />
                                        {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>}
                                    </div>
                                    <div>
                                        <label className="text-slate-400 text-xs font-medium mb-1.5 block">Şehir</label>
                                        <input
                                            {...register('city')}
                                            placeholder="Şehir"
                                            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-slate-400 text-xs font-medium mb-1.5 block">Biyografi</label>
                                <textarea
                                    {...register('bio')}
                                    rows={3}
                                    placeholder="Kendini tanıt…"
                                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none placeholder-slate-600"
                                />
                                <p className="text-slate-600 text-xs text-right mt-0.5">{(values.bio ?? '').length}/300</p>
                            </div>

                            {/* Yetenekler */}
                            <div>
                                <label className="text-slate-400 text-xs font-medium mb-2 block flex items-center gap-1">
                                    <Zap className="w-3.5 h-3.5 text-purple-400" /> Yetenekler
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }} placeholder="Yetenek ekle…" className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder-slate-600" />
                                    <button type="button" onClick={addSkill} className="px-3 py-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs hover:bg-purple-600/30 transition-all">Ekle</button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {values.skills.map(s => (
                                        <span key={s} className="flex items-center gap-1 px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs rounded-lg">
                                            {s} <button type="button" onClick={() => removeSkill(s)}><X className="w-3 h-3 hover:text-red-400" /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* İhtiyaçlar */}
                            <div>
                                <label className="text-slate-400 text-xs font-medium mb-2 block flex items-center gap-1">
                                    <Tag className="w-3.5 h-3.5 text-sky-400" /> İhtiyaçlarım
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input value={needInput} onChange={e => setNeedInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addNeed() } }} placeholder="İhtiyaç ekle…" className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder-slate-600" />
                                    <button type="button" onClick={addNeed} className="px-3 py-2 rounded-xl bg-sky-600/20 border border-sky-500/30 text-sky-300 text-xs hover:bg-sky-600/30 transition-all">Ekle</button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {values.needs.map(n => (
                                        <span key={n} className="flex items-center gap-1 px-2.5 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs rounded-lg">
                                            {n} <button type="button" onClick={() => removeNeed(n)}><X className="w-3 h-3 hover:text-red-400" /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white text-sm font-semibold transition-all active:scale-95">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    {isSaving ? 'Kaydediliyor…' : 'Kaydet'}
                                </button>
                                <button type="button" onClick={onCancel} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">
                                    <X className="w-4 h-4" /> İptal
                                </button>
                            </div>
                        </form>
                    ) : (
                        /* ── Görüntüleme Modu ── */
                        <div className="space-y-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <AvatarLarge name={profile.full_name} avatarUrl={profile.avatar_url} />
                                    <div>
                                        <h1 className="text-white text-xl font-bold">{profile.full_name}</h1>
                                        {profile.city && (
                                            <div className="flex items-center gap-1 text-slate-400 text-sm mt-0.5">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {profile.city}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 mt-2">
                                            {profile.rating_avg && (
                                                <div className="flex items-center gap-1.5">
                                                    <StarRating rating={profile.rating_avg} />
                                                    <span className="text-white text-sm font-semibold">{profile.rating_avg.toFixed(1)}</span>
                                                    <span className="text-slate-500 text-xs">({profile.rating_count})</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-sm font-medium transition-all flex-shrink-0"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    Düzenle
                                </button>
                            </div>

                            {/* Kredi ve stat */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center">
                                    <Clock className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                                    <p className="text-white font-bold text-lg">{profile.credits.toFixed(1)}</p>
                                    <p className="text-slate-500 text-xs">Kredi Bakiyesi</p>
                                </div>
                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center">
                                    <Star className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                                    <p className="text-white font-bold text-lg">{profile.rating_avg?.toFixed(1) ?? '—'}</p>
                                    <p className="text-slate-500 text-xs">Ortalama Puan</p>
                                </div>
                                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
                                    <Award className="w-4 h-4 text-green-400 mx-auto mb-1" />
                                    <p className="text-white font-bold text-lg">{profile.rating_count}</p>
                                    <p className="text-slate-500 text-xs">Değerlendirme</p>
                                </div>
                            </div>

                            {/* Bio */}
                            {profile.bio && (
                                <p className="text-slate-300 text-sm leading-relaxed">{profile.bio}</p>
                            )}

                            {/* Yetenekler */}
                            {profile.skills.length > 0 && (
                                <div>
                                    <p className="text-slate-400 text-xs font-medium mb-2 flex items-center gap-1.5">
                                        <Zap className="w-3.5 h-3.5 text-purple-400" /> YETENEKLERİM
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {profile.skills.map(s => (
                                            <span key={s} className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs rounded-lg font-medium">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* İhtiyaçlar */}
                            {profile.needs.length > 0 && (
                                <div>
                                    <p className="text-slate-400 text-xs font-medium mb-2 flex items-center gap-1.5">
                                        <Tag className="w-3.5 h-3.5 text-sky-400" /> İHTİYAÇLARIM
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {profile.needs.map(n => (
                                            <span key={n} className="px-3 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs rounded-lg font-medium">{n}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Değerlendirmeler ──────────────── */}
            {!isEditing && (
                <div className="space-y-3">
                    <h2 className="text-white font-bold flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        Değerlendirmeler
                        <span className="text-slate-500 font-normal text-sm">({MOCK_REVIEWS.length})</span>
                    </h2>
                    {MOCK_REVIEWS.length > 0 ? (
                        MOCK_REVIEWS.map((review: any) => (
                            <div key={review.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                            {review.reviewer.split(' ').map((n: string) => n[0]).join('')}
                                        </div>
                                        <span className="text-slate-300 text-sm font-medium">{review.reviewer}</span>
                                    </div>
                                    <StarRating rating={review.rating} />
                                </div>
                                {review.comment && (
                                    <p className="text-slate-400 text-sm leading-relaxed">{review.comment}</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                            <p className="text-slate-400 text-sm">Henüz bir değerlendirme bulunmuyor.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
