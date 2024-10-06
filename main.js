import init from './src/app.js';

const start = async () => {
  const app = init();

  try {
    const address = await app.listen({ port: parseInt(process.env.PORT, 10) });

    app.log.info(`server listening on ${address}`);
  } catch (err) {
    app.log.error(err);

    await app.close();

    process.exit(1);
  }
}

start();
