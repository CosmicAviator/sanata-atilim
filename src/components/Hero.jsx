import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// --- YEDEK ESER (API tamamen çökerse bu görünür) ---
const fallbackArt = {
  image: "https://upload.wikimedia.org/wikipedia/commons/8/8c/David_-_The_Death_of_Socrates.jpg",
  title: "The Death of Socrates",
  artist: "Jacques-Louis David"
};

// --- YEDEK SÖZLER ---
const fallbackQuotes = [
  { content: "Art is the lie that enables us to realize the truth.", author: "Pablo Picasso" },
  { content: "Creativity takes courage.", author: "Henri Matisse" },
  { content: "Every artist was first an amateur.", author: "Ralph Waldo Emerson" }
];

const Hero = () => {
  const [artWork, setArtWork] = useState(null);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- ESER ÇEKME FONKSİYONU ---
  const fetchValidArt = async (retryCount = 0) => {
    // 5 kere denedik hala bulamadıysak yedeği göster
    if (retryCount > 5) {
      setArtWork(fallbackArt);
      setLoading(false);
      return;
    }

    try {
      // 1. ADIM: Avrupa Resim Sanatı (Dept 11) ve 'Painting' araması yap
      const searchRes = await fetch('https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&departmentId=11&q=painting');
      const searchData = await searchRes.json();

      if (!searchData.objectIDs || searchData.objectIDs.length === 0) throw new Error("Liste boş");

      // 2. ADIM: Listeden rastgele bir ID seç
      const randomIndex = Math.floor(Math.random() * searchData.objectIDs.length);
      const objectID = searchData.objectIDs[randomIndex];

      // 3. ADIM: Detayları çek
      const detailRes = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectID}`);
      const detail = await detailRes.json();

      // 4. ADIM: Resim var mı kontrol et (primaryImageSmall daha hızlıdır)
      const imageSrc = detail.primaryImageSmall || detail.primaryImage;

      if (imageSrc) {
        // Resim bulundu! State'i güncelle.
        setArtWork({
          image: imageSrc,
          title: detail.title || "Untitled",
          artist: detail.artistDisplayName || "Unknown Artist"
        });
        setLoading(false);
      } else {
        // ID var ama resmi yokmuş, tekrar dene!
        console.log("Resimsiz eser denk geldi, tekrar deneniyor...");
        fetchValidArt(retryCount + 1);
      }

    } catch (error) {
      console.error("API Hatası:", error);
      fetchValidArt(retryCount + 1);
    }
  };

  useEffect(() => {
    // Eser aramayı başlat
    fetchValidArt();

    // Söz çekme (Quotable API)
    fetch('https://api.quotable.io/random?tags=art|philosophy|wisdom')
      .then(res => res.json())
      .then(data => setQuote({ content: data.content, author: data.author }))
      .catch(() => {
        const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        setQuote(randomQuote);
      });
      
  }, []);

  // Ekrana basılacak verileri belirle
  const activeArt = artWork || fallbackArt;
  const activeQuote = quote || fallbackQuotes[0];

  return (
    <div style={{ 
      height: '80vh', 
      position: 'relative', 
      overflow: 'hidden', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      color: '#f0f0e0',
      backgroundColor: '#050505' 
    }}>
      
      {/* --- ARKA PLAN RESMİ --- */}
      {/* Framer motion yerine düz img kullanıyoruz ki yükleme sorunu olmasın */}
      <img 
        src={activeArt.image} 
        alt={activeArt.title} 
        style={{ 
          position: 'absolute',
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover', 
          zIndex: 0, // En arkada
          filter: 'brightness(0.4) contrast(1.1)' 
        }}
        // Eğer resim yüklenirken hata verirse (kırık link), anında yedeğe dön
        onError={(e) => { 
          e.target.onerror = null; 
          e.target.src = fallbackArt.image; 
        }}
      />

      {/* --- İÇERİK --- */}
      <div style={{ textAlign: 'center', maxWidth: '800px', padding: '0 20px', zIndex: 10, position: 'relative' }}>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ 
            fontSize: '4rem', 
            margin: '0 0 20px 0', 
            fontFamily: '"Times New Roman", serif', 
            fontWeight: '100',
            letterSpacing: '5px',
            textShadow: '0 4px 20px rgba(0,0,0,1)'
          }}
        >
          SANATIN İZİNDE
        </motion.h1>

        <div style={{ width: '100px', height: '1px', background: '#d4af37', margin: '0 auto 40px auto' }}></div>

        {/* Yükleniyor yazısı veya Söz */}
        <div style={{ minHeight: '100px' }}>
          {loading ? (
             <p style={{ color: '#888', fontStyle: 'italic', fontSize: '0.9rem' }}>Küratör eser seçiyor...</p>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
              <p style={{ fontSize: '1.5rem', fontStyle: 'italic', fontFamily: '"Times New Roman", serif', color: '#ccc', marginBottom: '15px' }}>
                "{activeQuote.content}"
              </p>
              <span style={{ fontSize: '0.9rem', letterSpacing: '2px', color: '#d4af37', textTransform: 'uppercase' }}>
                — {activeQuote.author}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* --- SAĞ ALT KÜNYE --- */}
      {!loading && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.5 }}
          style={{ position: 'absolute', bottom: '30px', right: '40px', textAlign: 'right', opacity: 0.8, zIndex: 10 }}
        >
          <p style={{ fontSize: '0.9rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', margin: 0, fontWeight: 'bold', textShadow: '0 2px 4px #000' }}>
            {activeArt.title}
          </p>
          <p style={{ fontSize: '0.8rem', color: '#d4af37', fontFamily: 'serif', fontStyle: 'italic', margin: '5px 0 0 0', textShadow: '0 2px 4px #000' }}>
            {activeArt.artist}
          </p>
        </motion.div>
      )}

    </div>
  );
};

export default Hero;