$(document).ready(function(){

    $("#graphForm").submit(function(event) {  
        
        var xhr = $.post("/process", $("#graphForm").serialize(), null, 'text')
        .success(function(data) {
            console.log("output of POST" + data);
            $("#previewImage").attr("src", data);
        })
        .error(function(jqXHR) {
            console.log("Error occurred during processing")
            console.log(jqXHR)
        });
        event.preventDefault();
        return false;
    });
});
