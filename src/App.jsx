import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient'; // Supabase'i alıyoruz
import { useEffect, useState } from 'react';

// Sayfaları import et
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import CreatePost from './pages/CreatePost';
import AdminAuth from './pages/AdminAuth'; // Yeni giriş sayfası

// --- GÜVENLİK KOMPONENTİ ---
// Kullanıcı giriş yapmamışsa, login sayfasına yönlendirir.
const AuthGuard = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Oturum bilgisini Supabase'ten dinle
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        setLoading(false);
      }
    );

    // İlk yüklemede mevcut oturumu kontrol et
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    // Yüklenirken boş ekran gösterme
    return <div style={{ color: '#fff', textAlign: 'center', marginTop: '100px' }}>Güvenlik Kontrol Ediliyor...</div>; 
  }

  // Eğer session yoksa (giriş yapılmamışsa), '/gizli-oda'ya yönlendir
  if (!session) {
    return <Navigate to="/gizli-oda" replace />;
  }

  // Giriş yapılmışsa, çocuk komponenti (yani CreatePost) göster
  return children;
};


const App = () => {
  return (
    <Router>
      <Routes>
        {/* Ana Sayfa (Public) */}
        <Route path="/" element={<Home />} />
        
        {/* Makale Detay Sayfası (Public) */}
        <Route path="/yazi/:id" element={<ArticleDetail />} />
        
        {/* Yazar Giriş Sayfası (Public) */}
        <Route path="/gizli-oda" element={<AdminAuth />} />
        
        {/* YENİ: Makale Yazma Sayfası (Korumalı) */}
        <Route path="/yeni" element={
          <AuthGuard>
            <CreatePost />
          </AuthGuard>
        } />
        
        {/* /createpost rotası artık AdminAuth'a yönlendiriyor */}
        <Route path="/createpost" element={<Navigate to="/yeni" replace />} />
        
      </Routes>
    </Router>
  );
};

export default App;