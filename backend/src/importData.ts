import { USGSService } from "./usgsService";
import { insertEarthquakes } from "./database";
import { initDB } from "./database";

async function importData() {
  try {
    console.log("Starting earthquake data import...");

    await initDB();
    const earthquakes = await USGSService.fetchEarthquakes();
    await insertEarthquakes(earthquakes);

    console.log("Data import completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Data import failed:", error);
    process.exit(1);
  }
}

importData();
