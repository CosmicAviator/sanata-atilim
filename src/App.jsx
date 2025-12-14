import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Hero from './components/Hero.jsx';
import Masonry from './components/Masonry.jsx';
import CreatePost from './pages/CreatePost.jsx';
import AdminAuth from './pages/AdminAuth.jsx';

// ✅ YENİ: Navigation Bar Component
function NavigationBar({ isAdmin, selectedCategory, onCategoryChange }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/');
      window.location.reload(); // Sayfayı yenile
    }
  };

  const categories = ['Hepsi', 'Sinema', 'Edebiyat', 'Felsefe'];

  return (
    <nav style={{
      background: '#1a1a1a',
      borderBottom: '2px solid #d4af37',
      padding: '15px 40px',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        {/* Sol: Logo ve Başlık */}
        <Link 
          to="/" 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            textDecoration: 'none'
          }}
          onClick={() => onCategoryChange && onCategoryChange('Hepsi')}
        >
          <div style={{
            fontSize: '2rem',
            fontFamily: '"Times New Roman", serif',
            color: '#d4af37',
            fontWeight: 'bold',
            letterSpacing: '2px'
          }}>
            🎨 SANATA ATILIM
          </div>
          <div style={{
            fontSize: '0.9rem',
            color: '#888',
            fontStyle: 'italic',
            borderLeft: '2px solid #d4af37',
            paddingLeft: '15px'
          }}>
            Kütüphane Topluluğu
          </div>
        </Link>

        {/* Orta: Kategori Filtreleri (sadece ana sayfada) */}
        {window.location.pathname === '/' && (
          <div style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange && onCategoryChange(cat)}
                style={{
                  background: selectedCategory === cat ? '#d4af37' : 'transparent',
                  color: selectedCategory === cat ? '#000' : '#d4af37',
                  border: '2px solid #d4af37',
                  padding: '8px 18px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
                onMouseOver={(e) => {
                  if (selectedCategory !== cat) {
                    e.target.style.background = '#d4af3720';
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedCategory !== cat) {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Sağ: Admin Menü */}
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {isAdmin ? (
            <>
              <Link 
                to="/admin/create" 
                style={{
                  background: '#d4af37',
                  color: '#000',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s',
                  border: '2px solid #d4af37',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#d4af37';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#d4af37';
                  e.target.style.color = '#000';
                }}
              >
                ✍️ Yeni Yazı
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  color: '#ff6b6b',
                  border: '2px solid #ff6b6b',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#ff6b6b';
                  e.target.style.color = '#fff';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#ff6b6b';
                }}
              >
                🚪 Çıkış
              </button>
            </>
          ) : (
            <Link 
              to="/admin/auth" 
              style={{
                color: '#d4af37',
                textDecoration: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'color 0.3s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseOver={(e) => e.target.style.color = '#fff'}
              onMouseOut={(e) => e.target.style.color = '#d4af37'}
            >
              🔐 Admin Girişi
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Hepsi'); // ✅ Kategori filtresi

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

  // Yazıları çek - ✅ DÜZELTME: image_url → image dönüşümü
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      // ✅ Kategori filtreleme
      if (selectedCategory !== 'Hepsi') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;

      // ⚠️ KRİTİK FİX: image_url'yi image'e dönüştür (Masonry için gerekli)
      const transformedPosts = (data || []).map(post => ({
        ...post,
        image: post.image_url
      }));

      console.log('✅ Yüklenen yazı sayısı:', transformedPosts.length);
      setPosts(transformedPosts);
      
    } catch (err) {
      console.error('❌ Yazılar yüklenirken hata:', err.message);
      setError('Yazılar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]); // ✅ Kategori değişince yeniden yükle

  // Protected Route Bileşeni
  const ProtectedRoute = ({ children }) => {
    return isAdmin ? children : <Navigate to="/admin/auth" replace />;
  };

  return (
    <Router>
      <div className="App" style={{ minHeight: '100vh', background: '#0a0a0a' }}>
        {/* Navigation Bar - Her sayfada görünsün */}
        <NavigationBar 
          isAdmin={isAdmin} 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        
        <Routes>
          {/* Ana Sayfa - Hero + Blog Yazıları */}
          <Route 
            path="/" 
            element={
              <>
                {/* Hero component sadece ana sayfada */}
                <Hero />
                
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
                  {loading && (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#fff' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        border: '3px solid rgba(212, 175, 55, 0.3)',
                        borderTop: '3px solid #d4af37',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px'
                      }}></div>
                      <p style={{ color: '#bbb' }}>Yazılar yükleniyor...</p>
                      <style>{`
                        @keyframes spin {
                          0% { transform: rotate(0deg); }
                          100% { transform: rotate(360deg); }
                        }
                      `}</style>
                    </div>
                  )}
                  
                  {error && (
                    <div style={{
                      background: '#ff6b6b20',
                      border: '1px solid #ff6b6b',
                      color: '#ff6b6b',
                      padding: '20px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      maxWidth: '600px',
                      margin: '0 auto'
                    }}>
                      {error}
                    </div>
                  )}
                  
                  {!loading && !error && posts.length === 0 && (
                    <div style={{
                      textAlign: 'center',
                      padding: '60px 20px',
                      color: '#bbb'
                    }}>
                      <p style={{ fontSize: '3rem', marginBottom: '20px' }}>📝</p>
                      <p style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '10px' }}>
                        {selectedCategory === 'Hepsi' 
                          ? 'Henüz yazı bulunmuyor.' 
                          : `"${selectedCategory}" kategorisinde henüz yazı yok.`}
                      </p>
                      {isAdmin && (
                        <Link 
                          to="/admin/create"
                          style={{
                            display: 'inline-block',
                            marginTop: '20px',
                            background: '#d4af37',
                            color: '#000',
                            padding: '12px 30px',
                            borderRadius: '5px',
                            textDecoration: 'none',
                            fontWeight: 'bold'
                          }}
                        >
                          İlk yazıyı oluştur
                        </Link>
                      )}
                    </div>
                  )}
                  
                  {!loading && !error && posts.length > 0 && (
                    <Masonry items={posts} category={selectedCategory} />
                  )}
                </div>
              </>
            } 
          />

          {/* Admin Giriş Sayfası */}
          <Route path="/admin/auth" element={<AdminAuth />} />

          {/* Yazı Oluşturma Sayfası (Sadece Admin) */}
          <Route 
            path="/admin/create" 
            element={
              <ProtectedRoute>
                <CreatePost onPostCreated={fetchPosts} />
              </ProtectedRoute>
            } 
          />

          {/* 404 - Sayfa Bulunamadı */}
          <Route 
            path="*" 
            element={
              <div style={{
                textAlign: 'center',
                padding: '100px 20px',
                color: '#fff'
              }}>
                <h1 style={{ fontSize: '6rem', marginBottom: '20px', color: '#d4af37' }}>404</h1>
                <p style={{ fontSize: '1.5rem', marginBottom: '30px', color: '#bbb' }}>Sayfa bulunamadı</p>
                <Link 
                  to="/"
                  style={{
                    display: 'inline-block',
                    background: '#d4af37',
                    color: '#000',
                    padding: '15px 40px',
                    borderRadius: '5px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: '1.1rem'
                  }}
                >
                  Ana Sayfaya Dön
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