import sqlite3
import os
import random

def insert_filenames_into_db(db_path, directory_path):
    # Connect to the SQLite database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Clear the table before inserting new records
        cursor.execute("DELETE FROM puzzles")

        # Get all filenames in the directory
        filenames = [f for f in os.listdir(directory_path) if os.path.isfile(os.path.join(directory_path, f))]

        # Insert each filename into the database with appropriate rating
        for filename in filenames:
            if "easy" in filename.lower():
                rating = 985
            elif  "elementary" in filename.lower():
                rating = 980
            elif "intermediate" in filename.lower():
                rating = 995 
            elif "hard" in filename.lower():
                rating = 1000 
            else:
                rating = 970  
            if "ggg" not in filename.lower():
                if not (rating == 970):
                    rating = rating - 5

            anchor = 0
            if not (rating == 970):
                rating = rating + random.randint(-4,4)
            else:
                anchor = 1

            cursor.execute(
                """INSERT INTO puzzles (filename, rating, attempts, solved, is_anchor, happy_score)
                VALUES (?, ?, ?, ?, ?, ?)""",
                (filename, rating, 0, 0, anchor, 75)  # Default values for attempts, solved, and is_anchor
            )

        # Commit the changes
        conn.commit()
        print(f"Inserted {len(filenames)} filenames into the database.")

    except Exception as e:
        print(f"An error occurred: {e}")

    finally:
        # Close the database connection
        conn.close()

# Specify the paths to the database and the directory containing files
db_path = "tsumego_sets.db"  # Path to your SQLite database
directory_path = "puzzles"  # Path to your directory containing files

# Run the function
insert_filenames_into_db(db_path, directory_path)
