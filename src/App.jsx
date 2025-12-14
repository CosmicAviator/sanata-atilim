import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

import Hero from './components/Hero.jsx';
import Masonry from './components/Masonry.jsx';
import CreatePost from './pages/CreatePost.jsx';
import AdminAuth from './pages/AdminAuth.jsx';
import ArticleDetail from './pages/ArticleDetail.jsx';

// Kategori listesi
const CATEGORIES = ['Hepsi', 'Sinema', 'Mitoloji', 'Edebiyat', 'Sanat']; 

function NavigationBar({ isAdmin, selectedCategory, onCategoryChange }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = window.innerWidth < 768;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    window.location.reload(); 
  };
  
  const handleCategoryClick = (cat) => {
    if (onCategoryChange) onCategoryChange(cat);
    if (isMobile) setIsMenuOpen(false);
  };

  const navPadding = isMobile ? '20px 20px' : '30px 40px'; 

  return (
    <nav style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      padding: navPadding, 
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      color: '#ccc',
      textShadow: '0 0 8px rgba(0,0,0,0.8)'
    }}>
      {/* Sol Üst: Site İsmi */}
      <Link 
        to="/" 
        onClick={() => handleCategoryClick('Hepsi')}
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

      {/* Sağ Üst: HAMBURGER veya NORMAL MENU */}
      <div style={{ textAlign: 'right', position: 'relative' }}>
        
        {/* MOBİL: HAMBURGER İKONU */}
        {isMobile && (
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#d4af37',
              fontSize: '2rem',
              cursor: 'pointer',
              padding: '0',
              lineHeight: '1',
              position: 'relative',
              zIndex: 101,
            }}
          >
            {isMenuOpen ? '✕' : '☰'} 
          </button>
        )}
        
        {/* MOBİL VEYA NORMAL MENÜ KAPSAYICISI */}
        <AnimatePresence>
          {(!isMobile || isMenuOpen) && (
            <motion.div
              initial={isMobile ? { opacity: 0, x: 50 } : false}
              animate={isMobile ? { opacity: 1, x: 0 } : false}
              exit={isMobile ? { opacity: 0, x: 50 } : false}
              transition={{ duration: 0.2 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                
                // MOBİL MENÜ STİLİ
                ...(isMobile && {
                  position: 'fixed',
                  top: 0,
                  right: 0,
                  width: '70vw',
                  height: '100vh',
                  background: 'rgba(10, 10, 10, 0.95)',
                  boxShadow: '-5px 0 20px rgba(0, 0, 0, 0.5)',
                  padding: '100px 30px 30px 30px',
                  alignItems: 'flex-start',
                  zIndex: 99,
                  overflowY: 'auto'
                }),
                
                // MASAÜSTÜ STİLİ
                ...(!isMobile && {
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: '30px',
                })
              }}
            >
              
              {/* ADMIN MENÜSÜ / GİRİŞ */}
              <div style={{ 
                width: isMobile ? '100%' : 'auto', 
                textAlign: 'right' 
              }}>
                
                {isAdmin ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{ 
                      display: 'flex', 
                      gap: '15px', 
                      marginBottom: '20px',
                      flexDirection: isMobile ? 'column' : 'row'
                    }}
                  >
                    <Link 
                      to="/admin/create"
                      onClick={() => isMobile && setIsMenuOpen(false)}
                      style={{
                        color: '#d4af37',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        fontFamily: 'sans-serif',
                      }}
                    >
                      Yeni Yazı
                    </Link>
                    <button
                      onClick={handleLogout}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#888',
                        fontSize: '0.9rem',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        fontFamily: 'sans-serif',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Çıkış
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{ marginBottom: '20px' }}
                  >
                    <Link 
                      to="/admin/auth"
                      onClick={() => isMobile && setIsMenuOpen(false)}
                      style={{
                        color: '#888',
                        textDecoration: 'none',
                        fontSize: '0.8rem',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        fontFamily: 'sans-serif',
                      }}
                    >
                      Admin Girişi
                    </Link>
                  </motion.div>
                )}
              </div>

              {/* Kategori Filtreleri (Sadece Ana Sayfada) */}
              {window.location.pathname === '/' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  style={{ 
                    display: 'flex', 
                    gap: '15px', 
                    justifyContent: isMobile ? 'flex-start' : 'flex-end',
                    flexDirection: isMobile ? 'column' : 'row'
                  }}
                >
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryClick(cat)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: selectedCategory === cat ? '#d4af37' : '#888',
                        fontSize: '0.9rem',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        fontFamily: 'sans-serif',
                        cursor: 'pointer',
                        padding: 0,
                        fontWeight: selectedCategory === cat ? 'bold' : 'normal',
                        borderBottom: selectedCategory === cat ? '1px solid #d4af37' : 'none',
                        paddingBottom: selectedCategory === cat ? '2px' : '0'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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
  
  const isMobile = window.innerWidth < 768; 

  // Admin session kontrolü (Aynı Kaldı)
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

  // 🔥 KRİTİK DÜZELTME: Yazıları çeken fonksiyonun implementasyonu geri getirildi.
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

      console.log('✅ App - Yüklenen yazılar:', data?.length || 0);
      setPosts(data || []);
    } catch (err) {
      console.error('❌ Yazıları yükleme hatası:', err.message);
      setError('Yazılar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  // Protected Route (Aynı Kaldı)
  const ProtectedRoute = ({ children }) => {
    return isAdmin ? children : <Navigate to="/admin/auth" replace />;
  };

  const contentPadding = isMobile ? '40px 20px' : '60px 40px'; 

  return (
    <Router>
      <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
        {/* Navigation - Hamburger menü desteğiyle */}
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
                  padding: contentPadding, 
                }}>
                  {loading && (
                    <div style={{ textAlign: 'center', color: '#888', padding: '50px' }}>Yükleniyor...</div>
                  )}
                  {error && (
                    <div style={{ textAlign: 'center', color: '#f44336', padding: '50px' }}>{error}</div>
                  )}
                  
                  {!loading && !error && posts.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#888', padding: '50px' }}>
                      Seçilen kategoride ( **{selectedCategory}** ) yazı bulunmuyor.
                    </div>
                  )}
                  
                  {!loading && !error && posts.length > 0 && (
                    <Masonry items={posts} category={selectedCategory} />
                  )}
                </div>
              </>
            } 
          />

          <Route path="/admin/auth" element={<AdminAuth />} />

          {/* Yazı Detay Sayfası */}
          <Route path="/yazi/:id" element={<ArticleDetail />} />

          <Route 
            path="/admin/create" 
            element={
              <ProtectedRoute>
                <CreatePost onPostCreated={fetchPosts} />
              </ProtectedRoute>
            } 
          />

          {/* 404 Sayfası */}
          <Route 
            path="*" 
            element={
              <div style={{
                minHeight: '100vh',
                background: '#0a0a0a',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#f0f0e0',
                textAlign: 'center',
                padding: '40px',
                marginTop: '-80px' 
              }}>
                <h2 style={{ fontSize: '4rem', fontFamily: '"Times New Roman", serif', marginBottom: '10px', color: '#d4af37' }}>404</h2>
                <p style={{ fontSize: '1.5rem', marginBottom: '30px' }}>Sayfa Bulunamadı</p>
                <Link to="/" style={{ color: '#d4af37', textDecoration: 'none', borderBottom: '1px solid #d4af37', paddingBottom: '2px' }}>
                  ← Ana Sayfaya Dön
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