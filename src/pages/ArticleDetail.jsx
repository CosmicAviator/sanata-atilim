import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient'; // Veritabanı köprümüz (bir üst klasörde)

const ArticleDetail = () => {
  const { id } = useParams(); // URL'deki numarayı (ID) yakalar
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sayfa açılınca veya ID değişince çalışır
  useEffect(() => {
    fetchPost();
    window.scrollTo(0, 0); // Sayfanın en tepesine git
  }, [id]);

  async function fetchPost() {
    // Veritabanından bu ID'ye sahip olan TEK satırı çek
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.log('Hata:', error);
    } else {
      setPost(data);
    }
    setLoading(false);
  }

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '100px' }}>Yükleniyor...</div>;
  if (!post) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '100px' }}>Yazı bulunamadı.</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{ backgroundColor: '#111', minHeight: '100vh', color: '#f0f0e0' }}
    >
      
      {/* GERİ DÖN BUTONU */}
      <Link to="/" style={{ 
        position: 'fixed', 
        top: '30px', 
        left: '30px', 
        zIndex: 100, 
        color: '#fff', 
        textDecoration: 'none',
        fontSize: '1.5rem',
        mixBlendMode: 'difference' 
      }}>
        ←
      </Link>

      {/* KAPAK GÖRSELİ (Veritabanından gelen image_url) */}
      <div style={{ height: '60vh', position: 'relative', overflow: 'hidden' }}>
        <img 
          src={post.image_url} 
          alt={post.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5)' }} 
        />
        <div style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          width: '100%', 
          height: '150px', 
          background: 'linear-gradient(to top, #111 0%, transparent 100%)' 
        }} />
        
        {/* BAŞLIK VE KATEGORİ */}
        <div style={{ position: 'absolute', bottom: '50px', left: '0', right: '0', textAlign: 'center', padding: '0 20px' }}>
          <span style={{ fontFamily: 'sans-serif', color: '#d4af37', letterSpacing: '2px', fontSize: '0.9rem', textTransform: 'uppercase' }}>
            {post.category}
          </span>
          <h1 style={{ fontSize: '3rem', fontWeight: '100', margin: '10px 0', textShadow: '0 5px 15px rgba(0,0,0,0.8)' }}>
            {post.title}
          </h1>
        </div>
      </div>

      {/* METİN ALANI */}
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '50px 20px 100px 20px', fontSize: '1.25rem', lineHeight: '1.8' }}>
        {/* Veritabanındaki düz metni gösteriyoruz. İleride buraya HTML editör ekleyebiliriz. */}
        <p style={{ whiteSpace: 'pre-line' }}>
          {post.content}
        </p>
      </div>

    </motion.div>
  );
};

export default ArticleDetail;