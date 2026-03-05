'use client';

import { GLOBE_REGIONS, type GlobeRegion } from '@/lib/data/globe-regions';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';
import { Color, MeshPhongMaterial } from 'three';
import { RegionPopup } from './region-popup';

const COUNTRIES_GEOJSON_URL =
    'https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson';

// Soft pastel palette for country polygons
const LAND_COLORS = [
    '#b5d6a7',
    '#f7d9a0',
    '#a7c7d6',
    '#f0c4a8',
    '#c7b5d6',
    '#a7d6c2',
    '#d6c7a7',
    '#c2d6a7',
    '#d6a7b5',
    '#a7b5d6',
    '#d6d6a7',
    '#c7d6b5',
    '#d6b5c7',
    '#b5c7d6',
    '#d6c2a7',
];

export default function GlobeScene() {
    const globeRef = useRef<GlobeMethods | undefined>(undefined);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [hoveredRegion, setHoveredRegion] = useState<GlobeRegion | null>(
        null,
    );
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [countries, setCountries] = useState<any[]>([]);

    // Solid ocean-blue material for a cartoony look
    const oceanMaterial = useMemo(() => {
        const mat = new MeshPhongMaterial();
        mat.color = new Color('#91c4f2');
        mat.shininess = 15;
        return mat;
    }, []);

    // Fetch country boundaries for polygon rendering
    useEffect(() => {
        fetch(COUNTRIES_GEOJSON_URL)
            .then((res) => res.json())
            .then((data) => setCountries(data.features))
            .catch(() => {});
    }, []);

    // Responsive sizing
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) {
                setDimensions({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                });
            }
        });

        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    // Controls: no auto-rotation, zoom enabled
    useEffect(() => {
        const globe = globeRef.current;
        if (!globe) return;

        const controls = globe.controls();
        controls.autoRotate = false;
        controls.enableZoom = true;

        globe.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });
    }, []);

    // Track mouse position within container for popup placement
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            setMousePos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
        };

        container.addEventListener('mousemove', handleMouseMove);
        return () =>
            container.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Deterministic pastel color per country
    const getCountryColor = useCallback((feat: any) => {
        const idx = feat.properties?.ISO_N3
            ? Number.parseInt(feat.properties.ISO_N3, 10) % LAND_COLORS.length
            : Math.abs((feat.properties?.NAME || '').length) %
              LAND_COLORS.length;
        return LAND_COLORS[idx];
    }, []);

    const handlePointHover = useCallback((point: object | null) => {
        setHoveredRegion(point ? (point as GlobeRegion) : null);
    }, []);

    const handlePointClick = useCallback(
        (point: object) => {
            const region = point as GlobeRegion;
            router.push(
                `/chat?q=${encodeURIComponent(`popular recipes from ${region.name}`)}`,
            );
        },
        [router],
    );

    return (
        <div ref={containerRef} className="relative h-full w-full">
            {dimensions.width > 0 && (
                <Globe
                    ref={globeRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    globeMaterial={oceanMaterial}
                    backgroundColor="rgba(0,0,0,0)"
                    showAtmosphere={true}
                    atmosphereColor="#7ec8e3"
                    atmosphereAltitude={0.15}
                    showGraticules={true}
                    polygonsData={countries}
                    polygonCapColor={getCountryColor}
                    polygonSideColor={() => 'rgba(200, 200, 200, 0.3)'}
                    polygonStrokeColor={() => '#e0e0e0'}
                    polygonAltitude={0.005}
                    pointsData={GLOBE_REGIONS}
                    pointLat="lat"
                    pointLng="lng"
                    pointColor="color"
                    pointAltitude={0.06}
                    pointRadius={dimensions.width < 768 ? 1.0 : 0.6}
                    onPointHover={handlePointHover}
                    onPointClick={handlePointClick}
                />
            )}
            {hoveredRegion && (
                <RegionPopup
                    region={hoveredRegion}
                    x={mousePos.x}
                    y={mousePos.y}
                    containerWidth={dimensions.width}
                    containerHeight={dimensions.height}
                />
            )}
        </div>
    );
}
