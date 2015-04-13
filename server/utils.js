module.exports = {
    decodeParam: function(search) {
        if (search[0] === '?') {
            search = search.substr(1, search.length - 1);
        }
        return JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
    }
};