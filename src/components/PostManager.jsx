import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

const PostManager = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // MOBİL UYUM HESAPLAMASI
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    fetchPosts();
  }, []);

  // Yazıları çek
  async function fetchPosts() {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, category, created_at, image_url')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('✅ PostManager - Yüklenen yazılar:', data?.length || 0);
      setPosts(data || []);
    } catch (err) {
      console.error('❌ PostManager - Hata:', err.message);
      setError('Yazılar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }

  // Yazı silme (görsel dahil)
  const handleDelete = async (postId) => {
    setDeleting(postId);

    try {
      // 1. Post bilgisini al (görsel URL'si için)
      const post = posts.find(p => p.id === postId);
      
      // 2. Eğer görsel varsa, önce storage'dan sil
      if (post?.image_url) {
        try {
          // 🔥 KRİTİK DÜZELTME: Dosya yolunu Supabase formatına uygun çıkar
          // URL yapısı: .../storage/v1/object/public/blog-images/dosya_adı
          // İhtiyacımız olan yol: blog-images/dosya_adı
          const urlSegments = post.image_url.split('/');
          const filePath = urlSegments.slice(-2).join('/'); 
          
          console.log('🗑️ Görsel siliniyor:', filePath);

          const { error: storageError } = await supabase.storage
            .from('blog-images')
            .remove([filePath]);

          if (storageError) {
            // Hata olsa bile DB silmeye devam et, sadece uyarı ver
            console.warn('⚠️ Görsel silinemedi:', storageError.message);
          } else {
            console.log('✅ Görsel silindi');
          }
        } catch (storageErr) {
          console.warn('⚠️ Storage silme hatası:', storageErr.message);
        }
      }

      // 3. Veritabanından sil
      console.log('🗑️ Veritabanından siliniyor:', postId);

      const { error: dbError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (dbError) throw dbError;

      // 4. State'ten kaldır
      setPosts(posts.filter(post => post.id !== postId));
      setDeleteConfirm(null);
      
      console.log('✅ Yazı başarıyla silindi');

    } catch (err) {
      console.error('❌ Silme hatası:', err);
      alert('Yazı silinirken bir hata oluştu: ' + err.message);
    } finally {
      setDeleting(null);
    }
  };

  // Loading durumu
  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        marginTop: '40px',
        color: '#ccc' 
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(212, 175, 55, 0.3)',
          borderTop: '3px solid #d4af37',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 15px'
        }}></div>
        <p>Arşiv yükleniyor...</p>
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
        marginTop: '40px',
        color: '#ff6b6b',
        padding: '20px',
        background: '#ff6b6b20',
        borderRadius: '8px',
        border: '1px solid #ff6b6b'
      }}>
        <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>😔 Bir Hata Oluştu</p>
        <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>{error}</p>
        <button 
          onClick={fetchPosts}
          style={{
            marginTop: '15px',
            padding: '10px 20px',
            background: '#ff6b6b',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🔄 Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        maxWidth: '900px', // PostManager'ın maksimum genişliği
        margin: '0 auto',
        padding: isMobile ? '40px 20px' : '60px 40px',
        paddingTop: isMobile ? '120px' : '150px' // Navigasyon altından başlaması için
      }}
    >
      {/* Başlık */}
      <h3 style={{ 
        fontFamily: '"Times New Roman", serif', 
        borderBottom: '2px solid #d4af37', 
        paddingBottom: '10px', 
        marginTop: '40px', 
        fontSize: '1.8rem',
        color: '#d4af37',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: isMobile ? 'column' : 'row',
        textAlign: isMobile ? 'center' : 'left'
      }}>
        <span>📚 Tüm Yazılar ({posts.length})</span>
        
        {/* Yenile Butonu */}
        <button
          onClick={fetchPosts}
          style={{
            background: 'none',
            border: '1px solid #d4af37',
            color: '#d4af37',
            padding: '8px 15px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 'normal',
            transition: 'all 0.3s',
            marginTop: isMobile ? '15px' : '0' 
          }}
          onMouseOver={(e) => {
            e.target.style.background = '#d4af37';
            e.target.style.color = '#000';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'none';
            e.target.style.color = '#d4af37';
          }}
        >
          🔄 Yenile
        </button>
      </h3>

      {/* Boş durum */}
      {posts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#888',
          background: '#1a1a1a',
          borderRadius: '8px',
          marginTop: '20px',
          border: '1px dashed #333'
        }}>
          <p style={{ fontSize: '3rem', marginBottom: '15px' }}>📝</p>
          <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Henüz arşivde yazı bulunmuyor</p>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>İlk yazınızı oluşturun!</p>
        </div>
      ) : (
        // Yazı listesi
        <ul style={{ 
          listStyle: 'none', 
          padding: 0,
          marginTop: '20px'
        }}>
          <AnimatePresence>
            {posts.map((post) => (
              <motion.li
                key={post.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row', 
                  gap: '15px',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  padding: '15px',
                  background: '#1a1a1a',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  border: '1px solid #333',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#222';
                  e.currentTarget.style.borderColor = '#d4af37';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#1a1a1a';
                  e.currentTarget.style.borderColor = '#333';
                }}
              >
                {/* Thumbnail (varsa) */}
                {post.image_url && (
                  <Link to={`/yazi/${post.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      width: isMobile ? '100%' : '80px', 
                      height: isMobile ? '150px' : '80px',
                      flexShrink: 0,
                      borderRadius: '5px',
                      overflow: 'hidden',
                      background: '#0d0d0d'
                    }}>
                      <img
                        src={post.image_url}
                        alt={post.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  </Link>
                )}

                {/* İçerik Bilgileri */}
                <div style={{ 
                  flexGrow: 1, 
                  minWidth: 0,
                  marginTop: isMobile ? '10px' : '0' 
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '5px'
                  }}>
                    <Link to={`/yazi/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <strong style={{ 
                        color: '#fff',
                        fontSize: '1.1rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: isMobile ? 'normal' : 'nowrap',
                        transition: 'color 0.3s'
                      }}
                      onMouseOver={(e) => e.target.style.color = '#d4af37'}
                      onMouseOut={(e) => e.target.style.color = '#fff'}
                      >
                        {post.title}
                      </strong>
                    </Link>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row', 
                    gap: '10px',
                    fontSize: '0.85rem'
                  }}>
                    {/* Kategori Badge */}
                    <span style={{
                      color: '#d4af37',
                      background: '#d4af3720',
                      padding: '2px 8px',
                      borderRadius: '3px',
                      fontWeight: '600',
                      width: isMobile ? 'fit-content' : 'auto'
                    }}>
                      {post.category}
                    </span>

                    {/* Tarih */}
                    <span style={{ color: '#888' }}>
                      📅 {new Date(post.created_at).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Silme Butonu */}
                <div style={{ 
                  flexShrink: 0, 
                  alignSelf: isMobile ? 'flex-end' : 'center'
                }}>
                  {deleteConfirm === post.id ? (
                    // İki aşamalı onay
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(post.id)} // Sadece ID gönderildi
                        disabled={deleting === post.id}
                        style={{
                          background: '#f44336',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 15px',
                          borderRadius: '5px',
                          cursor: deleting === post.id ? 'not-allowed' : 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          opacity: deleting === post.id ? 0.6 : 1
                        }}
                      >
                        {deleting === post.id ? '⏳' : '✓ Eminim'}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setDeleteConfirm(null)}
                        disabled={deleting === post.id}
                        style={{
                          background: '#333',
                          color: '#fff',
                          border: '1px solid #555',
                          padding: '8px 15px',
                          borderRadius: '5px',
                          cursor: deleting === post.id ? 'not-allowed' : 'pointer',
                          fontSize: '0.85rem',
                          opacity: deleting === post.id ? 0.6 : 1
                        }}
                      >
                        İptal
                      </motion.button>
                    </div>
                  ) : (
                    // İlk silme butonu
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDeleteConfirm(post.id)}
                      style={{
                        background: 'none',
                        border: '1px solid #f44336',
                        color: '#f44336',
                        padding: '8px 15px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        transition: 'all 0.3s'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = '#f44336';
                        e.target.style.color = '#fff';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = 'none';
                        e.target.style.color = '#f44336';
                      }}
                    >
                      🗑️ Sil
                    </motion.button>
                  )}
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {/* İstatistikler */}
      {posts.length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#1a1a1a',
          borderRadius: '8px',
          border: '1px solid #333',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '10px' : '30px',
          justifyContent: isMobile ? 'flex-start' : 'center',
          fontSize: '0.9rem',
          color: '#888'
        }}>
          <div>
            <span style={{ color: '#d4af37', fontWeight: 'bold' }}>Toplam:</span> {posts.length} yazı
          </div>
          <div>
            <span style={{ color: '#d4af37', fontWeight: 'bold' }}>Sinema:</span>{' '}
            {posts.filter(p => p.category === 'Sinema').length}
          </div>
          <div>
            <span style={{ color: '#d4af37', fontWeight: 'bold' }}>Edebiyat:</span>{' '}
            {posts.filter(p => p.category === 'Edebiyat').length}
          </div>
          <div>
            <span style={{ color: '#d4af37', fontWeight: 'bold' }}>Felsefe:</span>{' '}
            {posts.filter(p => p.category === 'Felsefe').length}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PostManager;