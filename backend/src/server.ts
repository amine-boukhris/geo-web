import "dotenv/config";
import express from "express";
import cors from "cors";
import { initDB, getEarthquakes, getHeatmapData, insertEarthquakes } from "./database";
import { USGSService } from "./usgsService";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

import earthquakesRoutes from "./routes/earthquakes.route";

app.use("/api/earthquakes", earthquakesRoutes);

app.post("/api/import-data", async (req, res) => {
  try {
    const earthquakes = await USGSService.fetchEarthquakes();
    await insertEarthquakes(earthquakes);
    res.json({ message: `Imported ${earthquakes.length} earthquakes` });
  } catch (error) {
    console.error("Error importing data:", error);
    res.status(500).json({ error: "Failed to import data" });
  }
});

initDB().catch(console.error);

app.listen(PORT, () => {
  console.log("Server running");
  console.log("Earthquake API ready");
});
