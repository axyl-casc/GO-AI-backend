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
  
    async _send(sql, commit = false) {
      if (this.debug) {
        console.log(sql);
      }
      const result = await this.reader.query(sql);
      if (this.debug) {
        console.log(result);
      }
      return result;
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
      const rank = this.convertKyuDanToLevel(kyudan);
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
  
    convertKyuDanToLevel(kyudan) {
      // Conversion logic placeholder
      return kyudan * 10; // Example conversion logic
    }
  
    close() {
      this.reader.close();
    }
  }
  
module.exports = { SqlConnection };

