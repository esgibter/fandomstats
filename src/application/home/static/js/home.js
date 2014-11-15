$(".variant").hide();
$(".variant.selected").show();
  
//form tabs
$("legend a").click(function(){
	toggle = $(this);
	var target = toggle.attr("href").replace("#","");
	$("legend a").removeClass("selected");
	toggle.addClass("selected");
	$(".variant").removeClass("selected").hide();
	$("#"+target).addClass("selected").show();
 	return false;
});
  
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

$("#search-btn").click(function(){
	//$("#graph-area").show('fast');
	var tagAPI = {};
	tagAPI.url = "/api/v1.0/stats/tag/";
	var tag = "Harry+Potter";
	var params = {};
	$.getJSON(tagAPI.url+tag, params, function(result, status, object){
		console.log(object);
		$("#json-field").val(object.responseText);
	} );
	return false;
});
