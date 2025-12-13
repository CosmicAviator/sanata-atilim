import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Editörün stili

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); // Artık HTML tutacak
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Sinema');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Editörün üzerindeki butonlar (Toolbar)
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }], // Başlıklar
      ['bold', 'italic', 'underline', 'strike', 'blockquote'], // Vurgular
      [{'list': 'ordered'}, {'list': 'bullet'}], // Listeler
      ['clean'] // Temizle
    ],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Supabase'e gönder
    const { error } = await supabase
      .from('posts')
      .insert([{ title, content, image_url: imageUrl, category }]);

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
        Yeni Makale Yaz
      </motion.h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '30px' }}>
        
        {/* Başlık */}
        <input
          type="text"
          placeholder="Başlık (Örn: Amélie'nin Yalnızlığı)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{
            padding: '15px',
            fontSize: '1.2rem',
            background: '#1a1a1a',
            border: '1px solid #333',
            color: '#fff',
            outline: 'none'
          }}
        />

        {/* Kategori Seçimi */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            padding: '10px',
            background: '#1a1a1a',
            border: '1px solid #333',
            color: '#fff'
          }}
        >
          <option value="Sinema">Sinema</option>
          <option value="Edebiyat">Edebiyat</option>
          <option value="Felsefe">Felsefe</option>
        </select>

        {/* Görsel URL */}
        <input
          type="text"
          placeholder="Kapak Görseli URL'si"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          style={{
            padding: '15px',
            background: '#1a1a1a',
            border: '1px solid #333',
            color: '#fff'
          }}
        />

        {/* --- ZENGİN METİN EDİTÖRÜ --- */}
        <div className="editor-container" style={{ background: '#fff', color: '#000', borderRadius: '5px' }}>
          <ReactQuill 
            theme="snow" 
            value={content} 
            onChange={setContent} 
            modules={modules}
            style={{ height: '400px', marginBottom: '50px' }} 
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          type="submit"
          style={{
            padding: '15px',
            marginTop: '20px', 
            background: '#d4af37',
            color: '#000',
            border: 'none',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Yayınlanıyor...' : 'YAYINLA'}
        </motion.button>

      </form>
    </div>
  );
};

export default CreatePost;