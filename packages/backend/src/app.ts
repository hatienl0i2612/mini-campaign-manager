import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import fastifySchedule from '@fastify/schedule';
import { SimpleIntervalJob, AsyncTask } from 'toad-scheduler';
import { env } from '@/config/env';
import { authController } from '@/controllers/auth.controller';
import { campaignController } from '@/controllers/campaign.controller';
import { recipientController } from '@/controllers/recipient.controller';
import { runJobQueueWorker } from '@/workers/job-queue.worker';
import { runCampaignScheduler } from '@/workers/campaign-scheduler.worker';

export async function buildApp() {
    const app = Fastify({
        logger:
            env.NODE_ENV === 'development'
                ? {
                      transport: {
                          target: 'pino-pretty',
                          options: {
                              translateTime: 'HH:MM:ss Z',
                              ignore: 'pid,hostname',
                          },
                      },
                  }
                : true,
    });

    // ─── Plugins ────────────────────────────────────────────────────
    await app.register(cors, {
        origin: true,
        credentials: true,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    });

    await app.register(jwt, {
        secret: env.JWT_SECRET,
        sign: { expiresIn: env.JWT_EXPIRES_IN },
    });

    await app.register(fastifySchedule);

    const isApi = env.APP_MODE === 'api' || env.APP_MODE === 'full';
    const isWorker = env.APP_MODE === 'worker' || env.APP_MODE === 'full';

    // ─── Scheduled Jobs (worker | full) ─────────────────────────────
    if (isWorker) {
        const jobQueueTask = new AsyncTask('job-queue-worker', async () => {
            await runJobQueueWorker();
        });

        const campaignSchedulerTask = new AsyncTask('campaign-scheduler', async () => {
            await runCampaignScheduler();
        });

        app.ready().then(() => {
            app.scheduler.addSimpleIntervalJob(
                new SimpleIntervalJob({ seconds: 5, runImmediately: true }, jobQueueTask, {
                    preventOverrun: true,
                }),
            );

            app.scheduler.addSimpleIntervalJob(
                new SimpleIntervalJob(
                    { seconds: 10, runImmediately: false },
                    campaignSchedulerTask,
                    {
                        preventOverrun: true,
                    },
                ),
            );
        });
    }

    // ─── Controllers (api | full) ───────────────────────────────────
    if (isApi) {
        await app.register(authController, { prefix: '/api/auth' });
        await app.register(campaignController, { prefix: '/api/campaigns' });
        await app.register(recipientController, { prefix: '/api/recipients' });

        // ─── Health Check ───────────────────────────────────────────────
        app.get('/api/health', async () => {
            return {
                status: 'ok',
                mode: env.APP_MODE,
                timestamp: new Date().toISOString(),
            };
        });
    }

    console.log(`Process started (PID: ${process.pid})`);
    console.log(`App mode: ${env.APP_MODE} (api=${isApi}, worker=${isWorker})`);

    return app;
}
