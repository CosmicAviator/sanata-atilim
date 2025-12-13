import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Masonry from './components/Masonry';
import Hero from './components/Hero';
import ArticleDetail from './pages/ArticleDetail';
import CreatePost from './pages/CreatePost';
import Contact from './pages/Contact'; // Birazdan oluşturacağız
import './App.css';

// --- ANA SAYFA ---
const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // FİLTRELEME İÇİN YENİ DEĞİŞKEN
  const [selectedCategory, setSelectedCategory] = useState('HEPSİ');

  useEffect(() => { fetchPosts(); }, []);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('id', { ascending: false });

    if (error) console.log('Hata:', error);
    else {
      const formattedData = data.map(post => ({ ...post, image: post.image_url }));
      setPosts(formattedData);
    }
    setLoading(false);
  }

  // --- KATEGORİ LİSTESİ ---
  const categories = ['HEPSİ', 'SİNEMA', 'EDEBİYAT', 'MİTOLOJİ', 'SANAT'];

  // --- FİLTRELEME MANTIĞI ---
  // Eğer 'HEPSİ' seçiliyse tümünü göster, değilse kategori ismine göre süz
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
                  color: selectedCategory === cat ? '#d4af37' : '#666', // Seçili olan Altın Rengi, değilse gri
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

// --- TRAFİK POLİSİ ---
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/article/:id" element={<ArticleDetail />} />
        <Route path="/gizli-oda" element={<CreatePost />} />
        <Route path="/iletisim" element={<Contact />} /> 
      </Routes>
    </Router>
  );
}

export default App;