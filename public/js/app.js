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
                var inner = '<div> Total Tweets for <span class="text-primary"></span> : ' + results.count + '</div>';
                var $inner= $(inner);
                $inner.find('span').text(results.q);
                $('#count').html($inner);
            })
            .fail(function(response) {
                var err = 'An unknown error occured';
                try {
                    var errors = response.responseJSON.results.error;
                    err = errors.map(function(error){
                        return '<div><strong>Error Code: ' + error.code + '</strong> - ' + error.message + '</div>';
                    }).join('');
                } catch(e){}

                $('#count').html('<div class="alert alert-danger">' + err + '</div>');
            })
            .always(function() {
                $submit.button('reset');
                $inputs.prop('disabled', false);
            });
    });
});