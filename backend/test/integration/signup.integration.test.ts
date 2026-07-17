
import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import type { Express } from 'express';
import { describe } from 'mocha';

const TEST_MONGODB_URI = 'mongodb://localhost:27017/turfhood_test';

describe('POST /api/users/signup (integration)', () => {
  let app: Express;

  before(async function () {

    this.timeout(20000);


    process.env.MONGODB_URI = TEST_MONGODB_URI;
    process.env.JWT_SECRET = 'test-only-secret';

    await mongoose.connect(TEST_MONGODB_URI);


    await import('../../src/config/container.js');
    app = (await import('../../src/app.js')).default;
  });

  after(async () => {

    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  afterEach(async () => {
    // Each test starts from a clean slate so they can't affect one another.
    const collections = mongoose.connection.collections;
    await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
  });

  
  // HAPPY PATH: a real HTTP POST, through real validation, into a real database.
  it('creates a new user and responds 201 with the saved user', async () => {
    const response = await request(app).post('/api/users/signup').send({
      name: 'Jordan Lee',
      email: 'jordan@example.com',
      phone: '9123456780',
      password: 'password1',
    });

    expect(response.status).to.equal(201);
    expect(response.body.user.email).to.equal('jordan@example.com');
    expect(response.body.user.password).to.be.undefined; // never leak the password/hash
  });

  // ERROR CASE: the database's unique index — not just app logic — must
  // reject a second account with the same email.
  it('responds 409 when the email is already registered', async () => {
    const payload = {
      name: 'Jordan Lee',
      email: 'jordan@example.com',
      phone: '9123456780',
      password: 'password1',
    };

    await request(app).post('/api/users/signup').send(payload);
    const response = await request(app)
      .post('/api/users/signup')
      .send({ ...payload, phone: '9999999999' });

    expect(response.status).to.equal(409);
  });
});
