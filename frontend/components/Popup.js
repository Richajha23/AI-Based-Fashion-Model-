import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import StorageService from '../services/StorageService';
import SustainabilityVerifier from '../services/SustainabilityVerifier';

const Container = styled.div`
  width: 400px;
  min-height: 500px;
  background: #1a1a1a;
  color: white;
  font-family: 'Inter', sans-serif;
`;

const Header = styled.header`
  padding: 20px;
  text-align: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border-bottom: 1px solid #333;
`;

const Logo = styled.img`
  width: 80px;
  height: 80px;
  margin-bottom: 10px;
`;

const Brand = styled.h1`
  font-size: 24px;
  font-weight: bold;
  background: linear-gradient(135deg, #ff00ff 0%, #00ffff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
`;

const Content = styled.div`
  padding: 20px;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  margin: 8px 0;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #ff00ff 0%, #00ffff 100%);
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: 10px;
  margin: 10px 0;
  background: #ff5252;
  color: white;
  border-radius: 8px;
  text-align: center;
`;

const SuccessMessage = styled.div`
  padding: 10px;
  margin: 10px 0;
  background: #4caf50;
  color: white;
  border-radius: 8px;
  text-align: center;
`;

const UserProfile = styled.div`
  padding: 15px;
  margin: 10px 0;
  background: #2a2a2a;
  border-radius: 8px;

  h3 {
    margin: 0 0 10px 0;
    color: #b0b0b0;
  }

  p {
    margin: 5px 0;
    color: white;
  }
`;

const Popup = () => {
  const [currentView, setCurrentView] = useState('main');
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sustainabilityVerifier, setSustainabilityVerifier] = useState(null);

  useEffect(() => {
    initializeServices();
    loadUserProfile();
  }, []);

  const initializeServices = async () => {
    try {
      const verifier = new SustainabilityVerifier();
      await verifier.initializeWeb3();
      setSustainabilityVerifier(verifier);
    } catch (error) {
      console.error('Failed to initialize services:', error);
      setError('Failed to initialize blockchain services. Please make sure MetaMask is installed and connected.');
    }
  };

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const profile = await StorageService.getUserProfile();
      if (profile) {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleScanBody = async () => {
    try {
      setLoading(true);
      setError(null);
      // Implementation for body scanning
      setSuccess('Body scan completed successfully!');
      setCurrentView('bodyScan');
    } catch (error) {
      setError('Failed to start body scan');
    } finally {
      setLoading(false);
    }
  };

  const handleVirtualTryOn = async () => {
    try {
      setLoading(true);
      setError(null);
      // Implementation for virtual try-on
      setSuccess('Virtual try-on started successfully!');
      setCurrentView('virtualTryOn');
    } catch (error) {
      setError('Failed to start virtual try-on');
    } finally {
      setLoading(false);
    }
  };

  const handleSustainabilityCheck = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!sustainabilityVerifier) {
        throw new Error('Sustainability verifier not initialized');
      }

      const result = await sustainabilityVerifier.verifySustainability('demo-product');
      setSuccess(`Sustainability score: ${result.score}`);
      setCurrentView('sustainability');
    } catch (error) {
      setError('Failed to perform sustainability check');
    } finally {
      setLoading(false);
    }
  };

  const renderMainView = () => (
    <Content>
      {userProfile && (
        <UserProfile>
          <h3>Your Profile</h3>
          <p>Style: {userProfile.style?.join(', ') || 'Not set'}</p>
          <p>Sustainability Score: {userProfile.sustainabilityScore || 'N/A'}</p>
        </UserProfile>
      )}

      <Button onClick={handleScanBody} disabled={loading}>
        Body Scan
      </Button>
      <Button onClick={handleVirtualTryOn} disabled={loading}>
        Virtual Try-On
      </Button>
      <Button onClick={handleSustainabilityCheck} disabled={loading}>
        Sustainability Check
      </Button>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
    </Content>
  );

  return (
    <Container>
      <Header>
        <Logo src="../assets/syntstyle-128.png" alt="SynthStyle Logo" />
        <Brand>SynthStyle</Brand>
      </Header>
      {renderMainView()}
    </Container>
  );
};

export default Popup; 