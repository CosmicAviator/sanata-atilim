import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
// Yeni, hafif ve sağlam editörümüz:
import { Editor, EditorProvider } from 'react-simple-wysiwyg';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); // HTML içeriği burada
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Sinema');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

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

  // Editördeki değişiklikleri yakalayan fonksiyon
  function onChange(e) {
    setContent(e.target.value);
  }

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

        <input
          type="text"
          placeholder="Kapak Görseli URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          style={{ padding: '15px', background: '#1a1a1a', border: '1px solid #333', color: '#fff' }}
        />

        {/* --- SAĞLAM EDİTÖR --- */}
        <div style={{ background: '#fff', color: '#000', borderRadius: '5px', overflow: 'hidden', minHeight:'300px' }}>
          <EditorProvider>
            <Editor 
              value={content} 
              onChange={onChange}
              style={{ minHeight: '300px', width: '100%' }}
              containerProps={{ style: { minHeight: '300px' } }}
            />
          </EditorProvider>
        </div>

        <button
          disabled={loading}
          type="submit"
          style={{
            padding: '15px',
            background: '#d4af37',
            color: '#000',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Yayınlanıyor...' : 'YAYINLA'}
        </button>

      </form>
    </div>
  );
};

export default CreatePost;