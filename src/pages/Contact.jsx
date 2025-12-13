import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Contact = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 1 }}
      style={{ 
        backgroundColor: '#0a0a0a', 
        minHeight: '100vh', 
        color: '#dcdcdc', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '40px 20px',
        fontFamily: '"Times New Roman", serif'
      }}
    >
      <Link to="/" style={{ position: 'fixed', top: '40px', left: '40px', color: '#444', textDecoration: 'none', fontSize: '1.5rem' }}>←</Link>

      <div style={{ maxWidth: '600px', width: '100%' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ fontWeight: '100', fontSize: '2rem', letterSpacing: '3px', color: '#d4af37', marginBottom: '10px' }}>
            BİZE ULAŞIN
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#666', fontStyle: 'italic' }}>
            "Sözcükler, sessizliği kırmanın en zarif yoludur."
          </p>
        </div>

        {/* --- GÜNCELLENEN INSTAGRAM LINKI --- */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '50px' }}>
          <a 
            href="https://www.instagram.com/sanatatilimkutuphane.toplulugu/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              color: '#eee',
              border: '1px solid #333',
              padding: '10px 20px',
              borderRadius: '30px',
              fontSize: '0.9rem',
              letterSpacing: '1px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#d62976'; e.currentTarget.style.color = '#d62976'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#eee'; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            @sanatatilimkutuphane.toplulugu
          </a>
        </div>

        {/* --- FORM ALANI --- */}
        <form 
          action="https://formspree.io/f/mqarnjvl" 
          method="POST"
          style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}
        >
            <div style={groupStyle}>
              <label style={labelStyle}>KİMSİNİZ?</label>
              <input type="text" name="name" placeholder="Adınız Soyadınız" required style={minimalInputStyle} />
            </div>

            <div style={groupStyle}>
              <label style={labelStyle}>SİZE NASIL DÖNELİM?</label>
              <input type="email" name="email" placeholder="E-posta Adresiniz" required style={minimalInputStyle} />
            </div>

            <div style={groupStyle}>
              <label style={labelStyle}>KONU NEDİR?</label>
              <input type="text" name="subject" placeholder="Örn: Bir İşbirliği, Bir Eleştiri..." required style={minimalInputStyle} />
            </div>

            <div style={groupStyle}>
              <label style={labelStyle}>MEKTUBUNUZ</label>
              <textarea name="message" placeholder="Dökün içinizi..." rows="6" required style={{...minimalInputStyle, resize: 'none', borderBottom: '1px solid #333'}}></textarea>
            </div>

            <button 
              type="submit" 
              style={{
                padding: '15px 40px',
                background: 'transparent',
                border: '1px solid #d4af37',
                color: '#d4af37',
                fontFamily: 'sans-serif',
                letterSpacing: '2px',
                cursor: 'pointer',
                marginTop: '10px',
                fontSize: '0.9rem',
                alignSelf: 'center',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#d4af37'; e.currentTarget.style.color = '#000'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#d4af37'; }}
            >
                GÖNDER
            </button>
        </form>

      </div>
    </motion.div>
  );
};

// --- STİLLER ---
const groupStyle = { display: 'flex', flexDirection: 'column', gap: '10px' };
const labelStyle = { fontSize: '0.7rem', letterSpacing: '2px', color: '#555', fontFamily: 'sans-serif', marginLeft: '2px' };
const minimalInputStyle = { 
  width: '100%', 
  padding: '15px 5px', 
  backgroundColor: 'transparent', 
  border: 'none', 
  borderBottom: '1px solid #333', 
  color: '#eee', 
  fontSize: '1.1rem', 
  fontFamily: '"Times New Roman", serif', 
  outline: 'none',
  transition: 'border-color 0.3s'
};

export default Contact;