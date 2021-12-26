var resultField = $("#result-field");
resultField.val("");

$("#result-field").click(function(){
	this.focus();
	this.select();
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

fixedEncodeURIComponent = function (str) {
	return encodeURIComponent(str).replace(/%20/g, '+').replace(/[!'()*]/g, function (c) {
		return '%' + c.charCodeAt(0).toString(16);
	});
};

fixedDecodeURIComponent = function (str) {
	return decodeURIComponent(str.replace(/\+/g, '%20'));
}