import { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PostManager from '../components/PostManager';

// Yeni, sanatsal kategori listesi
const CATEGORIES = [
  { value: 'Sinema', label: '🎬 Sinema' },
  { value: 'Mitoloji', label: '🔱 Mitoloji' },
  { value: 'Edebiyat', label: '📚 Edebiyat' },
  { value: 'Sanat', label: '🎨 Sanat' },
];

const CreatePost = () => {
  const [title, setTitle] = useState('');
  // Başlangıç kategorisi olarak Sinema varsayalım
  const [category, setCategory] = useState(CATEGORIES[0].value); 
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const editorRef = useRef(null);
  const navigate = useNavigate();

  // Toolbar stili (Artık daha sade ve şık)
  const toolbarBtnStyle = {
    background: 'none',
    color: '#0a0a0a',
    border: 'none',
    padding: '6px 10px',
    cursor: 'pointer',
    borderRadius: '4px',
    fontWeight: 'normal',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  };

  const formatDoc = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    editorRef.current.focus();
  };

  // --- Fonksiyonlar (Aynı Bırakıldı) ---
  const handleImageChange = (e) => {
    // ... Görsel yükleme ve validasyon mantığı aynı ...
    const file = e.target.files[0];
    if (!file) { setImageFile(null); setImagePreview(null); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Görsel boyutu maksimum 5MB olabilir'); e.target.value = ''; return; }
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validFormats.includes(file.type)) { setError('Sadece JPG, PNG, WebP ve GIF formatları desteklenir'); e.target.value = ''; return; }

    setImageFile(file);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => { setImagePreview(reader.result); };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    // ... Validasyon mantığı aynı ...
    if (!title.trim()) { setError('❌ Başlık alanı zorunludur'); return false; }
    if (title.length < 3 || title.length > 200) { setError('❌ Başlık 3-200 karakter arasında olmalıdır'); return false; }
    const content = editorRef.current.innerHTML.trim();
    if (!content || content.length < 50) { setError('❌ İçerik çok kısa (minimum 50 karakter) veya boş'); return false; }
    if (!imageFile && !window.confirm('⚠️ Kapak görseli seçmediniz. Görselsiz devam etmek istiyor musunuz?')) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const content = editorRef.current.innerHTML;
      let finalImageUrl = '';

      // 1. RESİM YÜKLEME
      if (imageFile) {
        // ... Supabase görsel yükleme mantığı aynı ...
        try {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `blog-images/${fileName}`; 

            const { error: uploadError } = await supabase.storage
              .from('blog-images')
              .upload(filePath, imageFile, {
                cacheControl: '3600',
                upsert: false
              });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
              .from('blog-images')
              .getPublicUrl(filePath);

            finalImageUrl = publicUrl;

          } catch (uploadErr) {
            throw new Error(`Görsel yüklenemedi: ${uploadErr.message}`);
          }
      }

      // 2. VERİTABANINA KAYDETME
      const { error: dbError } = await supabase
        .from('posts')
        .insert([{
          title: title.trim(),
          content: content,
          image_url: finalImageUrl || null,
          category: category,
          created_at: new Date().toISOString()
        }])
        .select(); 

      if (dbError) throw dbError;

      setSuccess(true);
      
      // Formu temizle
      setTitle('');
      setCategory(CATEGORIES[0].value);
      setImageFile(null);
      setImagePreview(null);
      editorRef.current.innerHTML = '';

      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (err) {
      setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    // ... Temizleme mantığı aynı ...
    if (!window.confirm('🗑️ Formu temizlemek istediğinizden emin misiniz?')) return;
    setTitle('');
    setCategory(CATEGORIES[0].value);
    setImageFile(null);
    setImagePreview(null);
    setError(null);
    setSuccess(false);
    editorRef.current.innerHTML = '';
  };
  // ------------------------------------

  return (
    <div style={{ 
      padding: '60px 20px', 
      maxWidth: '1000px', // Daha geniş çalışma alanı
      margin: '0 auto', 
      color: '#f0f0e0', 
      minHeight: '100vh',
      background: '#0a0a0a' // Arka planı koru
    }}>
      
      {/* BAŞLIK */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 style={{
          color: '#d4af37', 
          fontFamily: '"Times New Roman", serif', 
          textAlign: 'center',
          fontSize: '3rem', // Daha vurgulu
          fontWeight: '300',
          marginBottom: '5px',
          textTransform: 'uppercase',
          letterSpacing: '3px'
        }}>
          Yazarın Çalışma Masası
        </h1>
        <div style={{
          width: '80px',
          height: '1px',
          background: '#d4af37',
          margin: '0 auto 50px'
        }} />
      </motion.div>

      {/* FORM */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
            background: '#1a1a1a', // Hafif koyu zemin
            padding: '50px',
            border: '1px solid #333',
            borderRadius: '5px'
        }}
      >
        <h2 style={{ 
          fontFamily: '"Times New Roman", serif', 
          fontSize: '2rem',
          fontWeight: '300',
          color: '#f0f0e0', // Fildişi
          marginBottom: '30px',
          borderLeft: '4px solid #d4af37', // Sol tarafta ince altın çizgi
          paddingLeft: '15px'
        }}>
          Yeni Eser Oluştur
        </h2>

        <form onSubmit={handleSubmit} style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '30px' 
        }}>
          
          {/* BAŞLIK */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '10px', 
              color: '#d4af37',
              fontSize: '0.9rem',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              Başlık <span style={{ color: '#ff6b6b' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Eserinizin başlığını girin..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              style={{ 
                width: '100%',
                padding: '12px 15px', 
                background: '#0a0a0a', // Daha koyu input
                border: '1px solid #333', 
                color: '#f0f0e0', 
                fontSize: '1.2rem',
                fontFamily: '"Times New Roman", serif',
                borderRadius: '3px',
                outline: 'none',
                transition: 'border 0.3s'
              }}
              onFocus={(e) => e.target.style.border = '1px solid #d4af37'}
              onBlur={(e) => e.target.style.border = '1px solid #333'}
            />
            <p style={{ fontSize: '0.8rem', color: '#777', marginTop: '5px' }}>
              {title.length}/200 karakter
            </p>
          </div>

          {/* KATEGORİ & GÖRSEL YÜKLEME GRUBU */}
          <div style={{ display: 'flex', gap: '30px' }}>
            {/* KATEGORİ */}
            <div style={{ flex: 1 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '10px', 
                color: '#d4af37',
                fontSize: '0.9rem',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
                Kategori Seçimi <span style={{ color: '#ff6b6b' }}>*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '12px 15px', 
                  background: '#0a0a0a', 
                  border: '1px solid #333', 
                  color: '#f0f0e0',
                  fontSize: '1rem',
                  fontFamily: 'sans-serif',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  // Ok rengini değiştirmek zor olduğu için standart bırakıldı
                }}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* GÖRSEL YÜKLEME */}
            <div style={{ flex: 1.5 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '10px', 
                color: '#d4af37',
                fontSize: '0.9rem',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
                Kapak Görseli (Önerilen)
              </label>
              <div style={{ 
                background: '#0a0a0a', 
                padding: '12px', 
                border: '1px solid #333', // Daha ince çerçeve
                borderRadius: '3px',
                textAlign: 'center'
              }}>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleImageChange}
                  style={{ width: '100%', color: '#ccc', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>
          
          {/* GÖRSEL ÖNİZLEME */}
          {imagePreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.5 }}
              style={{ 
                marginTop: '15px', 
                textAlign: 'center' 
              }}
            >
              <p style={{ color: '#d4af37', marginBottom: '10px' }}>
                📸 Önizleme
              </p>
              <img 
                src={imagePreview} 
                alt="Görsel önizleme" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '350px',
                  borderRadius: '3px',
                  border: '1px solid #d4af37', // İnce altın çerçeve
                  objectFit: 'cover'
                }}
              />
            </motion.div>
          )}

          {/* TOOLBAR VE EDITÖR */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '10px', 
              color: '#d4af37',
              fontSize: '0.9rem',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              İçerik Metni <span style={{ color: '#ff6b6b' }}>*</span>
            </label>
            
            <div style={{ 
              border: '1px solid #333', 
              borderRadius: '3px', 
              overflow: 'hidden',
            }}>
              
              {/* TOOLBAR */}
              <div style={{ 
                background: '#d4af37', 
                padding: '8px', 
                display: 'flex', 
                gap: '4px', 
                flexWrap: 'wrap',
                borderBottom: '1px solid #0a0a0a'
              }}>
                <button type="button" onClick={() => formatDoc('bold')} style={toolbarBtnStyle} onMouseOver={(e) => e.target.style.background = '#c29d2f'} onMouseOut={(e) => e.target.style.background = 'none'} title="Kalın"><b>B</b></button>
                <button type="button" onClick={() => formatDoc('italic')} style={toolbarBtnStyle} onMouseOver={(e) => e.target.style.background = '#c29d2f'} onMouseOut={(e) => e.target.style.background = 'none'} title="İtalik"><i>I</i></button>
                <button type="button" onClick={() => formatDoc('underline')} style={toolbarBtnStyle} onMouseOver={(e) => e.target.style.background = '#c29d2f'} onMouseOut={(e) => e.target.style.background = 'none'} title="Altı Çizili"><u>U</u></button>
                <span style={{width:'1px', background:'#0a0a0a', margin:'0 8px'}}></span>
                <button type="button" onClick={() => formatDoc('formatBlock', 'h2')} style={toolbarBtnStyle} onMouseOver={(e) => e.target.style.background = '#c29d2f'} onMouseOut={(e) => e.target.style.background = 'none'} title="Başlık">H2</button>
                <button type="button" onClick={() => formatDoc('formatBlock', 'h3')} style={toolbarBtnStyle} onMouseOver={(e) => e.target.style.background = '#c29d2f'} onMouseOut={(e) => e.target.style.background = 'none'} title="Alt Başlık">H3</button>
                <button type="button" onClick={() => formatDoc('formatBlock', 'p')} style={toolbarBtnStyle} onMouseOver={(e) => e.target.style.background = '#c29d2f'} onMouseOut={(e) => e.target.style.background = 'none'} title="Paragraf">P</button>
                <span style={{width:'1px', background:'#0a0a0a', margin:'0 8px'}}></span>
                <button type="button" onClick={() => formatDoc('insertUnorderedList')} style={toolbarBtnStyle} onMouseOver={(e) => e.target.style.background = '#c29d2f'} onMouseOut={(e) => e.target.style.background = 'none'} title="Madde Listesi">List</button>
                <button type="button" onClick={() => formatDoc('formatBlock', 'blockquote')} style={toolbarBtnStyle} onMouseOver={(e) => e.target.style.background = '#c29d2f'} onMouseOut={(e) => e.target.style.background = 'none'} title="Alıntı">❝</button>
              </div>

              {/* EDITÖR */}
              <div
                ref={editorRef}
                contentEditable
                style={{
                  minHeight: '450px', // Daha fazla çalışma alanı
                  padding: '30px',
                  background: '#fff', // Beyaz kağıt hissi
                  color: '#000',
                  outline: 'none',
                  fontFamily: 'Georgia, serif',
                  fontSize: '1.1rem',
                  lineHeight: '1.8',
                  overflowY: 'auto',
                  // placeholder özelliği için CSS gerekiyor, inline olmadığı için şimdilik atlıyoruz.
                }}
              ></div>
            </div>
          </div>

          {/* HATA VE BAŞARI MESAJI */}
          {(error || success) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: error ? '#ff6b6b20' : '#4caf5020',
                border: `1px solid ${error ? '#ff6b6b' : '#4caf50'}`,
                color: error ? '#ff6b6b' : '#4caf50',
                padding: '15px',
                borderRadius: '5px',
                fontSize: '0.95rem',
                textAlign: 'center'
              }}
            >
              {error || success && '✅ Yazı başarıyla yayınlandı! Sayfa yenileniyor...'}
            </motion.div>
          )}

          {/* BUTONLAR */}
          <div style={{ 
            display: 'flex', 
            gap: '15px', 
            marginTop: '20px' 
          }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '15px',
                background: loading ? '#666' : '#d4af37',
                color: '#000',
                border: 'none',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                borderRadius: '3px',
                transition: 'all 0.3s',
                textTransform: 'uppercase',
                letterSpacing: '2px'
              }}
              onMouseOver={(e) => !loading && (e.target.style.background = '#c29d2f')}
              onMouseOut={(e) => !loading && (e.target.style.background = '#d4af37')}
            >
              {loading ? '⏳ Yayınlanıyor...' : 'Eseri Yayınla'}
            </button>

            <button
              type="button"
              onClick={handleClearForm}
              disabled={loading}
              style={{
                padding: '15px 30px',
                background: 'none', // Arka plan yok
                color: '#888',
                border: '1px solid #555', // İnce çerçeve
                fontWeight: 'normal',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                borderRadius: '3px',
                transition: 'all 0.3s',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
              onMouseOver={(e) => !loading && (e.target.style.color = '#f0f0e0')}
              onMouseOut={(e) => !loading && (e.target.style.color = '#888')}
            >
              Temizle
            </button>
          </div>

        </form>
      </motion.div>
      
      {/* ARŞİV YÖNETİM PANELİ */}
      <div style={{ marginTop: '80px', padding: '20px 0' }}>
        <h2 style={{ 
          fontFamily: '"Times New Roman", serif', 
          fontSize: '2rem',
          fontWeight: '300',
          color: '#f0f0e0',
          marginBottom: '30px',
          borderLeft: '4px solid #d4af37',
          paddingLeft: '15px'
        }}>
          Yayınlanmış Eserler Arşivi
        </h2>
        <PostManager />
      </div>

    </div>
  );
};


export default CreatePost;