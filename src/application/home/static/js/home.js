$(".variant").hide();
$(".variant.selected").show();

function commaConcat(obj) {
	var string = "";
	$.each(obj, function(index, value){
		string += index + ", " + value + "\n";
	});	
	return string;
}
  
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

var resultField = $("#result-field");
resultField.val("");

$("#result-field").click(function(){
	this.focus();
	this.select();
});

$("#searchform, #searchform-homepage").submit(function(e){
	e.preventDefault();
	searchform = $(this);
	searchform.find(".form-info").remove();
	var button = searchform.find("#search-btn");
	var buttonContent = button.html();
	button.html($("#spinner").clone().show());
	var tagAPI = {};
	tagAPI.url = "/api/v1.0/stats";
	var tag = $("#search-string").val();
	var params = {};
	$.ajax({
		url:tagAPI.url,
		data:{
			tag_id:tag,
		},
		success: function(result, status, object){
			$(".api-results").show('fast');
			console.log(result);
			if ("searchform-homepage" == searchform.attr("id")) {
				var csv = '';
				csv += "total number of works in tag, "+result.numworks+"\n";
				$.each(result.stats, function(index,data) {
					csv += "\n";
					csv += index + ", number of works\n";
					csv += commaConcat(result.stats[index]);
				});			
				
				$("#result-field").val(csv);
				
			} else {
				$("#result-field").val(object.responseText);
			}			 
		},
		error: function(object,exception) {
			$("#result-field").val("");
			if (object.status === 0) {
				//connection error				
			} else if (object.status == 404 || object.status == 400) {
				//not found
				searchform.append('<p class="form-info">This tag wasn\'t found on AO3.</p>');				
			} else if (object.status == 501) {
				//redirection
				searchform.append('<p class="form-info">Looks like this is a non-canonical tag! Unfortunately, our API can\'t follow redirects yet. Try <a href="http://archiveofourown.org/tags/search?utf8=%E2%9C%93&query[name]='+tag+'&query[type]=">looking up the canonical tag on AO3</a>.</p>');								
			} else if (object.status == 500 || exception === 'parsererror' || exception === 'timeout' || exception === 'abort'){
				//internal error
				button.html($("#button-error").clone().show());
				searchform.append('<p class="form-info">An error occured.<a href="'+window.location.href+'">Refresh page to try again.</a></p>');
			} else {
				//something else
				//echo object.responseText
			}
		},
		complete:function(object,status) {
			console.log(object);
			button.html(buttonContent); //loader back to text
		}
	});
	
});

$("#search-btn").click(function(e){
	e.preventDefault();
	$(this).closest(".searchform").submit();
	return false;
});

var addresses = $("span.c-addr");

//function that formats email addresses, so they're not in full form in the static text and are (reasonably) protected from spam scrapers.
$.each(addresses, function(elem) {
	var addressPlaceholderElem = $(this);
	var address = addressPlaceholderElem.text().replace("-a-","@").replace("-d-",".");
	var addressLinkElem = $('<a href="mailto:'+address+'">'+address+'</a>');
	addressPlaceholderElem.replaceWith(addressLinkElem);
});