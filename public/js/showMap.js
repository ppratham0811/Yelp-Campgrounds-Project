mapboxgl.accessToken = mapToken;
var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: campground.geometry.coordinates,
    zoom: 10,
});
map.addControl(new mapboxgl.NavigationControl())


let mapMarker = new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
            `${campground.title}<br>${campground.location}`
        )
    )
    .addTo(map);
