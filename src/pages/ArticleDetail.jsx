import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
// DOMPurify içeriği temizlemek için gerekli
import DOMPurify from 'dompurify';

const ArticleDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setPost(data);
      } catch (err) {
        console.error('Makale yükleme hatası:', err);
        setError('Makale yüklenirken bir sorun oluştu veya makale bulunamadı.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#888' }}>
        Yükleniyor...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#f44336', padding: '20px' }}>
        <p>{error}</p>
        <Link to="/" style={{ color: '#d4af37', marginTop: '20px' }}>Ana Sayfaya Dön</Link>
      </div>
    );
  }

  // DOMPurify ile içeriği temizle ve güvenli hale getir
  // Güvenli iframe'lere izin vermek için yapılandırma aynı kaldı.
  const cleanContent = DOMPurify.sanitize(post.content, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src'],
    FORBID_TAGS: ['script', 'style', 'img'] // Sadece gömülü iframe'ler için img yasaklandı
  });

  const contentPadding = isMobile ? '40px 20px' : '60px 40px';
  const contentWidth = isMobile ? '100%' : '800px';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        background: '#0a0a0a',
        color: '#f0f0e0',
        minHeight: '100vh',
        paddingTop: isMobile ? '120px' : '150px'
      }}
    >
      <div style={{
        maxWidth: contentWidth,
        margin: '0 auto',
        padding: contentPadding,
        lineHeight: 1.8,
        fontSize: '1.1rem'
      }}>

        {/* Kapak Görseli */}
        {post.image_url && (
          <img
            src={post.image_url}
            alt={post.title}
            style={{
              width: '100%',
              height: isMobile ? '250px' : '400px',
              objectFit: 'cover',
              borderRadius: '8px',
              marginBottom: '40px'
            }}
          />
        )}

        {/* Makale Başlığı */}
        <h1 style={{
          fontSize: isMobile ? '2.5rem' : '3.5rem',
          fontFamily: '"Times New Roman", serif',
          marginBottom: '10px',
          lineHeight: 1.2,
          color: '#d4af37'
        }}>
          {post.title}
        </h1>

        {/* 🔥 YAZAR BİLGİ ALANI */}
        <div style={{
          borderBottom: '1px solid #333',
          paddingBottom: '15px',
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.9rem',
          color: '#888'
        }}>
          <div>
            <span style={{ color: '#d4af37', fontWeight: 'bold' }}>
              Yazar: {post.author_name || 'Anonim Küratör'}
            </span>
            {post.author_status && (
              <span style={{ marginLeft: '15px' }}>
                | {post.author_status}
              </span>
            )}
          </div>
          <span style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
            {post.category}
          </span>
        </div>

        {/* Makale İçeriği */}
        <div
          dangerouslySetInnerHTML={{ __html: cleanContent }}
          style={{ fontFamily: 'Georgia, serif', color: '#ccc' }}
        />

        {/* Anasayfaya Dön Butonu */}
        <div style={{
          textAlign: 'center',
          marginTop: '60px',
          paddingTop: '40px',
          borderTop: '1px solid rgba(212, 175, 55, 0.2)'
        }}>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              padding: '16px 40px',
              background: 'transparent',
              border: '1px solid #d4af37',
              color: '#d4af37',
              fontFamily: '"Times New Roman", serif',
              fontSize: '1rem',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#d4af37';
              e.target.style.color = '#0a0a0a';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#d4af37';
            }}
          >
            Anasayfaya Dön
          </Link>
        </div>

      </div>
    </motion.div>
  );
};

export default ArticleDetail;