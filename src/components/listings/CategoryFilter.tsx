'use client'

import { cn } from '@/lib/utils'
import { CATEGORIES } from '@/types'

const CATEGORY_ICONS: Record<string, string> = {
    'Eğitim': '📚', 'Tamirat': '🔧', 'Dijital': '💻',
    'Danışmanlık': '💡', 'Sağlık & Spor': '🏋️',
    'Sanat & Yaratıcılık': '🎨', 'Ulaşım': '🚗', 'Diğer': '✨',
}

interface Props {
    selected: string | null
    onChange: (category: string | null) => void
}

export function CategoryFilter({ selected, onChange }: Props) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {/* Tümü */}
            <button
                onClick={() => onChange(null)}
                className={cn(
                    'flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-150 active:scale-95',
                    selected === null
                        ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                )}
            >
                🌟 Tümü
            </button>

            {CATEGORIES.map((cat) => (
                <button
                    key={cat}
                    onClick={() => onChange(selected === cat ? null : cat)}
                    className={cn(
                        'flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-150 active:scale-95',
                        selected === cat
                            ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/25'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                    )}
                >
                    <span>{CATEGORY_ICONS[cat]}</span>
                    {cat}
                </button>
            ))}
        </div>
    )
}
