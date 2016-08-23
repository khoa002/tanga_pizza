$(function() {
    $('div#start').on('click', 'a#view-current-orders', function(e) {
        e.preventDefault();
        $.ajax({
            url: "https://pizzaserver.herokuapp.com/pizzas",
            method: "GET",
            contentType: "application/json"
        }).done(function(r) {
            $.ajax({
                url: "actions/sanitize_pizza_json.php",
                method: "POST",
                data: {
                    json: r
                }
            }).done(function(response) {
                $.each(response, function(i, e) {
                    if (!e.name && !e.description) return true; // skip any blank orders
                    $('table#current-orders tbody', 'div#view-current-orders').append('<tr><td>' + e.name + '</td><td>' + e.description + '</td></tr>');
                });
                $('div#start').slideUp();
                $('div#view-current-orders').slideDown();
            });
        });
    });
});