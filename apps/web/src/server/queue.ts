// BullMQ Queue singleton for render jobs
// Reads Redis connection from REDIS_URL
import { Queue } from 'bullmq';

const connection = { url: process.env.REDIS_URL as string };

export const renderQueue = new Queue('render', { connection });

