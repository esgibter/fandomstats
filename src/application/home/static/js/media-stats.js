$("button.js-call-api").click(function(e){
	var jsExample = $(this).closest('.js-api-examples__call');
	var apiLink = jsExample.find('a').first();
	var url = apiLink.attr('href');
	var resultField = jsExample.closest('.js-api-examples').find('.js-api-examples__result-field');
	resultField.val("please wait, this might take several seconds...");

	$.ajax({
		url:url,
		success: function(result, status, object){
			console.log(result);
			resultField.val(object.responseText);
		},
		error: function(object,exception) {
			resultField.val("An error ocurred.");
		}
	});
});

$(".searchform").submit(function(e){
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
			$("#result-field").val(object.responseText);
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
