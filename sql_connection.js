const sqlite3 = require('sqlite3').verbose();
const { convertKyuDanToLevel, convertLevelToKyuDan } = require('./rank_conversion');
const path = require('path');

class SQLiteReader {
  constructor(dbPath) {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database:', dbPath);
      }
    });
  }

  async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed.');
      }
    });
  }
}
class SqlConnection {
    constructor(filePath, debug = false) {
      const fullPath = path.resolve(filePath);
      this.debug = debug;
      this.reader = new SQLiteReader(fullPath);
    }
  
    async _send(sql, options = { single: false }) {
      if (this.debug) {
          console.log(sql);
      }
  
      const result = await this.reader.query(sql);
  
      if (this.debug) {
          console.log(result);
      }
  
      if (options.single) {
          // Return the first row as a single object
          return Array.isArray(result) && result.length > 0 ? result[0] : null;
      }
  
      // Return all rows as an array
      return Array.isArray(result) ? result : [result];
  }
  
  
    async getCount() {
      const sql = "SELECT COUNT(level_19) FROM AI";
      const result = await this._send(sql);
      return parseInt(result[0]["COUNT(level_19)"], 10);
    }
  
    async getSum(boardsize) {
      const sql = `SELECT SUM(level_${boardsize}) FROM AI`;
      const result = await this._send(sql);
      return parseInt(result[0][`SUM(level_${boardsize})`], 10);
    }
  
    async getAvgRank(boardsize) {
      const sql = `SELECT AVG(level_${boardsize}) FROM AI`;
      const result = await this._send(sql);
      return parseFloat(result[0][`AVG(level_${boardsize})`]);
    }
  
    async getMinRank(boardsize) {
      const sql = `SELECT MIN(level_${boardsize}) FROM AI`;
      const result = await this._send(sql);
      return parseFloat(result[0][`MIN(level_${boardsize})`]);
    }
  
    async getMaxRank(boardsize) {
      const sql = `SELECT MAX(level_${boardsize}) FROM AI`;
      const result = await this._send(sql);
      return parseFloat(result[0][`MAX(level_${boardsize})`]);
    }
  
    async getStdev(boardsize) {
      const sql = `SELECT AVG(level_${boardsize}*level_${boardsize}) - AVG(level_${boardsize})*AVG(level_${boardsize}) FROM AI`;
      const result = await this._send(sql);
      return parseFloat(result[0][`AVG(level_${boardsize}*level_${boardsize}) - AVG(level_${boardsize})*AVG(level_${boardsize})`]);
    }
  
    async getBetween(boardsize, kyudan) {
      const rank = convertKyuDanToLevel(kyudan);
      const sql = `
        WITH ExactMatch AS (
          SELECT *
          FROM AI
          WHERE level_${boardsize} = ${rank}
        ),
        NearestBelow AS (
          SELECT *
          FROM AI
          WHERE level_${boardsize} < ${rank}
          ORDER BY level_${boardsize} DESC
          LIMIT 1
        ),
        NearestAbove AS (
          SELECT *
          FROM AI
          WHERE level_${boardsize} > ${rank}
          ORDER BY level_${boardsize} ASC
          LIMIT 1
        ),
        CombinedResults AS (
          SELECT * FROM ExactMatch
          UNION ALL
          SELECT * FROM NearestBelow
          UNION ALL
          SELECT * FROM NearestAbove
        )
        SELECT *
        FROM CombinedResults
        WHERE EXISTS (SELECT 1 FROM ExactMatch) -- Return exact match if it exists
        OR NOT EXISTS (SELECT 1 FROM ExactMatch) -- Otherwise, return nearest below and above
        LIMIT CASE 
          WHEN EXISTS (SELECT 1 FROM ExactMatch) THEN 1 -- 1 row if exact match exists
          ELSE 2 -- 2 rows if no exact match
        END;
      `;

      return await this._send(sql);
    }
  
    async numberSummary(boardsize) {
      const avg = await this.getAvgRank(boardsize);
      const count = await this.getCount();
      const sum = await this.getSum(boardsize);
      const stdev = await this.getStdev(boardsize);
      const min = await this.getMinRank(boardsize);
      const max = await this.getMaxRank(boardsize);
  
      return {
        average: avg,
        count: count,
        sum: sum,
        stdev: stdev,
        min: min,
        max: max
      };
    }

    async getRank(path, boardsize) {
      const sql = `SELECT level_${boardsize} FROM AI WHERE path="${path}";`;
      const result = await this._send(sql);
      return result[0][`level_${boardsize}`];
  }

  async getEngines(engineName) {
      const sql = `SELECT path FROM AI WHERE engine="${engineName}";`;
      return await this._send(sql);
  }

  async gamePlayed(path, won) {
      try {
          let sql = `UPDATE AI SET games_played=games_played+1 WHERE path="${path}";`;
          await this._send(sql, true);

          if (won) {
              sql = `UPDATE AI SET games_won=games_won+1 WHERE path="${path}";`;
              await this.sqlConnection._send(sql, true);
          }
          return 1;
      } catch (error) {
          console.error("Error updating game status:", error);
          return 0;
      }
  }// 994

  async getIsAnchor(path) {
      const sql = `SELECT is_anchor FROM AI WHERE path="${path}";`;
      const result = await this._send(sql);
      return result[0].is_anchor;
  }

  async changeRank(path, boardsize, diff) {
    const isAnchor = await this.getIsAnchor(path);
    if (parseInt(isAnchor, 10) === 1) {
        return 0;
    }

    // Update season_games and season_wins based on diff
    const incrementGameSql = `
        UPDATE AI 
        SET 
            season_games_${boardsize} = season_games_${boardsize} + 1,
            season_wins_${boardsize} = season_wins_${boardsize} + CASE WHEN ${diff} > 0 THEN ${diff} ELSE 0 END
        WHERE path="${path}";
    `;
    await this._send(incrementGameSql, true);

    // Check if season_games reaches 10
    const getSeasonStatsSql = `
        SELECT season_games_${boardsize} AS season_games, 
               season_wins_${boardsize} AS season_wins, 
               level_${boardsize} AS current_level
        FROM AI
        WHERE path="${path}";
    `;
    const stats = await this._send(getSeasonStatsSql, false);
    const { season_games, season_wins, current_level } = stats[0];

    if (season_games >= 10) {
        // Reset season_games and season_wins, and adjust level based on season_wins
        const resetSql = `
          UPDATE AI 
          SET 
              season_games_${boardsize} = 0,
              season_wins_${boardsize} = 0,
              level_${boardsize} = CASE 
                  WHEN ${season_wins} >= 9 THEN level_${boardsize} + 2 
                  WHEN ${season_wins} > 7 THEN level_${boardsize} + 1 
                  WHEN ${season_wins} < 3 AND ${season_wins} > 1 THEN level_${boardsize} - 1
                  WHEN ${season_wins} <= 1 THEN level_${boardsize} - 2
                  ELSE level_${boardsize}
              END
          WHERE path="${path}";
        `;
        await this._send(resetSql, true);
    }

    // Return updated level for verification or debugging
    return current_level;
}



  async getNearestLevel(kyudan, boardsize) {
      const level = convertKyuDanToLevel(kyudan);
      const sql = `
          SELECT path, level_${boardsize} 
          FROM AI 
          ORDER BY ABS(level_${boardsize} - ${level}) 
          LIMIT 1;
      `;
      const result = await this._send(sql);
      return result[0];
  }

  async getRandomAI() {
      const sql = `SELECT path FROM AI;`;
      const paths = await this._send(sql);
      const randomIndex = Math.floor(Math.random() * paths.length);
      return paths[randomIndex].path;
  }
  
    close() {
      this.reader.close();
    }
  }
  
module.exports = { SqlConnection };

