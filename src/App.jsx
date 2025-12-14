import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { motion } from 'framer-motion';
import Hero from './components/Hero.jsx';
import Masonry from './components/Masonry.jsx';
import CreatePost from './pages/CreatePost.jsx';
import AdminAuth from './pages/AdminAuth.jsx';
import ArticleDetail from './pages/ArticleDetail.jsx'; // ✅ Yeni eklendi

// ✅ Minimal ve Zarif Navigation Bar
function NavigationBar({ isAdmin, selectedCategory, onCategoryChange }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    window.location.reload();
  };

  const categories = ['Hepsi', 'Sinema', 'Edebiyat', 'Felsefe'];

  return (
    <nav style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      padding: '30px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      color: '#ccc',
      textShadow: '0 2px 8px rgba(0,0,0,0.8)'
    }}>
      {/* Sol Üst: Site İsmi */}
      <Link 
        to="/" 
        onClick={() => onCategoryChange && onCategoryChange('Hepsi')}
        style={{ textDecoration: 'none' }}
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h1 style={{
            margin: 0,
            fontSize: '1.8rem',
            fontFamily: '"Times New Roman", serif',
            color: '#f0f0e0',
            fontWeight: '300',
            letterSpacing: '3px',
            lineHeight: '1.4'
          }}>
            SANATA ATILIM<br />
            <span style={{
              fontSize: '0.85rem',
              letterSpacing: '2px',
              color: '#888',
              textTransform: 'uppercase',
              fontFamily: 'sans-serif'
            }}>
              Kütüphane Topluluğu
            </span>
          </h1>
        </motion.div>
      </Link>

      {/* Sağ Üst: Admin veya Kategori */}
      <div style={{ textAlign: 'right' }}>
        {/* Admin Menüsü */}
        {isAdmin && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ 
              display: 'flex', 
              gap: '15px', 
              marginBottom: '20px',
              justifyContent: 'flex-end'
            }}
          >
            <Link 
              to="/admin/create"
              style={{
                color: '#d4af37',
                textDecoration: 'none',
                fontSize: '0.75rem',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                fontFamily: 'sans-serif',
                transition: 'opacity 0.3s'
              }}
              onMouseOver={(e) => e.target.style.opacity = '0.7'}
              onMouseOut={(e) => e.target.style.opacity = '1'}
            >
              Yeni Yazı
            </Link>
            <button
              onClick={handleLogout}
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
              onMouseOver={(e) => e.target.style.color = '#f0f0e0'}
              onMouseOut={(e) => e.target.style.color = '#888'}
            >
              Çıkış
            </button>
          </motion.div>
        )}

        {/* Admin Giriş (Admin değilse) */}
        {!isAdmin && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ marginBottom: '20px' }}
          >
            <Link 
              to="/admin/auth"
              style={{
                color: '#888',
                textDecoration: 'none',
                fontSize: '0.7rem',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                fontFamily: 'sans-serif',
                transition: 'color 0.3s'
              }}
              onMouseOver={(e) => e.target.style.color = '#d4af37'}
              onMouseOut={(e) => e.target.style.color = '#888'}
            >
              Admin
            </Link>
          </motion.div>
        )}

        {/* Kategori Filtreleri (Ana sayfada) */}
        {window.location.pathname === '/' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange && onCategoryChange(cat)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: selectedCategory === cat ? '#d4af37' : '#888',
                  fontSize: '0.85rem',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  fontFamily: 'sans-serif',
                  cursor: 'pointer',
                  transition: 'color 0.3s',
                  padding: 0,
                  fontWeight: selectedCategory === cat ? 'bold' : 'normal'
                }}
                onMouseOver={(e) => {
                  if (selectedCategory !== cat) {
                    e.target.style.color = '#ccc';
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedCategory !== cat) {
                    e.target.style.color = '#888';
                  }
                }}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </nav>
  );
}

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Hepsi');

  // Admin session kontrolü
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAdmin(!!session);
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAdmin(!!session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Yazıları çek
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'Hepsi') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedPosts = (data || []).map(post => ({
        ...post,
        image: post.image_url
      }));

      console.log('✅ Yüklenen yazı sayısı:', transformedPosts.length);
      setPosts(transformedPosts);
      
    } catch (err) {
      console.error('❌ Yazılar yüklenirken hata:', err.message);
      setError('Yazılar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  // Protected Route
  const ProtectedRoute = ({ children }) => {
    return isAdmin ? children : <Navigate to="/admin/auth" replace />;
  };

  return (
    <Router>
      <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
        {/* Navigation - Transparent overlay */}
        <NavigationBar 
          isAdmin={isAdmin} 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        
        <Routes>
          {/* Ana Sayfa */}
          <Route 
            path="/" 
            element={
              <>
                <Hero />
                
                {/* İçerik Alanı */}
                <div style={{ 
                  maxWidth: '1200px', 
                  margin: '0 auto', 
                  padding: '60px 40px' 
                }}>
                  {loading && (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '100px 0', 
                      color: '#888' 
                    }}>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        style={{
                          width: '40px',
                          height: '40px',
                          border: '2px solid rgba(212, 175, 55, 0.2)',
                          borderTop: '2px solid #d4af37',
                          borderRadius: '50%',
                          margin: '0 auto 20px'
                        }}
                      />
                      <p style={{ 
                        fontSize: '0.8rem', 
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        fontFamily: 'sans-serif'
                      }}>
                        Yükleniyor...
                      </p>
                    </div>
                  )}
                  
                  {error && (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: '#888',
                      fontSize: '0.9rem'
                    }}>
                      {error}
                    </div>
                  )}
                  
                  {!loading && !error && posts.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        textAlign: 'center',
                        padding: '100px 20px',
                        color: '#888'
                      }}
                    >
                      <p style={{ 
                        fontSize: '1rem', 
                        marginBottom: '10px',
                        fontFamily: '"Times New Roman", serif',
                        fontStyle: 'italic'
                      }}>
                        {selectedCategory === 'Hepsi' 
                          ? 'Henüz yazı bulunmuyor.' 
                          : `"${selectedCategory}" kategorisinde yazı yok.`}
                      </p>
                      {isAdmin && (
                        <Link 
                          to="/admin/create"
                          style={{
                            color: '#d4af37',
                            fontSize: '0.75rem',
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            textDecoration: 'none',
                            fontFamily: 'sans-serif'
                          }}
                        >
                          İlk yazıyı oluştur →
                        </Link>
                      )}
                    </motion.div>
                  )}
                  
                  {!loading && !error && posts.length > 0 && (
                    <Masonry items={posts} category={selectedCategory} />
                  )}
                </div>
              </>
            } 
          />

          <Route path="/admin/auth" element={<AdminAuth />} />

          {/* ✅ Yazı Detay Sayfası */}
          <Route path="/yazi/:id" element={<ArticleDetail />} />

          <Route 
            path="/admin/create" 
            element={
              <ProtectedRoute>
                <CreatePost onPostCreated={fetchPosts} />
              </ProtectedRoute>
            } 
          />

          {/* 404 */}
          <Route 
            path="*" 
            element={
              <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#888',
                textAlign: 'center'
              }}>
                <h1 style={{ 
                  fontSize: '8rem', 
                  margin: 0, 
                  fontFamily: '"Times New Roman", serif',
                  color: '#d4af37',
                  fontWeight: '300'
                }}>
                  404
                </h1>
                <p style={{ 
                  fontSize: '0.8rem', 
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  fontFamily: 'sans-serif',
                  marginBottom: '30px'
                }}>
                  Sayfa bulunamadı
                </p>
                <Link 
                  to="/"
                  style={{
                    color: '#d4af37',
                    fontSize: '0.75rem',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    fontFamily: 'sans-serif',
                    borderBottom: '1px solid #d4af37',
                    paddingBottom: '2px'
                  }}
                >
                  Ana Sayfa
                </Link>
              </div>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;