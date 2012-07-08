$(document).ready(function(){
    $("a").click(function(event){
        alert("As you can see, the link no longer took you to jquery.com");
        event.preventDefault();
    });
    
    $("#graphForm").submit(function(event) {  
        
        $.post("/process", $("#graphForm").serialize(),
            function(data) {
                console.log("output of POST" + data);
                $("#previewImage").attr("src", data);
            });
        event.preventDefault();
        return false;
    });
});
