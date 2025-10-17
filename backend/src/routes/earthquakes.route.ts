import { Router } from "express";
import { getEarthquakes, getHeatmapData } from "../database";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const minMagnitude = parseFloat(req.query.min_magnitude as string) || 4.5;
    const startDate = req.query.start_date ? new Date(req.query.start_date as string) : undefined;
    const endDate = req.query.end_date ? new Date(req.query.end_date as string) : undefined;

    const earthquakes = await getEarthquakes(minMagnitude, startDate, endDate);

    // convert to geojson format
    const features = earthquakes.map((eq) => ({
      type: "Feature" as const,
      geometry: JSON.parse(eq.location),
      properties: {
        id: eq.id,
        magnitude: eq.magnitude,
        depth: eq.depth,
        time: eq.time,
        place: eq.place,
        felt: eq.felt,
        significance: eq.significance,
      },
    }));

    res.json({
      type: "FeatureCollection",
      features,
    });
  } catch (error) {
    console.error("Error fetching earthquakes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/heatmap", async (req, res) => {
  try {
    const heatmapData = await getHeatmapData();

    const features = heatmapData.map((row) => ({
      type: "Feature" as const,
      geometry: JSON.parse(row.geojson),
      properties: {
        magnitude: row.magnitude,
      },
    }));

    res.json({
      type: "FeatureCollection",
      features,
    });
  } catch (error) {
    console.error("Error fetching heatmap data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
