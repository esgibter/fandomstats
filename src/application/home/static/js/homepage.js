function commaConcat(obj) {
	var string = "";
	$.each(obj, function(index, value){
		string += index + ", " + value + "\n";
	});	
	return string;
}

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
			//number of works (big number)
			//ratings (piechart)
			plotCategories(result.stats.category,result.numworks);
			//warnings (percent bar)
			
			//the rest (bar charts)
			renderCsv(result);			 
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


function renderCsv(result) {
	var csv = '';
	csv += "total number of works in tag, "+result.numworks+"\n";
	$.each(result.stats, function(index,data) {
		csv += "\n";
		csv += index + ", number of works\n";
		csv += commaConcat(result.stats[index]);
	});			
	
	$("#result-field").val(csv);	
}

// ----------- TESTING -------------------

$(document).ready(function(){
	//$("#search-string").val("fluff");
	//$(".searchform").submit();
	var cats = { "Gen": 33453, "Other": 5355, "Multi": 13294, "F/F": 23684, "M/M": 208583, "F/M": 82023 };
	var sum = 324267;
	$(".api-results").show();
	plotCategories(cats,sum);	
});


//----------------------- D3 JS HELL ---------------------

var margin = {
		top:50,
		left:50,
		right:50,
		bottom:50,
};

//TODO: make dynamic
var width = 600 - margin.left - margin.right;
var height = 300 - margin.top - margin.bottom;

//TODO: function resize()


function plotCategories(category,sum) {
	
	var dataset = [];
	
	for (key in category) {
		var number = category[key];
        var percent = number/sum;
            
		item = {
			y:key,
			x:number,
			percent:percent
		};
		
		dataset.push(item);
	}
	
	var palette = {
		accent:"#CC0000",
		light1: "#F0F0F0",
	};
		
	//var div = $(".api-results").append('<div id="graph-category"></div>');
	
	var svg = d3.select("#graph-category")
				.append("svg")
				.attr("width",width + margin.left + margin.right)
				.attr("height",height + margin.top + margin.bottom)
				.append("g")
					.attr("transform","translate(" + margin.left + ", "+ margin.top +")");	
	
	// =================== defining scales and axes
	
	var xScale = d3.scaleLinear()
				.domain([0,sum])
				.range([0,width]);
				
	var xAxis = d3.axisBottom(xScale);
				
	
	var yScale = d3.scaleBand()
				.domain(dataset.map(function(d) {return d.y;}))
				.rangeRound([height,0])
				.padding(0.05);
				
				
	var yAxis = d3.axisLeft(yScale);				
				
	//================= drawing axes
	
	
	svg.append("g")
				.attr("class","y axis")
				.attr("transform","translate(0,0)")
				.call(yAxis)
				.attr("font-size","1em")
				.attr("fill","#333");
				
	
	svg.selectAll("g.x .tick text")
				.attr("transform","translate(0,10)");
	
	//================= plotting the values
	
	var slots = svg.append("g")
				.attr("class","slots")
				.style("fill",palette.light1);
				
	var slotRects = slots.selectAll("rect")
				.data(dataset)
				.enter()
				.append("rect")
				.attr("x", function(d) {
					return xScale(0);
				})
				.attr("y", function(d) {
					console.log("=========");
					console.log(d);
					console.log(yScale(d.y));
					return yScale(d.y);
				})
				.attr("height", yScale.bandwidth())
				.attr("width", function(d) {
					return xScale(sum);
				})
				.attr("fill","#f0f0f0");
	
	var bars = svg.append("g")
				.attr("class","bars")
				.style("fill",palette.accent)
				.attr("width",width)
				.attr("height",height)
				.attr("transform","translate(0,0)");
	
	var rect = bars.selectAll("rect")
				.data(dataset)
				.enter()
				.append("rect")
				.attr("x", function(d) {
					return xScale(0);
				})
				.attr("y", function(d) {
					return yScale(d.y);
				})
				.attr("height", yScale.bandwidth())
				.attr("width", function(d) {
					//console.log("=========");
					//console.log(d);
					return xScale(d.x);
				})
				.attr("fill","#cc0000");
			
	var percents = svg.append("g")
				.attr("class","percents");
	
	var percentLabels = percents.selectAll("text")
				.data(dataset)
				.enter()
				.append("text")
				.attr("x",function (d) {
					return width + 5;
				})
				.attr("y",function(d) {
					return yScale(d.y) + yScale.bandwidth()/2;
				})
				.attr("dy","0.35em")
				.attr("height",yScale.bandwidth())
				.text(function(d) {
					var perc = d.percent * 100;
					
					return Math.round(perc) + "%";
				})
				.attr("font-size", "0.8em")
				.attr("fill","#999");
	
	var ficCounts = svg.append("g")
				.attr("class","fic-counts");
	
	var countLabels = ficCounts.selectAll("text")
				.data(dataset)
				.enter()
				.append("text")
				.attr("x",function (d) {
					var left = xScale(d.x);
					if (left < (width - 20)) {
						return xScale(d.x) + 5;
					} else {
						return xScale(d.x) - 5;
					}					
				})
				.attr("y",function(d) {
					return yScale(d.y) + yScale.bandwidth()/2;
				})
				.attr("dy","0.35em")
				.attr("height",yScale.bandwidth())
				.text(function(d) {
					return d.x;
				})
				.attr("fill", function(d) {
					var left = xScale(d.x);
					if (left < (width - 20)) {
						return "#cc0000";
					} else {
						return "#fff";
					}
				})
				.attr("text-anchor",function(d) {
					var left = xScale(d.x);
					if (left < (width - 20)) {
						return "start";
					} else {
						return "end";
					}
				});	
}

