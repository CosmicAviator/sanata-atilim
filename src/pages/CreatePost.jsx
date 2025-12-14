import { useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// ... (KATEGORİLER aynı kaldı)

const CreatePost = ({ onPostCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 🔥 YENİ EKLENTİLER: Yazar bilgileri
  const [authorName, setAuthorName] = useState('');
  const [authorStatus, setAuthorStatus] = useState(''); // Örneğin: 'Boğaziçi Felsefe', 'Topluluk Üyesi'

  const navigate = useNavigate();
  const isMobile = window.innerWidth < 768;
  const categories = useMemo(() => CATEGORIES.slice(1), []); // Hepsi hariç

  // ... (Görsel Yükleme Fonksiyonu uploadImage aynı kaldı)

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content || !category) {
      setError('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    setSubmitting(true);
    setError(null);
    let imageUrl = null;

    if (file) {
      imageUrl = await uploadImage(file);
      if (!imageUrl) {
        setSubmitting(false);
        setError('Görsel yüklenirken bir hata oluştu.');
        return;
      }
    }

    try {
      const { error: dbError } = await supabase
        .from('posts')
        .insert({
          title,
          content,
          category,
          image_url: imageUrl,
          // 🔥 VERİTABANI GÜNCELLEMESİ: Yeni alanlar eklendi
          author_name: authorName || 'Anonim Küratör', // Eğer boşsa varsayılan isim
          author_status: authorStatus || 'Sanata Atılım Topluluğu', // Eğer boşsa varsayılan statü
        });

      if (dbError) throw dbError;

      onPostCreated(); // Ana sayfadaki listeyi yenile
      navigate('/'); // Ana sayfaya yönlendir

    } catch (err) {
      console.error('Yazı yayınlama hatası:', err.message);
      setError('Yazı yayınlanırken bir sorun oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  const formStyle = { 
    // ... (stiller aynı) ... 
  };
  
  const inputStyle = { 
    // ... (stiller aynı) ... 
  };
  
  const labelStyle = { 
    // ... (stiller aynı) ... 
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      style={{
        maxWidth: isMobile ? '100%' : '800px',
        margin: '0 auto',
        padding: isMobile ? '40px 20px' : '80px 40px',
        color: '#f0f0e0'
      }}
    >
      <h2 style={{ /* ... (başlık stili aynı) ... */ }}>
        Yeni Yazı Oluştur
      </h2>
      
      {/* ... (Hata Mesajı aynı) ... */}

      <form onSubmit={handleSubmit} style={formStyle}>
        
        {/* Başlık Alanı (Aynı Kaldı) */}
        <div style={{ marginBottom: '25px' }}>
          {/* ... (Başlık kodu aynı) ... */}
        </div>

        {/* Kategori ve Görsel Yükleme Bölümü (Aynı Kaldı) */}
        <div style={{ /* ... (stiller aynı) ... */ }}>
          {/* ... (Kategori Kodu aynı) ... */}
          {/* ... (Görsel Kodu aynı) ... */}
        </div>

        {/* 🔥 YENİ EKLENTİ: YAZAR BİLGİLERİ */}
        <div style={{ 
          display: 'flex', 
          gap: isMobile ? '0' : '20px', 
          marginBottom: '25px',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          {/* Yazar Adı */}
          <div style={{ flex: 1, marginBottom: isMobile ? '20px' : '0' }}>
            <label style={labelStyle}>
              Yazar Adı (Zorunlu Değil)
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Ad Soyad"
              style={inputStyle}
            />
          </div>

          {/* Yazar Statüsü / Bölümü */}
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>
              Bölüm/Statü (Opsiyonel)
            </label>
            <input
              type="text"
              value={authorStatus}
              onChange={(e) => setAuthorStatus(e.target.value)}
              placeholder="Örn: Boğaziçi Felsefe, Topluluk Üyesi"
              style={inputStyle}
            />
          </div>
        </div>

        {/* İçerik Alanı (Aynı Kaldı) */}
        <div style={{ marginBottom: '30px' }}>
          {/* ... (Content Kodu aynı) ... */}
        </div>

        {/* Yayınla Butonu (Aynı Kaldı) */}
        <button
          type="submit"
          disabled={submitting || uploading}
          style={{ /* ... (buton stili aynı) ... */ }}
        >
          {submitting ? 'Yayınlanıyor...' : 'Eseri Yayınla'}
        </button>

      </form>
    </motion.div>
  );
};

export default CreatePost;