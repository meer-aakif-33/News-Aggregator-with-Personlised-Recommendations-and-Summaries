    import postgres from 'postgres';
    import dotenv from 'dotenv';

    dotenv.config();  // Make sure .env is loaded

    // Read the connection string from your environment variable
    const connectionString = process.env.DATABASE_URL;

    // Initialize the client
    // If using Supabase online, it automatically handles SSL
    const sql = postgres(connectionString);

    export default sql;
