import app from './app.js';

const PORT = process.env.PORT || process.env.PORT || 4000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

app.listen(PORT, () => {
  console.log(`Server listening on ${BASE_URL}`);
});
