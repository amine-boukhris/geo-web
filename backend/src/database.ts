import { Pool } from "pg";
import { Earthquake, Point } from "./types";

const pool = new Pool({
  host: "localhost",
  database: "earthquakes",
  user: "postgres",
  password: "",
  port: 5432,
});

export const initDB = async (): Promise<void> => {
  const client = await pool.connect();
  try {
    // enable postgis, create earthquakes table and index
    await client.query("CREATE EXTENSION IF NOT EXISTS postgis;");

    await client.query(`
      CREATE TABLE IF NOT EXISTS earthquakes (
        id SERIAL PRIMARY KEY,
        magnitude FLOAT,
        location GEOMETRY(Point, 4326),
        depth FLOAT,
        time TIMESTAMP,
        place TEXT,
        felt INTEGER,
        significance INTEGER
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS earthquakes_location_idx 
      ON earthquakes USING GIST(location);
    `);

    console.log("Database initialized successfully");
  } catch (error) {
    console.error(error);
  } finally {
    client.release();
  }
};

export const insertEarthquakes = async (earthquakes: Omit<Earthquake, "id">[]): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const eq of earthquakes) {
      await client.query(
        `INSERT INTO earthquakes
          (magnitude, location, depth, time, place, felt, significance)
          VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), $4, $5, $6, $7, $8)
          ON CONFLICT DO NOTHING
        `,
        [
          eq.magnitude,
          eq.location.x,
          eq.location.y,
          eq.depth,
          eq.time,
          eq.place,
          eq.felt,
          eq.significance,
        ]
      );
    }

    await client.query("COMMIT");
    console.log(`Inserted ${earthquakes.length} earthquakes`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getEarthquakes = async (
  minMagnitude: number = 4.5,
  startDate?: Date,
  endDate?: Date
): Promise<any[]> => {
  let query = `
    SELECT id, magnitude, depth, time, place, felt, significance, ST_AsGeoJSON(location) as location
    FROM earthquakes
    WHERE magnitude >= $1
  `;

  const params: any[] = [minMagnitude];
  let paramCount = 1;

  if (startDate && endDate) {
    paramCount += 2;
    query += ` AND time BETWEEN $${paramCount - 1} AND $${paramCount}`;
    params.push(startDate, endDate);
  }

  query += ` ORDER BY time DESC LIMIT 1000`;

  const result = await pool.query(query, params);

  return result.rows;
};

export const getHeatmapData = async (): Promise<any[]> => {
  const query = `
    SELECT 
      ST_AsGeoJSON(
        ST_Buffer(
          ST_Transform(location, 3857),
          POWER(magnitude, 2) * 50000
        )
      ) as geojson,
      magnitude
    FROM earthquakes
    WHERE magnitude >= 4.5,
    AND time >= NOW() - INTERVAL '30 days'
  `;

  const result = await pool.query(query);
  return result.rows;
};
