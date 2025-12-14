import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient'; // Supabase'i alıyoruz

import Masonry from './components/Masonry';
import Hero from './components/Hero';

// Sayfaları import et (Uzantıların doğru olduğundan emin ol)
import ArticleDetail from './pages/ArticleDetail.jsx';
import CreatePost from './pages/CreatePost.jsx';
import Contact from './pages/Contact.jsx'; 
import AdminAuth from './pages/AdminAuth.jsx'; 

import './App.css';

// --- GÜVENLİK KOMPONENTİ (AuthGuard) ---
const AuthGuard = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div style={{ color: '#fff', textAlign: 'center', marginTop: '100px' }}>Güvenlik Kontrol Ediliyor...</div>; 
  }

  if (!session) {
    return <Navigate to="/gizli-oda" replace />;
  }

  return children;
};


// --- ANA SAYFA (Home) ---
const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('HEPSİ');
  const [session, setSession] = useState(null); 
  const navigate = useNavigate(); // Yönlendirme için eklendi

  // --- OTURUM KAPATMA FONKSİYONU ---
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        alert('Oturumu kapatırken hata oluştu:', error.message);
    } else {
        setSession(null); // Local state'i temizle
        navigate('/'); // Ana sayfaya yönlendir
    }
  };

  useEffect(() => { 
    fetchPosts(); 
    
    // Oturum Kontrolü (Navbar butonu için)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
            setSession(session);
        }
    );

    return () => {
        authListener.subscription.unsubscribe();
    };
  }, []);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('id', { ascending: false });

    if (error) console.log('Hata:', error);
    else {
      // ÇÖZÜM: image_url'i, Masonry'nin beklediği 'image' anahtarına dönüştürüyoruz.
      const formattedData = data.map(post => ({ ...post, image: post.image_url })); 
      setPosts(formattedData);
    }
    setLoading(false);
  }

  const categories = ['HEPSİ', 'SİNEMA', 'EDEBİYAT', 'MİTOLOJİ', 'SANAT'];
  
  const visiblePosts = selectedCategory === 'HEPSİ' 
    ? posts 
    : posts.filter(post => post.category && post.category.toUpperCase().includes(selectedCategory));

  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Yükleniyor...</div>;

  return (
    <>
      {/* NAVBAR */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '2rem 4rem', alignItems: 'center', position: 'absolute', top: 0, left: 0, width: '100%', boxSizing: 'border-box', zIndex: 10 }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', letterSpacing: '1px', textShadow: '0 2px 10px rgba(0,0,0,1)', color: '#fff', fontFamily: '"Times New Roman", serif' }}>
          SANATA ATILIM VE KÜTÜPHANE TOPLULUĞU
        </div>
        <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none' }}>
          <li style={navItemStyle}><Link to="/" style={{color: 'inherit', textDecoration: 'none'}}>ANASAYFA</Link></li>
          <li style={navItemStyle}>MANIFESTO</li>
          <li style={navItemStyle}><Link to="/iletisim" style={{color: 'inherit', textDecoration: 'none'}}>İLETİŞİM</Link></li>
          
          {/* --- YAZI YAZ VE ÇIKIŞ YAP KONTROLÜ --- */}
          {session ? (
            <>
              {/* 1. YAZI YAZ BUTONU */}
              <li style={navItemStyle}><Link to="/yeni" style={{color: '#d4af37', textDecoration: 'none', fontWeight:'bold'}}>YAZI YAZ</Link></li> 
              
              {/* 2. OTURUM KAPATMA BUTONU */}
              <li style={navItemStyle}>
                  <button onClick={handleLogout} style={logoutButtonStyle}>
                      ÇIKIŞ YAP
                  </button>
              </li>
            </>
          ) : (
            null 
          )}
        </ul>
      </nav>

      <Hero />
      
      <div style={{ maxWidth: '1200px', margin: '50px auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', borderBottom: '1px solid #333', paddingBottom: '10px', margin: '0 20px 40px 20px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '100', margin: 0, color: '#ccc', fontFamily: '"Times New Roman", serif' }}>
            YAZILAR
          </h2>

          {/* --- FİLTRE BUTONLARI --- */}
          <div style={{ display: 'flex', gap: '20px' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: selectedCategory === cat ? '#d4af37' : '#666',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  letterSpacing: '2px',
                  fontWeight: selectedCategory === cat ? 'bold' : 'normal',
                  transition: 'color 0.3s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        {/* --- FİLTRELENMİŞ LİSTEYİ GÖSTER --- */}
        {visiblePosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#555' }}>
            <p>Bu rafta henüz bir kitap yok...</p>
            {selectedCategory !== 'HEPSİ' && <p style={{fontSize: '0.8rem'}}>("{selectedCategory}" kategorisinde yazı bulunamadı)</p>}
          </div>
        ) : (
          <Masonry data={visiblePosts} />
        )}
      </div>
    </>
  );
};

const navItemStyle = { fontFamily: 'sans-serif', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '2px', cursor: 'pointer', color: '#ccc', textShadow: '0 2px 5px rgba(0,0,0,0.8)' };

// Logout butonu için özel stil
const logoutButtonStyle = {
    ...navItemStyle,
    background: 'none',
    border: '1px solid #f44336', 
    color: '#f44336', 
    padding: '5px 10px',
    borderRadius: '3px',
    marginLeft: '10px',
    textShadow: 'none',
    transition: 'background-color 0.3s, color 0.3s',
};


// --- TRAFİK POLİSİ (App Componenti) ---
function App() {
  return (
    <Router>
      <Routes>
        {/* Ana Sayfa (Public) */}
        <Route path="/" element={<Home />} />
        
        {/* Makale Detay Sayfası (Public) */}
        <Route path="/article/:id" element={<ArticleDetail />} />
        
        {/* İletişim Sayfası (Public) */}
        <Route path="/iletisim" element={<Contact />} /> 
        
        {/* Yazar Giriş Sayfası (Public) */}
        <Route path="/gizli-oda" element={<AdminAuth />} />
        
        {/* Makale Yazma Sayfası (Korumalı) */}
        <Route path="/yeni" element={
          <AuthGuard>
            <CreatePost />
          </AuthGuard>
        } />
        
      </Routes>
    </Router>
  );
}

export default App;