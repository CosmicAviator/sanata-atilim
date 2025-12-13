import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Sinema');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // İçeriği satır başlarına göre paragraflara böl (<p> etiketi ekle)
    // Bu sayede düz yazsan bile okurken paragraf paragraf ayrılacak.
    const formattedContent = content.split('\n').map(para => 
      para.trim() ? `<p>${para}</p>` : '<br>'
    ).join('');

    const { error } = await supabase
      .from('posts')
      .insert([{ title, content: formattedContent, image_url: imageUrl, category }]);

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
        Yeni Makale Yaz (Güvenli Mod)
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

        {/* Eski usül ama sağlam Textarea */}
        <textarea
          placeholder="Yazını buraya yapıştır..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          style={{
            padding: '15px',
            background: '#fff',
            color: '#000',
            minHeight: '400px',
            fontFamily: 'Georgia, serif',
            fontSize: '1rem',
            border: 'none',
            borderRadius: '5px'
          }}
        />

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