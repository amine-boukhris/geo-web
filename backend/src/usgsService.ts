import { USGSFeature, USGSResponse, Earthquake, Point } from "./types";
import axios from "axios";

export class USGSService {
  private static readonly BASE_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query";

  static async fetchEarthquakes(
    startTime: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endTime: Date = new Date(),
    minMagnitude: number = 4.5
  ): Promise<Omit<Earthquake, "id">[]> {
    const params = {
      format: "geojson",
      starttime: startTime.toISOString().split("T")[0],
      endtime: endTime.toISOString().split("T")[0],
      minmagnitude: minMagnitude,
    };

    console.log("Fetching earthquake data from USGS...");

    const response = await axios.get<USGSResponse>(this.BASE_URL, { params });
    const features = response.data.features;

    console.log(`Found ${features.length} earthquakes`);

    return features.map((feature: USGSFeature) => ({
      magnitude: feature.properties.mag,
      location: {
        x: feature.geometry.coordinates[0], // longitude
        y: feature.geometry.coordinates[1], // latitude
      } as Point,
      depth: feature.geometry.coordinates[2],
      time: new Date(feature.properties.time),
      place: feature.properties.place,
      felt: feature.properties.felt || 0,
      significance: feature.properties.sig || 0,
    }));
  }
}
