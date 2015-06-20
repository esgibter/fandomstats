$(".variant").hide();
$(".variant.selected").show();

g = {}; //graphs namespace (this seems like a good idea? I dunno. *shrugs*)

function parseResult(raw) {
	clean = {};
	$.each(raw.stats,function(parameter,results) {
		clean[parameter] = $.map(results,function(amount,index){
			return {"value":index,"works":amount};
		});
	});
	return clean;
}

function graphMe(all) {
    these = parseResult(all);
    
    dataCats = these.category;
    
    var bar = 40;
    var margin = {top:20,right:20,bottom:20, left:20};
    var labelSpace = 60;
    var bottomSpace = 30;
    var graphWidth = (bar + 10) * dataCats.length;
    var graphHeight = 300;
    var svgWidth = graphWidth + margin.left + margin.right;
    var svgHeight = graphHeight + margin.top +margin.bottom + labelSpace + bottomSpace;
    
    var x = d3.scale.linear().domain([0,dataCats.length]).range([0,graphWidth]); 
    var y = d3.scale.linear().domain([0,d3.max(dataCats,function(datum) {return datum.works;})]).rangeRound([0,graphHeight]); 
      
    g.graph1 = d3.select("#graph1")
		.attr("width",svgWidth)
    	.attr("height",svgHeight);
    	
    g.graph1.selectAll("*").remove();
    
	g.graph1.selectAll("rect")
    	.data(dataCats)
    	.enter()
    	.append("svg:rect")
    	.attr("x",function(datum,index) {return x(index) + margin.left;})
    	.attr("y",function(datum) {return svgHeight - y(datum.works) - margin.top - bottomSpace;})
    	.attr("height",function(datum) {return y(datum.works);})
    	.attr("width",bar)
    	.attr("fill","#aa0000");
    	
    g.graph1.selectAll("text")
    	.data(dataCats)
    	.enter()
    	.append("svg:text")
    	.attr("x",function(datum,index) {return x(index) + bar + margin.left; })
    	.attr("y",function(datum) {return svgHeight - y(datum.works) - margin.top - 30  - bottomSpace;})
    	.attr("dx", -bar/2)
    	.attr("dy","1.2em")
    	.attr("text-anchor","middle")
    	.text(function(datum) {return datum.works;})
    	.attr("fill","#333");
    
    g.graph1.selectAll("text.yAxis")
    	.data(dataCats)
    	.enter()
    	.append("svg:text")
    	.attr("x", function(datum, index) { return x(index) + bar - margin.left; })
    	.attr("y",graphHeight + labelSpace + margin.top)
    	.attr("dx",bar/2)
    	.attr("text-anchor","middle")
    	.attr("style", "font-size: 12; font-family: Helvetica, sans-serif")
    	.text(function(datum) {return datum.value;})
    	.attr("transform","translate(0,18)")
    	.attr("class","yAxis");	
    	
    g.graph1.append("svg:text")
    	.attr("x",margin.left)
    	.attr("y",margin.top)
    	.attr("text-anchor".top)
    	.attr("transform","translate(0,18)")
    	.text("Categories");
};

these = {
    "numworks": 4026,
    "stats": {
        "relationship": {
            "James &quot;Bucky&quot; Barnes/Steve Rogers": 378,
            "Maria Hill/Steve Rogers": 320,
            "Steve Rogers/Tony Stark": 360,
            "James &quot;Bucky&quot; Barnes/Natasha Romanov": 58,
            "Jane Foster/Thor": 386,
            "Clint Barton & Natasha Romanov": 153,
            "Clint Barton/Natasha Romanov": 683,
            "Clint Barton/Phil Coulson": 602,
            "Pepper Potts/Tony Stark": 591,
            "Maria Hill/Natasha Romanov": 257
        },
        "category": {
            "Multi": 423,
            "Gen": 1252,
            "F/F": 516,
            "Other": 90,
            "F/M": 1803,
            "M/M": 1437
        },
        "rating": {
            "Mature": 726,
            "Not Rated": 300,
            "General Audiences": 902,
            "Explicit": 444,
            "Teen And Up Audiences": 1654
        },
        "fandom": {
            "Marvel Cinematic Universe": 1820,
            "Marvel": 237,
            "Marvel (Movies)": 391,
            "The Avengers (Marvel) - All Media Types": 463,
            "Agents of S.H.I.E.L.D. (TV)": 494,
            "The Avengers (Marvel Movies)": 2904,
            "Thor (Movies)": 440,
            "Captain America (Movies)": 957,
            "Iron Man (Movies)": 371,
            "The Avengers - Ambiguous Fandom": 168
        },
        "warning": {
            "Creator Chose Not To Use Archive Warnings": 1434,
            "Underage": 59,
            "Graphic Depictions Of Violence": 421,
            "Rape/Non-Con": 101,
            "Major Character Death": 177,
            "No Archive Warnings Apply": 2287
        },
        "character": {
            "Natasha Romanov": 2779,
            "Pepper Potts": 1373,
            "Maria Hill": 4026,
            "Thor (Marvel)": 1273,
            "Phil Coulson": 2087,
            "Bruce Banner": 1808,
            "Steve Rogers": 2602,
            "Nick Fury": 2140,
            "Tony Stark": 2326,
            "Clint Barton": 2711
        },
        "freeform": {
            "Alternate Universe - Canon Divergence": 133,
            "Hurt/Comfort": 237,
            "Alternate Universe": 403,
            "Fluff": 323,
            "Post-Captain America: The Winter Soldier": 119,
            "Angst": 427,
            "Romance": 213,
            "Friendship": 245,
            "Humor": 234,
            "Established Relationship": 89
        }
    }
};

//graphMe(these);
$("#graph-area").hide();
  
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
	var button = $(this);
	var buttonContent = button.html();
	button.html($(".spinner").clone().show());
	var tagAPI = {};
	tagAPI.url = "/api/v1.0/stats/tag/";
	var tag = $("#search-string").val();
	var params = {};
	$.getJSON(tagAPI.url+tag, params, function(result, status, object){
		console.log("status: "+status);
		button.html(buttonContent); //loader back to text	
		if (status=="success") {
			$("#graph-area").show('fast',graphMe(result));
			$("#json-field").val(object.responseText);
		} else {
			//thow an error (maybe a notification area?)
		}
		
	} );
	return false;
});
