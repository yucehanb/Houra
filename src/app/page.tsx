import Link from 'next/link'
import { ArrowRight, Clock, Star, Shield, Users, Zap, CheckCircle2, Globe, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const revalidate = 60; // 60 saniyede bir ISR üzerinden yenile

function formatStat(num: number): string {
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K+';
  return num.toString();
}

export default async function Home() {
  // DB üzerinden eş zamanlı gerçek sayıları çekelim
  const [{ count: usersCount }, { data: transactions }, { data: reviews }] = await Promise.all([
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('transactions').select('credits_amount').eq('status', 'completed'),
    supabaseAdmin.from('reviews').select('rating')
  ])

  const liveUsers = usersCount || 0
  const liveHours = transactions?.reduce((sum, t) => sum + Number(t.credits_amount || 0), 0) || 0
  
  const liveRating = reviews?.length 
    ? (reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length).toFixed(1)
    : '5.0'

  return (
    <div className="min-h-screen bg-[#0a0a0c] selection:bg-purple-500/30">
      {/* ── Navbar ─────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/20">
              H
            </div>
            <span className="text-white font-bold tracking-tight text-xl">HOURA</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#nasil-calisir" className="hover:text-white transition-colors">Nasıl Çalışır?</a>
            <a href="#ozellikler" className="hover:text-white transition-colors">Özellikler</a>
            <a href="#topluluk" className="hover:text-white transition-colors">Topluluk</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">Giriş Yap</Link>
            <Link href="/register" className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-purple-500/20">
              Katıl
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ─────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-purple-600/10 blur-[120px] rounded-full opacity-50 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-6 animate-fade-in">
            <Zap className="w-3 h-3 fill-current" /> Yeni Nesil Yetenek Takası
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] mb-8 tracking-tight">
            Zamanın En Değerli <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-[length:200%_auto] animate-gradient">Para Birimin</span> Olsun.
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl leading-relaxed mb-10">
            Para harcamadan hizmet al, yeteneklerini paylaş. Zaman Bankası HOURA ile topluluk içinde yardımlaş, kredi kazan ve hayatı kolaylaştır.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-black font-bold text-lg hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl">
              Hemen Başla <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#nasil-calisir" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center">
              Nasıl Çalışır?
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto opacity-70">
            <div className="flex flex-col items-center">
              <span className="text-white text-3xl font-bold">{formatStat(liveUsers)}</span>
              <span className="text-slate-500 text-sm mt-1">Aktif Kullanıcı</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-white text-3xl font-bold">{formatStat(liveHours)}</span>
              <span className="text-slate-500 text-sm mt-1">Takas Saati</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-white text-3xl font-bold">{liveRating}/5</span>
              <span className="text-slate-500 text-sm mt-1">Ortalama Memnuniyet</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-white text-3xl font-bold">%100</span>
              <span className="text-slate-500 text-sm mt-1">Güvenli Sistem</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Cards ─────────────────── */}
      <section id="ozellikler" className="py-20 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Neden HOURA?</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Geleneksel ekonomi yerine toplumsal dayanışmayı ve beceri paylaşımını merkeze alıyoruz.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Clock className="w-6 h-6 text-purple-400" />, title: 'Zaman Bazlı Ekonomi', desc: 'Aldığınız hizmetin süresi kadar kredi kazanırsınız. Herkesin zamanı eşittir.' },
              { icon: <Users className="w-6 h-6 text-blue-400" />, title: 'Güçlü Topluluk', desc: 'Sizin gibi yetenekli kişilerle tanışın, ağınızı genişletin ve yardımlaşın.' },
              { icon: <Shield className="w-6 h-6 text-emerald-400" />, title: 'Güvenli Takas', desc: 'Kredileriniz şeffaf bir şekilde yönetilir, her işlem güvence altındadır.' },
              { icon: <Star className="w-6 h-6 text-yellow-400" />, title: 'Beceri Geliştirme', desc: 'Yeni beceriler öğrenmek için para biriktirmenize gerek yok, zamanınız yeter.' },
              { icon: <Zap className="w-6 h-6 text-pink-400" />, title: 'Hızlı ve Kolay', desc: 'İlanınızı verin, taleplere cevap verin ve saniyeler içinde takasa başlayın.' },
              { icon: <Globe className="w-6 h-6 text-sky-400" />, title: 'Sınırsız Kategori', desc: 'Tesisattan yazılıma, yogadan bahçe işlerine kadar her türlü hizmet burada.' },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-purple-500/30 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-white font-bold text-xl mb-3">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────── */}
      <section id="nasil-calisir" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">
                4 Adımda <br /> <span className="text-purple-500">HOURA</span> Serüveni
              </h2>
              <div className="space-y-8">
                {[
                  { step: '01', title: 'Ücretsiz Katıl', desc: 'Profilini oluştur, yeteneklerini belirle ve HOURE topluluğuna ilk adımını at.' },
                  { step: '02', title: 'İlan Ver veya Bul', desc: 'Neye ihtiyacın olduğunu veya ne sunabileceğini anlatan bir ilan oluştur.' },
                  { step: '03', title: 'Hizmetini Sun', desc: 'Yardım et ve karşılığında dijital "Saat Kredisi" kazan.' },
                  { step: '04', title: 'Kredilerini Harca', desc: 'Kazandığın kredilerle topluluktaki diğer kişilerden dilediğin hizmeti al.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 items-start">
                    <div className="text-2xl font-black text-purple-800/50 leading-none">{item.step}</div>
                    <div>
                      <h4 className="text-white font-bold text-lg mb-1">{item.title}</h4>
                      <p className="text-slate-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative w-full max-w-lg mx-auto lg:mx-0">
              {/* Arka plan parlama efekti */}
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 to-blue-500/30 blur-3xl rounded-[3rem]" />
              
              {/* Gerçekçi İlan Kartı Mockup'ı */}
              <div className="relative bg-[#111320] border border-white/10 rounded-[2.5rem] p-6 shadow-2xl transition-transform hover:-translate-y-2 duration-500 z-10">
                
                {/* Kart Üst (Kullanıcı & Kategori) */}
                <div className="flex justify-between items-start mb-5">
                  <div className="flex gap-3 items-center">
                    <div className="relative">
                      {/* Avatar Placeholder */}
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px]">
                        <div className="w-full h-full rounded-full bg-[#111320] flex items-center justify-center text-white font-bold">
                          E
                        </div>
                      </div>
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#111320] rounded-full z-10"></div>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-[15px] leading-tight flex items-center gap-1">
                        Elif Yılmaz <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                      </h4>
                      <p className="text-slate-400 text-xs mt-0.5">İstanbul • Çevrimiçi</p>
                    </div>
                  </div>
                  <div className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                    Eğitim & Dil
                  </div>
                </div>

                {/* Kart İçerik */}
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-white mb-2 leading-snug">
                    İngilizce Konuşma Pratiği (A2-B2)
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                    Gramer ağırlıklı değil, tamamen pratiğe ve özgüven kazanmaya yönelik İngilizce sohbet seansları yapıyorum. Karşılığında sosyal medya danışmanlığı arıyorum!
                  </p>
                </div>

                {/* Kredi & Yetenek Etiketleri */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-2">
                    <span className="bg-white/5 border border-white/10 text-slate-300 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> 4.9
                    </span>
                    <span className="bg-white/5 border border-white/10 text-slate-300 text-xs px-2.5 py-1 rounded-full">
                      İngilizce Üst Orta
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-green-500/10 px-3 py-1.5 rounded-xl border border-green-500/20">
                    <Clock className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-bold text-sm">2 Kredi / Saat</span>
                  </div>
                </div>

                {/* Aksiyon Butonları (Mockup) */}
                <div className="grid grid-cols-[1fr_auto] gap-3">
                  <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3.5 border-none rounded-xl text-sm shadow-lg shadow-purple-900/50 hover:opacity-90 transition-opacity">
                    Hizmeti Al
                  </button>
                  <button className="w-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                    <Heart className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                {/* Yüzen rozet / Dekoratif */}
                <div className="absolute -right-6 -top-6 bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-2xl shadow-xl transform rotate-12 flex items-center justify-center animate-bounce-slow">
                  <span className="text-2xl drop-shadow-md">🤝</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Community / Values ─────────────────── */}
      <section id="topluluk" className="py-20 bg-gradient-to-b from-[#0a0a0c] to-[#120f1c]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Topluluğumuza Katıl</h2>
            <p className="text-slate-500 max-w-xl mx-auto">HOURA sadece bir yetenek takas platformu değil, aynı zamanda yardımlaşmayı seven insanların oluşturduğu büyük bir ailedir.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors" />
              <Heart className="w-10 h-10 text-purple-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">İyilik Zinciri</h3>
              <p className="text-slate-400 leading-relaxed mb-6">
                Burada para geçmez. Sadece zamanınızı ve emeğinizi ortaya koyarak ihtiyaç duyduğunuz şeylere ulaşırsınız. Biri sizin hayatınızı kolaylaştırırken, siz de yeteneğinizle bir başkasına dokunursunuz.
              </p>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-purple-500" /> Eşitlikçi sistem</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-purple-500" /> Gerçek yardımlaşma</li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
              <Globe className="w-10 h-10 text-blue-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Sınırları Kaldır</h3>
              <p className="text-slate-400 leading-relaxed mb-6">
                İster uzaktan dijital bir yeteneğinizi paylaşın, isterseniz mahallenizdeki komşunuza fiziksel bir konuda yardım edin. HOURA ile lokasyonunuza uygun veya online on binlerce kişiye anında erişin.
              </p>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-blue-500" /> Yerel ve global erişim</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-blue-500" /> Yeni yetenekler keşfetme</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────── */}
      <section className="py-20 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 relative">
          <div className="bg-gradient-to-br from-purple-600 to-blue-700 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 relative z-10">Zamanını Değerlendirmeye <br /> Hazır mısın?</h2>
            <p className="text-white/80 text-lg mb-12 max-w-xl mx-auto relative z-10">Hemen kaydol, 2 saat hoş geldin kredini al ve takasa başla. Üyelik tamamen ücretsizdir.</p>
            <div className="flex justify-center relative z-10">
              <Link href="/register" className="px-10 py-5 rounded-2xl bg-white text-purple-600 font-black text-xl hover:shadow-2xl hover:scale-105 transition-all active:scale-95 shadow-xl">
                Ücretsiz Katıl
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────── */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-white font-bold text-xs">H</div>
            <span className="text-white font-bold">HOURA</span>
            <span className="text-slate-600 text-xs ml-4">© 2026 Tüm hakları saklıdır.</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Gizlilik Politikası</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Kullanım Şartları</Link>
            <a href="mailto:houra.iletisim@gmail.com" className="hover:text-white transition-colors">İletişim</a>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer">𝕏</div>
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer">📸</div>
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer">💼</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
