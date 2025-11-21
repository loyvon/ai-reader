"""
Migration script to add scroll_position column to reading_progress table.
"""
import sqlite3
import os

db_path = os.getenv("DATABASE_PATH", "reader_data.db")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check if column exists
    cursor.execute("PRAGMA table_info(reading_progress)")
    columns = [row[1] for row in cursor.fetchall()]
    
    if 'scroll_position' not in columns:
        print("Adding scroll_position column...")
        cursor.execute("""
            ALTER TABLE reading_progress 
            ADD COLUMN scroll_position INTEGER DEFAULT 0
        """)
        conn.commit()
        print("✓ Migration completed successfully!")
    else:
        print("✓ Column already exists, no migration needed.")
        
except sqlite3.OperationalError as e:
    if "no such table" in str(e):
        print("Table doesn't exist yet, will be created on first run.")
    else:
        print(f"Error: {e}")
finally:
    conn.close()
