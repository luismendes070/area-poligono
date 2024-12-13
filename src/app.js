// app.js
$(document).ready(function () {
    const map = L.map('map').setView([0, 0], 2);
    const stripe = Stripe('your-publishable-key'); // Replace with your Stripe publishable key
    const apiBaseUrl = 'http://localhost:4566'; // LocalStack S3 endpoint

    let userLoggedIn = false;
    let drawnPolygon;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    function calculateArea(polygon) {
        const latlngs = polygon.getLatLngs()[0];
        const area = L.GeometryUtil.geodesicArea(latlngs);
        return area;
    }

    function uploadToS3(data) {
        $.ajax({
            url: `${apiBaseUrl}/your-bucket-name`,
            type: 'PUT',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function () {
                alert('Polygon data uploaded successfully!');
            },
            error: function () {
                alert('Error uploading data to S3');
            }
        });
    }

    function handleStripeCheckout() {
        stripe.redirectToCheckout({
            sessionId: 'your-session-id', // Replace with dynamically created session ID
        }).then(function (result) {
            if (result.error) {
                alert(result.error.message);
            }
        });
    }

    $('#login').click(function () {
        const username = $('#username').val();
        const password = $('#password').val();

        if (username === 'admin' && password === 'password') { // Mock authentication
            userLoggedIn = true;
            alert('Login successful!');
            $('#auth').hide();
            $('#map').show();
            $('#stripeCheckout').show();
        } else {
            alert('Invalid credentials');
        }
    });

    map.on('click', function (e) {
        if (!userLoggedIn) {
            alert('Please log in to interact with the map.');
            return;
        }

        if (drawnPolygon) {
            map.removeLayer(drawnPolygon);
        }

        drawnPolygon = L.polygon([
            [e.latlng.lat, e.latlng.lng],
            [e.latlng.lat + 0.01, e.latlng.lng],
            [e.latlng.lat, e.latlng.lng + 0.01]
        ]).addTo(map);

        const area = calculateArea(drawnPolygon);
        alert(`Polygon area: ${area} m²`);

        uploadToS3({
            coordinates: drawnPolygon.getLatLngs(),
            area
        });
    });

    $('#stripeCheckout').click(handleStripeCheckout);
});