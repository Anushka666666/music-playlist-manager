import pg from 'pg';

const pool = new pg.Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'playlist_manager',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  connectionTimeoutMillis: 5000,
});

pool.query('SELECT NOW()')
  .then(() => console.log('Connected to PostgreSQL'))
  .catch((err) => {
    console.error('PostgreSQL connection failed:', err.message);
    process.exit(1);
  });

export default pool;
