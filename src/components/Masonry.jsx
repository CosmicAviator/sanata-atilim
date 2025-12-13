import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Masonry = ({ category }) => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
      if (category !== 'Hepsi') {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      if (error) console.error('Hata:', error);
      else setPosts(data);
    };

    fetchPosts();
  }, [category]);

  // HTML Etiketlerini Temizleme Fonksiyonu (Sadece metin kalsın)
  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  return (
    <div style={{ 
      columnCount: 3, 
      columnGap: '20px', 
      padding: '40px 20px', 
      maxWidth: '1200px', 
      margin: '0 auto' 
    }}>
      {/* Mobil uyumluluk için stil ayarı */}
      <style>{`
        @media (max-width: 900px) { div[style*="column-count: 3"] { column-count: 2 !important; } }
        @media (max-width: 600px) { div[style*="column-count: 3"] { column-count: 1 !important; } }
      `}</style>

      {posts.map((post) => (
        <motion.div
          key={post.id}
          whileHover={{ y: -5 }}
          onClick={() => navigate(`/yazi/${post.id}`)}
          style={{
            breakInside: 'avoid',
            marginBottom: '20px',
            background: '#1a1a1a',
            borderRadius: '10px',
            overflow: 'hidden',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
          }}
        >
          {post.image_url && (
            <img 
              src={post.image_url} 
              alt={post.title} 
              style={{ width: '100%', display: 'block' }} 
            />
          )}
          <div style={{ padding: '20px' }}>
            <span style={{ fontSize: '0.8rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {post.category}
            </span>
            <h3 style={{ margin: '10px 0', fontSize: '1.5rem', fontFamily: '"Times New Roman", serif', color: '#fff' }}>
              {post.title}
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#bbb', lineHeight: '1.6' }}>
              {/* HTML'den arındırılmış temiz metnin ilk 120 karakteri */}
              {stripHtml(post.content).substring(0, 120)}...
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Masonry;