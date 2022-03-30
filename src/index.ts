import { logger } from './logger';
import express from 'express';
import * as service from './updateService';
import { listUsers } from './userRepository';
import cron from 'node-cron';

const port = process.env.PORT || '5000';

async function startServer() {
  const app = express();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.get('/health', async (_req, res) => {
    res.status(200);
  });

  app.get('/users', async (req, res) => {
    let search = '';
    if (req.query.search && typeof req.query.search === 'string') {
      search = req.query.search;
    }

    let page = 1;
    if (req.query.page) {
      if (typeof req.query.page !== 'string' || parseInt(req.query.page) < 1) {
        res.status(400).end();
        return;
      } else {
        page = Math.max(parseInt(req.query.page), 1);
      }
    }

    const data = await listUsers(search, page);

    res.status(200).json(data);
  })

  app.post('/load', async (_req, res) => {
    await service.update();

    res.status(200).end();
  });

  app.listen(port);

  cron.schedule('* * * * *', async () => {
    try {
      await service.update();
    } catch (e) {
      logger.error('Error while running update service', e);
    }
  });

  logger.info(`Server is running on port ${port}`);
}

startServer();
