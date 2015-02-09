$(".variant").hide();
$(".variant.selected").show();
  
//more link in description 
moreDesc = $(".more-text");
moreDesc.hide();
descOpen = false;
$("a.more").show().click(function(){
	var moreLink = $(this);
	if(descOpen) {	      	
	  	moreDesc.fadeOut("slow",function(){
	  		moreLink.html("more&raquo;");	
	  	});
	  	descOpen = false;
	} else {
		moreLink.html("&laquo;less");	      		
		moreDesc.fadeIn("slow");
		descOpen = true;
	}
	return false;
});

var jsonField = $("#json-field");
jsonField.val("");

$("#json-field").click(function(){
	this.focus();
	this.select();
});

$("#searchform").submit(function(e){
	e.preventDefault();
	var button = $("#search-btn");
	var buttonContent = button.html();
	button.html($(".spinner").clone().show());
	var tagAPI = {};
	tagAPI.url = "/api/v1.0/stats/tag/";
	var tag = $("#search-string").val();
	var params = {};
	$.ajax({
		url:tagAPI.url+tag,
		success: function(result,status, object){
			$("#graph-area").show('fast');
			console.log(object);
			$("#json-field").val(object.responseText); 
		},
		error: function(object,exception) {
			if (object.status === 0) {
				//connection error
			} else if (object.status == 404) {
				//not found
			} else if (object.status == 500){
				alert("blerp 500");
				//internal error
			} else if (exception === 'parsererror') {
				//request failed
			} else if (exception === 'timeout') {
				//timeout error
			} else if (exception === 'abort') {
				//aborted
			} else {
				//something else
				//echo object.responseText
			}
		},
		complete:function(object,status) {
			console.log("status: "+status);
			button.html(buttonContent); //loader back to text
		}
	});
	
});

$("#search-btn").click(function(e){
	e.preventDefault();
	$("#searchform").submit();
	return false;
});
