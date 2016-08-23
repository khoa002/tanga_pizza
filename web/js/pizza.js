$(function() {
    $('div#start').on('click', 'a#view-current-orders', function(e) {
        e.preventDefault();
        $.ajax({
            url: "https://pizzaserver.herokuapp.com/pizzas",
            method: "GET",
            contentType: "application/json"
        }).done(function(pizzasResponse) {
            $.ajax({
                url: "actions/sanitize_pizza_json.php",
                method: "POST",
                data: {
                    json: pizzasResponse
                }
            }).done(function(sanitizedPizzaResponse) {
                $.each(sanitizedPizzaResponse, function(i, e) {
                    if (!$.trim(e.name) && !$.trim(e.description)) return true; // skip any blank orders
                    $('table#current-orders tbody', 'div#view-current-orders').append('<tr><td class="datacol" data-key="pid">' + e.id + '</td><td class="datacol" data-key="pname">' + e.name + '</td><td class="datacol" data-key="pdesc">' + e.description + '</td><td><button type="button" class="btn btn-default btn-sm view-toppings">View toppings</button></td><td><button type="button" class="btn btn-primary btn-sm edit-pizza">Edit this pizza</button></td></tr>');
                });
                $('div#start').slideUp();
                $('div#view-current-orders').slideDown();
            });
        });
    });

    $('div#view-current-orders').on('click', 'a.close', function(e) {
        e.preventDefault();
        $('div#view-current-orders').slideUp();
        $('div#start').slideDown();
    });

    $('div#view-current-orders').on('click', 'button.edit-pizza', function(e) {
        e.preventDefault();
        var $row = $(this).parents('tr');
        var pid = $('td.datacol[data-key="pid"]', $row).text();
        var $form = $('form#current-order', 'div#edit-current-order');
        $form[0].reset();
        $.ajax({
            url: 'https://pizzaserver.herokuapp.com/toppings',
            method: 'GET'
        }).done(function(toppingsResponse) {
            $.ajax({
                url: "actions/sanitize_pizza_json.php",
                method: "POST",
                data: {
                    json: toppingsResponse
                }
            }).done(function(sanitizedToppingsResponse) {
                getPizzaToppingsByID(pid, function(toppingsOnPizzaResponse) {
                    var toppingsOnPizzaIds = new Array();
                    $.each(toppingsOnPizzaResponse, function(i, o) {
                        if ($.inArray(o.id, toppingsOnPizzaIds) > -1) return true;
                        toppingsOnPizzaIds.push(o.id);
                    });

                    $('td.datacol', $row).each(function(i, o) {
                        var key = $(o).data('key');
                        var value = $(o).text();
                        $('.form-control[name="' + key + '"]', $form).val(value);
                    });
                    $('.form-control[name="ptoppings"]', $form).html('');
                    var toppingIdsArray = new Array(); // used to prevent duplicates
                    $.each(sanitizedToppingsResponse, function(i, o) {
                        if(!$.trim(o.name)) return true;
                        if ($.inArray(o.id, toppingIdsArray) > -1) return true;
                        toppingIdsArray.push(o.id);
                        var $optionDiv = $('<option value="' + o.id + '">' + o.name + '</option>');
                        if ($.inArray(o.id, toppingsOnPizzaIds) > -1) $optionDiv.prop('selected', true);
                        $('.form-control[name="ptoppings"]', $form).append($optionDiv);
                    });
                    $('.form-control[name="ptoppings"]', $form).select2();
                    $('.form-control[name="ptoppings"]', $form).on('select2:unselecting', function(e){
                        e.preventDefault();
                        return false;
                    });
                    $('div#view-current-orders').slideUp();
                    $('div#edit-current-order').slideDown();
                });
            });
        });
    });

    $('div#view-current-orders').on('click', 'button.view-toppings', function(e) {
        e.preventDefault();
        var $button = $(this);
        if (!$button.hasClass('btn-info')) {
            var $row = $button.parents('tr');
            var pid = $('td.datacol[data-key="pid"]', $row).text();

            $button.width($button.width());
            $button.html('<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>');
            $button.prop('disabled', true);

            getPizzaToppingsByID(pid, function(response) {
                var toppingIdsArray = new Array(); // used to check for duplicates
                var $popoverContent = $("<div></div>");
                $.each(response, function(i, o) {
                    if ($.inArray(o.topping_id, toppingIdsArray) > -1) return true;
                    toppingIdsArray.push(o.topping_id);
                    $popoverContent.append('<span class="label label-info" style="display: inline-block; margin: 0 1px;">' + o.name + '</span>');
                });
                $button.html('View toppings');
                $button.prop('disabled', false);
                $button.popover('destroy'); // destroy any existing popover object
                $button.popover({
                    title: $('td.datacol[data-key="pname"]', $row).text(),
                    html: true,
                    content: $popoverContent.html(),
                    placement: 'left',
                    trigger: 'hover'
                });
                $button.popover('show');
                $button.removeClass('btn-default');
                $button.addClass('btn-info');
            });
        }
    });

    $('div#edit-current-order').on('click', 'button.cancel', function(e) {
        e.preventDefault();
        $('div#edit-current-order').slideUp();
        $('div#view-current-orders').slideDown();
    });
});

function getPizzaToppingsByID(pid, cb) {
    var urlToGetToppings = 'https://pizzaserver.herokuapp.com/pizzas/' + pid + '/toppings';
    $.ajax({
        url: urlToGetToppings,
        method: "GET"
    }).done(function(r) {
        $.ajax({
            url: "actions/sanitize_pizza_json.php",
            method: "POST",
            data: {
                json: r
            }
        }).done(function(response) {
            if (typeof(cb) == 'function') cb(response);
        });
    });
}