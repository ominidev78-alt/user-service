import app from './app.js';
import { env } from './config/env.js';
import './config/db.js';

app.listen(env.PORT, '0.0.0.0', () => {
  console.log('USER-SERVICE rodando na porta', env.PORT);
});
