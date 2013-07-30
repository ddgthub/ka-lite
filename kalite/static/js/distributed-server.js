// Functions related to loading the page

function toggle_state(state, status){
    $("." + (status ? "not-" : "") + state + "-only").hide();
    $("." + (!status ? "not-" : "") + state + "-only").show();
}

function show_messages(messages) {
    // This function knows to loop through the server-side messages,
    //   received in the format from the status object
    for (var mi in messages) {
        show_message(messages[mi]["tags"], messages[mi]["text"]);
    }
}

function show_failure_messages(resp, msg_id) {
    // When receiving an error response object,
    //   show errors reported in that object
    if (msg_id) {
        clear_message(msg_id)
    }
    var messages = $.parseJSON(resp.responseText);
    for (msg_type in messages) {
        show_message(msg_type, messages[msg_type], msg_id);
    }
}

$(function(){
    // Do the AJAX request to async-load user and message data
    $("[class$=-only]").hide();
    doRequest("/securesync/api/status").success(function(data){
        toggle_state("logged-in", data.is_logged_in);
        toggle_state("registered", data.registered);
        toggle_state("django-user", data.is_django_user);
        toggle_state("admin", data.is_admin);
        if (data.is_logged_in){
            if (data.is_admin) {
                $('#logout').text(data.username + " (Logout)");
            }
            else {
                $('#logged-in-name').text(data.username);
                if (data.points!=0) {
                    $('#sitepoints').text("Points: " + data.points);
                }
            }
        }
        show_messages(data.messages);
    }).fail(function(resp) {
        show_failure_messages(resp, "id_status")
    });

    // load progress data for all videos linked on page, and render progress circles
    var youtube_ids = $.map($(".progress-circle[data-youtube-id]"), function(el) { return $(el).data("youtube-id") });
    if (youtube_ids.length > 0) {
        doRequest(
            "/api/get_video_logs", 
            youtube_ids
        ).success(function(data) {
            $.each(data, function(ind, video) {
                var newClass = video.complete ? "complete" : "partial";
                $("[data-youtube-id='" + video.youtube_id + "']").addClass(newClass);
            });
        }).fail(function(resp) {
            show_failure_messages(resp, "id_get_video_log")
        });
    }

    // load progress data for all exercises linked on page, and render progress circles
    var exercise_ids = $.map($(".progress-circle[data-exercise-id]"), function(el) { return $(el).data("exercise-id") });
    if (exercise_ids.length > 0) {
        doRequest(
            "/api/get_exercise_logs",
            exercise_ids
        ).success(function(data) {
            $.each(data, function(ind, exercise) {
                var newClass = exercise.complete ? "complete" : "partial";
                $("[data-exercise-id='" + exercise.exercise_id + "']").addClass(newClass);
            });
        }).fail(function(resp) {
            show_failure_messages(resp, "id_get_exercise_logs");
        });
    }

});
