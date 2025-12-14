import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Navbar from './components/Navbar.jsx'; // ✅ .jsx eklendi
import Masonry from './components/Masonry.jsx'; // ✅ .jsx eklendi
import CreatePost from './pages/CreatePost.jsx'; // ✅ .jsx eklendi
import AdminAuth from './pages/AdminAuth.jsx'; // ✅ .jsx eklendi

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

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
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

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
  }, []);

  // Protected Route Bileşeni
  const ProtectedRoute = ({ children }) => {
    return isAdmin ? children : <Navigate to="/admin/auth" replace />;
  };

  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <Navbar isAdmin={isAdmin} />
        
        <Routes>
          {/* Ana Sayfa - Blog Yazıları */}
          <Route 
            path="/" 
            element={
              <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
                  Sanata Atılım Blogu
                </h1>
                
                {loading && (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    <p className="mt-4 text-gray-600">Yazılar yükleniyor...</p>
                  </div>
                )}
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-center max-w-md mx-auto">
                    {error}
                  </div>
                )}
                
                {!loading && !error && posts.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-xl">Henüz yazı bulunmuyor.</p>
                    {isAdmin && (
                      <p className="mt-2">
                        <a href="/admin/create" className="text-blue-600 hover:underline">
                          İlk yazıyı oluştur
                        </a>
                      </p>
                    )}
                  </div>
                )}
                
                {!loading && !error && posts.length > 0 && (
                  <Masonry items={posts} />
                )}
              </div>
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
              <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">Sayfa bulunamadı</p>
                <a 
                  href="/" 
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Ana Sayfaya Dön
                </a>
              </div>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;