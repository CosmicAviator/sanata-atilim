import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';

const PostManager = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    // Tüm yazıları getir (Admin olduğu için tümüne erişebilir)
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, category, created_at') // Sadece gerekli alanları getir
      .order('created_at', { ascending: false });

    if (error) console.error('Yazılar getirilirken hata:', error);
    else setPosts(data);
    
    setLoading(false);
  }

  const handleDelete = async (postId, title) => {
    // Silme onayı al
    const confirmDelete = window.confirm(`"${title}" başlıklı yazıyı gerçekten silmek istiyor musunuz? Bu işlem geri alınamaz!`);
    
    if (!confirmDelete) return; // Kullanıcı iptal ettiyse çık

    try {
      // Supabase'den yazıyı sil
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) {
        throw error;
      }

      // Başarılıysa, listeden kaldır ve kullanıcıya bildir
      setPosts(posts.filter(post => post.id !== postId));
      alert(`"${title}" başlıklı yazı başarıyla silindi.`);

    } catch (error) {
      alert('Yazı silinirken hata oluştu: ' + error.message);
    }
  };

  if (loading) {
    return <div style={{ color: '#ccc', textAlign: 'center', marginTop: '20px' }}>Arşiv yükleniyor...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h3 style={{ fontFamily: '"Times New Roman", serif', borderBottom: '1px solid #d4af37', paddingBottom: '10px', marginTop: '40px', fontSize: '1.8rem' }}>
        Tüm Yazılar ({posts.length})
      </h3>
      
      {posts.length === 0 ? (
        <p style={{color: '#888', marginTop: '20px'}}>Henüz arşivde yazı bulunmuyor.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {posts.map(post => (
            <li 
              key={post.id} 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '15px', 
                borderBottom: '1px solid #333'
              }}
            >
              <div style={{ flexGrow: 1 }}>
                <strong style={{ color: '#fff' }}>{post.title}</strong>
                <span style={{ color: '#d4af37', marginLeft: '10px', fontSize: '0.9rem' }}>[{post.category}]</span>
                <span style={{ color: '#888', marginLeft: '10px', fontSize: '0.8rem' }}>
                  {new Date(post.created_at).toLocaleDateString('tr-TR')}
                </span>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDelete(post.id, post.title)}
                style={{
                  background: 'none',
                  border: '1px solid #f44336',
                  color: '#f44336',
                  padding: '5px 10px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Sil
              </motion.button>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};

export default PostManager;