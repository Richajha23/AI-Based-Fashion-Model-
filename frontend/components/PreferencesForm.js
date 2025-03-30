import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import StorageService from '../services/StorageService';

const Form = styled.form`
  padding: 20px;
`;

const Section = styled.div`
  margin-bottom: 20px;
  
  h3 {
    color: ${props => props.theme.colors.textSecondary};
    margin-bottom: 15px;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  
  label {
    display: flex;
    align-items: center;
    cursor: pointer;
    
    input {
      margin-right: 10px;
    }
  }
`;

const StyleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 20px;
`;

const StyleOption = styled.button`
  padding: 10px;
  background: ${props => props.selected ? props.theme.colors.primary : props.theme.colors.surface};
  border: none;
  border-radius: 8px;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const RangeInput = styled.div`
  margin-top: 10px;
  
  input {
    width: 100%;
    margin: 10px 0;
  }
  
  .value {
    text-align: center;
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const SaveButton = styled.button`
  width: 100%;
  padding: 15px;
  background: ${props => props.theme.gradients.primary};
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Message = styled.div`
  padding: 10px;
  margin: 10px 0;
  border-radius: 8px;
  text-align: center;
  
  &.success {
    background: #4CAF50;
    color: white;
  }
  
  &.error {
    background: #f44336;
    color: white;
  }

  &.info {
    background: #2196F3;
    color: white;
  }
`;

const PreferencesForm = ({ onBack }) => {
  const [preferences, setPreferences] = useState({
    style: [],
    sustainability: {
      preferOrganic: true,
      preferRecycled: true,
      maxPriceRange: 200
    }
  });
  
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    checkStorageAndLoadPreferences();
  }, []);

  const checkStorageAndLoadPreferences = async () => {
    try {
      setLoading(true);
      setMessage(null);
      
      const isAvailable = await StorageService.checkStorageAvailable();
      setStorageAvailable(isAvailable);
      
      if (!isAvailable) {
        setMessage({
          type: 'error',
          text: 'Chrome storage is not available. Please make sure you are using the extension in Chrome and have granted the necessary permissions.'
        });
        return;
      }

      const savedPreferences = await StorageService.getPreferences();
      if (savedPreferences) {
        setPreferences(savedPreferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to load preferences. Please try again or contact support if the issue persists.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStyleToggle = (style) => {
    setPreferences(prev => ({
      ...prev,
      style: prev.style.includes(style)
        ? prev.style.filter(s => s !== style)
        : [...prev.style, style]
    }));
  };

  const handleSustainabilityChange = (key) => {
    setPreferences(prev => ({
      ...prev,
      sustainability: {
        ...prev.sustainability,
        [key]: !prev.sustainability[key]
      }
    }));
  };

  const handlePriceRangeChange = (value) => {
    setPreferences(prev => ({
      ...prev,
      sustainability: {
        ...prev.sustainability,
        maxPriceRange: parseInt(value)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!storageAvailable) {
      setMessage({
        type: 'error',
        text: 'Cannot save preferences: Chrome storage is not available.'
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await StorageService.savePreferences(preferences);
      setMessage({ 
        type: 'success', 
        text: 'Preferences saved successfully! Redirecting...' 
      });
      setTimeout(() => {
        onBack();
      }, 1500);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to save preferences. Please check your browser permissions and try again.' 
      });
    } finally {
      setSaving(false);
    }
  };

  const styleOptions = [
    'Casual', 'Formal', 'Sporty', 'Vintage',
    'Minimalist', 'Bohemian', 'Streetwear', 'Classic'
  ];

  if (loading) {
    return (
      <Form>
        <Message className="info">
          Loading preferences...
        </Message>
      </Form>
    );
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Section>
        <h3>Style Preferences</h3>
        <StyleGrid>
          {styleOptions.map(style => (
            <StyleOption
              key={style}
              type="button"
              selected={preferences.style.includes(style)}
              onClick={() => handleStyleToggle(style)}
            >
              {style}
            </StyleOption>
          ))}
        </StyleGrid>
      </Section>

      <Section>
        <h3>Sustainability Preferences</h3>
        <CheckboxGroup>
          <label>
            <input
              type="checkbox"
              checked={preferences.sustainability.preferOrganic}
              onChange={() => handleSustainabilityChange('preferOrganic')}
            />
            Prefer Organic Materials
          </label>
          <label>
            <input
              type="checkbox"
              checked={preferences.sustainability.preferRecycled}
              onChange={() => handleSustainabilityChange('preferRecycled')}
            />
            Prefer Recycled Materials
          </label>
        </CheckboxGroup>

        <RangeInput>
          <div>Maximum Price Range</div>
          <input
            type="range"
            min="50"
            max="500"
            step="10"
            value={preferences.sustainability.maxPriceRange}
            onChange={(e) => handlePriceRangeChange(e.target.value)}
          />
          <div className="value">${preferences.sustainability.maxPriceRange}</div>
        </RangeInput>
      </Section>

      {message && (
        <Message className={message.type}>
          {message.text}
        </Message>
      )}

      <SaveButton type="submit" disabled={saving || !storageAvailable}>
        {saving ? 'Saving...' : 'Save Preferences'}
      </SaveButton>
    </Form>
  );
};

export default PreferencesForm; 