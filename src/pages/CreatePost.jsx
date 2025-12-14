import { useState, useRef } from 'react';
import { supabase } from '../supabaseClient'; // ✅ Düzeltme: supabaseClient yerine lib/supabase
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PostManager from '../components/PostManager';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Sinema');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // ✅ Yeni: Görsel önizleme
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const editorRef = useRef(null);
  const navigate = useNavigate();

  // --- TOOLBAR FONKSİYONLARI ---
  const formatDoc = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    editorRef.current.focus();
  };

  // ✅ YENİ: Görsel seçimi ve önizleme
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    // Dosya boyutu kontrolü (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Görsel boyutu maksimum 5MB olabilir');
      e.target.value = ''; // Input'u temizle
      return;
    }

    // Dosya formatı kontrolü
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validFormats.includes(file.type)) {
      setError('Sadece JPG, PNG, WebP ve GIF formatları desteklenir');
      e.target.value = '';
      return;
    }

    setImageFile(file);
    setError(null);

    // Önizleme oluştur
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // ✅ YENİ: Form validasyonu
  const validateForm = () => {
    // Başlık kontrolü
    if (!title.trim()) {
      setError('❌ Başlık alanı zorunludur');
      return false;
    }
    if (title.length < 3) {
      setError('❌ Başlık en az 3 karakter olmalıdır');
      return false;
    }
    if (title.length > 200) {
      setError('❌ Başlık maksimum 200 karakter olabilir');
      return false;
    }

    // İçerik kontrolü
    const content = editorRef.current.innerHTML.trim();
    if (!content || content === '<br>' || content === '<p><br></p>') {
      setError('❌ İçerik alanı boş bırakılamaz');
      return false;
    }
    if (content.length < 50) {
      setError('❌ İçerik çok kısa (minimum 50 karakter)');
      return false;
    }

    // Görsel kontrolü (opsiyonel ama önerilir)
    if (!imageFile) {
      const confirmed = window.confirm(
        '⚠️ Kapak görseli seçmediniz. Görselsiz devam etmek istiyor musunuz?'
      );
      if (!confirmed) return false;
    }

    return true;
  };

  // ✅ İYİLEŞTİRİLMİŞ: Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validasyon kontrolü
    if (!validateForm()) return;

    setLoading(true);

    try {
      const content = editorRef.current.innerHTML;
      let finalImageUrl = '';

      // 1. RESİM YÜKLEME (varsa)
      if (imageFile) {
        try {
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `blog-images/${fileName}`; // ✅ Düzeltme: Klasör eklendi

          console.log('📤 Görsel yükleniyor:', fileName);

          const { error: uploadError } = await supabase.storage
            .from('blog-images')
            .upload(filePath, imageFile, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) throw uploadError;

          // Public URL al
          const { data: { publicUrl } } = supabase.storage
            .from('blog-images')
            .getPublicUrl(filePath);

          finalImageUrl = publicUrl;
          console.log('✅ Görsel yüklendi:', publicUrl);

        } catch (uploadErr) {
          throw new Error(`Görsel yüklenemedi: ${uploadErr.message}`);
        }
      }

      // 2. VERİTABANINA KAYDETME
      console.log('💾 Veritabanına kaydediliyor...');

      const { data, error: dbError } = await supabase
        .from('posts')
        .insert([{
          title: title.trim(),
          content: content,
          image_url: finalImageUrl || null, // ✅ Boşsa null kaydet
          category: category,
          created_at: new Date().toISOString()
        }])
        .select(); // ✅ Eklenen veriyi geri döndür

      if (dbError) throw dbError;

      console.log('✅ Yazı başarıyla kaydedildi:', data);

      // Başarı durumu
      setSuccess(true);
      
      // Formu temizle
      setTitle('');
      setCategory('Sinema');
      setImageFile(null);
      setImagePreview(null);
      editorRef.current.innerHTML = '';

      // 3 saniye sonra başarı mesajını kaldır ve sayfayı yenile
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (err) {
      console.error('❌ Hata:', err);
      setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ YENİ: Formu temizle
  const handleClearForm = () => {
    if (!window.confirm('🗑️ Formu temizlemek istediğinizden emin misiniz?')) return;
    
    setTitle('');
    setCategory('Sinema');
    setImageFile(null);
    setImagePreview(null);
    setError(null);
    setSuccess(false);
    editorRef.current.innerHTML = '';
  };

  return (
    <div style={{ 
      padding: '40px 20px', 
      maxWidth: '900px', 
      margin: '0 auto', 
      color: '#f0f0e0', 
      minHeight: '100vh' 
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
          fontSize: '2.5rem',
          marginBottom: '10px',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          ✍️ Yazar Kontrol Paneli
        </h1>
        <p style={{
          textAlign: 'center',
          color: '#bbb',
          fontSize: '0.9rem',
          marginBottom: '30px'
        }}>
          Yeni içerik oluşturun ve mevcut yazılarınızı yönetin
        </p>
      </motion.div>

      {/* FORM */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 style={{ 
          fontFamily: '"Times New Roman", serif', 
          borderBottom: '2px solid #d4af37', 
          paddingBottom: '10px', 
          marginBottom: '30px',
          color: '#d4af37'
        }}>
          📝 Yeni İçerik Oluştur
        </h2>

        <form onSubmit={handleSubmit} style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px' 
        }}>
          
          {/* BAŞLIK */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#d4af37',
              fontWeight: 'bold'
            }}>
              Başlık <span style={{ color: '#ff6b6b' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Yazınızın başlığını girin..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              style={{ 
                width: '100%',
                padding: '15px', 
                background: '#1a1a1a', 
                border: '1px solid #333', 
                color: '#fff', 
                fontSize: '1.2rem',
                borderRadius: '5px',
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

          {/* KATEGORİ */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#d4af37',
              fontWeight: 'bold'
            }}>
              Kategori <span style={{ color: '#ff6b6b' }}>*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ 
                width: '100%',
                padding: '12px', 
                background: '#1a1a1a', 
                border: '1px solid #333', 
                color: '#fff',
                fontSize: '1rem',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              <option value="Sinema">🎬 Sinema</option>
              <option value="Edebiyat">📚 Edebiyat</option>
              <option value="Felsefe">🤔 Felsefe</option>
            </select>
          </div>

          {/* GÖRSEL YÜKLEME */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#d4af37',
              fontWeight: 'bold'
            }}>
              Kapak Görseli (Önerilen)
            </label>
            <div style={{ 
              background: '#1a1a1a', 
              padding: '20px', 
              border: '2px dashed #d4af37', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleImageChange}
                style={{ 
                  width: '100%',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              />
              <p style={{ 
                fontSize: '0.85rem', 
                color: '#bbb', 
                marginTop: '10px' 
              }}>
                Maksimum 5MB • JPG, PNG, WebP, GIF
              </p>
            </div>

            {/* GÖRSEL ÖNİZLEME */}
            {imagePreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ 
                  marginTop: '15px', 
                  textAlign: 'center' 
                }}
              >
                <p style={{ 
                  color: '#d4af37', 
                  marginBottom: '10px',
                  fontWeight: 'bold'
                }}>
                  📸 Önizleme:
                </p>
                <img 
                  src={imagePreview} 
                  alt="Görsel önizleme" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '300px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                  }}
                />
              </motion.div>
            )}
          </div>

          {/* TOOLBAR VE EDITÖR */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#d4af37',
              fontWeight: 'bold'
            }}>
              İçerik <span style={{ color: '#ff6b6b' }}>*</span>
            </label>
            
            <div style={{ 
              border: '1px solid #333', 
              borderRadius: '8px', 
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}>
              
              {/* TOOLBAR */}
              <div style={{ 
                background: '#d4af37', 
                padding: '12px', 
                display: 'flex', 
                gap: '8px', 
                flexWrap: 'wrap',
                borderBottom: '2px solid #000'
              }}>
                <button type="button" onClick={() => formatDoc('bold')} style={btnStyle} title="Kalın">
                  <b>B</b>
                </button>
                <button type="button" onClick={() => formatDoc('italic')} style={btnStyle} title="İtalik">
                  <i>I</i>
                </button>
                <button type="button" onClick={() => formatDoc('underline')} style={btnStyle} title="Altı Çizili">
                  <u>U</u>
                </button>
                <span style={{width:'2px', background:'#000', margin:'0 8px'}}></span>
                <button type="button" onClick={() => formatDoc('formatBlock', 'h2')} style={btnStyle} title="Başlık">
                  H2
                </button>
                <button type="button" onClick={() => formatDoc('formatBlock', 'h3')} style={btnStyle} title="Alt Başlık">
                  H3
                </button>
                <button type="button" onClick={() => formatDoc('formatBlock', 'p')} style={btnStyle} title="Paragraf">
                  P
                </button>
                <span style={{width:'2px', background:'#000', margin:'0 8px'}}></span>
                <button type="button" onClick={() => formatDoc('insertUnorderedList')} style={btnStyle} title="Madde Listesi">
                  • Liste
                </button>
                <button type="button" onClick={() => formatDoc('formatBlock', 'blockquote')} style={btnStyle} title="Alıntı">
                  ❝ Alıntı
                </button>
                <span style={{width:'2px', background:'#000', margin:'0 8px'}}></span>
                <button type="button" onClick={() => formatDoc('justifyLeft')} style={btnStyle} title="Sola Hizala">
                  ⬅
                </button>
                <button type="button" onClick={() => formatDoc('justifyCenter')} style={btnStyle} title="Ortala">
                  ↔
                </button>
                <button type="button" onClick={() => formatDoc('justifyRight')} style={btnStyle} title="Sağa Hizala">
                  ➡
                </button>
              </div>

              {/* EDITÖR */}
              <div
                ref={editorRef}
                contentEditable
                style={{
                  minHeight: '400px',
                  padding: '25px',
                  background: '#fff',
                  color: '#000',
                  outline: 'none',
                  fontFamily: 'Georgia, serif',
                  fontSize: '1.1rem',
                  lineHeight: '1.8',
                  overflowY: 'auto'
                }}
                placeholder="Yazınızı buraya yazın..."
              ></div>
            </div>
          </div>

          {/* HATA MESAJI */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#ff6b6b20',
                border: '1px solid #ff6b6b',
                color: '#ff6b6b',
                padding: '15px',
                borderRadius: '8px',
                fontSize: '0.95rem'
              }}
            >
              {error}
            </motion.div>
          )}

          {/* BAŞARI MESAJI */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#4caf5020',
                border: '1px solid #4caf50',
                color: '#4caf50',
                padding: '15px',
                borderRadius: '8px',
                fontSize: '0.95rem',
                textAlign: 'center'
              }}
            >
              ✅ Yazı başarıyla yayınlandı! Sayfa yenileniyor...
            </motion.div>
          )}

          {/* BUTONLAR */}
          <div style={{ 
            display: 'flex', 
            gap: '15px', 
            marginTop: '10px' 
          }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '18px',
                background: loading ? '#666' : '#d4af37',
                color: '#000',
                border: 'none',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1.1rem',
                borderRadius: '8px',
                transition: 'all 0.3s',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
              onMouseOver={(e) => !loading && (e.target.style.background = '#c29d2f')}
              onMouseOut={(e) => !loading && (e.target.style.background = '#d4af37')}
            >
              {loading ? '⏳ Yayınlanıyor...' : '📤 YAYINLA'}
            </button>

            <button
              type="button"
              onClick={handleClearForm}
              disabled={loading}
              style={{
                padding: '18px 30px',
                background: '#333',
                color: '#fff',
                border: '1px solid #555',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                borderRadius: '8px',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => !loading && (e.target.style.background = '#444')}
              onMouseOut={(e) => !loading && (e.target.style.background = '#333')}
            >
              🗑️ Temizle
            </button>
          </div>

        </form>
      </motion.div>
      
      {/* ARŞİV YÖNETİM PANELİ */}
      <div style={{ marginTop: '60px' }}>
        <PostManager />
      </div>

    </div>
  );
};

// Toolbar buton stili
const btnStyle = {
  background: '#1a1a1a',
  color: '#fff',
  border: 'none',
  padding: '8px 12px',
  cursor: 'pointer',
  borderRadius: '4px',
  fontWeight: 'bold',
  fontSize: '0.9rem',
  transition: 'all 0.2s',
  minWidth: '35px'
};

export default CreatePost;