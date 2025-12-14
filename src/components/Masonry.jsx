import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // ✅ Düzeltme: supabaseClient yerine lib/supabase
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Masonry = ({ category }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({}); // Görsel yükleme hatalarını takip et
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (category && category !== 'Hepsi') {
          query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error) throw error;

        console.log('✅ Masonry - Yüklenen yazılar:', data?.length || 0);
        setPosts(data || []);
      } catch (err) {
        console.error('❌ Masonry - Hata:', err.message);
        setError('Yazılar yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [category]);

  // HTML Etiketlerini Temizleme Fonksiyonu
  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Görsel hata kontrolü
  const handleImageError = (postId) => {
    console.warn(`⚠️ Görsel yüklenemedi: Post ID ${postId}`);
    setImageErrors(prev => ({ ...prev, [postId]: true }));
  };

  // Loading durumu
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        color: '#fff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid rgba(212, 175, 55, 0.3)',
            borderTop: '3px solid #d4af37',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 15px'
          }}></div>
          <p style={{ fontSize: '1rem', color: '#bbb' }}>Yazılar yükleniyor...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Error durumu
  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px', 
        color: '#ff6b6b',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>😔 Bir Hata Oluştu</h3>
        <p>{error}</p>
      </div>
    );
  }

  // Boş durum
  if (posts.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px', 
        color: '#bbb',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#fff' }}>
          📝 Henüz Yazı Yok
        </h3>
        <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
          {category && category !== 'Hepsi' 
            ? `"${category}" kategorisinde henüz yazı bulunmuyor.` 
            : 'Henüz hiç yazı eklenmemiş.'}
        </p>
      </div>
    );
  }

  // Ana Masonry Grid
  return (
    <>
      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 900px) { 
          .masonry-container { column-count: 2 !important; } 
        }
        @media (max-width: 600px) { 
          .masonry-container { column-count: 1 !important; } 
        }

        /* Görsel geçiş animasyonu */
        .post-image {
          transition: transform 0.3s ease, filter 0.3s ease;
        }
        .post-card:hover .post-image {
          transform: scale(1.05);
          filter: brightness(1.1);
        }

        /* Kart gölge efekti */
        .post-card {
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }
        .post-card:hover {
          box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4) !important;
        }
      `}</style>

      <div 
        className="masonry-container"
        style={{ 
          columnCount: 3, 
          columnGap: '20px', 
          padding: '40px 20px', 
          maxWidth: '1200px', 
          margin: '0 auto' 
        }}
      >
        {posts.map((post) => (
          <motion.div
            key={post.id}
            className="post-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -5 }}
            onClick={() => navigate(`/yazi/${post.id}`)}
            style={{
              breakInside: 'avoid',
              marginBottom: '20px',
              background: '#1a1a1a',
              borderRadius: '10px',
              overflow: 'hidden',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
            {/* Görsel Alanı */}
            {post.image_url && !imageErrors[post.id] ? (
              <div style={{ 
                width: '100%', 
                overflow: 'hidden',
                backgroundColor: '#0d0d0d' 
              }}>
                <img 
                  src={post.image_url}
                  alt={post.title || 'Blog görseli'}
                  className="post-image"
                  style={{ 
                    width: '100%', 
                    height: 'auto',
                    display: 'block',
                    objectFit: 'cover'
                  }}
                  onError={() => handleImageError(post.id)}
                  loading="lazy"
                />
              </div>
            ) : post.image_url && imageErrors[post.id] ? (
              // Görsel yüklenemedi durumu
              <div style={{
                width: '100%',
                height: '200px',
                background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#666'
              }}>
                <span style={{ fontSize: '2rem', marginBottom: '10px' }}>🖼️</span>
                <span style={{ fontSize: '0.85rem' }}>Görsel yüklenemedi</span>
              </div>
            ) : null}

            {/* İçerik Alanı */}
            <div style={{ padding: '20px' }}>
              {/* Kategori Badge */}
              {post.category && (
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: '#d4af37', 
                  textTransform: 'uppercase', 
                  letterSpacing: '1.5px',
                  fontWeight: '600',
                  display: 'inline-block',
                  marginBottom: '8px'
                }}>
                  {post.category}
                </span>
              )}

              {/* Başlık */}
              <h3 style={{ 
                margin: '10px 0', 
                fontSize: '1.4rem', 
                fontFamily: '"Times New Roman", serif', 
                color: '#fff',
                lineHeight: '1.3',
                fontWeight: '600'
              }}>
                {post.title}
              </h3>

              {/* Açıklama/Özet */}
              {post.content && (
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: '#bbb', 
                  lineHeight: '1.6',
                  marginTop: '10px'
                }}>
                  {stripHtml(post.content).substring(0, 120)}
                  {stripHtml(post.content).length > 120 && '...'}
                </p>
              )}

              {/* Tarih */}
              {post.created_at && (
                <p style={{
                  fontSize: '0.75rem',
                  color: '#777',
                  marginTop: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>📅</span>
                  {new Date(post.created_at).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              )}

              {/* Devamını Oku Linki */}
              <div style={{
                marginTop: '15px',
                paddingTop: '15px',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <span style={{
                  fontSize: '0.85rem',
                  color: '#d4af37',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  Devamını Oku →
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
};

export default Masonry;