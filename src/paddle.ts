import { initializePaddle, type Paddle } from '@paddle/paddle-js';

let paddleInstance: Paddle | undefined;

export const getPaddle = async (): Promise<Paddle | undefined> => {
  if (paddleInstance) return paddleInstance;
  
  paddleInstance = await initializePaddle({
    environment: 'sandbox',
    token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN || '',
  });

  return paddleInstance;
};
