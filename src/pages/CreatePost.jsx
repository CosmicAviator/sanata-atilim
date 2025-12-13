import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CreatePost = () => {
  const navigate = useNavigate();
  
  // --- STATE'LER ---
  const [formData, setFormData] = useState({ title: '', category: '', content: '' });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [oldPosts, setOldPosts] = useState([]); // Eski yazıları tutacak liste

  // --- SAYFA AÇILINCA ESKİ YAZILARI ÇEK ---
  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { data } = await supabase.from('posts').select('*').order('id', { ascending: false });
    setOldPosts(data || []);
  }

  // --- FORM İŞLEMLERİ ---
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !imageFile) {
      alert('Eksik kalan şeyler var...');
      return;
    }
    setLoading(true);
    try {
      const fileName = `${Date.now()}_${imageFile.name}`;
      const { error: uploadError } = await supabase.storage.from('blog-images').upload(fileName, imageFile);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('blog-images').getPublicUrl(fileName);

      const { error: insertError } = await supabase.from('posts').insert([{ 
          title: formData.title, category: formData.category, content: formData.content, image_url: publicUrl 
      }]);

      if (insertError) throw insertError;
      alert('Hikaye ölümsüzleşti. ✨');
      navigate('/');
    } catch (error) {
      alert('Hata: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- SİLME FONKSİYONU ---
  const handleDelete = async (id) => {
    const onay = window.confirm("Bu hikayeyi yakmak istediğine emin misin?");
    if (onay) {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) alert("Silemedim: " + error.message);
      else {
        // Listeden de sil ki sayfa yenilemeden gitsin
        setOldPosts(oldPosts.filter(post => post.id !== id));
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
      style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#dcdcdc', padding: '80px 20px', fontFamily: '"Times New Roman", serif' }}
    >
      <Link to="/" style={{ position: 'fixed', top: '40px', left: '40px', color: '#444', textDecoration: 'none', fontSize: '1.5rem' }}>←</Link>

      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        
        {/* --- BAŞLIK --- */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontWeight: '100', fontSize: '1.5rem', letterSpacing: '3px', color: '#d4af37', opacity: 0.8 }}>YAZAR MASASI</h1>
          <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, #d4af37, transparent)', margin: '20px auto' }}></div>
        </div>

        {/* --- YAZI EKLEME FORMU --- */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginBottom: '100px' }}>
          <div style={groupStyle}><label style={labelStyle}>BAŞLIK</label><input type="text" name="title" onChange={handleChange} style={minimalInputStyle} /></div>
          
          <div style={groupStyle}><label style={labelStyle}>KATEGORİ</label><input type="text" name="category" onChange={handleChange} style={minimalInputStyle} /></div>

          <div style={groupStyle}>
            <label style={labelStyle}>KAPAK FOTOĞRAFI</label>
            <input type="file" accept="image/*" onChange={handleFileChange} id="file-input" style={{ display: 'none' }} />
            <label htmlFor="file-input" style={{ cursor: 'pointer', border: '1px dashed #444', padding: '20px', textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>
              {imageFile ? `Seçildi: ${imageFile.name}` : '+ Fotoğraf Seç'}
            </label>
            {previewUrl && <img src={previewUrl} alt="Önizleme" style={{ marginTop: '10px', width: '100%', maxHeight: '200px', objectFit: 'cover', opacity: 0.8 }} />}
          </div>

          <div style={groupStyle}><label style={labelStyle}>METİN</label><textarea name="content" onChange={handleChange} style={{ ...minimalInputStyle, minHeight: '200px', resize: 'none' }}></textarea></div>

          <button type="submit" disabled={loading} style={{ padding: '20px', backgroundColor: 'transparent', color: '#d4af37', border: '1px solid #333', cursor: 'pointer', letterSpacing: '2px' }}>
            {loading ? '...' : 'YAYINLA'}
          </button>
        </form>

        {/* --- SİLME LİSTESİ (ARŞİV) --- */}
        <h2 style={{ fontSize: '1rem', color: '#555', textAlign: 'center', letterSpacing: '2px', marginBottom: '30px', borderBottom: '1px solid #222', paddingBottom: '10px' }}>ARŞİVDEKİLER</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {oldPosts.map(post => (
            <div key={post.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: '1px solid #222', borderRadius: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <img src={post.image_url} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }} />
                <span style={{ color: '#aaa' }}>{post.title}</span>
              </div>
              
              <button 
                onClick={() => handleDelete(post.id)}
                style={{ background: 'transparent', border: 'none', color: '#d32f2f', cursor: 'pointer', fontSize: '0.9rem', letterSpacing: '1px' }}
              >
                YAK
              </button>
            </div>
          ))}
        </div>

      </div>
    </motion.div>
  );
};

// Stiller
const groupStyle = { display: 'flex', flexDirection: 'column', gap: '10px' };
const labelStyle = { fontSize: '0.7rem', letterSpacing: '2px', color: '#555', fontFamily: 'sans-serif', marginLeft: '2px' };
const minimalInputStyle = { width: '100%', padding: '15px 5px', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #333', color: '#eee', fontSize: '1.2rem', fontFamily: '"Times New Roman", serif', outline: 'none' };

export default CreatePost;