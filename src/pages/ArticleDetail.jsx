import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) console.error('Hata:', error);
      else setPost(data);
    };

    fetchPost();
  }, [id]);

  if (!post) return <div style={{color:'#fff', textAlign:'center', marginTop:'50px'}}>Yükleniyor...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{ padding: '0 20px', paddingBottom: '100px', color: '#f0f0e0', maxWidth: '800px', margin: '0 auto' }}
    >
      {/* Kapak Görseli */}
      {post.image_url && (
        <div style={{ width: '100%', height: '400px', overflow: 'hidden', marginBottom: '40px', borderRadius: '0 0 20px 20px' }}>
          <img 
            src={post.image_url} 
            alt={post.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>
      )}

      {/* Geri Dön Butonu */}
      <button 
        onClick={() => navigate('/')}
        style={{ background: 'none', border: 'none', color: '#d4af37', cursor: 'pointer', marginBottom: '20px', fontSize: '1.2rem' }}
      >
        ← Geri Dön
      </button>

      <h1 style={{ fontFamily: '"Times New Roman", serif', fontSize: '3rem', marginBottom: '10px' }}>{post.title}</h1>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginBottom: '40px', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
        <span>{new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
        <span style={{ color: '#d4af37' }}>{post.category}</span>
      </div>

      {/* --- İÇERİK (HTML Render) --- */}
      <div 
        className="article-content"
        dangerouslySetInnerHTML={{ __html: post.content }} 
        style={{ 
          fontSize: '1.1rem', 
          lineHeight: '1.8', 
          fontFamily: 'Georgia, serif' 
        }}
      />
      
    </motion.div>
  );
};

export default ArticleDetail;