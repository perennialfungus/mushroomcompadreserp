import { randomUUID } from "node:crypto";

export type ShopifyWebhookProcessingJob = {
  jobId: string;
  eventId: string;
  organizationId: string;
  topic: string;
  shopDomain: string;
  webhookId: string;
  requestId: string;
};

export type WebhookJobQueue = {
  enqueueShopifyWebhook(job: ShopifyWebhookProcessingJob): Promise<void>;
};

export function createMemoryWebhookJobQueue() {
  const jobs: ShopifyWebhookProcessingJob[] = [];

  return {
    jobs,
    async enqueueShopifyWebhook(job: ShopifyWebhookProcessingJob) {
      jobs.push({
        ...job,
        jobId: job.jobId || randomUUID()
      });
    }
  } satisfies WebhookJobQueue & {
    jobs: ShopifyWebhookProcessingJob[];
  };
}
