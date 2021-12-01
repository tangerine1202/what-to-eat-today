export function calculateLatLngDistance (lat1, lng1, lat2, lng2) {
  // Spherical Law of Cosines https://www.movable-type.co.uk/scripts/latlong.html
  const R = 6371e3
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δλ = (lng2 - lng1) * Math.PI / 180
  const d = R * Math.acos(
    Math.sin(φ1) * Math.sin(φ2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  )
  return d // in meters
}
