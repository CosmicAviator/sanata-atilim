import { useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// ✅ KRİTİK DÜZELTME: KATEGORİLER BURADA TANIMLI OLMALIDIR
const CATEGORIES = ['Hepsi', 'Sinema', 'Mitoloji', 'Edebiyat', 'Sanat']; 

const CreatePost = ({ onPostCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1]); // İlk kategoriyi seçili getiriyoruz (Hepsi hariç)
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Yazar bilgileri
  const [authorName, setAuthorName] = useState('');
  const [authorStatus, setAuthorStatus] = useState(''); 

  const navigate = useNavigate();
  const isMobile = window.innerWidth < 768;
  
  // Hepsi hariç kategorileri kullan
  const categories = useMemo(() => CATEGORIES.slice(1), []); 

  // --- Görsel Yükleme Fonksiyonu ---
  const uploadImage = async (selectedFile) => {
    setUploading(true);
    const fileName = `${Date.now()}-${selectedFile.name}`;
    try {
      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(`blog-images/${fileName}`, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;
      
      const { data: publicUrlData } = supabase.storage
        .from('blog-images')
        .getPublicUrl(data.path);

      setUploading(false);
      return publicUrlData.publicUrl;

    } catch (error) {
      console.error('Görsel yükleme hatası:', error.message);
      setUploading(false);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content || !category) {
      setError('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }
    
    // Varsayılan kategoriyi seçili tut
    if (category === 'Hepsi') {
         setError('Lütfen geçerli bir kategori seçin.');
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
          author_name: authorName || 'Anonim Küratör',
          author_status: authorStatus || 'Sanata Atılım Topluluğu',
        });

      if (dbError) throw dbError;

      onPostCreated();
      navigate('/'); 

    } catch (err) {
      console.error('Yazı yayınlama hatası:', err.message);
      setError('Yazı yayınlanırken bir sorun oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Style Tanımları (Görünüm tutarlılığı için) ---
  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
  };
  
  const inputStyle = {
    width: '100%',
    padding: '12px 15px',
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '5px',
    color: '#f0f0e0',
    fontSize: '1rem',
    boxSizing: 'border-box',
    marginTop: '5px',
    fontFamily: 'sans-serif'
  };
  
  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    color: '#ccc',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    fontFamily: 'sans-serif'
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
        color: '#f0f0e0',
        paddingTop: isMobile ? '120px' : '150px' 
      }}
    >
      <h2 style={{ 
        fontFamily: '"Times New Roman", serif', 
        borderBottom: '2px solid #d4af37', 
        paddingBottom: '10px', 
        marginBottom: '40px', 
        fontSize: isMobile ? '2rem' : '2.5rem',
        color: '#d4af37'
      }}>
        Yeni Yazı Oluştur
      </h2>
      
      {error && (
        <p style={{ color: '#f44336', background: '#f4433620', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} style={formStyle}>
        
        {/* Başlık Alanı */}
        <div style={{ marginBottom: '25px' }}>
          <label style={labelStyle}>
            Yazı Başlığı (Zorunlu)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Makalenizin başlığı..."
            style={inputStyle}
          />
        </div>

        {/* Kategori ve Görsel Yükleme Bölümü */}
        <div style={{ 
          display: 'flex', 
          gap: isMobile ? '0' : '20px', 
          marginBottom: '25px',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          {/* Kategori Seçimi */}
          <div style={{ flex: 1, marginBottom: isMobile ? '20px' : '0' }}>
            <label style={labelStyle}>
              Kategori Seç (Zorunlu)
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{...inputStyle, height: '44px'}}
            >
              <option value="Hepsi" disabled>--- Seçiniz ---</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Görsel Yükleme */}
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>
              Kapak Görseli (Opsiyonel)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              style={{...inputStyle, padding: '8px 15px'}} // dosya inputu stili
            />
          </div>
        </div>

        {/* YAZAR BİLGİLERİ */}
        <div style={{ 
          display: 'flex', 
          gap: isMobile ? '0' : '20px', 
          marginBottom: '25px',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          {/* Yazar Adı */}
          <div style={{ flex: 1, marginBottom: isMobile ? '20px' : '0' }}>
            <label style={labelStyle}>
              Yazar Adı (Opsiyonel)
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

        {/* İçerik Alanı */}
        <div style={{ marginBottom: '30px' }}>
          <label style={labelStyle}>
            İçerik (HTML İçerebilir) (Zorunlu)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Buraya makalenin HTML içeriğini yapıştırın..."
            rows="15"
            style={{...inputStyle, resize: 'vertical', fontFamily: 'monospace', lineHeight: 1.5}}
          />
        </div>

        {/* Yayınla Butonu */}
        <button
          type="submit"
          disabled={submitting || uploading}
          style={{
            padding: '15px 30px',
            background: '#d4af37',
            color: '#0a0a0a',
            border: 'none',
            borderRadius: '5px',
            cursor: (submitting || uploading) ? 'not-allowed' : 'pointer',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            transition: 'all 0.3s',
            opacity: (submitting || uploading) ? 0.7 : 1
          }}
          onMouseOver={(e) => {
            if (!(submitting || uploading)) e.target.style.background = '#e6bf6a';
          }}
          onMouseOut={(e) => {
            if (!(submitting || uploading)) e.target.style.background = '#d4af37';
          }}
        >
          {submitting ? 'Yayınlanıyor...' : uploading ? 'Görsel Yükleniyor...' : 'Eseri Yayınla'}
        </button>

      </form>
    </motion.div>
  );
};

export default CreatePost;