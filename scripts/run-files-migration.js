const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function runFilesMigration() {
    try {
        console.log('Running files table migration...');

        // Create files table
        await sql`
      CREATE TABLE IF NOT EXISTS files (
          id SERIAL PRIMARY KEY,
          filename VARCHAR(255) NOT NULL,
          original_name VARCHAR(255) NOT NULL,
          mime_type VARCHAR(100) NOT NULL,
          file_size INTEGER NOT NULL,
          file_data BYTEA NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_by INTEGER REFERENCES users(id)
      )
    `;

        // Add indexes
        await sql`CREATE INDEX IF NOT EXISTS idx_files_filename ON files(filename)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_files_created_by ON files(created_by)`;

        console.log('✅ Files table migration completed successfully!');

        // Test the table creation
        const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'files'
    `;

        if (result.length > 0) {
            console.log('✅ Files table created successfully!');
        } else {
            console.log('❌ Files table was not created');
        }

    } catch (error) {
        console.error('❌ Error running files migration:', error);
        process.exit(1);
    }
}

runFilesMigration(); 