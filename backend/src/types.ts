export interface Earthquake {
  id: number;
  magnitude: number;
  location: Point;
  depth: number;
  time: Date;
  place: string;
  felt?: number;
  significance?: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface USGSFeature {
  type: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    felt?: number;
    sig?: number;
  };
  geometry: {
    type: string;
    coordinates: [number, number, number]; // [lng, lat, depth]
  };
}

export interface USGSResponse {
  type: string;
  features: USGSFeature[];
}
