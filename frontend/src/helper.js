export function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

export function getCsrf(){
    return getCookie("csrftoken");
}

export function waitForSocketConnection(socket, callback, name){
    setTimeout(
        function () {
            if (socket.readyState === 1) {
                console.log(`Connection ${name != null ? name : ""} is made`);
                if (callback != null){
                    callback();
                }
            } else {
                console.log(`wait for connection ${name != null ? name : ""}...`)
                waitForSocketConnection(socket, callback, name);
            }

        }, 5);
}