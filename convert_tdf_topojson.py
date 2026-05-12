"""
Converts the Tierra del Fuego TopoJSON (departamentos level) to GeoJSON
and replaces the TDF feature in agrentinaProvincesGeoJson.json
"""
import json, sys

# ── 1.  Paste the TopoJSON here ──────────────────────────────────────────────
TOPOJSON_PATH = "tdf_topojson.json"   # we will write it first, then read it

# ── 2.  TopoJSON → GeoJSON helpers ───────────────────────────────────────────

def decode_arcs(raw_arcs, scale, translate):
    """Delta-decode + transform all arcs to [lon, lat] lists."""
    result = []
    for arc in raw_arcs:
        x = y = 0
        coords = []
        for pt in arc:
            x += pt[0]
            y += pt[1]
            coords.append([x * scale[0] + translate[0],
                           y * scale[1] + translate[1]])
        result.append(coords)
    return result

def get_ring(arc_index, decoded):
    """Return coordinates for one arc index (negative = reversed)."""
    if arc_index < 0:
        return decoded[~arc_index][::-1]
    return decoded[arc_index]

def stitch_ring(arc_indices, decoded):
    """Join multiple arcs into a single closed ring."""
    ring = []
    for idx in arc_indices:
        seg = get_ring(idx, decoded)
        if ring:
            ring += seg[1:]   # drop first point (duplicate of last)
        else:
            ring += seg
    # ensure closed
    if ring and ring[0] != ring[-1]:
        ring.append(ring[0])
    return ring

def geom_to_geojson(geom, decoded):
    """Convert a TopoJSON geometry object to a GeoJSON geometry dict."""
    t = geom["type"]
    if t == "Polygon":
        return {
            "type": "Polygon",
            "coordinates": [stitch_ring(ring, decoded)
                             for ring in geom["arcs"]]
        }
    elif t == "MultiPolygon":
        return {
            "type": "MultiPolygon",
            "coordinates": [
                [stitch_ring(ring, decoded) for ring in poly]
                for poly in geom["arcs"]
            ]
        }
    raise ValueError(f"Unsupported geometry type: {t}")

# ── 3.  Merge all dept geometries into one province MultiPolygon ──────────────

def flatten_to_polygons(geojson_geom):
    """Return a list of polygon rings-lists from a Polygon or MultiPolygon."""
    t = geojson_geom["type"]
    if t == "Polygon":
        return [geojson_geom["coordinates"]]
    elif t == "MultiPolygon":
        return geojson_geom["coordinates"]
    return []

# ── 4.  Main ─────────────────────────────────────────────────────────────────

def main():
    # Read the TopoJSON we just saved
    with open(TOPOJSON_PATH, "r", encoding="utf-8") as f:
        topo = json.load(f)

    transform = topo["transform"]
    scale     = transform["scale"]
    translate = transform["translate"]

    decoded = decode_arcs(topo["arcs"], scale, translate)

    # Convert each department geometry
    obj_key = list(topo["objects"].keys())[0]   # e.g. "departamentos-tierra_del_fuego"
    geoms   = topo["objects"][obj_key]["geometries"]

    all_polys = []
    for geom in geoms:
        gj = geom_to_geojson(geom, decoded)
        all_polys.extend(flatten_to_polygons(gj))

    # Build province MultiPolygon
    province_geom = {
        "type": "MultiPolygon",
        "coordinates": all_polys
    }

    print(f"Province geometry: {len(all_polys)} polygons converted from TopoJSON")

    # ── 5.  Replace TDF feature in provinces GeoJSON ─────────────────────────
    provinces_path = "DatosGeoJson/agrentinaProvincesGeoJson.json"
    with open(provinces_path, "r", encoding="utf-8") as f:
        provinces = json.load(f)

    tdf_idx = None
    for i, feat in enumerate(provinces["features"]):
        if feat["properties"].get("provincia") == "TIERRA DEL FUEGO":
            tdf_idx = i
            break

    if tdf_idx is None:
        print("ERROR: TDF feature not found in provinces file")
        sys.exit(1)

    provinces["features"][tdf_idx]["geometry"] = province_geom
    print(f"Replaced feature index {tdf_idx} (TIERRA DEL FUEGO)")

    with open(provinces_path, "w", encoding="utf-8") as f:
        json.dump(provinces, f, ensure_ascii=False, separators=(",", ":"))

    print("Done! Saved", provinces_path)

if __name__ == "__main__":
    main()
