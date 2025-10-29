'use client';

import dynamic from "next/dynamic";
import {useEffect, useState} from "react";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export type Quake = {
    id: string;
    latitude: number;
    longitude: number;
    magnitude: number;
}

export default function Home() {
    const [quakes, setQuakes] = useState<Quake[]>([])

    useEffect(() => {
        // const apiUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson"
        const apiUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson"
        const fetchData = async () => {

            const response = await fetch(apiUrl)
            const data = await response.json();
            // coordinates: [longitude, latitude, depth]
            const newQuakes: Quake[] = data.features.map((feature: any) => ({
                id: feature.id,
                longitude: feature.geometry.coordinates[0],
                latitude: feature.geometry.coordinates[1],
                magnitude: feature.properties.mag,
            }))

            setQuakes(newQuakes);
        }
        fetchData()
    }, [])

    return (<div className="min-h-screen w-full relative">
        <MapView quakes={quakes}  />
    </div>)
}
