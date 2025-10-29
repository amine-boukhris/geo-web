"use client"

import {useEffect, useRef} from "react";
import L from 'leaflet'
import "leaflet/dist/leaflet.css";
import {Quake} from "@/app/page";

interface MapViewProps {
    quakes: Quake[]
}

export default function MapView({quakes}: MapViewProps) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);

    useEffect(() => {
        if (mapRef.current) return
        console.log("made it")
        const map = L.map(mapContainerRef.current!, {
            center: [0, 0],
            zoom: 2,
        })

        L.tileLayer("https://tile.openstreetmap.bzh/ca/{z}/{x}/{y}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        mapRef.current = map;

        // add markers
        const getMarkerIcon = (magnitude: number) => {
            const size = mapNumRange(magnitude, 0, Math.sqrt(Math.pow(10, 10)), 0, 1000)
            return L.divIcon({
                className: "custom-marker",
                html: `
                    <div style="
                      background-color: deeppink;
                      width: ${size}px;
                      height: ${size}px;
                      border-radius: 50%;
                      border: 1px solid black
                    "></div>
                `,
                iconSize: [size, size],
            });
        }

        const getLinearMagnitude = (magnitude: number) => {
            return Math.sqrt(Math.pow(10, magnitude));
        }

        const mapNumRange = (num: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
            return ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
        }

        markersRef.current = quakes.map((quake) => {
            return L.marker([quake.latitude, quake.longitude], {
                icon: getMarkerIcon(getLinearMagnitude(quake.magnitude)),
            }).addTo(mapRef.current!);
        });

    }, []);

    return <div ref={mapContainerRef} className="w-full min-h-screen"></div>
}