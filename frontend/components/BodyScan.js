import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import * as tf from '@tensorflow/tfjs';

const Container = styled.div`
  position: relative;
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

const CameraView = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 10px;
  overflow: hidden;
  background: #2A2A2A;
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const Instructions = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  padding: 15px 30px;
  border-radius: 20px;
  text-align: center;
  font-size: 14px;
`;

const ActionButton = styled.button`
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.theme.gradients.primary};
  border: none;
  color: white;
  padding: 12px 30px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MeasurementsDisplay = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: #2A2A2A;
  border-radius: 10px;
  
  h3 {
    margin: 0 0 15px 0;
  }
  
  .measurement {
    display: flex;
    justify-content: space-between;
    margin: 8px 0;
    
    span:first-child {
      color: #888;
    }
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: #3A3A3A;
  border-radius: 2px;
  margin-top: 15px;
  overflow: hidden;
  
  div {
    height: 100%;
    background: ${props => props.theme.gradients.primary};
    width: ${props => props.progress}%;
    transition: width 0.3s ease;
  }
`;

const BodyScan = ({ onBack }) => {
  const [scanning, setScanning] = useState(false);
  const [measurements, setMeasurements] = useState(null);
  const [progress, setProgress] = useState(0);
  const [instruction, setInstruction] = useState('Stand in front of the camera');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    initCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setInstruction('Error accessing camera. Please check permissions.');
    }
  };

  const startScan = async () => {
    setScanning(true);
    setProgress(0);
    
    // Simulated scanning process
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(i);
      
      switch (i) {
        case 0:
          setInstruction('Stand straight with arms slightly raised');
          break;
        case 20:
          setInstruction('Capturing front view...');
          break;
        case 40:
          setInstruction('Turn 90 degrees to your right');
          break;
        case 60:
          setInstruction('Capturing side view...');
          break;
        case 80:
          setInstruction('Processing measurements...');
          break;
        case 100:
          finishScan();
          break;
      }
    }
  };

  const finishScan = () => {
    setScanning(false);
    setInstruction('Scan complete!');
    
    // Simulated measurements - replace with actual calculations
    const newMeasurements = {
      height: '175 cm',
      shoulders: '45 cm',
      chest: '95 cm',
      waist: '80 cm',
      hips: '95 cm',
      inseam: '80 cm'
    };
    
    setMeasurements(newMeasurements);
    
    // Save measurements to storage
    chrome.runtime.sendMessage({
      action: 'updateMeasurements',
      measurements: newMeasurements
    });
  };

  return (
    <Container>
      <Header>
        <button onClick={onBack}>←</button>
        <h2>Body Scan</h2>
      </Header>

      <CameraView>
        <Video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted
        />
        <Canvas ref={canvasRef} />
        
        <Instructions>
          {instruction}
        </Instructions>
        
        <ActionButton 
          onClick={startScan}
          disabled={scanning}
        >
          {scanning ? 'Scanning...' : 'Start Scan'}
        </ActionButton>
      </CameraView>

      {scanning && (
        <ProgressBar progress={progress}>
          <div />
        </ProgressBar>
      )}

      {measurements && (
        <MeasurementsDisplay>
          <h3>Your Measurements</h3>
          {Object.entries(measurements).map(([key, value]) => (
            <div key={key} className="measurement">
              <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
              <span>{value}</span>
            </div>
          ))}
        </MeasurementsDisplay>
      )}
    </Container>
  );
};

export default BodyScan; 