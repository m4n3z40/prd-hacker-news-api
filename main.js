import app from './src/app.js';

const start = async () => {
  try {
    const address = await app.listen({ port: parseInt(process.env.PORT, 10) });

    app.log.info(`server listening on ${address}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
