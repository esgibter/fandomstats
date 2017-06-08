var FSTATS = FSTATS || {}; //namespace
FSTATS.version = '1.0.0';
FSTATS.palette = {
	accent:"#CC0000",
	light1: "#F0F0F0",
};
FSTATS.defaultBarHeight = 10;
FSTATS.graphInstances = {};
	
FSTATS.redrawGraphs = function() {
	console.log("resizing");
	if (FSTATS.graphInstances !== null) {
		$.each(FSTATS.graphInstances,function() {
			console.log(this);
			if (this.redraw !== undefined) {
				this.redraw();
			}
		});	
	}	
	//https://www.safaribooksonline.com/blog/2014/02/17/building-responsible-visualizations-d3-js/
};


/*~~~~ notes ~~~~
 * 
 * Would it be worth it to rewrite this as pure D3.js? 
 * 
 */


//######## RUN ##########//





//######### HOOKS #########//



//maybe this should be triggered when the DIVS are resized, not the whole window? That way it'd fix the problem with still-being-constructed divs.
$(window).resize(debounce(FSTATS.redrawGraphs,250));



$(document).ready(function(){
	/*
	$.getJSON("/home/static/js/dummy.json", function(result) {
		console.log(result);
	});
	*/
	$("#search-string").val("fluff");
	$(".searchform").submit();	
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
			//TODO CHANGE COLORS TO SOMETHING SANE, FOR SHIT'S SAKE!!!
			$(".api-results").show('fast');
			console.log(result);
			//number of works (big number)
			//ratings (piechart)
			//warnings (percent bar)
			//the rest (bar charts)
			
			var graphs = $("#main-graphs");
			graphs.css("visibility","visible"); //TODO do something with this, it's leaving a huge gap where the 'hidden' divs are, this should be using display:none (but that messes up the graph plotting).
			
			console.log(FSTATS.graphInstances);
			
			if (FSTATS.graphInstances['sumOfWorks'] !== undefined) {
				FSTATS.graphInstances['sumOfWorks'].setNumber(result.numworks);
			} else {
				FSTATS.graphInstances['sumOfWorks'] = new FSTATS.Number({
					number:result.numworks,
					color: '#3ec9ef',
					commentBefore:'There are',
					commentAfter:'works using the tag <em>' + tag + '</em> on AO3.',
					container:$("#num-sum"),
				});
				FSTATS.graphInstances['sumOfWorks'].plot();
			};
			
			
			if (FSTATS.graphInstances['categoryGraph'] !== undefined) {
				FSTATS.graphInstances['categoryGraph'].setData({
						values:result.stats.category,
						sum:result.numworks,
						color: '#3ec9ef',
						textColor:"#3eb7d8",
					});	
			} else {
				FSTATS.graphInstances['categoryGraph'] = new FSTATS.PercentBarGraph({
					container: $('#graph-category'),
					data:{
						values:result.stats.category,
						sum:result.numworks,
						color: '#3ec9ef',
						textColor:"#3eb7d8",
					},
					ratio:3/9,
				});
				
				FSTATS.graphInstances['categoryGraph'].plot();
			}
			FSTATS.graphInstances['categoryGraph'].redraw();
			
			//TODO this draws wrong - the first two columns are too high. BUT after resizing, it's okay. Maybe a problem with the height calculation?
			//Or resizing? Maybe: set a "drawing" param, and don't let the graph resize while it's drawing.
			if (FSTATS.graphInstances['warningGraph'] !== undefined) {
				FSTATS.graphInstances['warningGraph'].setData({
					values:result.stats.warning,
					sum:result.numworks,
					color: '#3ec9ef',
					textColor:"#3eb7d8",
				});	
			} else {
				FSTATS.graphInstances['warningGraph'] = new FSTATS.PercentBarGraph({
					container:$("#graph-warning"),
					data: {
						values:result.stats.warning,
						sum:result.numworks,
						color: '#3ec9ef',
						textColor:"#3eb7d8",
					},
					ratio:4/9,
				});
				FSTATS.graphInstances['warningGraph'].plot();
			}
			FSTATS.graphInstances['warningGraph'].redraw();
			
			
			//var graphs = $("#main-graphs");
			//graphs.css("visibility","visible");
			//plotCategories(result.stats.category,result.numworks);
			$('<div id="api-export" class="large-12 column"><label>results as CSV:</label><textarea placeholder="" id="result-field" readonly="readonly"></textarea></div>').appendTo(graphs);
			FSTATS.renderCsv(result);
			
			$('<div id="api-export" class="large-12 column"><label>results as CSV:</label><textarea placeholder="" id="result-field" readonly="readonly"></textarea></div>').appendTo(graphs);
			$('<div id="learnmore" class="small-12 columns">No pretty graphs yet, but we\'re working on it! In the meantime, you can learn more about <a href="ao3-tag-stats#future">our aims for the website.</a></div>').appendTo(graphs);
			FSTATS.renderCsv(result);
										 
		},
		error: function(object,exception) {
			console.log(object);
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
			button.html(buttonContent); //loader back to text
		}
	});
	
});


//################ OOP hell #################//





FSTATS.renderCsv = function(result) {
	var csv = '';
	csv += "total number of works in tag, "+result.numworks+"\n";
	$.each(result.stats, function(index,data) {
		csv += "\n";
		csv += index + ", number of works\n";
		csv += commaConcat(result.stats[index]);
	});			
	
	$("#result-field").val(csv);	
};

FSTATS.Number = function(settings) {
	console.log("creating a number.");
	console.log(settings);
	var self = this;
	this.number = settings.number;
	this.commentBefore = settings.commentBefore;
	this.commentAfter = settings.commentAfter;
	this.container = settings.container;
	this.color = settings.color;
	
	this.plot = function() {
		var div = $('<div class="number" style="color:'+self.color+'"></div>');
		div.append('<div class="comment">'+self.commentBefore+'</div>');
		div.append('<div class="value">'+d3.format(",")(self.number)+'</div>');
		div.append('<div class="comment">'+self.commentAfter+'</div>');
		div.appendTo(self.container);
	};
	
	this.setNumber = function(newNumber) {
		self.container.find('.value').html(d3.format(",")(newNumber));
	};
};

//TODO checks for required settings!
FSTATS.Graph = function(settings) {
	this.data = settings.data;
	
	this.setData = settings.setData;
	/**
	 * Margins. Shared between all graphs for consistency sake.
	 */
	this.margin = {
		top:50,
		left:50,
		right:50,
		bottom:50,
	};
	
	/**
	 * Method that redraws the graph.
	 */
	this.redraw = settings.redraw;
	
	/**
	 * Method that plots the graph.
	 */
	this.plot = settings.plot;	
	
	/**
	 * Div that contains the graph. (JQuery object) 
	 */
	this.container = settings.container;
	
	/**
	 * A decimal number. (I personally write them as fractions when setting them, it's easier to read IMO.)
	 */
	this.ratio = settings.ratio;
	
	this.width = this.container.width() - this.margin.left - this.margin.right;
	//console.log(this.data.values.keys().length);
	//this.height = (FSTATS.defaultBarHeight + 4)*this.data.values.length + this.margin.top + this.margin.bottom;
	
	this.height = this.width*this.ratio - this.margin.top - this.margin.bottom;
	console.log("height: "+this.height);
};



//TODO make this a general "grey percentage bars" class
FSTATS.PercentBarGraph = function(settings) {
	var self = this;
	this.parent = FSTATS.Graph;
	this.parent.call(this,settings); //calls parent constructor
	
	
	this.setData = function(newData) {
		self.values = newData.values;
		self.sum = newData.sum;
		self.dataset = [];
		self.longest = 0;
		
		for (key in self.values) {
			var number = self.values[key];
		    var percent = number/self.sum;
		    
		    if (key.length > self.longest) {
		    	self.longest = key.length;
		    }    
		    
			item = {
					y:key,
					x:number,
					percent:percent
				};
			
			self.dataset.push(item);
		};
	};
	
	this.setData(this.data);
	
	var em = parseFloat(getComputedStyle(document.body).fontSize);
	this.margin.left = self.longest * em * 0.9;
	
	if (self.longest > 5) {
		this.margin.left = this.margin.left * 0.5; 
	} else {
		this.margin.left = this.margin.left * 0.7;
	}
	 //Most characters are actually narrower than em, so this somehow fixes that.
	
	//set left margin according to the number of characters in the label
	
	
	this.labelFontSize = 0.9;
	this.percentsFontSize = 0.8;
	
	this.redraw = function() {
		//console.log("redrawing graph!");
		//get new size of container
		self.width = self.container.width() - self.margin.left - self.margin.right;
		
		self.height = self.width*self.ratio - self.margin.top - self.margin.bottom;
		
		
		self.svg.attr("width",self.width + self.margin.left + self.margin.right)
				.attr("height",self.height + self.margin.top + self.margin.bottom);
		
		self.xScale.range([0,self.width]);
		self.yScale.rangeRound([0,self.height]);
		
		
		
		self.graph.select(".y.axis")
					.transition()
						.duration(300)
						.attr("transform","translate(0,0)")
						.call(self.yAxis);
		
		self.slots.selectAll("rect")
					.transition()
					.duration(300)
						.attr("y", function(d) {
							return self.yScale(d.y);
						})
						.attr("height", self.yScale.bandwidth())
						.attr("width", function(d) {
							return self.xScale(self.data.sum);
						});
						
		self.bars.selectAll("rect")
					.transition() //resize heights (simultaneously with the slots)
						.duration(300) 
						.attr("y", function(d) {
							return self.yScale(d.y);
						})
						.attr("height", self.yScale.bandwidth())
					.transition() //resize widths (slower)
						.duration(1000)
						.delay(function(d, i) { return i * 100; })
						.attr("width", function(d){
							//console.log("=========");
							//console.log(d);
							return self.xScale(d.x);
						});
					
		self.percents.selectAll("text")
					.transition()
						.duration(300)
						.attr("x",function (d) {
							return self.width + 5;
						})
						.attr("y",function(d) {
							return self.yScale(d.y) + self.yScale.bandwidth()/2;
						})
						.attr("height",self.yScale.bandwidth());
						
				
		//.attr("font-size", "0.8em");
		//change font size?
		
		self.ficCounts.selectAll("text")
					.transition()
						.duration(1000)
						.attr("x",function (d) {
							var left = self.xScale(d.x);
							if (left < (self.width - 20)) {
								return self.xScale(d.x) + 5;
							} else {
								return self.xScale(d.x) - 5;
							}					
						})
						.attr("y",function(d) {
							return self.yScale(d.y) + self.yScale.bandwidth()/2;
						})
						.attr("height",self.yScale.bandwidth())
						.attr("fill", function(d) {
							var left = self.xScale(d.x);
							if (left < (self.width - 20)) {
								return self.data.textColor;
							} else {
								return "#fff";
							}
						})
						.attr("text-anchor",function(d) {
							var left = self.xScale(d.x);
							if (left < (self.width - 20)) {
								return "start";
							} else {
								return "end";
							}
						});
							 			
		
		
		//should I edit things for cases where the width is too small?
		
		//redraw data (animate)
	};
	
	this.plot = function() {
		
		self.svg = d3.select(self.container[0]) //self.container is a JQuery object, this is how we get the DOM element out of it. TODO Maybe do it the other way round and pass a DOM element?
				.append("svg")
				.attr("class","has-graph")
				.attr("width",self.width + self.margin.left + self.margin.right)
				.attr("height",self.height + self.margin.top + self.margin.bottom);
		self.graph = self.svg.append("g")
					.attr("transform","translate(" + self.margin.left + ", "+ self.margin.top +")");	
		
		// =================== defining scales and axes
		
		self.xScale = d3.scaleLinear()
				.domain([0,self.data.sum])
				.range([0,self.width]);
				
		self.xAxis = d3.axisBottom(self.xScale);
					
		
		self.yScale = d3.scaleBand()
					.domain(self.dataset.map(function(d) {return d.y;}))
					.rangeRound([0,self.height]) //I'm not "flipping" the axis here, because I want the bars to start at top
					.padding(0.05);
					
					
		self.yAxis = d3.axisLeft(self.yScale);
		
		//================= drawing axes
		
		
		self.graph.append("g")
					.attr("class","y axis")
					.attr("transform","translate(0,0)")
					.call(self.yAxis)
					.attr("font-size",self.labelFontSize + 'em')
					.attr("fill","#333");
					
		
		self.graph.selectAll("g.x .tick text")
					.attr("transform","translate(0,10)");
					
		//================= plotting the values
	
		//TODO decide what needs to be a param and what can stay a variable???
		self.slots = self.graph.append("g")
					.attr("class","slots")
					.style("fill",FSTATS.palette.light1);
					
		slotRects = self.slots.selectAll("rect")
					.data(self.dataset)
					.enter()
					.append("rect")
					.attr("x", function(d) {
						return self.xScale(0);
					})
					.attr("y", function(d) {
						//console.log("=========");
						//console.log(d);
						//console.log(self.yScale(d.y));
						return self.yScale(d.y);
					})
					.attr("height", self.yScale.bandwidth())
					.attr("width", function(d) {
						return self.xScale(self.data.sum);
					})
					.attr("fill","#f0f0f0"); //TODO ??????
		
		self.bars = self.graph.append("g")
					.attr("class","bars")
					.style("fill",self.data.color)
					.attr("width",self.width)
					.attr("height",self.height)
					.attr("transform","translate(0,0)");
		
		//TODO: the first rect in WarningGraph is drawn too high and partially covers the next rect. this gets fixed when redrawing.
		var rect = self.bars.selectAll("rect")
					.data(self.dataset)
					.enter()
					.append("rect")
						.attr("x", function(d) {
							return self.xScale(0);
						})
						.attr("y", function(d) {
							return self.yScale(d.y);
						})
						.attr("height", self.yScale.bandwidth())
						.attr("width", function(d) {
							return 0;						
						})
						.attr("fill",self.data.color)
					.transition()
						.delay(function(d, i) { return i * 100; })
						.duration(1000)
						.attr("width", function(d){
							//console.log("=========");
							//console.log(d);
							return self.xScale(d.x);
						})
					;
					
				
		self.percents = self.graph.append("g")
					.attr("class","percents");
		
		var percentLabels = self.percents.selectAll("text")
					.data(self.dataset)
					.enter()
					.append("text")
					.attr("x",function (d) {
						return self.width + 5;
					})
					.attr("y",function(d) {
						return self.yScale(d.y) + self.yScale.bandwidth()/2;
					})
					.attr("dy","0.35em")
					.attr("height",self.yScale.bandwidth())
					.text(function(d) {
						return d3.format(">.0%")(d.percent);					
					})
					.attr("font-size", self.percentsFontSize + 'em')
					.attr("fill","#999");
		
		self.ficCounts = self.graph.append("g")
					.attr("class","fic-counts");
		
		var countLabels = self.ficCounts.selectAll("text")
					.data(self.dataset)
					.enter()
					.append("text")
					.attr("x",function (d) {
						var left = self.xScale(d.x);
						if (left < (self.width - 20)) {
							return self.xScale(d.x) + 5;
						} else {
							return self.xScale(d.x) - 5;
						}					
					})
					.attr("y",function(d) {
						return self.yScale(d.y) + self.yScale.bandwidth()/2;
					})
					.attr("dy","0.35em")
					.attr("font-size",self.labelFontSize + 'em')
					.attr("height",self.yScale.bandwidth())
					.text(function(d) {
						return d3.format(",")(d.x);
					})
					.attr("fill", function(d) {
						var left = self.xScale(d.x);
						if (left < (self.width - 20)) {
							return self.data.textColor;
						} else {
							return "#fff";
						}
					})
					.attr("text-anchor",function(d) {
						var left = self.xScale(d.x);
						if (left < (self.width - 20)) {
							return "start";
						} else {
							return "end";
						}
					});	
	};
	//additional constructor shit	
};

FSTATS.PercentBarGraph.prototype = Object.create(FSTATS.Graph.prototype); //inheritance
FSTATS.PercentBarGraph.prototype.constructor = FSTATS.PercentGraph; //sets the constructor to the right function



function numWorks() {
	//TODO: big number of works (potentially: get all works on AO3 from the logged-out screen -- relevant github issue https://github.com/esgibter/fandomstats/issues/40)
}





//--------------- UTILITIES --------------------//

function commaConcat(obj) {
	var string = "";
	$.each(obj, function(index, value){
		string += index + ", " + value + "\n";
	});	
	return string;
}

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};
//thx to David Walsh (https://davidwalsh.name/javascript-debounce-function), for not making me write my own debounce fn!


