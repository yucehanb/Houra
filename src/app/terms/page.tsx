import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Kullanım Koşulları',
    description: 'HOURA (Zaman Bankası) kullanım koşulları ve şartları.'
}

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#0B0F19] relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
            {/* Arka plan dekoratif elementler */}
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors mb-8 group">
                    <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
                    Ana Sayfaya Dön
                </Link>

                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl text-slate-300">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-4">
                        Kullanım Koşulları
                    </h1>
                    <p className="text-slate-500 mb-10 pb-8 border-b border-white/10 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        Son güncelleme: 8 Mart 2026
                    </p>

                    <div className="space-y-8 text-base leading-relaxed text-slate-300">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">1. Kabul Edilme ve Genel Hükümler</h2>
                            <p className="text-slate-400">
                                HOURA platformunu kullanarak veya platforma erişerek, bu Kullanım Koşulları&apos;nı kabul etmiş sayılırsınız.
                                Platformumuz bireylerin kendi aralarında adil, ücretsiz ve güvenli bir şekilde beceri takası yapmasını hedefler.
                                Eğer bu koşulların herhangi bir kısmını kabul etmiyorsanız, platformu kullanmamalısınız.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. Hizmetin Tanımı (Zaman Bankası)</h2>
                            <p className="text-slate-400">
                                HOURA, kullanıcıların yeteneklerini ve hizmetlerini zaman kredisi karşılığında takas etmelerine olanak tanıyan
                                bir dijital arabuluculuk platformudur. Platform, sağlanan hizmetlerin kalitesini,
                                içeriğini veya tarafların iyi niyetini doğrudan garanti etmez. Kullanıcıların güvene
                                dayalı topluluk kurallarına uyması beklenir.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. Hesap Kuralları ve Güvenlik</h2>
                            <ul className="list-disc pl-5 space-y-3 text-slate-400">
                                <li>Hesap oluştururken istenilen temel profil bilgisini doğru, şeffaf ve güncel sağlamalısınız.</li>
                                <li>Hesabınızın giriş güvenliğini sağlamaktan ve hesabınız üzerinden yapılan tüm eylemlerden siz sorumlusunuz.</li>
                                <li>Platformda tek bir kişinin yalnızca bir hesaba (gerçek kişi) sahip olmasına izin verilir. Sahte hesaplar
                                    tespit edildiğinde zaman kredilerine bakılmaksızın silinir.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">4. Zaman Kredileri (Houra Kredisi)</h2>
                            <p className="text-slate-400">
                                Kullanıcılar &quot;Zaman Kredisi&quot; kullanarak hizmet alır veya verirler. Yeni üye olan her kullanıcıya
                                başlangıçta <strong className="text-white font-medium">2 kredi hediye edilir</strong>. Adil bir ekonomi ve rekabet düzeni
                                oluşturmak amacıyla bir kullanıcının cüzdanında birikebilecek <strong className="text-white font-medium">maksimum kredi limiti 6</strong>
                                olarak belirlenmiştir. Zaman kredisi gerçek bir para birimine
                                dönüştürülemez, alınıp satılamaz ve platform dışına aktarılamaz.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">5. Davranış, Ahlak Kuralları ve Yasaklar</h2>
                            <p className="text-slate-400">
                                Kullanıcılar platformu yalnızca yasal, ahlaka uygun ve iyi niyetli amaçlarla kullanmalıdır.
                                Aşağıda sayılan eylemler kesinlikle yasaktır:
                            </p>
                            <ul className="list-disc pl-5 space-y-3 mt-4 text-slate-400">
                                <li>Yasadışı veya toplum güvenliğini tehdit eden nitelikteki hizmet listelemeleri hazırlamak.</li>
                                <li>Diğer kullanıcılara zorbalık yapmak, hakaret, tehdit, taciz veya nefret söylemi içeren dilde mesajlar kullanmak.</li>
                                <li>Zaman kredisi sistemini kendi veya başkaları lehine manipüle etme amaçlı hilelere teşebbüs etmek.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">6. Fesih, Askıya Alma ve Hesap Kapatma</h2>
                            <p className="text-slate-400">
                                HOURA yönetimi, sistemin veya topluluğun bütünlüğünü ve güvenliğini tehlikeye atan, kullanım
                                koşullarını kasıtlı şekilde ihlal eden hesapları önceden bildirim yapmaksızın kısıtlama, askıya alma
                                veya tamamen silme hakkını saklı tutar.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">7. Sorumluluğun Reddi</h2>
                            <p className="text-slate-400">
                                HOURA, bir hizmet sağlayıcı değil; bir bağlantı ve etkileşim ağıdır. Platform üzerinden alınan
                                hizmetlerin kalite beklentisi, yasal standartları veya yarattığı sonuçlara dair hukuki bir teminatımız
                                bulunmamaktadır. Taraflar doğabilecek anlaşmazlıkları ağırlıklı olarak kendi aralarında mutabakatla çözmekten sorumludur.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
