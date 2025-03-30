import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

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

const ViewContainer = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 10px;
  overflow: hidden;
  background: #2A2A2A;
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
`;

const Controls = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  background: rgba(0, 0, 0, 0.7);
  padding: 10px;
  border-radius: 20px;
`;

const ControlButton = styled.button`
  background: ${props => props.active ? '#9C27B0' : 'transparent'};
  border: 1px solid #9C27B0;
  color: white;
  padding: 8px 15px;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? '#9C27B0' : 'rgba(156, 39, 176, 0.2)'};
  }
`;

const ProductList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-top: 20px;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 10px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #2A2A2A;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #666;
    border-radius: 3px;
  }
`;

const ProductCard = styled.div`
  background: #2A2A2A;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  img {
    width: 100%;
    height: 120px;
    object-fit: cover;
    border-radius: 4px;
    margin-bottom: 8px;
  }

  h4 {
    margin: 0 0 5px 0;
    font-size: 14px;
  }

  p {
    margin: 0;
    font-size: 12px;
    color: #888;
  }
`;

const InfoPanel = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  padding: 15px;
  border-radius: 10px;
  max-width: 200px;

  h4 {
    margin: 0 0 10px 0;
  }

  p {
    margin: 5px 0;
    font-size: 12px;
    color: #CCC;
  }
`;

const VirtualTryOn = ({ onBack }) => {
  const [activeView, setActiveView] = useState('front');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    initThreeJS();
    fetchProducts();
    
    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  const initThreeJS = () => {
    if (!containerRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;
    controlsRef.current = controls;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  };

  const fetchProducts = async () => {
    try {
      // Replace with actual API call
      const response = await fetch('http://localhost:3000/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = async (product) => {
    setSelectedProduct(product);
    
    try {
      // Load 3D model
      // This is a placeholder - you would need to implement actual 3D model loading
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({ color: 0x9c27b0 });
      const mesh = new THREE.Mesh(geometry, material);
      
      // Clear previous model
      sceneRef.current.clear();
      
      // Add new model
      sceneRef.current.add(mesh);
    } catch (error) {
      console.error('Error loading 3D model:', error);
    }
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    
    // Update camera position based on view
    switch (view) {
      case 'front':
        cameraRef.current.position.set(0, 0, 5);
        break;
      case 'back':
        cameraRef.current.position.set(0, 0, -5);
        break;
      case 'side':
        cameraRef.current.position.set(5, 0, 0);
        break;
      default:
        break;
    }
    
    cameraRef.current.lookAt(0, 0, 0);
    controlsRef.current.update();
  };

  return (
    <Container>
      <Header>
        <button onClick={onBack}>←</button>
        <h2>Virtual Try-On</h2>
      </Header>

      <ViewContainer ref={containerRef}>
        <Controls>
          <ControlButton
            active={activeView === 'front'}
            onClick={() => handleViewChange('front')}
          >
            Front
          </ControlButton>
          <ControlButton
            active={activeView === 'side'}
            onClick={() => handleViewChange('side')}
          >
            Side
          </ControlButton>
          <ControlButton
            active={activeView === 'back'}
            onClick={() => handleViewChange('back')}
          >
            Back
          </ControlButton>
        </Controls>

        {selectedProduct && (
          <InfoPanel>
            <h4>{selectedProduct.name}</h4>
            <p>Size: {selectedProduct.size}</p>
            <p>Color: {selectedProduct.color}</p>
            <p>Fit: {selectedProduct.fit}</p>
          </InfoPanel>
        )}
      </ViewContainer>

      <ProductList>
        {loading ? (
          <div>Loading products...</div>
        ) : (
          products.map(product => (
            <ProductCard
              key={product.id}
              onClick={() => handleProductSelect(product)}
            >
              <img src={product.image} alt={product.name} />
              <h4>{product.name}</h4>
              <p>${product.price}</p>
            </ProductCard>
          ))
        )}
      </ProductList>
    </Container>
  );
};

export default VirtualTryOn; 