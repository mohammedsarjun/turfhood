import { expect } from 'chai';
import express from 'express';
import request from 'supertest';
import { container } from 'tsyringe';
import { TurfOwnerApplicationController } from '../../src/presentation/turfOwnerApplication/controllers/TurfOwnerApplicationController.js';
import { ListMyTurfOwnerApplicationsUseCase } from '../../src/application/turfOwnerApplication/use-cases/ListMyTurfOwnerApplicationsUseCase.js';
import { TURF_OWNER_APPLICATION_TOKENS } from '../../src/domain/turfOwnerApplication/tokens.js';
import type { AuthenticatedRequest } from '../../src/presentation/shared/middlewares/authenticate.js';
import { FakeTurfOwnerApplicationRepository } from '../mocks/FakeTurfOwnerApplicationRepository.js';
import { buildTurfOwnerApplication } from '../fixtures/turfOwnerApplications.fixture.js';

describe('My Turfs pagination HTTP contract (in-memory repository)', () => {
  it('passes normalized query parameters through the controller and use case', async () => {
    const scope = container.createChildContainer();
    scope.registerInstance(
      TURF_OWNER_APPLICATION_TOKENS.ListMyTurfOwnerApplicationsUseCase,
      new ListMyTurfOwnerApplicationsUseCase(
        new FakeTurfOwnerApplicationRepository({
          allByApplicant: [
            buildTurfOwnerApplication({ id: 'one' }),
            buildTurfOwnerApplication({ id: 'two' }),
          ],
        }),
      ),
    );
    const controller = scope.resolve(TurfOwnerApplicationController);
    const app = express();
    app.use((req: AuthenticatedRequest, _res, next) => {
      req.user = { userId: 'user_1', roles: ['customer'] };
      next();
    });
    app.get('/mine', controller.listMine);
    const response = await request(app).get('/mine?page=2&limit=1').expect(200);
    expect(response.body.applications.map((item: { id: string }) => item.id)).to.deep.equal([
      'two',
    ]);
    expect(response.body.pagination).to.deep.equal({ page: 2, limit: 1, total: 2, totalPages: 2 });
    const malformed = await request(app).get('/mine?page=Infinity&limit=-1').expect(200);
    expect(malformed.body.pagination).to.deep.equal({ page: 1, limit: 9, total: 2, totalPages: 1 });
  });
});
