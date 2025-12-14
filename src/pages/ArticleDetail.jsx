import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        console.log('✅ Yazı yüklendi:', data.title);
        setPost(data);
      } catch (err) {
        console.error('❌ Yazı yüklenemedi:', err.message);
        setError('Yazı bulunamadı veya yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // Loading
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#888'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '50px',
            height: '50px',
            border: '2px solid rgba(212, 175, 55, 0.2)',
            borderTop: '2px solid #d4af37',
            borderRadius: '50%'
          }}
        />
      </div>
    );
  }

  // Error
  if (error || !post) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#888',
        textAlign: 'center',
        padding: '40px'
      }}>
        <h2 style={{
          fontSize: '2rem',
          fontFamily: '"Times New Roman", serif',
          marginBottom: '20px',
          color: '#f0f0e0'
        }}>
          Yazı Bulunamadı
        </h2>
        <p style={{ marginBottom: '30px', fontSize: '0.9rem' }}>{error}</p>
        <Link
          to="/"
          style={{
            color: '#d4af37',
            fontSize: '0.8rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            textDecoration: 'none',
            fontFamily: 'sans-serif',
            borderBottom: '1px solid #d4af37',
            paddingBottom: '2px'
          }}
        >
          ← Ana Sayfa
        </Link>
      </div>
    );
  }

  // Yazı içeriği
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      {/* Geri Dönüş ve Kategori */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 40px 20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px'
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              fontSize: '0.75rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontFamily: 'sans-serif',
              cursor: 'pointer',
              transition: 'color 0.3s',
              padding: 0
            }}
            onMouseOver={(e) => e.target.style.color = '#d4af37'}
            onMouseOut={(e) => e.target.style.color = '#888'}
          >
            ← Geri
          </button>

          <span style={{
            fontSize: '0.7rem',
            color: '#d4af37',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontFamily: 'sans-serif'
          }}>
            {post.category}
          </span>
        </div>
      </div>

      {/* Kapak Görseli */}
      {post.image_url && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={{
            width: '100%',
            maxHeight: '60vh',
            overflow: 'hidden',
            marginBottom: '60px'
          }}
        >
          <img
            src={post.image_url}
            alt={post.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.8)'
            }}
          />
        </motion.div>
      )}

      {/* İçerik */}
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 40px 100px',
          color: '#f0f0e0'
        }}
      >
        {/* Başlık */}
        <h1 style={{
          fontSize: '3rem',
          fontFamily: '"Times New Roman", serif',
          fontWeight: '300',
          lineHeight: '1.2',
          marginBottom: '30px',
          color: '#f0f0e0'
        }}>
          {post.title}
        </h1>

        {/* Altın Çizgi */}
        <div style={{
          width: '100px',
          height: '1px',
          background: '#d4af37',
          marginBottom: '40px'
        }} />

        {/* Tarih */}
        <p style={{
          fontSize: '0.75rem',
          color: '#888',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          fontFamily: 'sans-serif',
          marginBottom: '60px'
        }}>
          {new Date(post.created_at).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>

        {/* İçerik (HTML) */}
        <div
          style={{
            fontSize: '1.1rem',
            lineHeight: '1.8',
            fontFamily: 'Georgia, serif',
            color: '#f0f0e0'
          }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Alt Bölüm: Geri Dön */}
        <div style={{
          marginTop: '80px',
          paddingTop: '40px',
          borderTop: '1px solid #333',
          textAlign: 'center'
        }}>
          <Link
            to="/"
            style={{
              color: '#d4af37',
              fontSize: '0.75rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              textDecoration: 'none',
              fontFamily: 'sans-serif',
              transition: 'opacity 0.3s'
            }}
            onMouseOver={(e) => e.target.style.opacity = '0.7'}
            onMouseOut={(e) => e.target.style.opacity = '1'}
          >
            ← Diğer Yazılar
          </Link>
        </div>
      </motion.article>
    </div>
  );
};

export default ArticleDetail;