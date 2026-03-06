import { WordItem, Category, DifficultyOption } from '@/types/crossword';

export const categories: Category[] = [
  { id: 'tyt-mat', name: 'TYT Matematik', icon: '📐', description: 'Sayılar, cebir, geometri', color: 'hsl(152, 32%, 38%)', grade: 'TYT' },
  { id: 'tyt-fiz', name: 'TYT Fizik', icon: '⚡', description: 'Mekanik, dalgalar, elektrik', color: 'hsl(210, 60%, 50%)', grade: 'TYT' },
  { id: 'tyt-kim', name: 'TYT Kimya', icon: '🧪', description: 'Elementler, bağlar, tepkimeler', color: 'hsl(280, 50%, 55%)', grade: 'TYT' },
  { id: 'tyt-bio', name: 'TYT Biyoloji', icon: '🧬', description: 'Hücre, genetik, ekoloji', color: 'hsl(120, 40%, 45%)', grade: 'TYT' },
  { id: 'tyt-tur', name: 'TYT Türkçe', icon: '📝', description: 'Dil bilgisi, edebiyat', color: 'hsl(35, 60%, 50%)', grade: 'TYT' },
  { id: 'tyt-tar', name: 'TYT Tarih', icon: '📜', description: 'Uygarlıklar, savaşlar, inkılaplar', color: 'hsl(350, 50%, 55%)', grade: 'TYT' },
  { id: 'tyt-cog', name: 'TYT Coğrafya', icon: '🌍', description: 'İklim, nüfus, haritalar', color: 'hsl(200, 50%, 45%)', grade: 'TYT' },
  { id: 'tyt-fel', name: 'TYT Felsefe', icon: '🤔', description: 'Düşünce, ahlak, mantık', color: 'hsl(270, 40%, 50%)', grade: 'TYT' },
];

export const difficultyOptions: DifficultyOption[] = [
  { id: 'easy', name: 'Kolay', icon: '🟢', description: 'Tek konu', topicCount: '1 konu' },
  { id: 'medium', name: 'Orta', icon: '🟡', description: 'Birkaç konu', topicCount: '2-4 konu' },
  { id: 'hard', name: 'Zor', icon: '🟠', description: 'Çok konu', topicCount: '5-9 konu' },
  { id: 'super-hard', name: 'Süper Zor', icon: '🔴', description: 'Tüm konular', topicCount: '10+ konu' },
  { id: 'all', name: 'Hepsi', icon: '🌀', description: 'Filtre yok', topicCount: 'Tümü' },
];

export const wordBank: Record<string, WordItem[]> = {
  'tyt-mat': [
    // Sayılar
    { word: 'ASAL', clue: 'Yalnızca 1 ve kendisine bölünebilen sayı', category: 'tyt-mat', topic: 'Sayılar', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'KESIR', clue: 'Pay ve paydadan oluşan sayı ifadesi', category: 'tyt-mat', topic: 'Sayılar', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'ÇARPAN', clue: 'Bir sayıyı tam bölen sayı', category: 'tyt-mat', topic: 'Sayılar', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'ORAN', clue: 'İki niceliğin birbirine bölümü', category: 'tyt-mat', topic: 'Sayılar', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'TABAN', clue: 'Üslü ifadede kuvveti alınan sayı', category: 'tyt-mat', topic: 'Sayılar', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'PAY', clue: 'Kesirde çizginin üstündeki sayı', category: 'tyt-mat', topic: 'Sayılar', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'PAYDA', clue: 'Kesirde çizginin altındaki sayı', category: 'tyt-mat', topic: 'Sayılar', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'EKSİ', clue: 'Çıkarma işleminin simgesi', category: 'tyt-mat', topic: 'Sayılar', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'TOPLAM', clue: 'Sayıların bir araya gelmesiyle oluşan sonuç', category: 'tyt-mat', topic: 'Sayılar', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'ÇARPIM', clue: 'İki sayının birbiriyle çarpılması sonucu', category: 'tyt-mat', topic: 'Sayılar', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'ONDALIK', clue: 'Virgüllü sayı ifadesi', category: 'tyt-mat', topic: 'Sayılar', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'BÖLÜM', clue: 'Bölme işleminin sonucu', category: 'tyt-mat', topic: 'Sayılar', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    // Üslü-Köklü
    { word: 'ÜSLÜ', clue: 'Tabanın kuvvetini gösteren ifade türü', category: 'tyt-mat', topic: 'Üslü-Köklü', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'FAKTÖR', clue: 'Çarpanlara ayırma işlemindeki bileşen', category: 'tyt-mat', topic: 'Üslü-Köklü', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'KÖKLER', clue: 'Denklemin sıfırı yapan değerleri', category: 'tyt-mat', topic: 'Üslü-Köklü', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    // Kümeler
    { word: 'KÜMELER', clue: 'Nesnelerin bir araya geldiği topluluk', category: 'tyt-mat', topic: 'Kümeler', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    // Fonksiyonlar
    { word: 'FONKSİYON', clue: 'Her elemana tek değer atayan bağıntı', category: 'tyt-mat', topic: 'Fonksiyonlar', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'PARABOL', clue: 'İkinci derece fonksiyonun grafiği', category: 'tyt-mat', topic: 'Fonksiyonlar', difficulty: 3, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'EĞİM', clue: 'Doğrunun dikliğini ölçen değer', category: 'tyt-mat', topic: 'Fonksiyonlar', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    // Türev-İntegral
    { word: 'TÜREV', clue: 'Anlık değişim hızını veren işlem', category: 'tyt-mat', topic: 'Türev-İntegral', difficulty: 3, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'İNTEGRAL', clue: 'Eğri altında kalan alanı bulan işlem', category: 'tyt-mat', topic: 'Türev-İntegral', difficulty: 3, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    // Geometri
    { word: 'ÜÇGEN', clue: 'Üç kenarı olan çokgen', category: 'tyt-mat', topic: 'Geometri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'ÇEMBER', clue: 'Bir noktaya eşit uzaklıktaki noktalar kümesi', category: 'tyt-mat', topic: 'Geometri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'KARE', clue: 'Dört kenarı eşit dörtgen', category: 'tyt-mat', topic: 'Geometri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'YAMUK', clue: 'İki kenarı paralel dörtgen', category: 'tyt-mat', topic: 'Geometri', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'AÇIORTAY', clue: 'Bir açıyı iki eşit parçaya bölen ışın', category: 'tyt-mat', topic: 'Geometri', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'ÇAP', clue: 'Çemberin merkezinden geçen doğru parçası', category: 'tyt-mat', topic: 'Geometri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'YARICAP', clue: 'Merkezden çembere olan uzaklık', category: 'tyt-mat', topic: 'Geometri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'ALAN', clue: 'Bir yüzeyin büyüklüğü', category: 'tyt-mat', topic: 'Geometri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'HACİM', clue: 'Bir cismin kapladığı yer miktarı', category: 'tyt-mat', topic: 'Geometri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'SİMETRİ', clue: 'Bir eksene göre ayna görüntüsü', category: 'tyt-mat', topic: 'Geometri', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'DOĞRU', clue: 'İki yönde sonsuza uzanan çizgi', category: 'tyt-mat', topic: 'Geometri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'TEĞET', clue: 'Çembere tek noktada dokunan doğru', category: 'tyt-mat', topic: 'Geometri', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'KİRİŞ', clue: 'Çember üzerindeki iki noktayı birleştiren doğru parçası', category: 'tyt-mat', topic: 'Geometri', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    // Denklemler
    { word: 'DENKLEM', clue: 'Eşitlik içeren matematiksel ifade', category: 'tyt-mat', topic: 'Denklemler', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'EŞITSIZLIK', clue: 'Büyüklük küçüklük ifadesi', category: 'tyt-mat', topic: 'Denklemler', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    // Olasılık-Sayma
    { word: 'OLASILIK', clue: 'Bir olayın gerçekleşme şansı', category: 'tyt-mat', topic: 'Olasılık-Sayma', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'PERMÜTASYON', clue: 'Sıralı dizilme sayısı', category: 'tyt-mat', topic: 'Olasılık-Sayma', difficulty: 3, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    // Matris
    { word: 'MATRIS', clue: 'Sayıların satır ve sütunlarda dizildiği tablo', category: 'tyt-mat', topic: 'Matris', difficulty: 3, grade: 'TYT', lang: 'tr', frequency_score: 0.6 },
    { word: 'EBEVEYN', clue: 'Olasılıkta bağımsız olaylar çarpım kuralı', category: 'tyt-mat', topic: 'Olasılık-Sayma', difficulty: 3, grade: 'TYT', lang: 'tr', frequency_score: 0.5 },
  ],
  'tyt-fiz': [
    // Mekanik
    { word: 'KÜTLE', clue: 'Madde miktarının ölçüsü', category: 'tyt-fiz', topic: 'Mekanik', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'HIZ', clue: 'Birim zamanda alınan yol', category: 'tyt-fiz', topic: 'Mekanik', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'İVME', clue: 'Hızın zamana göre değişim oranı', category: 'tyt-fiz', topic: 'Mekanik', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'KUVVET', clue: 'Cisimlerin hareketini değiştiren etki', category: 'tyt-fiz', topic: 'Mekanik', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'NEWTON', clue: 'Kuvvet birimi', category: 'tyt-fiz', topic: 'Mekanik', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'ATALET', clue: 'Cismin harekete direnme özelliği', category: 'tyt-fiz', topic: 'Mekanik', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'SÜRTÜNME', clue: 'Harekete karşı koyan yüzey kuvveti', category: 'tyt-fiz', topic: 'Mekanik', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'VEKTÖR', clue: 'Hem büyüklüğü hem yönü olan nicelik', category: 'tyt-fiz', topic: 'Mekanik', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'SKALER', clue: 'Yalnız büyüklüğü olan nicelik', category: 'tyt-fiz', topic: 'Mekanik', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'BOYUT', clue: 'Uzunluk, genişlik veya yükseklik ölçüsü', category: 'tyt-fiz', topic: 'Mekanik', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    // Enerji
    { word: 'ENERJİ', clue: 'İş yapabilme yeteneği', category: 'tyt-fiz', topic: 'Enerji', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'JOULE', clue: 'Enerji ve iş birimi', category: 'tyt-fiz', topic: 'Enerji', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'WATT', clue: 'Güç birimi', category: 'tyt-fiz', topic: 'Enerji', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    // Basınç
    { word: 'BASINÇ', clue: 'Birim alana etki eden kuvvet', category: 'tyt-fiz', topic: 'Basınç', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'YOĞUNLUK', clue: 'Birim hacimdeki kütle', category: 'tyt-fiz', topic: 'Basınç', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    // Dalgalar
    { word: 'DALGA', clue: 'Enerjinin titreşimle taşınması', category: 'tyt-fiz', topic: 'Dalgalar', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'FREKANS', clue: 'Birim zamandaki titreşim sayısı', category: 'tyt-fiz', topic: 'Dalgalar', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'GENLİK', clue: 'Dalganın denge noktasından en uzak mesafesi', category: 'tyt-fiz', topic: 'Dalgalar', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'PERYOT', clue: 'Bir tam titreşim süresi', category: 'tyt-fiz', topic: 'Dalgalar', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'HERTZ', clue: 'Frekans birimi', category: 'tyt-fiz', topic: 'Dalgalar', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'SARKAÇ', clue: 'İpte sallanan kütle sistemi', category: 'tyt-fiz', topic: 'Dalgalar', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    // Optik
    { word: 'KIRILMA', clue: 'Işığın ortam değiştirirken yön değiştirmesi', category: 'tyt-fiz', topic: 'Optik', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'YANSIMA', clue: 'Işığın yüzeyden geri dönmesi', category: 'tyt-fiz', topic: 'Optik', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'MERCEK', clue: 'Işığı kırarak odaklayan optik araç', category: 'tyt-fiz', topic: 'Optik', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'AYNA', clue: 'Işığı yansıtan düzgün yüzey', category: 'tyt-fiz', topic: 'Optik', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'GÜNEŞ', clue: 'Dünyaya ışık ve ısı veren yıldız', category: 'tyt-fiz', topic: 'Optik', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    // Elektrik
    { word: 'DİRENÇ', clue: 'Akıma karşı gösterilen zorluk', category: 'tyt-fiz', topic: 'Elektrik', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'AKIM', clue: 'Birim zamanda geçen yük miktarı', category: 'tyt-fiz', topic: 'Elektrik', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'GERİLİM', clue: 'İki nokta arasındaki potansiyel fark', category: 'tyt-fiz', topic: 'Elektrik', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'VOLTAJ', clue: 'Elektrik potansiyel farkı', category: 'tyt-fiz', topic: 'Elektrik', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'AMPUL', clue: 'Elektriği ışığa çeviren alet', category: 'tyt-fiz', topic: 'Elektrik', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'PILİ', clue: 'Kimyasal enerjiyi elektriğe çeviren kaynak', category: 'tyt-fiz', topic: 'Elektrik', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    // Atom Fiziği
    { word: 'ATOM', clue: 'Maddenin en küçük yapı taşı', category: 'tyt-fiz', topic: 'Atom Fiziği', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'PROTON', clue: 'Atomda artı yüklü tanecik', category: 'tyt-fiz', topic: 'Atom Fiziği', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'NÖTRON', clue: 'Atomda yüksüz tanecik', category: 'tyt-fiz', topic: 'Atom Fiziği', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'ELEKTRON', clue: 'Atomda eksi yüklü tanecik', category: 'tyt-fiz', topic: 'Atom Fiziği', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    // Moment
    { word: 'MOMENT', clue: 'Kuvvetin döndürme etkisi', category: 'tyt-fiz', topic: 'Moment', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'TORK', clue: 'Döndürme kuvveti momenti', category: 'tyt-fiz', topic: 'Moment', difficulty: 3, grade: 'TYT', lang: 'tr', frequency_score: 0.6 },
    // Isı
    { word: 'ISI', clue: 'Sıcak cisimden soğuğa geçen enerji', category: 'tyt-fiz', topic: 'Isı-Sıcaklık', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
  ],
  'tyt-kim': [
    // Madde ve Özellikleri
    { word: 'ELEMENT', clue: 'Tek tür atomdan oluşan saf madde', category: 'tyt-kim', topic: 'Madde ve Özellikleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'BİLEŞİK', clue: 'Farklı elementlerin kimyasal bağla birleşmesi', category: 'tyt-kim', topic: 'Madde ve Özellikleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'KARIŞIM', clue: 'Maddelerin fiziksel olarak bir arada bulunması', category: 'tyt-kim', topic: 'Madde ve Özellikleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'METAL', clue: 'İletken, parlak ve dövülebilir element türü', category: 'tyt-kim', topic: 'Madde ve Özellikleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'AMETAL', clue: 'Elektron almaya yatkın element türü', category: 'tyt-kim', topic: 'Madde ve Özellikleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    // Asit-Baz
    { word: 'ASİT', clue: 'Suda H+ iyonu veren madde', category: 'tyt-kim', topic: 'Asit-Baz', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'BAZ', clue: 'Suda OH- iyonu veren madde', category: 'tyt-kim', topic: 'Asit-Baz', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'TUZ', clue: 'Asit-baz tepkimesinin ürünü', category: 'tyt-kim', topic: 'Asit-Baz', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    // Kimyasal Bağlar
    { word: 'KOVALENT', clue: 'Elektron paylaşımıyla oluşan bağ', category: 'tyt-kim', topic: 'Kimyasal Bağlar', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'İYONİK', clue: 'Elektron alışverişiyle oluşan bağ', category: 'tyt-kim', topic: 'Kimyasal Bağlar', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    // Mol Kavramı
    { word: 'MOL', clue: 'Madde miktarı birimi 6.02x10²³', category: 'tyt-kim', topic: 'Mol Kavramı', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    // Atom Yapısı
    { word: 'ORBİTAL', clue: 'Elektronun bulunma olasılığının yüksek olduğu bölge', category: 'tyt-kim', topic: 'Atom Yapısı', difficulty: 3, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'ÇEKIRDEK', clue: 'Atomun merkezindeki proton ve nötronları içeren kısım', category: 'tyt-kim', topic: 'Atom Yapısı', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    // Periyodik Tablo
    { word: 'PERIYOT', clue: 'Periyodik tabloda yatay sıra', category: 'tyt-kim', topic: 'Periyodik Tablo', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'GRUP', clue: 'Periyodik tabloda dikey sütun', category: 'tyt-kim', topic: 'Periyodik Tablo', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'SOY', clue: 'Tepkimeye girmeyen gaz grubu', category: 'tyt-kim', topic: 'Periyodik Tablo', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    // Çözeltiler
    { word: 'ÇÖZELTI', clue: 'Homojen karışım', category: 'tyt-kim', topic: 'Çözeltiler', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'DERIŞIM', clue: 'Çözeltinin yoğunluk ölçüsü', category: 'tyt-kim', topic: 'Çözeltiler', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    // İyonlar
    { word: 'KATYON', clue: 'Pozitif yüklü iyon', category: 'tyt-kim', topic: 'İyonlar', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'ANYON', clue: 'Negatif yüklü iyon', category: 'tyt-kim', topic: 'İyonlar', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'OKSİT', clue: 'Oksijenle oluşan bileşik', category: 'tyt-kim', topic: 'İyonlar', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    // Redoks
    { word: 'İNDİRGENME', clue: 'Elektron kazanma olayı', category: 'tyt-kim', topic: 'Redoks', difficulty: 3, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'YÜKSELTGENME', clue: 'Elektron verme olayı', category: 'tyt-kim', topic: 'Redoks', difficulty: 3, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    // Tepkime Hızı
    { word: 'KATALİZ', clue: 'Tepkimeyi hızlandıran ama değişmeyen madde etkisi', category: 'tyt-kim', topic: 'Tepkime Hızı', difficulty: 3, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'DENGE', clue: 'İleri ve geri tepkime hızlarının eşitlenmesi', category: 'tyt-kim', topic: 'Tepkime Hızı', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    // Organik Kimya
    { word: 'ALKAN', clue: 'Tekli bağlı doymuş hidrokarbon', category: 'tyt-kim', topic: 'Organik Kimya', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'ALKEN', clue: 'Çift bağlı doymamış hidrokarbon', category: 'tyt-kim', topic: 'Organik Kimya', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'ALKİN', clue: 'Üçlü bağlı doymamış hidrokarbon', category: 'tyt-kim', topic: 'Organik Kimya', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'İZOMER', clue: 'Aynı formül farklı yapıdaki bileşikler', category: 'tyt-kim', topic: 'Organik Kimya', difficulty: 3, grade: 'TYT', lang: 'tr', frequency_score: 0.6 },
    // Hal Değişimleri
    { word: 'GAZ', clue: 'Maddenin sıkıştırılabilir hali', category: 'tyt-kim', topic: 'Hal Değişimleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'SIVI', clue: 'Kabın şeklini alan madde hali', category: 'tyt-kim', topic: 'Hal Değişimleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'KATI', clue: 'Belirli şekli ve hacmi olan madde hali', category: 'tyt-kim', topic: 'Hal Değişimleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'ERİME', clue: 'Katının sıvıya dönüşmesi', category: 'tyt-kim', topic: 'Hal Değişimleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'BUHARLAŞMA', clue: 'Sıvının gaza dönüşmesi', category: 'tyt-kim', topic: 'Hal Değişimleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'SÜBLÜM', clue: 'Katıdan doğrudan gaza geçiş', category: 'tyt-kim', topic: 'Hal Değişimleri', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.6 },
  ],
  'tyt-bio': [
    // Hücre Yapısı
    { word: 'HÜCRE', clue: 'Canlının en küçük yapısal birimi', category: 'tyt-bio', topic: 'Hücre Yapısı', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'MEMBRAN', clue: 'Hücre zarının diğer adı', category: 'tyt-bio', topic: 'Hücre Yapısı', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'ÇEKİRDEK', clue: 'Hücrenin yönetim merkezi', category: 'tyt-bio', topic: 'Hücre Yapısı', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'RİBOZOM', clue: 'Protein sentezi yapan organel', category: 'tyt-bio', topic: 'Hücre Yapısı', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'KLOROPLAST', clue: 'Fotosentez yapan organel', category: 'tyt-bio', topic: 'Hücre Yapısı', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'MİTOKONDRİ', clue: 'Enerji üreten hücre organeli', category: 'tyt-bio', topic: 'Hücre Yapısı', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'GOLGİ', clue: 'Paketleme ve salgılama yapan organel', category: 'tyt-bio', topic: 'Hücre Yapısı', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'LİZOZOM', clue: 'Hücre içi sindirim yapan organel', category: 'tyt-bio', topic: 'Hücre Yapısı', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    // Hücre Bölünmesi
    { word: 'MİTOZ', clue: 'Vücut hücrelerinin bölünme şekli', category: 'tyt-bio', topic: 'Hücre Bölünmesi', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'MAYOZ', clue: 'Üreme hücrelerinin oluşum bölünmesi', category: 'tyt-bio', topic: 'Hücre Bölünmesi', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    // Genetik
    { word: 'GEN', clue: 'Kalıtsal bilgi taşıyan DNA parçası', category: 'tyt-bio', topic: 'Genetik', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'KROMOZOM', clue: 'DNA ve proteinden oluşan yapı', category: 'tyt-bio', topic: 'Genetik', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'MUTASYON', clue: 'DNA dizisindeki kalıcı değişim', category: 'tyt-bio', topic: 'Genetik', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    // Makromoleküller
    { word: 'ENZİM', clue: 'Biyolojik katalizör protein', category: 'tyt-bio', topic: 'Makromoleküller', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'PROTEİN', clue: 'Amino asitlerden oluşan makromolekül', category: 'tyt-bio', topic: 'Makromoleküller', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    // Metabolizma
    { word: 'FOTOSENTEZ', clue: 'Işık enerjisiyle besin üretme', category: 'tyt-bio', topic: 'Metabolizma', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'SOLUNUM', clue: 'Besinin enerji üretmek için yıkılması', category: 'tyt-bio', topic: 'Metabolizma', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'OSMOZ', clue: 'Suyun yarı geçirgen zardan geçişi', category: 'tyt-bio', topic: 'Metabolizma', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    // Evrim-Ekoloji
    { word: 'EVRİM', clue: 'Canlıların zamanla değişim süreci', category: 'tyt-bio', topic: 'Evrim-Ekoloji', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'EKOSİSTEM', clue: 'Canlı ve cansız varlıkların oluşturduğu sistem', category: 'tyt-bio', topic: 'Evrim-Ekoloji', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'ADAPTASYON', clue: 'Canlının çevreye uyum sağlaması', category: 'tyt-bio', topic: 'Evrim-Ekoloji', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'TÜR', clue: 'Birbiriyle çiftleşip verimli döl veren canlılar', category: 'tyt-bio', topic: 'Evrim-Ekoloji', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'POPÜLASYON', clue: 'Aynı türün belirli alandaki bireyleri', category: 'tyt-bio', topic: 'Evrim-Ekoloji', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    // İnsan Fizyolojisi
    { word: 'BAĞIŞIKLIK', clue: 'Vücudun hastalıklara karşı savunması', category: 'tyt-bio', topic: 'İnsan Fizyolojisi', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'HORMON', clue: 'Endokrin bezlerin salgıladığı kimyasal mesajcı', category: 'tyt-bio', topic: 'İnsan Fizyolojisi', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'SİNİR', clue: 'Uyarıları ileten hücre türü', category: 'tyt-bio', topic: 'İnsan Fizyolojisi', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'KAS', clue: 'Hareketi sağlayan doku türü', category: 'tyt-bio', topic: 'İnsan Fizyolojisi', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'DAMAR', clue: 'Kanı taşıyan boru sistemi', category: 'tyt-bio', topic: 'İnsan Fizyolojisi', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'KALP', clue: 'Kanı pompalayan organ', category: 'tyt-bio', topic: 'İnsan Fizyolojisi', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'AKCİĞER', clue: 'Gaz değişimi yapan solunum organı', category: 'tyt-bio', topic: 'İnsan Fizyolojisi', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'BÖBREK', clue: 'Kanı süzerek idrarı oluşturan organ', category: 'tyt-bio', topic: 'İnsan Fizyolojisi', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'KANDENGESİ', clue: 'Vücudun iç ortamını sabit tutması', category: 'tyt-bio', topic: 'İnsan Fizyolojisi', difficulty: 3, grade: 'TYT', lang: 'tr', frequency_score: 0.6 },
    // Mikroorganizmalar
    { word: 'VİRÜS', clue: 'Zorunlu hücre içi paraziti', category: 'tyt-bio', topic: 'Mikroorganizmalar', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'BAKTERİ', clue: 'Prokaryot tek hücreli canlı', category: 'tyt-bio', topic: 'Mikroorganizmalar', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'MANTAR', clue: 'Saprofitik veya parazit ökaryot canlı', category: 'tyt-bio', topic: 'Mikroorganizmalar', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
  ],
  'tyt-tur': [
    // Sözcük Türleri
    { word: 'FİİL', clue: 'Eylem bildiren sözcük türü', category: 'tyt-tur', topic: 'Sözcük Türleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'SIFAT', clue: 'İsmi niteleyen ya da belirten sözcük', category: 'tyt-tur', topic: 'Sözcük Türleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'EDAT', clue: 'Tek başına anlamı olmayan ilgeç', category: 'tyt-tur', topic: 'Sözcük Türleri', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'BAĞLAÇ', clue: 'Cümle veya sözcükleri bağlayan söz', category: 'tyt-tur', topic: 'Sözcük Türleri', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'ÜNLEM', clue: 'Duygu bildiren sözcük türü', category: 'tyt-tur', topic: 'Sözcük Türleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'ZAMİR', clue: 'İsmin yerini tutan sözcük', category: 'tyt-tur', topic: 'Sözcük Türleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'ZARF', clue: 'Fiili eylemi niteleyen sözcük', category: 'tyt-tur', topic: 'Sözcük Türleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    // Cümle Ögeleri
    { word: 'ÖZNE', clue: 'Yüklemi yapan veya olan öge', category: 'tyt-tur', topic: 'Cümle Ögeleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'YÜKLEM', clue: 'Cümlenin temel ögesi, eylemi bildirir', category: 'tyt-tur', topic: 'Cümle Ögeleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'NESNE', clue: 'Fiilden etkilenen öge', category: 'tyt-tur', topic: 'Cümle Ögeleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    // Söz Sanatları
    { word: 'MECAZ', clue: 'Sözcüğün gerçek anlamı dışında kullanılması', category: 'tyt-tur', topic: 'Söz Sanatları', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'TEŞBIH', clue: 'Benzetme sanatı', category: 'tyt-tur', topic: 'Söz Sanatları', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'İSTİARE', clue: 'Açık veya kapalı benzetme sanatı', category: 'tyt-tur', topic: 'Söz Sanatları', difficulty: 3, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'KİNAYE', clue: 'Bir sözü hem gerçek hem mecaz anlamda kullanma', category: 'tyt-tur', topic: 'Söz Sanatları', difficulty: 3, grade: 'TYT', lang: 'tr', frequency_score: 0.6 },
    // Paragraf
    { word: 'PARAGRAF', clue: 'Bir düşünce etrafında oluşan yazı birimi', category: 'tyt-tur', topic: 'Paragraf', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'ANLATIM', clue: 'Düşüncelerin söz veya yazıyla aktarılması', category: 'tyt-tur', topic: 'Paragraf', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    // Ses Bilgisi
    { word: 'SÖZCÜK', clue: 'Anlamlı ses birliği', category: 'tyt-tur', topic: 'Ses Bilgisi', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'HECE', clue: 'Sözcüğün ses birimleri', category: 'tyt-tur', topic: 'Ses Bilgisi', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'ÜNLÜ', clue: 'Sesli harf (a, e, ı, i, o, ö, u, ü)', category: 'tyt-tur', topic: 'Ses Bilgisi', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'ÜNSÜZ', clue: 'Sessiz harf', category: 'tyt-tur', topic: 'Ses Bilgisi', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    // Ekler
    { word: 'YAPIM', clue: 'Sözcüğe yeni anlam katan ek türü', category: 'tyt-tur', topic: 'Ekler', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'ÇEKİM', clue: 'Sözcüğü cümleye bağlayan ek türü', category: 'tyt-tur', topic: 'Ekler', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    // Edebiyat Türleri
    { word: 'ROMAN', clue: 'Uzun anlatı türü', category: 'tyt-tur', topic: 'Edebiyat Türleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'HİKAYE', clue: 'Kısa öykü türü', category: 'tyt-tur', topic: 'Edebiyat Türleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'MASAL', clue: 'Olağanüstü olayların anlatıldığı halk edebiyatı türü', category: 'tyt-tur', topic: 'Edebiyat Türleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'DESTAN', clue: 'Kahramanlık konulu uzun manzum eser', category: 'tyt-tur', topic: 'Edebiyat Türleri', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'MAKALE', clue: 'Bir düşünceyi kanıtlayan yazı türü', category: 'tyt-tur', topic: 'Edebiyat Türleri', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'DENEME', clue: 'Kişisel düşünce yazısı', category: 'tyt-tur', topic: 'Edebiyat Türleri', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'FIKRA', clue: 'Kısa güldürücü anlatı veya köşe yazısı', category: 'tyt-tur', topic: 'Edebiyat Türleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'SÖYLEV', clue: 'Topluluk önünde yapılan konuşma', category: 'tyt-tur', topic: 'Edebiyat Türleri', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.6 },
    // Divan Edebiyatı
    { word: 'GAZEL', clue: 'Divan edebiyatında aşk şiiri türü', category: 'tyt-tur', topic: 'Divan Edebiyatı', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.6 },
    { word: 'KASİDE', clue: 'Övgü amaçlı yazılan divan şiiri', category: 'tyt-tur', topic: 'Divan Edebiyatı', difficulty: 3, grade: 'TYT', lang: 'tr', frequency_score: 0.6 },
    { word: 'RUBAI', clue: 'Dört mısralık nazım biçimi', category: 'tyt-tur', topic: 'Divan Edebiyatı', difficulty: 3, grade: 'TYT', lang: 'tr', frequency_score: 0.6 },
    // Şiir Bilgisi
    { word: 'REDIF', clue: 'Şiirde kafiyeden sonra tekrarlanan kısım', category: 'tyt-tur', topic: 'Şiir Bilgisi', difficulty: 3, grade: 'TYT', lang: 'tr', frequency_score: 0.6 },
    { word: 'KAFİYE', clue: 'Şiirde mısra sonlarındaki ses benzerliği', category: 'tyt-tur', topic: 'Şiir Bilgisi', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
  ],
  'tyt-tar': [
    // İlk Türk Devletleri
    { word: 'HAKAN', clue: 'Türk devletlerinde hükümdar unvanı', category: 'tyt-tar', topic: 'İlk Türk Devletleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'KURULTAY', clue: 'Türklerde devlet meclisi', category: 'tyt-tar', topic: 'İlk Türk Devletleri', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'GÖKTÜRK', clue: 'İlk Türk alfabesini kullanan devlet', category: 'tyt-tar', topic: 'İlk Türk Devletleri', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'SELÇUKLU', clue: 'Anadoluyu Türkleştiren büyük devlet', category: 'tyt-tar', topic: 'İlk Türk Devletleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    // Osmanlı
    { word: 'SULTAN', clue: 'Osmanlıda devlet başkanı unvanı', category: 'tyt-tar', topic: 'Osmanlı', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'FETİH', clue: 'Bir yerin savaşla alınması', category: 'tyt-tar', topic: 'Osmanlı', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'FERMAN', clue: 'Padişahın resmi yazılı emri', category: 'tyt-tar', topic: 'Osmanlı', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'DİVAN', clue: 'Osmanlıda yüksek devlet kurulu', category: 'tyt-tar', topic: 'Osmanlı', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'TIMAR', clue: 'Osmanlıda toprak vergi sistemi', category: 'tyt-tar', topic: 'Osmanlı', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'LONCA', clue: 'Esnaf ve zanaatkar birliği', category: 'tyt-tar', topic: 'Osmanlı', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'MEDRESE', clue: 'Osmanlıda eğitim kurumu', category: 'tyt-tar', topic: 'Osmanlı', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'YENİÇERİ', clue: 'Osmanlının piyade askeri ocağı', category: 'tyt-tar', topic: 'Osmanlı', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'HİLAFET', clue: 'İslam dünyasının ruhani liderliği', category: 'tyt-tar', topic: 'Osmanlı', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'HALIFELIK', clue: 'İslam toplumunun dini liderliği kurumu', category: 'tyt-tar', topic: 'Osmanlı', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.6 },
    // Reform Dönemi
    { word: 'TANZIMAT', clue: '1839 reform fermanı dönemi', category: 'tyt-tar', topic: 'Reform Dönemi', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'MEŞRUTİYET', clue: 'Anayasal monarşi sistemi', category: 'tyt-tar', topic: 'Reform Dönemi', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'REFORM', clue: 'Düzeltme amaçlı yapılan değişiklik', category: 'tyt-tar', topic: 'Reform Dönemi', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    // Kurtuluş Savaşı
    { word: 'MÜDAFAA', clue: 'Savunma, milli mücadele terimi', category: 'tyt-tar', topic: 'Kurtuluş Savaşı', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'MİSAK', clue: 'Ulusal ant, Misak-ı Milli', category: 'tyt-tar', topic: 'Kurtuluş Savaşı', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'ATATÜRK', clue: 'Cumhuriyetin kurucusu', category: 'tyt-tar', topic: 'Kurtuluş Savaşı', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'LOZAN', clue: 'Türkiye Cumhuriyetini tanıtan barış antlaşması', category: 'tyt-tar', topic: 'Kurtuluş Savaşı', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    // Cumhuriyet Dönemi
    { word: 'CUMHURİYET', clue: 'Halkın egemenliğine dayanan yönetim', category: 'tyt-tar', topic: 'Cumhuriyet Dönemi', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'İNKILAP', clue: 'Köklü değişim ve devrim', category: 'tyt-tar', topic: 'Cumhuriyet Dönemi', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'LAİKLİK', clue: 'Din ve devlet işlerinin ayrılması', category: 'tyt-tar', topic: 'Cumhuriyet Dönemi', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    // Genel Kavramlar
    { word: 'SAVAŞ', clue: 'Silahlı çatışma', category: 'tyt-tar', topic: 'Genel Kavramlar', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'BARIŞ', clue: 'Savaşın sona ermesi', category: 'tyt-tar', topic: 'Genel Kavramlar', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'ANTLAŞMA', clue: 'İki taraf arasında imzalanan sözleşme', category: 'tyt-tar', topic: 'Genel Kavramlar', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'DARBE', clue: 'Askeri müdahale ile yönetim değişikliği', category: 'tyt-tar', topic: 'Genel Kavramlar', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'VATAN', clue: 'Milletin üzerinde yaşadığı toprak', category: 'tyt-tar', topic: 'Genel Kavramlar', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'MİLLET', clue: 'Ortak kültür ve tarihi paylaşan topluluk', category: 'tyt-tar', topic: 'Genel Kavramlar', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
  ],
  'tyt-cog': [
    // İklim
    { word: 'İKLİM', clue: 'Uzun yıllar boyunca gözlenen hava koşulları', category: 'tyt-cog', topic: 'İklim', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'RÜZGAR', clue: 'Havanın yatay hareketi', category: 'tyt-cog', topic: 'İklim', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'YAGIŞ', clue: 'Atmosferden düşen su', category: 'tyt-cog', topic: 'İklim', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    // Harita Bilgisi
    { word: 'HARİTA', clue: 'Yeryüzünün küçültülmüş çizimi', category: 'tyt-cog', topic: 'Harita Bilgisi', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'ENLEM', clue: 'Ekvatora olan paralellik derecesi', category: 'tyt-cog', topic: 'Harita Bilgisi', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'BOYLAM', clue: 'Greenwich meridyenine olan uzaklık derecesi', category: 'tyt-cog', topic: 'Harita Bilgisi', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    // Yer Şekilleri
    { word: 'VOLKAN', clue: 'Magmanın yeryüzüne çıktığı dağ', category: 'tyt-cog', topic: 'Yer Şekilleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'DEPREM', clue: 'Yer kabuğundaki kırılma sonucu sarsıntı', category: 'tyt-cog', topic: 'Yer Şekilleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'EROZYON', clue: 'Toprak aşınması', category: 'tyt-cog', topic: 'Yer Şekilleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'PLATO', clue: 'Yüksek düzlük arazi', category: 'tyt-cog', topic: 'Yer Şekilleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'OVA', clue: 'Alçak ve düz arazi', category: 'tyt-cog', topic: 'Yer Şekilleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'VADI', clue: 'İki dağ arasındaki çukur alan', category: 'tyt-cog', topic: 'Yer Şekilleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'DELTA', clue: 'Akarsuyun denize döküldüğü yerde oluşan alan', category: 'tyt-cog', topic: 'Yer Şekilleri', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    // Su Kaynakları
    { word: 'AKARSU', clue: 'Sürekli akan doğal su yolu', category: 'tyt-cog', topic: 'Su Kaynakları', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'GÖL', clue: 'Kara ile çevrili durgun su kütlesi', category: 'tyt-cog', topic: 'Su Kaynakları', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'OKYANUS', clue: 'Kıtalar arasındaki büyük su kütlesi', category: 'tyt-cog', topic: 'Su Kaynakları', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    // Kara Şekilleri
    { word: 'KITA', clue: 'Büyük kara parçası', category: 'tyt-cog', topic: 'Kara Şekilleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'ADA', clue: 'Dört tarafı suyla çevrili kara parçası', category: 'tyt-cog', topic: 'Kara Şekilleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'YARIMADA', clue: 'Üç tarafı suyla çevrili kara parçası', category: 'tyt-cog', topic: 'Kara Şekilleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'BOĞAZ', clue: 'İki kara arasındaki dar su geçidi', category: 'tyt-cog', topic: 'Kara Şekilleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'KÖRFEZ', clue: 'Denizin karaya doğru sokulduğu alan', category: 'tyt-cog', topic: 'Kara Şekilleri', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    // Biyocoğrafya
    { word: 'FLORA', clue: 'Bir bölgedeki bitki örtüsü', category: 'tyt-cog', topic: 'Biyocoğrafya', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'FAUNA', clue: 'Bir bölgedeki hayvan topluluğu', category: 'tyt-cog', topic: 'Biyocoğrafya', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    // Nüfus-Ekonomi
    { word: 'NÜFUS', clue: 'Bir yerde yaşayan insan sayısı', category: 'tyt-cog', topic: 'Nüfus-Ekonomi', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'GÖÇ', clue: 'İnsan topluluklarının yer değiştirmesi', category: 'tyt-cog', topic: 'Nüfus-Ekonomi', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'KENT', clue: 'Büyük ve gelişmiş yerleşim yeri', category: 'tyt-cog', topic: 'Nüfus-Ekonomi', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'SEKTÖR', clue: 'Ekonomik faaliyet alanı', category: 'tyt-cog', topic: 'Nüfus-Ekonomi', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'İHRACAT', clue: 'Dış satım, ürünlerin yurt dışına satılması', category: 'tyt-cog', topic: 'Nüfus-Ekonomi', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'İTHALAT', clue: 'Dış alım, ürünlerin yurt dışından alınması', category: 'tyt-cog', topic: 'Nüfus-Ekonomi', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'MADEN', clue: 'Yeraltından çıkarılan değerli kaynak', category: 'tyt-cog', topic: 'Nüfus-Ekonomi', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'TARIM', clue: 'Topraktan ürün yetiştirme faaliyeti', category: 'tyt-cog', topic: 'Nüfus-Ekonomi', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
  ],
  'tyt-fel': [
    // Felsefenin Alanları
    { word: 'FELSEFE', clue: 'Bilgelik sevgisi, düşünce bilimi', category: 'tyt-fel', topic: 'Felsefenin Alanları', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'VARLIK', clue: 'Var olanın genel adı, ontolojinin konusu', category: 'tyt-fel', topic: 'Felsefenin Alanları', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'BİLGİ', clue: 'Epistemolojinin temel konusu', category: 'tyt-fel', topic: 'Felsefenin Alanları', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'DEĞER', clue: 'Aksiyolojinin temel kavramı', category: 'tyt-fel', topic: 'Felsefenin Alanları', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    // Ahlak Felsefesi
    { word: 'AHLAK', clue: 'İyi ve kötü davranışları inceleyen alan', category: 'tyt-fel', topic: 'Ahlak Felsefesi', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'ERDEM', clue: 'İyi ahlaklı olma durumu', category: 'tyt-fel', topic: 'Ahlak Felsefesi', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'ETİK', clue: 'Ahlak felsefesinin diğer adı', category: 'tyt-fel', topic: 'Ahlak Felsefesi', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'ADALET', clue: 'Hakka uygun davranma ilkesi', category: 'tyt-fel', topic: 'Ahlak Felsefesi', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    // Estetik
    { word: 'ESTETİK', clue: 'Güzellik felsefesi', category: 'tyt-fel', topic: 'Estetik', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'SANAT', clue: 'Yaratıcı ifade ve estetik üretim', category: 'tyt-fel', topic: 'Estetik', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    // Mantık
    { word: 'MANTIK', clue: 'Doğru düşünmenin kurallarını inceleyen bilim', category: 'tyt-fel', topic: 'Mantık', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'TÜMEVARIM', clue: 'Özelden genele giden akıl yürütme', category: 'tyt-fel', topic: 'Mantık', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'TÜMDENGELİM', clue: 'Genelden özele giden akıl yürütme', category: 'tyt-fel', topic: 'Mantık', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'ÖNERME', clue: 'Doğru ya da yanlış olan yargı', category: 'tyt-fel', topic: 'Mantık', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'KIYAS', clue: 'İki önermeden sonuç çıkarma', category: 'tyt-fel', topic: 'Mantık', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'DOĞRULUK', clue: 'Bir önermenin gerçeğe uygunluğu', category: 'tyt-fel', topic: 'Mantık', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    // Filozoflar
    { word: 'SOKRATES', clue: 'Sorgulamayı öğreten Antik Yunan filozofu', category: 'tyt-fel', topic: 'Filozoflar', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'PLATON', clue: 'İdealar kuramını ortaya atan düşünür', category: 'tyt-fel', topic: 'Filozoflar', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'ARİSTO', clue: 'Mantığın kurucusu sayılan düşünür', category: 'tyt-fel', topic: 'Filozoflar', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'İDEA', clue: 'Platonun gerçek varlık olarak gördüğü kavram', category: 'tyt-fel', topic: 'Filozoflar', difficulty: 3, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    // Siyaset Felsefesi
    { word: 'ÖZGÜRLÜK', clue: 'Bireyin kendi kararlarını verebilme hakkı', category: 'tyt-fel', topic: 'Siyaset Felsefesi', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'DEVLET', clue: 'Siyaset felsefesinin temel kavramı', category: 'tyt-fel', topic: 'Siyaset Felsefesi', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.9 },
    { word: 'ÜTOPYA', clue: 'Gerçekleşmesi zor ideal toplum düzeni', category: 'tyt-fel', topic: 'Siyaset Felsefesi', difficulty: 3, grade: 'TYT', lang: 'tr', frequency_score: 0.6 },
    // Bilim Felsefesi
    { word: 'DENEY', clue: 'Bilimde gözlem ve test yöntemi', category: 'tyt-fel', topic: 'Bilim Felsefesi', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
    { word: 'HİPOTEZ', clue: 'Henüz kanıtlanmamış bilimsel varsayım', category: 'tyt-fel', topic: 'Bilim Felsefesi', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'TEORİ', clue: 'Kanıtlarla desteklenen bilimsel açıklama', category: 'tyt-fel', topic: 'Bilim Felsefesi', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.7 },
    { word: 'SEZGI', clue: 'Akıl yürütmeden doğrudan kavrama', category: 'tyt-fel', topic: 'Bilim Felsefesi', difficulty: 2, grade: 'TYT', lang: 'tr', frequency_score: 0.6 },
    // Felsefi Akımlar
    { word: 'NİHİLİZM', clue: 'Hiçbir değerin anlam taşımadığını savunan akım', category: 'tyt-fel', topic: 'Felsefi Akımlar', difficulty: 3, grade: 'TYT', lang: 'tr', frequency_score: 0.5 },
    { word: 'EMPİRİZM', clue: 'Bilginin kaynağının deney olduğunu savunan görüş', category: 'tyt-fel', topic: 'Felsefi Akımlar', difficulty: 3, grade: 'TYT', lang: 'tr', frequency_score: 0.6 },
    // Din Felsefesi
    { word: 'DİN', clue: 'İnanç ve ibadet sistemi', category: 'tyt-fel', topic: 'Din Felsefesi', difficulty: 1, grade: 'TYT', lang: 'tr', frequency_score: 0.8 },
  ],
};
