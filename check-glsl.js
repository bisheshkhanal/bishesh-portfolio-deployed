const fs = require('fs');
const vite = require('vite');

(async () => {
  const server = await vite.createServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });
  
  try {
    const result = await server.transformRequest('/src/features/topology/shaders/topology.vert.glsl');
    console.log('GLSL TRANSFORM RESULT:', result.code.substring(0, 100));
  } catch (e) {
    console.error('ERROR:', e);
  }
  
  await server.close();
})();
