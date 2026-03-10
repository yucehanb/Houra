import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Gizlilik Politikası',
    description: 'HOURA platformunda verilerinizin nasıl toplandığı ve korunduğu hakkında bilgilendirme.'
}

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#0B0F19] relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
            {/* Arka plan dekoratif elementler */}
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />
            <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors mb-8 group">
                    <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
                    Ana Sayfaya Dön
                </Link>

                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl text-slate-300">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-4">
                        Gizlilik Politikası
                    </h1>
                    <p className="text-slate-500 mb-10 pb-8 border-b border-white/10 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Son güncelleme: 8 Mart 2026
                    </p>

                    <div className="space-y-8 text-base leading-relaxed text-slate-300">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">1. Giriş ve Veri Politikası Amacı</h2>
                            <p className="text-slate-400">
                                HOURA (Zaman Bankası) olarak gizliliğinize en yüksek düzeyde önem veriyor; kullanıcı güvenini her şeyin
                                önünde tutuyoruz. Bu Gizlilik Politikası, web ve mobil uygulamamızı kullanırken kişisel
                                verilerinizin tarafımızca nasıl toplandığını, ne sebeple kullanıldığını ve nasıl korunduğunu açıklamaktadır.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. Toplanan Bilgiler Nelerdir?</h2>
                            <ul className="list-disc pl-5 space-y-3 text-slate-400">
                                <li><strong className="text-white">Kayıt / Hesap Bilgileri:</strong> Adınız, soyadınız, e-posta adresiniz, biyografiniz ve şifre veriniz (kriptolanmış formatta).</li>
                                <li><strong className="text-white">Uygulama İçi İçerik Bilgileri:</strong> Sağladığınız/aldığınız hizmetler (ilanlar), beceri etiketleriniz, diğer kullanıcılardan aldığınız yorumlar ve puanlar.</li>
                                <li><strong className="text-white">İletişim İçerikleri:</strong> Platform içi mesajlaşma sisteminde oluşturduğunuz işlem, talep ve diyaloglar.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. Bilgilerin İşlenmesi ve Kullanımı</h2>
                            <p className="text-slate-400">Topladığımız bilgileri yalnızca aşağıdaki meşru amaçlar ve gereklilikler çerçevesinde işleriz:</p>
                            <ul className="list-disc pl-5 space-y-3 mt-4 text-slate-400">
                                <li>Kullanıcılar arasında hizmet, yetenek ve ilan eşleşmelerini başarıyla sağlamak.</li>
                                <li>Uygulama içi anlık iletişim kalitesini iyileştirmek ve destek sorunlarına çözüm bulmak.</li>
                                <li>Platform üzerindeki istismarları, sahte hesapları ve tehdit edici davranışları analiz etmek.</li>
                                <li>Geri bildirimlerinize dayanarak yeni özellikler geliştirmek ve uygulamayı optimize etmek.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">4. Üçüncü Taraflarla Bilgi Paylaşımı</h2>
                            <p className="text-slate-400">
                                Kişisel verilerinizi <strong className="text-white">asla</strong> reklam şirketlerine
                                satmıyoruz veya izniniz dışında ticari veri tabanı ağlarına aktarmıyoruz. Ancak unutulmamalıdır ki, platforma ilan yüklediğinizde
                                profil isminiz (adınız ve varsa soyadınızın ilk harfi vb.), ilan içerikleriniz ve
                                değerlendirmeleriniz tüm kullanıcılar ile paylaşılan kamuya açık bir profilde gösterilecektir.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">5. Veri Güvenliği Standartları</h2>
                            <p className="text-slate-400">
                                Verilerinizi yetkisiz erişime veya değiştirilmeye karşı korumak için sektör standardında ve modern şifreleme alt yapıları (örn: Supabase RLS ve HTTPS) kullanıyoruz.
                                Şifreleriniz kendi veritabanlarımızda asla açık metin şeklinde okunamaz ve saklanmaz; tüm iletişim kriptolanır.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">6. Kullanıcı Seçimleri ve Veri İzni Hakları</h2>
                            <p className="text-slate-400">
                                Hesap sahipleri, profillerini ve paylaşılan verilerini diledikleri zaman "Profil Düzenleme" alanından
                                değiştirme hakkına sahiptir. Tüm veri geçmişinizin anonimleştirilmesi veya sistemden
                                tümüyle çıkartılması için kalıcı hesap silimi talep etmeniz mümkündür. Hesap silindiğinde
                                mesaj geçmişiniz karşı taraftaki bütünlüğü korumak adına anonim (bölgesel) olarak arşivlenebilir.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
