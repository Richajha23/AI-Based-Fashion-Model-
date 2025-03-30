import mongoose from 'mongoose';

class DatabaseService {
  constructor() {
    this.isConnected = false;
    this.connect();
  }

  async connect() {
    try {
      const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/synthstyle';
      await mongoose.connect(MONGODB_URI);
      this.isConnected = true;
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      this.isConnected = false;
    }
  }

  async savePreferences(userId, preferences) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const result = await mongoose.model('Preferences').findOneAndUpdate(
        { userId },
        { $set: preferences },
        { upsert: true, new: true }
      );

      return result;
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  }

  async getPreferences(userId) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const preferences = await mongoose.model('Preferences').findOne({ userId });
      return preferences || null;
    } catch (error) {
      console.error('Error getting preferences:', error);
      throw error;
    }
  }

  async saveUserProfile(userId, profile) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const result = await mongoose.model('UserProfile').findOneAndUpdate(
        { userId },
        { $set: profile },
        { upsert: true, new: true }
      );

      return result;
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  }

  async getUserProfile(userId) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const profile = await mongoose.model('UserProfile').findOne({ userId });
      return profile || null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }
}

export default new DatabaseService(); 