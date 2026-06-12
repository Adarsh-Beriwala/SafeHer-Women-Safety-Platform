import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { formatTimestamp } from '../utils/helpers';
import { FiCamera, FiDownload, FiClock, FiImage } from 'react-icons/fi';
import './EvidenceHistory.css';

const EvidenceHistory = () => {
  const { currentUser } = useAuth();
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchEvidence = async () => {
      if (!currentUser) return;
      try {
        const q = query(
          collection(db, 'evidence'),
          where('userId', '==', currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        // Sort locally to avoid Firebase Composite Index requirement
        items.sort((a, b) => b.timestamp - a.timestamp);
        
        setEvidence(items);
      } catch (error) {
        console.error('Error fetching evidence:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvidence();
  }, [currentUser]);

  return (
    <div className="evidence-page">
      <div className="container">
        <div className="evidence-header animate-fadeInUp">
          <h1><FiCamera /> Evidence History</h1>
          <p>All auto-captured evidence from SOS triggers is securely stored here.</p>
          <span className="badge badge-success">{evidence.length} captures</span>
        </div>

        {loading ? (
          <div className="evidence-loading">
            <div className="spinner"></div>
            <p>Loading evidence...</p>
          </div>
        ) : evidence.length === 0 ? (
          <div className="evidence-empty animate-fadeInUp delay-1">
            <FiImage className="evidence-empty-icon" />
            <h3>No Evidence Captured Yet</h3>
            <p>When you trigger SOS, photos are automatically captured from your camera and stored securely in the cloud.</p>
          </div>
        ) : (
          <div className="evidence-grid animate-fadeInUp delay-1">
            {evidence.map((item) => (
              <div
                key={item.id}
                className="evidence-card glass-card"
                onClick={() => setSelectedImage(item)}
              >
                <div className="evidence-img-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#251b3d' }}>
                  {item.type === 'audio' ? (
                     <div style={{ padding: '20px', textAlign: 'center', width: '100%' }}>
                       <FiImage style={{ fontSize: '30px', opacity: 0.5, marginBottom: '10px' }} />
                       <audio controls src={item.audioUrl} style={{ width: '100%', height: '30px' }} />
                     </div>
                  ) : (
                    <img src={item.imageUrl} alt={`Evidence ${item.filename}`} loading="lazy" />
                  )}
                </div>
                <div className="evidence-card-info">
                  <span className="evidence-time">
                    <FiClock /> {formatTimestamp(item.timestamp)}
                  </span>
                  <a
                    href={item.type === 'audio' ? item.audioUrl : item.imageUrl}
                    download={`evidence_${item.timestamp}.${item.type === 'audio' ? 'webm' : 'jpg'}`}
                    className="btn btn-ghost btn-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FiDownload /> Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        {selectedImage && (
          <div className="evidence-lightbox" onClick={() => setSelectedImage(null)}>
            <div className="evidence-lightbox-content" onClick={(e) => e.stopPropagation()}>
              {selectedImage.type === 'audio' ? (
                <div style={{ padding: '40px', background: '#1c1331', borderRadius: '10px', textAlign: 'center' }}>
                  <h3 style={{ color: 'white', marginBottom: '20px' }}>Audio Evidence</h3>
                  <audio controls src={selectedImage.audioUrl} style={{ width: '300px' }} autoPlay />
                </div>
              ) : (
                <img src={selectedImage.imageUrl} alt="Evidence full view" />
              )}
              <div className="evidence-lightbox-info">
                <span><FiClock /> {formatTimestamp(selectedImage.timestamp)}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedImage(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvidenceHistory;
