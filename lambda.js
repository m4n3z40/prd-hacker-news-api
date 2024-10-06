import awsLambdaFastify from '@fastify/aws-lambda';
import app from './src/app.js';

const handler = awsLambdaFastify(init());

export { handler };
