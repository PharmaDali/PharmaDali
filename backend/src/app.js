import express from 'express';
import userRoutes from './users/users.routes.js';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'PharmaDali API is running' });
});

app.use('/api/users', userRoutes);

export default app;