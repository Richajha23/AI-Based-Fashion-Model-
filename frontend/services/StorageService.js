class StorageService {
  static async checkStorageAvailable() {
    return new Promise((resolve) => {
      if (chrome && chrome.storage && chrome.storage.local) {
        resolve(true);
      } else {
        console.error('Chrome storage API not available');
        resolve(false);
      }
    });
  }

  static async savePreferences(preferences) {
    try {
      const isAvailable = await this.checkStorageAvailable();
      if (!isAvailable) {
        throw new Error('Chrome storage is not available');
      }

      // Save to local storage
      await new Promise((resolve, reject) => {
        chrome.storage.local.set({ preferences }, () => {
          if (chrome.runtime.lastError) {
            console.error('Local storage error:', chrome.runtime.lastError);
            reject(new Error('Failed to save preferences to local storage'));
          } else {
            resolve(true);
          }
        });
      });

      // Save to database
      try {
        const userId = await this.getUserId();
        const response = await fetch('http://localhost:3000/api/preferences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            preferences
          })
        });

        if (!response.ok) {
          throw new Error('Failed to save preferences to database');
        }
      } catch (error) {
        console.error('Database error:', error);
        // Don't throw here, as we still saved locally
      }

      return true;
    } catch (error) {
      console.error('Error in savePreferences:', error);
      throw error;
    }
  }

  static async getPreferences() {
    try {
      const isAvailable = await this.checkStorageAvailable();
      if (!isAvailable) {
        throw new Error('Chrome storage is not available');
      }

      // Try to get from database first
      try {
        const userId = await this.getUserId();
        const response = await fetch(`http://localhost:3000/api/preferences/${userId}`);
        
        if (response.ok) {
          const data = await response.json();
          // Update local storage with database data
          await new Promise((resolve) => {
            chrome.storage.local.set({ preferences: data }, resolve);
          });
          return data;
        }
      } catch (error) {
        console.error('Database error:', error);
      }

      // Fallback to local storage
      return new Promise((resolve, reject) => {
        chrome.storage.local.get(['preferences'], (result) => {
          if (chrome.runtime.lastError) {
            console.error('Local storage error:', chrome.runtime.lastError);
            reject(new Error('Failed to get preferences from local storage'));
          } else {
            resolve(result.preferences || {
              style: [],
              sustainability: {
                preferOrganic: true,
                preferRecycled: true,
                maxPriceRange: 200
              }
            });
          }
        });
      });
    } catch (error) {
      console.error('Error in getPreferences:', error);
      throw error;
    }
  }

  static async getUserId() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['userId'], (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error('Failed to get user ID'));
        } else {
          if (!result.userId) {
            // Generate a new user ID if none exists
            const newUserId = 'user_' + Math.random().toString(36).substr(2, 9);
            chrome.storage.local.set({ userId: newUserId }, () => {
              resolve(newUserId);
            });
          } else {
            resolve(result.userId);
          }
        }
      });
    });
  }

  static async saveUserProfile(profile) {
    try {
      const isAvailable = await this.checkStorageAvailable();
      if (!isAvailable) {
        throw new Error('Chrome storage is not available');
      }

      // Save to local storage
      await new Promise((resolve, reject) => {
        chrome.storage.local.set({ userProfile: profile }, () => {
          if (chrome.runtime.lastError) {
            console.error('Local storage error:', chrome.runtime.lastError);
            reject(new Error('Failed to save user profile to local storage'));
          } else {
            resolve(true);
          }
        });
      });

      // Save to database
      try {
        const userId = await this.getUserId();
        const response = await fetch('http://localhost:3000/api/user/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            profile
          })
        });

        if (!response.ok) {
          throw new Error('Failed to save user profile to database');
        }
      } catch (error) {
        console.error('Database error:', error);
        // Don't throw here, as we still saved locally
      }

      return true;
    } catch (error) {
      console.error('Error in saveUserProfile:', error);
      throw error;
    }
  }

  static async getUserProfile() {
    try {
      const isAvailable = await this.checkStorageAvailable();
      if (!isAvailable) {
        throw new Error('Chrome storage is not available');
      }

      // Try to get from database first
      try {
        const userId = await this.getUserId();
        const response = await fetch(`http://localhost:3000/api/user/profile/${userId}`);
        
        if (response.ok) {
          const data = await response.json();
          // Update local storage with database data
          await new Promise((resolve) => {
            chrome.storage.local.set({ userProfile: data }, resolve);
          });
          return data;
        }
      } catch (error) {
        console.error('Database error:', error);
      }

      // Fallback to local storage
      return new Promise((resolve, reject) => {
        chrome.storage.local.get(['userProfile'], (result) => {
          if (chrome.runtime.lastError) {
            console.error('Local storage error:', chrome.runtime.lastError);
            reject(new Error('Failed to get user profile from local storage'));
          } else {
            resolve(result.userProfile || null);
          }
        });
      });
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      throw error;
    }
  }

  static async clearStorage() {
    try {
      const isAvailable = await this.checkStorageAvailable();
      if (!isAvailable) {
        throw new Error('Chrome storage is not available');
      }

      // Clear local storage
      await new Promise((resolve, reject) => {
        chrome.storage.local.clear(() => {
          if (chrome.runtime.lastError) {
            console.error('Local storage error:', chrome.runtime.lastError);
            reject(new Error('Failed to clear local storage'));
          } else {
            resolve(true);
          }
        });
      });

      // Clear database data
      try {
        const userId = await this.getUserId();
        await fetch(`http://localhost:3000/api/user/clear/${userId}`, {
          method: 'POST'
        });
      } catch (error) {
        console.error('Database error:', error);
        // Don't throw here, as we still cleared local storage
      }

      return true;
    } catch (error) {
      console.error('Error in clearStorage:', error);
      throw error;
    }
  }
}

export default StorageService; 