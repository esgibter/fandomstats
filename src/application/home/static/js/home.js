$(".variant").hide();
$(".variant.selected").show();

g = {}; //graphs namespace (this seems like a good idea? I dunno. *shrugs*)

function graphMe() {
	var data = [{year: 2006, books: 54},
    	{year: 2007, books: 43},
    	{year: 2008, books: 41},
    	{year: 2009, books: 44},
    	{year: 2010, books: 35}];
    var barWidth = 40;
    var width = (barWidth +10) * data.length;
    var height = 200;
    
    var x = d3.scale.linear().domain([0,data.length]).range([0,width]); 
    var y = d3.scale.linear().domain([0,d3.max(data,function(datum) {return datum.books;})]).rangeRound([0,height]);
    
    var barDemo = d3.select("#testdiv")
    	.append("svg:svg")
    	.attr("width",width)
    	.attr("height",height);
    
    barDemo.selectAll("rect")
    	.data(data)
    	.enter()
    	.append("svg:rect")
    	.attr("x",function(datum,index) {return x(index);})
    	.attr("y",function(datum) {return height - y(datum.books);})
    	.attr("height",function(datum) {return y(datum.books);})
    	.attr("width",barWidth)
    	.attr("fill","#aa0000");
    
    
    all = {
	    "numworks": 4026,
	    "stats": {
	        "fandom": {
	            "Iron Man (Movies)": 371,
	            "The Avengers (Marvel Movies)": 2904,
	            "Marvel Cinematic Universe": 1820,
	            "Thor (Movies)": 440,
	            "Captain America (Movies)": 957,
	            "The Avengers - Ambiguous Fandom": 168,
	            "The Avengers (Marvel) - All Media Types": 463,
	            "Marvel": 237,
	            "Agents of S.H.I.E.L.D. (TV)": 494,
	            "Marvel (Movies)": 391
	        },
	        "freeform": {
	            "Established Relationship": 89,
	            "Alternate Universe - Canon Divergence": 133,
	            "Alternate Universe": 403,
	            "Romance": 213,
	            "Post-Captain America: The Winter Soldier": 119,
	            "Humor": 234,
	            "Friendship": 245,
	            "Angst": 427,
	            "Fluff": 323,
	            "Hurt/Comfort": 237
	        },
	        "character": {
	            "Pepper Potts": 1373,
	            "Nick Fury": 2140,
	            "Phil Coulson": 2087,
	            "Maria Hill": 4026,
	            "Bruce Banner": 1808,
	            "Clint Barton": 2711,
	            "Thor (Marvel)": 1273,
	            "Tony Stark": 2326,
	            "Steve Rogers": 2602,
	            "Natasha Romanov": 2779
	        },
	        "rating": {
	            "Teen And Up Audiences": 1654,
	            "General Audiences": 902,
	            "Explicit": 444,
	            "Mature": 726,
	            "Not Rated": 300
	        },
	        "relationship": {
	            "Maria Hill/Steve Rogers": 320,
	            "Jane Foster/Thor": 386,
	            "Clint Barton/Natasha Romanov": 683,
	            "James &quot;Bucky&quot; Barnes/Steve Rogers": 378,
	            "Maria Hill/Natasha Romanov": 257,
	            "James &quot;Bucky&quot; Barnes/Natasha Romanov": 58,
	            "Pepper Potts/Tony Stark": 591,
	            "Clint Barton/Phil Coulson": 602,
	            "Steve Rogers/Tony Stark": 360,
	            "Clint Barton & Natasha Romanov": 153
	        },
	        "category": {
	            "F/F": 516,
	            "Multi": 423,
	            "Other": 90,
	            "F/M": 1803,
	            "M/M": 1437,
	            "Gen": 1252
	        },
	        "warning": {
	            "Creator Chose Not To Use Archive Warnings": 1434,
	            "Graphic Depictions Of Violence": 421,
	            "Rape/Non-Con": 101,
	            "Major Character Death": 177,
	            "Underage": 59,
	            "No Archive Warnings Apply": 2287
	        }
	    }
	};
    
    cats = all.stats.category;
    
    function parseResult(raw) {
    	clean = {};
    	$.each(raw.stats,function(parameter,results) {
    		clean[parameter] = $.map(results,function(amount,index){
    			return {"value":index,"works":amount};
    		});
    	});
    	return clean;
    }
    
    these = parseResult(all);
    console.log(these);
    
    dataCats = these.warning;
    console.log(dataCats);
    
    var bar = 40;
    var svgWidth = (bar + 10) * dataCats.length;
    var svgHeight = 300;
    
    var x1 = d3.scale.linear().domain([0,dataCats.length]).range([0,svgWidth]); 
    var y1 = d3.scale.linear().domain([0,d3.max(dataCats,function(datum) {return datum.works;})]).rangeRound([0,svgHeight]); 
      
    g.graph1 = d3.select("#graph1")
		.attr("width",svgWidth+20)
    	.attr("height",svgHeight+20);
    
	g.graph1.selectAll("rect")
    	.data(dataCats)
    	.enter()
    	.append("svg:rect")
    	.attr("x",function(datum,index) {return x1(index)+10;})
    	.attr("y",function(datum) {return svgHeight - y1(datum.works) +10;})
    	.attr("height",function(datum) {return y1(datum.works);})
    	.attr("width",bar)
    	.attr("fill","#aa0000");
};

graphMe();
  
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
			$("#graph-area").show('fast');
			$("#json-field").val(object.responseText);
		} else {
			//thow an error (maybe a notification area?)
		}
		
	} );
	return false;
});
