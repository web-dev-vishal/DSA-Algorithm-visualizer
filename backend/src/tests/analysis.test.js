import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import Analysis from '../models/Analysis.js';
import config from '../config/index.js';

const testMongoUri = 'mongodb://127.0.0.1:27017/dsa_visualizer_test';

beforeAll(async () => {
  config.mongoUri = testMongoUri;
  config.configName = 'test';
  
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(testMongoUri);
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  }
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('DSA Code Analysis API', () => {
  const mockCode = `
    void bubbleSort(int arr[], int n) {
      for (int i = 0; i < n-1; i++) {
        for (int j = 0; j < n-i-1; j++) {
          if (arr[j] > arr[j+1]) {
            int temp = arr[j];
            arr[j] = arr[j+1];
            arr[j+1] = temp;
          }
        }
      }
    }
  `;

  describe('POST /api/v1/analyze', () => {
    it('should analyze and visualize code successfully (using offline mock parser by default)', async () => {
      const res = await request(app)
        .post('/api/v1/analyze')
        .send({
          code: mockCode,
          language: 'C++',
          array: [5, 1, 4, 2]
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('algorithmName');
      expect(res.body.data.algorithmName).toBe('Bubble Sort');
      expect(res.body.data).toHaveProperty('steps');
      expect(res.body.data.steps.length).toBeGreaterThan(0);
      
      // Verify caching occurred in MongoDB
      const cached = await Analysis.findOne();
      expect(cached).not.toBeNull();
      expect(cached.algorithmName).toBe('Bubble Sort');
    });

    it('should validate inputs and reject empty code', async () => {
      const res = await request(app)
        .post('/api/v1/analyze')
        .send({
          code: '',
          language: 'C++'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
