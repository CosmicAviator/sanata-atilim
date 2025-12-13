import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom'; // Tıklama özelliği buradan geliyor

const useColumnCount = () => {
  const [columns, setColumns] = useState(3);
  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 600) setColumns(1);
      else if (window.innerWidth < 900) setColumns(2);
      else setColumns(3);
    };
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);
  return columns;
};

const Masonry = ({ data }) => {
  const columns = useColumnCount();
  const columnWrappers = {};
  for (let i = 0; i < columns; i++) { columnWrappers[`column${i}`] = []; }

  data.forEach((item, i) => {
    const columnIndex = i % columns;
    columnWrappers[`column${columnIndex}`].push(item);
  });

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
      {Object.keys(columnWrappers).map((columnKey, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          {columnWrappers[columnKey].map((item) => (
            
            // İŞTE SİHİR BURADA: Link ile sarmaladık
            <Link to={`/article/${item.id}`} key={item.id} style={{ textDecoration: 'none' }}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, type: 'spring' }}
                whileHover={{ y: -5 }} 
                style={{
                  backgroundColor: '#1a1a1a',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                  cursor: 'pointer'
                }}
              >
                <img src={item.image} alt={item.title} style={{ width: '100%', display: 'block', filter: 'grayscale(20%)' }} />
                <div style={{ padding: '20px' }}>
                  <span style={{ color: '#d4af37', fontSize: '0.7rem', letterSpacing: '1px', display: 'block', marginBottom: '5px' }}>
                    {item.category.toUpperCase()}
                  </span>
                  <h3 style={{ margin: '5px 0 10px 0', fontWeight: '100', color: '#f0f0e0', fontSize: '1.2rem' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#888', margin: 0 }}>
                    {item.description}
                  </p>
                </div>
              </motion.div>
            </Link>

          ))}
        </div>
      ))}
    </div>
  );
};

export default Masonry;