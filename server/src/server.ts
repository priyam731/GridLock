import { createApp } from './app';
import { config } from './config';

const { httpServer } = createApp();

httpServer.listen(config.port, () => {
  console.log(`🔒 GridLock server running on http://localhost:${config.port}`);
  console.log(`   Grid: ${config.gridCols}×${config.gridRows} (${config.gridCols * config.gridRows} cells)`);
  console.log(`   Cooldown: ${config.cooldownMs}ms per capture`);
});
