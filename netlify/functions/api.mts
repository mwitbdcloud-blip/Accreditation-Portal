import type { Handler } from '@netlify/functions';
import serverless from 'serverless-http';
import { createApp } from '../../server';

let handlerPromise: Promise<ReturnType<typeof serverless>> | undefined;

function getHandler() {
  handlerPromise ??= createApp({ serveFrontend: false, enableTimers: false }).then((app) => serverless(app));
  return handlerPromise;
}

export const handler: Handler = async (event, context) => {
  const handler = await getHandler();
  return (await handler(event, context)) as any;
};
