import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SustainabilityVerifier from '../services/SustainabilityVerifier';

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  
  button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 10px;
    margin-right: 10px;
    
    &:hover {
      opacity: 0.8;
    }
  }
  
  h2 {
    margin: 0;
  }
`;

const ScoreCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  text-align: center;
  
  h3 {
    margin: 0 0 15px 0;
    color: ${props => props.theme.colors.textSecondary};
  }
  
  .score {
    font-size: 48px;
    font-weight: bold;
    background: ${props => props.theme.gradients.primary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const CertificationList = styled.div`
  margin-top: 20px;
  
  h3 {
    margin-bottom: 10px;
  }
  
  ul {
    list-style: none;
    padding: 0;
    
    li {
      background: ${props => props.theme.colors.surface};
      margin-bottom: 10px;
      padding: 15px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      
      &:before {
        content: '✓';
        color: #4CAF50;
        margin-right: 10px;
        font-weight: bold;
      }
    }
  }
`;

const SupplyChain = styled.div`
  margin-top: 20px;
  
  h3 {
    margin-bottom: 10px;
  }
  
  .chain {
    background: ${props => props.theme.colors.surface};
    padding: 15px;
    border-radius: 8px;
    
    .step {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      span:first-child {
        color: ${props => props.theme.colors.textSecondary};
      }
    }
  }
`;

const SustainabilityCheck = ({ onBack }) => {
  const [verifier] = useState(() => new SustainabilityVerifier());
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkSustainability = async () => {
      try {
        const result = await verifier.verifyProduct('demo-product');
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkSustainability();
  }, [verifier]);

  if (loading) {
    return (
      <Container>
        <Header>
          <button onClick={onBack}>←</button>
          <h2>Sustainability Check</h2>
        </Header>
        <div>Loading sustainability data...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <button onClick={onBack}>←</button>
          <h2>Sustainability Check</h2>
        </Header>
        <div>Error: {error}</div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <button onClick={onBack}>←</button>
        <h2>Sustainability Check</h2>
      </Header>

      <ScoreCard>
        <h3>Sustainability Score</h3>
        <div className="score">{data.sustainabilityScore}</div>
      </ScoreCard>

      <CertificationList>
        <h3>Certifications</h3>
        <ul>
          {data.certifications.map((cert, index) => (
            <li key={index}>{cert}</li>
          ))}
        </ul>
      </CertificationList>

      <SupplyChain>
        <h3>Supply Chain</h3>
        <div className="chain">
          <div className="step">
            <span>Manufacturer</span>
            <span>{data.supplyChain.manufacturer}</span>
          </div>
          <div className="step">
            <span>Distributor</span>
            <span>{data.supplyChain.distributor}</span>
          </div>
          <div className="step">
            <span>Retailer</span>
            <span>{data.supplyChain.retailer}</span>
          </div>
        </div>
      </SupplyChain>
    </Container>
  );
};

export default SustainabilityCheck; 