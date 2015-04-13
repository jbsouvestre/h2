$(function() {
    'use strict';

    $.fn.serializeObject = function() {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };

    $('#advanced').on('click', function() {

    });

    $('#search').on('submit', function(e) {
        e.preventDefault();

        var query = $(this).serializeObject();

        $('#count').empty();

        var $submit = $(this).find(':submit');
        $submit.button('loading');

        var $inputs = $(this).find('input');
        $inputs.prop('disabled', true);

        $.get('search', query)
            .done(function(response) {
                var results = response.results;
                console.log(results);
                var inner = '<div> Total Tweets for <span class="text-primary">' + results.q + ' </span> : ' + results.count;
                console.log(inner);
                $('#count').html(inner);
            })
            .fail(function() {
                alert('An error occured !');
            })
            .always(function() {
                $submit.button('reset');
                $inputs.prop('disabled', false);
            });
    });
});