/** GeoJSON Point — `coordinates` is `[longitude, latitude]`, matching MongoDB's 2dsphere expectations. */
export interface GeoPoint {
    type: 'Point';
    coordinates: [number, number];
}
