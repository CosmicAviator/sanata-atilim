import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Supabase'in kendi login fonksiyonu
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        // Hata varsa, butonu tekrar aktif et ve hatayı göster
        throw error;
      }
      
      // Giriş başarılıysa, yeni yazı yazma sayfasına yönlendir
      navigate('/yeni'); 

    } catch (error) {
      alert(error.message || 'Giriş Başarısız.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ 
        padding: '40px', 
        maxWidth: '400px', 
        margin: '100px auto', 
        color: '#f0f0e0', 
        border: '1px solid #333',
        borderRadius: '10px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
      }}
    >
      <h2 style={{ fontFamily: '"Times New Roman", serif', borderBottom: '1px solid #d4af37', paddingBottom: '10px', textAlign: 'center' }}>
        Yazar Girişi
      </h2>

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '30px' }}>
        
        {/* Email */}
        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '15px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', outline: 'none' }}
        />

        {/* Şifre */}
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '15px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', outline: 'none' }}
        />

        {/* Giriş Butonu */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          type="submit"
          style={{
            padding: '15px',
            background: '#d4af37',
            color: '#000',
            border: 'none',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Giriş Yapılıyor...' : 'GİRİŞ YAP'}
        </motion.button>

      </form>
    </motion.div>
  );
};

export default AdminAuth;