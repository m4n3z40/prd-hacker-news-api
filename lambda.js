import awsLambdaFastify from '@fastify/aws-lambda';
import init from './src/app.js';

const handler = awsLambdaFastify(init());

export { handler };
