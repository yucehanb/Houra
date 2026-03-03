import Link from 'next/link'
import { ArrowRight, Clock, Star, Shield, Users, Zap, CheckCircle2, Globe, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Home() {
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

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto opacity-50">
            <div className="flex flex-col items-center">
              <span className="text-white text-2xl font-bold">10K+</span>
              <span className="text-slate-500 text-sm">Aktif Kullanıcı</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-white text-2xl font-bold">50K+</span>
              <span className="text-slate-500 text-sm">Takas Saati</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-white text-2xl font-bold">4.9/5</span>
              <span className="text-slate-500 text-sm">Kullanıcı Memnuniyeti</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-white text-2xl font-bold">%100</span>
              <span className="text-slate-500 text-sm">Güvenli Sistem</span>
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
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 blur-3xl rounded-full" />
              <div className="relative bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-sm">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                    <div className="w-12 h-12 rounded-full bg-purple-500" />
                    <div>
                      <div className="w-32 h-3 bg-white/10 rounded-full mb-2" />
                      <div className="w-20 h-2 bg-white/5 rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="w-full h-4 bg-white/10 rounded-full" />
                    <div className="w-full h-4 bg-white/10 rounded-full" />
                    <div className="w-3/4 h-4 bg-white/10 rounded-full" />
                  </div>
                  <div className="pt-4 grid grid-cols-2 gap-4">
                    <div className="h-24 bg-white/5 rounded-2xl border border-white/5" />
                    <div className="h-24 bg-white/5 rounded-2xl border border-white/5" />
                  </div>
                  <div className="w-full h-12 bg-purple-600/50 rounded-xl animate-pulse" />
                </div>
              </div>
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
            <a href="#" className="hover:text-white transition-colors">Gizlilik Politikası</a>
            <a href="#" className="hover:text-white transition-colors">Kullanım Şartları</a>
            <a href="#" className="hover:text-white transition-colors">İletişim</a>
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
