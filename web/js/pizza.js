$(function() {
    $('div#start').on('click', 'a#view-current-orders', function(e) {
        e.preventDefault();
        refreshCurrentOrders(function() {
            $('div#start').slideUp();
            $('div#view-current-orders').slideDown();
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
        var kvpairs = {};
        $('td.datacol', $row).each(function(i, o) {
            kvpairs[$(o).data('key')] = $(o).text();
        });
        showEditPizzaForm(pid, kvpairs, function(response) {
            $('div#view-current-orders').slideUp();
            $('div#edit-current-order').slideDown();
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
                    if (!$.trim(o.name)) return true;
                    if ($.inArray(o.topping_id, toppingIdsArray) > -1) return true;
                    toppingIdsArray.push(o.topping_id);
                    $popoverContent.append('<span class="label label-info" style="display: inline-block; margin: 0 1px;">' + o.name + '</span>');
                });
                if (response.length == 0) $popoverContent.append('<span class="label label-warning" style="display: inline-block; margin: 0 1px;">No topping added, add yours now!</span>');
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

    $('div#edit-current-order').on('click', 'a.cancel', function(e) {
        e.preventDefault();
        refreshCurrentOrders(function() {
            $('div#edit-current-order').slideUp();
            $('div#view-current-orders').slideDown();
        });
    });

    $('div#edit-current-order').on('click', 'a#pnewtopping-add', function(e) {
        e.preventDefault();
        var $form = $('form#current-order', 'div#edit-current-order');
        var $newTopping = $('input#pnewtopping', $form);
        var $formGroup = $newTopping.closest('.form-group');
        $formGroup.removeClass('has-error');
        var newToppingValue = $.trim($newTopping.val());
        var pid = $('input#pid', $form).val();
        if (!newToppingValue) {
            $newTopping.val('');
            $formGroup.addClass('has-error');
            return false;
        }

        $.ajax({
            url: "https://pizzaserver.herokuapp.com/toppings",
            method: "POST",
            data: {
                topping: {
                    name: newToppingValue
                }
            }
        }).success(function(addToppingSuccessResponse) {
            $.ajax({
                url: "https://pizzaserver.herokuapp.com/pizzas/" + pid + "/toppings",
                method: "POST",
                data: {
                    topping_id: addToppingSuccessResponse.id
                }
            }).success(function() {
                // should be checking for addToppingSuccessResponse.error
                // but the way the application is built now, existing topping
                // won't be posted
            }).fail(function() {
                // handle it
            }).done(function() {
                refreshCurrentOrders(function() {
                    // $('div#edit-current-order a.cancel').click(); // simulate closing this window
                    $('div#view-current-orders button.edit-pizza[data-pid="' + pid + '"]').click(); // simulate click on the edit button again
                });
            });
        }).fail(function() {
            // handle it
        });
    });

    $('div#start').on('click', 'a#lets-go', function() {
        var $form = $('div#start-new-order form#new-order');
        $form[0].reset();
        $('div#start').slideUp();
        $('div#start-new-order').slideDown();
    });

    $('div#start-new-order').on('click', 'a.close', function(e) {
        e.preventDefault();
        $('div#start-new-order').slideUp();
        $('div#start').slideDown();
    });

    $('div#start-new-order').on('click', 'a#save-this-pizza', function(e) {
        e.preventDefault();
        var $form = $('div#start-new-order form#new-order');
        var $name = $('input#pname', $form);
        var $desc = $('textarea#pdesc', $form);
        var name = $.trim($name.val());
        var desc = $.trim($desc.val());
        $name.closest('.form-group').removeClass('has-error');
        $desc.closest('.form-group').removeClass('has-error');
        if (!name) {
            $name.closest('.form-group').addClass('has-error');
            $name.val('');
            return false;
        }
        if (!desc) {
            $desc.closest('.form-group').addClass('has-error');
            $desc.val('');
            return false;
        }
        $.ajax({
            url: 'https://pizzaserver.herokuapp.com/pizzas',
            method: 'POST',
            data: {
                pizza: {
                    name: name,
                    description: desc
                }
            }
        }).success(function(addPizzaResponse) {
            var pid = addPizzaResponse.id;
            var kvpairs = {
                pname: name,
                pdesc: desc
            };
            showEditPizzaForm(pid, kvpairs, function(response) {
                $('div#start-new-order').slideUp();
                $('div#edit-current-order').slideDown();
            });
        }).fail(function() {
            // handle it
        });
    });
    $('[data-toggle="tooltip"]').tooltip();
});

function refreshCurrentOrders(cb) {
    $.ajax({
        url: "https://pizzaserver.herokuapp.com/pizzas",
        method: "GET",
        contentType: "application/json"
    }).done(function(pizzasResponse) {
        pizzasResponse.sort(function(a, b) {
            return parseFloat(b.id) - parseFloat(a.id);
        });
        $.ajax({
            url: "actions/sanitize_pizza_json.php",
            method: "POST",
            data: {
                json: JSON.stringify(pizzasResponse)
            }
        }).done(function(sanitizedPizzaResponse) {
            $('table#current-orders tbody', 'div#view-current-orders').empty();
            $.each(sanitizedPizzaResponse, function(i, e) {
                // if (!$.trim(e.name) && !$.trim(e.description)) return true; // skip any blank orders
                $('table#current-orders tbody', 'div#view-current-orders').append('<tr><td class="datacol" data-key="pid">' + e.id + '</td><td class="datacol" data-key="pname">' + e.name + '</td><td class="datacol" data-key="pdesc">' + e.description + '</td><td><button type="button" class="btn btn-default btn-sm view-toppings">View toppings</button></td><td><button type="button" data-pid="' + e.id + '" class="btn btn-primary btn-sm edit-pizza">Edit this pizza</button></td></tr>');
            });
            if (typeof(cb) === 'function') cb();
        });
    });
}

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

function showEditPizzaForm(pid, kvpairs, cb) {
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
                    if ($.inArray(o.topping_id, toppingsOnPizzaIds) > -1) return true;
                    toppingsOnPizzaIds.push(o.topping_id);
                });

                $('.form-control[name="pid"]', $form).val(pid);
                $.each(kvpairs, function(key, value) {
                    $('.form-control[name="' + key + '"]', $form).val(value);
                });
                $('.form-control[name="ptoppings"]', $form).html('');
                var toppingIdsArray = new Array(); // used to prevent duplicates
                $.each(sanitizedToppingsResponse, function(i, o) {
                    if (!$.trim(o.name)) return true;
                    if ($.inArray(o.id, toppingIdsArray) > -1) return true;
                    toppingIdsArray.push(o.id);
                    var $optionDiv = $('<option value="' + o.id + '">' + o.name + '</option>');
                    if ($.inArray(o.id, toppingsOnPizzaIds) > -1) {
                        $optionDiv.prop('selected', true);
                    }
                    $('.form-control[name="ptoppings"]', $form).append($optionDiv);
                });
                // destroy the select2 object if it exists from a previous load
                if ($('.form-control[name="ptoppings"]', $form).data('select2')) {
                    $('.form-control[name="ptoppings"]', $form).off('select2:unselecting');
                    $('.form-control[name="ptoppings"]', $form).off('select2:select');
                    $('.form-control[name="ptoppings"]', $form).select2('destroy');
                }
                $('.form-control[name="ptoppings"]', $form).select2();
                $('.form-control[name="ptoppings"]', $form).on('select2:unselecting', function(e) {
                    e.preventDefault();
                    $('.form-control[name="ptoppings"]', $form).select2('close');
                    return false;
                });
                $('.form-control[name="ptoppings"]', $form).on('select2:select', function(e) {
                    var selectedObject = e.params.data;
                    $.ajax({
                        url: "https://pizzaserver.herokuapp.com/pizzas/" + pid + "/toppings",
                        method: "POST",
                        data: {
                            topping_id: selectedObject.id
                        }
                    }).success(function(addToppingSuccessResponse) {
                        // should be checking for addToppingSuccessResponse.error
                        // but the way the application is built now, existing topping
                        // won't be posted
                    }).fail(function() {
                        // handle it
                    });
                });
                if (typeof(cb) === 'function') cb();
            });
        });
    });
}