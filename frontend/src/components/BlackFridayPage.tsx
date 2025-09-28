import React from 'react';
import { useNavigate } from 'react-router-dom';

const BlackFridayPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div>
      {/* Section ONE - Marketing Banner */}
      <div className="marketing-banner">
        Limited Time: $96 off <a href="#">Zealthy Weight Loss Program</a>
      </div>
      
      {/* Section TWO - Fixed Navigation */}
      <div className="fixed-nav">
        <div className="zealthy-logo">
          <div className="zealthy-logo-text">ZEALTHY</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button className="btn btn-secondary" onClick={handleGoBack}>
            Go Back
          </button>
        </div>
      </div>

      {/* Section THREE - Scrollable Content */}
      <div className="scrollable-content">
        <div className="container">
          <div className="card" style={{ textAlign: 'center', padding: '60px 40px', marginTop: '100px' }}>
            <h1 style={{ 
              fontSize: '48px', 
              color: '#dc3545', 
              marginBottom: '20px',
              fontWeight: 'bold'
            }}>
              🛍️ Black Friday Sale
            </h1>
            <h2 style={{ 
              fontSize: '36px', 
              color: '#2c3e50', 
              marginBottom: '30px',
              fontWeight: '600'
            }}>
              Starting Soon!
            </h2>
            <p style={{ 
              fontSize: '20px', 
              color: '#6c757d', 
              marginBottom: '40px',
              lineHeight: '1.6'
            }}>
              Get ready for our biggest sale of the year! Amazing discounts on all Zealthy programs and services.
            </p>
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '30px', 
              borderRadius: '12px',
              border: '2px dashed #dc3545',
              marginBottom: '30px'
            }}>
              <h3 style={{ color: '#dc3545', marginBottom: '15px' }}>
                🔥 What to Expect:
              </h3>
              <ul style={{ textAlign: 'left', display: 'inline-block' }}>
                <li style={{ marginBottom: '8px' }}>Up to 70% off Weight Loss Programs</li>
                <li style={{ marginBottom: '8px' }}>Special pricing on Nutrition Plans</li>
                <li style={{ marginBottom: '8px' }}>Exclusive access to Premium Features</li>
                <li style={{ marginBottom: '8px' }}>Limited edition wellness packages</li>
              </ul>
            </div>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-success" 
                style={{ fontSize: '18px', padding: '15px 30px' }}
                onClick={() => navigate('/')}
              >
                Return to Home
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ fontSize: '18px', padding: '15px 30px' }}
                onClick={handleGoBack}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlackFridayPage;
