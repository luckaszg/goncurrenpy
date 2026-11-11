import index from './index.html';

const server = Bun.serve({
  port: 9000,
  routes: {
    "/": index,
  }
});
