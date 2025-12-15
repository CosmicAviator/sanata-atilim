import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const isMobile = window.innerWidth < 768;

    return (
        <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{
                background: 'linear-gradient(to top, #050505, #0a0a0a)',
                borderTop: '1px solid rgba(212, 175, 55, 0.1)',
                padding: isMobile ? '40px 20px' : '60px 40px',
                color: '#888',
                fontFamily: '"Times New Roman", serif',
            }}
        >
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'center' : 'flex-start',
                gap: '40px',
                textAlign: isMobile ? 'center' : 'left',
            }}>

                {/* Sol: Logo ve Tagline */}
                <div>
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <h3 style={{
                            margin: 0,
                            fontSize: '1.5rem',
                            color: '#f0f0e0',
                            fontWeight: '300',
                            letterSpacing: '3px',
                            marginBottom: '10px',
                        }}>
                            SANATA ATILIM
                        </h3>
                    </Link>
                    <p style={{
                        margin: 0,
                        fontSize: '0.85rem',
                        color: '#666',
                        fontStyle: 'italic',
                        maxWidth: '300px',
                    }}>
                        Sanatın izinde, bilginin peşinde.
                    </p>
                </div>

                {/* Orta: Kategoriler */}
                <div>
                    <h4 style={{
                        margin: '0 0 15px 0',
                        fontSize: '0.8rem',
                        color: '#d4af37',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        fontFamily: 'sans-serif',
                    }}>
                        Kategoriler
                    </h4>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                    }}>
                        {['Sinema', 'Mitoloji', 'Edebiyat', 'Sanat'].map((cat) => (
                            <span
                                key={cat}
                                style={{
                                    fontSize: '0.9rem',
                                    color: '#888',
                                    cursor: 'default',
                                }}
                            >
                                {cat}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Sağ: İletişim */}
                <div>
                    <h4 style={{
                        margin: '0 0 15px 0',
                        fontSize: '0.8rem',
                        color: '#d4af37',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        fontFamily: 'sans-serif',
                    }}>
                        Topluluk
                    </h4>
                    <p style={{
                        margin: 0,
                        fontSize: '0.85rem',
                        color: '#666',
                        lineHeight: '1.6',
                    }}>
                        Atılım Üniversitesi<br />
                        Kütüphane Topluluğu
                    </p>
                    <a
                        href="https://www.instagram.com/sanatatilimkutuphane.toplulugu/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-block',
                            marginTop: '15px',
                            fontSize: '0.85rem',
                            color: '#d4af37',
                            textDecoration: 'none',
                            letterSpacing: '1px',
                            borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
                            paddingBottom: '2px',
                            transition: 'color 0.3s',
                        }}
                    >
                        Instagram
                    </a>
                </div>
            </div>

            {/* Alt: Telif Hakkı */}
            <div style={{
                maxWidth: '1200px',
                margin: '40px auto 0 auto',
                paddingTop: '20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                textAlign: 'center',
            }}>
                <p style={{
                    margin: 0,
                    fontSize: '0.75rem',
                    color: '#555',
                    letterSpacing: '1px',
                }}>
                    {currentYear} Sanata Atılım. Tüm hakları saklıdır.
                </p>
            </div>
        </motion.footer>
    );
};

export default Footer;
