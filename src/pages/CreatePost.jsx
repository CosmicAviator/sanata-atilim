import { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Sinema');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const editorRef = useRef(null); // Editör alanını seçmek için
  const navigate = useNavigate();

  // --- TOOLBAR FONKSİYONLARI ---
  // Bu fonksiyonlar tarayıcının kendi komutlarını çalıştırır
  const formatDoc = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    editorRef.current.focus(); // İşlemden sonra tekrar yazıya odaklan
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Editörün içindeki HTML kodunu alıyoruz
    const content = editorRef.current.innerHTML;

    let finalImageUrl = '';

    // 1. RESİM YÜKLEME
    if (imageFile) {
      try {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('blog-images')
          .getPublicUrl(filePath);

        finalImageUrl = data.publicUrl;
      } catch (error) {
        alert('Resim hatası: ' + error.message);
        setLoading(false);
        return;
      }
    }

    // 2. KAYDETME
    const { error } = await supabase
      .from('posts')
      .insert([{ title, content, image_url: finalImageUrl, category }]);

    if (error) {
      alert('Hata: ' + error.message);
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: '#f0f0e0', minHeight: '100vh' }}>
      <motion.h2 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ fontFamily: '"Times New Roman", serif', borderBottom: '1px solid #d4af37', paddingBottom: '10px' }}
      >
        Yeni Makale Yaz (Özel Tasarım)
      </motion.h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '30px' }}>
        
        {/* Başlık ve Kategori */}
        <input
          type="text"
          placeholder="Başlık"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ padding: '15px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', fontSize: '1.2rem' }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: '10px', background: '#1a1a1a', border: '1px solid #333', color: '#fff' }}
        >
          <option value="Sinema">Sinema</option>
          <option value="Edebiyat">Edebiyat</option>
          <option value="Felsefe">Felsefe</option>
        </select>

        {/* Resim Yükleme */}
        <div style={{ background: '#1a1a1a', padding: '15px', border: '1px dashed #d4af37', borderRadius: '5px' }}>
            <label style={{ display: 'block', marginBottom: '10px', color: '#d4af37', cursor: 'pointer' }}>
                Kapak Görseli Seç:
            </label>
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                style={{ color: '#fff' }}
            />
        </div>

        {/* --- KENDİ YAPTIĞIMIZ TOOLBAR --- */}
        <div style={{ border: '1px solid #333', borderRadius: '5px', overflow: 'hidden' }}>
          
          {/* Butonlar */}
          <div style={{ background: '#d4af37', padding: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => formatDoc('bold')} style={btnStyle}><b>B</b></button>
            <button type="button" onClick={() => formatDoc('italic')} style={btnStyle}><i>I</i></button>
            <button type="button" onClick={() => formatDoc('underline')} style={btnStyle}><u>U</u></button>
            <span style={{width:'1px', background:'#000', margin:'0 5px'}}></span>
            <button type="button" onClick={() => formatDoc('formatBlock', 'h2')} style={btnStyle}>Başlık</button>
            <button type="button" onClick={() => formatDoc('formatBlock', 'p')} style={btnStyle}>Paragraf</button>
            <span style={{width:'1px', background:'#000', margin:'0 5px'}}></span>
            <button type="button" onClick={() => formatDoc('insertUnorderedList')} style={btnStyle}>Liste</button>
            <button type="button" onClick={() => formatDoc('formatBlock', 'blockquote')} style={btnStyle}>❝ Alıntı</button>
          </div>

          {/* Yazı Yazma Alanı (ContentEditable) */}
          <div
            ref={editorRef}
            contentEditable
            style={{
              minHeight: '400px',
              padding: '20px',
              background: '#fff',
              color: '#000',
              outline: 'none',
              fontFamily: 'Georgia, serif',
              fontSize: '1.1rem',
              lineHeight: '1.6'
            }}
          ></div>
        </div>
        {/* -------------------------------- */}

        <button
          disabled={loading}
          type="submit"
          style={{
            padding: '15px',
            background: '#d4af37',
            color: '#000',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '1.1rem'
          }}
        >
          {loading ? 'Yayınlanıyor...' : 'YAYINLA'}
        </button>

      </form>
    </div>
  );
};

// Toolbar Buton Stili
const btnStyle = {
  background: '#1a1a1a',
  color: '#fff',
  border: 'none',
  padding: '5px 10px',
  cursor: 'pointer',
  borderRadius: '3px',
  fontWeight: 'bold'
};

export default CreatePost;