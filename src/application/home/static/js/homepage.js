var FSTATS = FSTATS || {}; //namespace
FSTATS.version = '1.0.0';
FSTATS.em = parseFloat(getComputedStyle(document.body).fontSize); //this should return font size in pixels...

FSTATS.palette = {
	accent:"#CC0000",
	light1: "#F0F0F0",
	bland:"#B38D87",
};

FSTATS.maxRadius = 150;


FSTATS.fontSizes = {
	'medium label': 0.9,
	'small label': 0.8,
	'large label': 1.5
};

FSTATS.sortFunctions = {
	'key':function(a,b) {
		if (a.y > b.y) {
			return 1;
		} else {
			return -1;
		}
	},
	'value':function(a,b){
		return b.x-a.x;
	}
};

FSTATS.parseTags = function(string,taglist) {
	var newString;
		for (key in taglist) {
			newString = string.replace("{{"+key+"}}",taglist[key]);
		}
		return newString;
	};

FSTATS.fixedEncodeURIComponent = function(str) {
  return encodeURIComponent(str).replace(/%20/g, '+').replace(/[!'()*]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
};

FSTATS.fixedDecodeURIComponent = function(str) {
	return decodeURIComponent(str.replace(/\+/g, '%20'));
}

FSTATS.defaultMargin = {
		top:10,
		left:10,
		right:50,
		bottom:10,
	};

//FSTATS.defaultBarHeight = 10;
FSTATS.minBarHeight = 35;
FSTATS.maxBarHeight = 50;
FSTATS.graphInstances = {};

FSTATS.redrawGraphs = debounce(function(){
	//console.log("resizing");
	if (FSTATS.graphInstances !== null) {
		$.each(FSTATS.graphInstances,function() {
			if (this.redraw !== undefined) {
				this.redraw();
			}
		});
	}
},250);


//maybe this should be triggered when the DIVS are resized, not the whole window? That way it'd fix the problem with still-being-constructed divs.
window.addEventListener('resize', FSTATS.redrawGraphs);


/*//TESTING
$(document).ready(function(){
	$("#search-string").val("Harry Potter");
	$(".searchform").submit();
});
//TESTING*/

//QUERY GET PARAM PARSER
$(document).ready(function(){
	var searchMatch = window.location.search.match(/^\?q=(.+)/i);
	if (searchMatch != null) {
			query = FSTATS.fixedDecodeURIComponent(searchMatch[1]);
			console.log("decoded query: "+query);
			$("#search-string").val(query);
			$(".searchform").submit();
	}
});


//SEARCH LISTENER
$(".searchform").submit(function(e){
	e.preventDefault();
	searchform = $(this);
	searchform.find(".form-info").remove();
	var button = searchform.find("#search-btn");
	var buttonContent = button.html();
	button.html($("#spinner").clone().show());
	var tagAPI = {};
	tagAPI.url = "/api/v1.0/stats";
	var searchString = $("#search-string").val();

	var tags = searchString.split(",");

	main_tag = tags[0];
	other_tags = tags.slice(1);

	/*TEST
	$.ajax({
		url:"/home/static/js/dummy.json",
		success: function(result, status, object){
	EST*/

	///*LIVE
	$.ajax({
		url:tagAPI.url,
		data:{
			tag_id:main_tag,
			other_tag_names:other_tags
		},
		success: function(result, status, object){
			//LIVE*/
			$(".api-results").show('fast');

			var graphs = $("#main-graphs");
			graphs.css("visibility","visible");

			//TODO Remove duplcity - searching container div, checking whether to plot or update

			var searchBookmark = $("#search-bookmark");
			if (0 == searchBookmark.length) {
				searchBookmark = $('<div class="large-12 column graph" id="search-bookmark"></div>');
				graphs.append(searchBookmark);
			}

			if (FSTATS.graphInstances['searchBookmark'] !== undefined) {
				FSTATS.graphInstances['searchBookmark'].update({
					query:searchString,
					container:searchBookmark,
				});
			} else {
				FSTATS.graphInstances['searchBookmark'] = new FSTATS.Bookmark({
					query:searchString,
					container:searchBookmark,
				});
				FSTATS.graphInstances['searchBookmark'].plot();
			};

			//* NUMBER OF FICS
			var numSum = $("#num-sum");
			if (0 == numSum.length) {
				numSum = $('<div class="large-12 column graph" id="num-sum"></div>');
				graphs.append(numSum);
			}

			if (FSTATS.graphInstances['sumOfWorks'] !== undefined) {
				FSTATS.graphInstances['sumOfWorks'].update({
					number:result.numworks,
					color: FSTATS.palette.accent,
					commentBefore:'There are',
					commentAfter:'works tagged <em>{{tags}}</em> on AO3.',
					variables:{
						tags:tags.join(", ")
					},
					container:numSum,
				});
			} else {
				FSTATS.graphInstances['sumOfWorks'] = new FSTATS.Number({
					number:result.numworks,
					color: FSTATS.palette.accent,
					commentBefore:'There are',
					commentAfter:'works tagged <em>{{tags}}</em> on AO3.',
					variables:{
						tags:tags.join(", ")
					},
					container:numSum,
				});
				FSTATS.graphInstances['sumOfWorks'].plot();
			};
			//NUMBER OF FICS*/


			//*RATINGS
			var ratings = $("#graph-ratings");
			if (0 == ratings.length) {
				ratings = $('<div class="large-12 column graph" id="graph-ratings"></div>');
				ratings.append('<h3>Ratings</h3><p>What rating did the author choose for their work (if any).</p>');
				graphs.append(ratings);
			}

			if (FSTATS.graphInstances['ratingsGraph'] !== undefined) {
				FSTATS.graphInstances['ratingsGraph'].setData({
						values:[
							{
								"x":result.stats.rating["General Audiences"],
								"y":'G',
								"description":'General Audiences',
								"color":'#99D012',
							},
							{
								"x":result.stats.rating["Teen And Up Audiences"],
								"y":'T',
								"description":'Teen And Up Audiences',
								"color":'#F1E024',
							},
							{
								"x":result.stats.rating["Mature"],
								"y":'M',
								"description":'Mature',
								"color":'#F39325',
							},
							{
								"x":result.stats.rating["Explicit"],
								"y":'E',
								"description":'Explicit',
								"color":'#AB0606',
							},
							{
								"x":result.stats.rating["Not Rated"],
								"y":'N',
								"description":'Not Rated',
								"color":'#CECECC',
							},
						],
						sum:result.numworks,
					});
				FSTATS.graphInstances['ratingsGraph'].redraw();
			} else {
				FSTATS.graphInstances['ratingsGraph'] = new FSTATS.PieChart({
					container:ratings,
					data: {
						values:[
							{
								"x":result.stats.rating["General Audiences"],
								"y":'G',
								"description":'General Audiences',
								"color":'#99D012',
							},
							{
								"x":result.stats.rating["Teen And Up Audiences"],
								"y":'T',
								"description":'Teen And Up Audiences',
								"color":'#F1E024',
							},
							{
								"x":result.stats.rating["Mature"],
								"y":'M',
								"description":'Mature',
								"color":'#F39325',
							},
							{
								"x":result.stats.rating["Explicit"],
								"y":'E',
								"description":'Explicit',
								"color":'#AB0606',
							},
							{
								"x":result.stats.rating["Not Rated"],
								"y":'N',
								"description":'Not Rated',
								"color":'#CECECC',
							},
						],
						sum:result.numworks,
					},
				});
				FSTATS.graphInstances['ratingsGraph'].plot();
			}
			//RATINGS*/


			///*CATEGORIES
			var categories = $("#graph-category");
			if (0 == categories.length) {
				categories = $('<div class="large-12 column graph" id="graph-category"></div>');
				categories.append('<h3>Categories</h3><p>Types of ships based on the genders of the participants, where F = female, M = male. (The percents are from the total amount of works and do not add up to 100%.)</p>');
				graphs.append(categories);
			}

			if (FSTATS.graphInstances['categoryGraph'] !== undefined) {
				FSTATS.graphInstances['categoryGraph'].setData({
						values:result.stats.category,
						sum:result.numworks,
					});
				FSTATS.graphInstances['categoryGraph'].redraw();
			} else {
				FSTATS.graphInstances['categoryGraph'] = new FSTATS.BarGraph({
					type:'percentage',
					container: categories,
					data:{
						values:result.stats.category,
						sum:result.numworks,
						color: FSTATS.palette.bland,
						textColor:FSTATS.palette.bland,
					},
					ratio:3/9,
				});

				FSTATS.graphInstances['categoryGraph'].plot();
			}
			//CATEGORIES*/

			///*WARNINGS
			var warnings = $("#graph-warning");
			if (0 == warnings.length) {
				warnings = $('<div class="large-12 column graph" id="graph-warning"></div>');
				warnings.append('<h3>Warnings</h3><p>Additional content warnings set by the author. (The percents are from the total amount of works and do not add up to 100%.)</p>');
				graphs.append(warnings);
			}
			if (FSTATS.graphInstances['warningGraph'] !== undefined) {
				FSTATS.graphInstances['warningGraph'].setData({
					values:result.stats.warning,
					sum:result.numworks,
				});
				FSTATS.graphInstances['warningGraph'].redraw();
			} else {
				FSTATS.graphInstances['warningGraph'] = new FSTATS.BarGraph({
					type:'percentage',
					container:warnings,
					data: {
						values:result.stats.warning,
						sum:result.numworks,
						color: FSTATS.palette.bland,
						textColor:FSTATS.palette.bland,
					},
					ratio:4/9,
				});
				FSTATS.graphInstances['warningGraph'].plot();
			}
			//WARNINGS*/

			///*FANDOMS
			var fandoms = $("#graph-fandom");
			if (0 == fandoms.length) {
				fandoms = $('<div class="large-12 column graph" id="graph-fandom"></div>');
				fandoms.append('<h3>Fandoms</h3><p>First 10 most frequently appearing fandoms for this tag.</p>');
				graphs.append(fandoms);
			}

			if (FSTATS.graphInstances['fandomGraph'] !== undefined) {
				FSTATS.graphInstances['fandomGraph'].setData({
					values:result.stats.fandom,
					sum:result.numworks,
				});
				FSTATS.graphInstances['fandomGraph'].redraw();
			} else {
				FSTATS.graphInstances['fandomGraph'] = new FSTATS.BarGraph({
					container:fandoms,
					data: {
						values:result.stats.fandom,
						sum:result.numworks,
						color: FSTATS.palette.bland,
						textColor:FSTATS.palette.bland,
					},
					ratio:5/9,
					sort:'value'
				});
				FSTATS.graphInstances['fandomGraph'].plot();
			}
			//FANDOMS*/

			///*RELATIONSHIPS
			var relationships = $("#graph-relationship");
			if (0 == relationships.length) {
				relationships = $('<div class="large-12 column graph" id="graph-relationship"></div>');
				relationships.append('<h3>Relationships</h3><p>First 10 most frequently appearing ships for this tag, both romantic (designated with a "/") and platonic (using "&").</p>');
				graphs.append(relationships);
			}

			if (FSTATS.graphInstances['relationshipGraph'] !== undefined) {
				FSTATS.graphInstances['relationshipGraph'].setData({
					values:result.stats.relationship,
					sum:result.numworks,
				});
				FSTATS.graphInstances['relationshipGraph'].redraw();
			} else {
				FSTATS.graphInstances['relationshipGraph'] = new FSTATS.BarGraph({
					container:relationships,
					data: {
						values:result.stats.relationship,
						sum:result.numworks,
						color: FSTATS.palette.bland,
						textColor:FSTATS.palette.bland,
					},
					ratio:5/9,
					sort:'value'
				});
				FSTATS.graphInstances['relationshipGraph'].plot();
			}
			//RELATIONSHIPS*/

			///*CHARACTERS
			var characters = $("#graph-character")
			if (0 == characters.length) {
				characters = $('<div class="large-12 column graph" id="graph-character"></div>');
				characters.append('<h3>Characters</h3><p>First 10 most frequently appearing characters for this tag.</p>');
				graphs.append(characters);
			}

			if (FSTATS.graphInstances['characterGraph'] !== undefined) {
				FSTATS.graphInstances['characterGraph'].setData({
					values:result.stats.character,
					sum:result.numworks,
				});
				FSTATS.graphInstances['characterGraph'].redraw();
			} else {
				FSTATS.graphInstances['characterGraph'] = new FSTATS.BarGraph({
					container:characters,
					data: {
						values:result.stats.character,
						sum:result.numworks,
						color: FSTATS.palette.bland,
						textColor:FSTATS.palette.bland,
					},
					ratio:5/9,
					sort:'value'
				});
				FSTATS.graphInstances['characterGraph'].plot();
			}
			//CHARACTERS*/

			///*FREEFORM TAGS
			var freeforms = $("#graph-freeform");
			if (0 == freeforms.length) {
				freeforms = $('<div class="large-12 column graph" id="graph-freeform"></div>');
				freeforms.append('<h3>Freeform tags</h3><p>First 10 most frequently appearing "freeform" tags (i.e. other than fandom, relationship, or character tags).</p>');
				graphs.append(freeforms);
			}

			if (FSTATS.graphInstances['freeformGraph'] !== undefined) {
				FSTATS.graphInstances['freeformGraph'].setData({
					values:result.stats.freeform,
					sum:result.numworks,
				});
				FSTATS.graphInstances['freeformGraph'].redraw();
			} else {
				FSTATS.graphInstances['freeformGraph'] = new FSTATS.BarGraph({
					container:freeforms,
					data: {
						values:result.stats.freeform,
						sum:result.numworks,
						color: FSTATS.palette.bland,
						textColor:FSTATS.palette.bland,
					},
					ratio:5/9,
					sort:'value'
				});
				FSTATS.graphInstances['freeformGraph'].plot();
			}
			//FREEFORM TAGS*/

			var csvField = $("#api-export");
			if (0 == csvField.length) {
				csvField = $('<div id="api-export" class="large-12 column"><label>results as CSV:</label><textarea placeholder="" id="result-field" readonly="readonly"></textarea></div>');
				csvField.appendTo(graphs);
			}

			FSTATS.renderCsv(result,csvField);

		},
		error: function(object,exception) {
			//console.log(object);
			$("#result-field").val("");
			if (object.status === 0) {
				//connection error
			} else if (object.status == 404 || object.status == 400) {
				//not found
				searchform.append('<p class="form-info">This tag wasn\'t found on AO3.</p>');
			} else if (object.status == 501) {
				//redirection
				searchform.append('<p class="form-info">Looks like this is a non-canonical tag! Unfortunately, our API can\'t follow redirects yet. Try <a href="http://archiveofourown.org/tags/search" >looking up the canonical tag on AO3</a>.</p>');
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


FSTATS.renderCsv = function(result,container) {
	var csv = '';
	csv += "total number of works in tag, "+result.numworks+"\n";
	$.each(result.stats, function(index,data) {
		csv += "\n";
		csv += index + ", number of works\n";
		csv += commaConcat(result.stats[index]);
	});

	container.find("#result-field").val(csv);
};

FSTATS.Bookmark = function(settings) {
	var self = this;
	self.container = settings.container;

	self.setBookmark = function(query) {
		console.log("query: "+query);
		self.bookmark = "/?q="+FSTATS.fixedEncodeURIComponent(query);
		console.log("bookmark: " + self.bookmark);
	}

	self.setBookmark(settings.query);

	self.plot = function() {
		var div = $('<div><a class="bookmark" href="'+self.bookmark+'">(permalink)</a></div>');
		div.appendTo(self.container);
	}

	self.update = function(settings) {
		self.setBookmark(settings.query);
		self.container.find(".bookmark").attr("href",self.bookmark);
	}
}

//TODO: get all works on AO3 from the logged-out screen -- relevant github issue https://github.com/esgibter/fandomstats/issues/40
FSTATS.Number = function(settings) {
	var self = this;
	this.number = settings.number;
	if (undefined != settings.variables){
		this.variables = settings.variables;
	} else {
		this.variables = {};
	}

	this.commentBefore = FSTATS.parseTags(settings.commentBefore,this.variables);
	this.commentAfter = FSTATS.parseTags(settings.commentAfter,this.variables);
	this.container = settings.container;
	this.color = settings.color;



	this.plot = function() {
		var div = $('<div class="number" style="color:'+self.color+'"></div>');
		div.append('<div class="comment" id="comment-before">'+self.commentBefore+'</div>');
		div.append('<div class="value">'+d3.format(",")(self.number)+'</div>');
		div.append('<div class="comment" id="comment-after">'+self.commentAfter+'</div>');
		div.appendTo(self.container);
	};

	this.setNumber = function(newNumber) {
		self.container.find('.value').html(d3.format(",")(newNumber));
	};

	this.update = function(settings) {
		//update number
		self.number = settings.number;
		self.container.find('.value').html(d3.format(",")(settings.number));

		//update variables, if changed
		if (undefined != settings.variables) {
			self.variables= settings.variables;
		}

		//update comments, if changed
		if (undefined != settings.commentBefore) {
			self.commentBefore = FSTATS.parseTags(settings.commentBefore,this.variables);
			self.container.find("#comment-before").html(self.commentBefore);
		}
		if (undefined != settings.commentAfter) {
			self.commentAfter = FSTATS.parseTags(settings.commentAfter,this.variables);
			self.container.find("#comment-after").html(self.commentAfter);
		}



	};
};

//TODO checks for required settings!
FSTATS.Graph = function(settings) {
	this.data = settings.data;
	var self = this;

	if (undefined == settings.sort) {
		this.sortFunction = FSTATS.sortFunctions['key'];
	} else {
		this.sortFunction = FSTATS.sortFunctions[settings.sort];
	}


	this.setData = function(newData) {
		self.values = newData.values;
		self.sum = newData.sum;
		self.dataset = [];
		self.longest = 0;
		self.max = 0;

		for (key in self.values) {
			var number = self.values[key];
		    var percent = number/self.sum;

		    //find longest label (needed to size the left margin)
		    if (key.length > self.longest) {
		    	self.longest = key;
		    }

		    //find the largest value (needed for absolute graphs)
		    if (number > self.max) {
		    	self.max = number;
		    }

			item = {
					y:decodeHtml(key),
					x:number,
					percent:percent
				};

			self.dataset.push(item);
		};

		//alphabetize the results. TODO maybe have an option to force a specific order?
		self.dataset.sort(self.sortFunction);
	};

	/**
	 * Margins. Shared between all graphs for consistency sake.
	 */
	this.margin =  JSON.parse(JSON.stringify(FSTATS.defaultMargin)); //hack to clone, not add reference to the original object


	/**
	 * Method that redraws the graph.
	 */
	this.redraw = settings.redraw;

	/**
	 * Method that plots the graph.
	 */
	this.plot = settings.plot;

	/**
	 * Get the width of the widest text in a dataset - used to calculate margins on bar graphs.
	 */
	this.getTextWidth = function(svg, dataset) {
		var maxTextWidth = 0;

		svg.append('g')
		    .selectAll('.dummyText')
		    .data(dataset)
		    .enter()
		    .append("text")
		    .attr("font-size",FSTATS.fontSizes["medium label"] + 'em')
			.text(function(d) { return d.y})
		    .each(function(d,i) {
		        var thisWidth = this.getComputedTextLength();
		        if (thisWidth > maxTextWidth) {
		        	maxTextWidth = thisWidth;
		        }
		        this.remove() // remove them just after displaying them
		    });
		return maxTextWidth;
	}

	/**
	 * Div that contains the graph. (JQuery object)
	 */
	this.container = settings.container;

	/**
	 * A decimal number. (I personally write them as fractions when setting them, it's easier to read IMO.)
	 */
	this.ratio = settings.ratio;
};

FSTATS.BarGraph = function(settings) {
	var self = this;
	this.parent = FSTATS.Graph;
	this.parent.call(this,settings); //calls parent constructor
	if (settings.type == undefined) {
		this.type = 'absolute';
	} else {
		this.type = settings.type;
	}

	this.setData(this.data);

	this.plot = function() {
		//console.log("---------------------");
		var svgWidth = this.container.width();
		this.width = this.container.width() - this.margin.left - this.margin.right;

		var height = this.width*this.ratio - this.margin.top - this.margin.bottom;
		var numberOfBars = Object.keys(this.data).length;

		if (height > numberOfBars * FSTATS.maxBarHeight) { //too thick
			this.height = numberOfBars*FSTATS.maxBarHeight;
		} else if (height > numberOfBars * FSTATS.minBarHeight) { //too thin
			this.height = numberOfBars*FSTATS.minBarHeight;
		} else { //just right
			this.height =  height;
		}

		var svgHeight = self.height + self.margin.top + self.margin.bottom;

		self.svg = d3.select(self.container[0]) //self.container is a JQuery object, this is how we get the DOM element out of it. TODO Maybe do it the other way round and pass a DOM element?
				.append("svg")
				.attr("class","has-graph")
				.attr("width",svgWidth)
				.attr("height",svgHeight);

		var maxTextWidth = self.getTextWidth(self.svg,self.dataset);
		self.margin.left = self.margin.left + maxTextWidth;
		self.width = self.width - maxTextWidth;

		self.graph = self.svg.append("g")
					.attr("transform","translate(" + (self.margin.left) + ", "+ self.margin.top +")");

		// =================== defining scales and axes

		self.ficCountLabelPadding = FSTATS.fontSizes["medium label"]*FSTATS.em * 4;

		if ('percentage' == self.type) {
			self.xScale = d3.scaleLinear()
				.domain([0,self.sum])
				.range([0,self.width]);
		} else {
			self.xScale = d3.scaleLinear()
				.domain([0,self.max])
				.range([0,self.width - self.ficCountLabelPadding]);
		}


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
					.attr("font-size",FSTATS.fontSizes["medium label"] + 'em')
					.attr("fill","#333");


		self.graph.selectAll("g.x .tick text")
					.attr("transform","translate(0,10)");

		//================= plotting the values

		if ('percentage'== self.type) {
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
							return self.yScale(d.y);
						})
						.attr("height", self.yScale.bandwidth())
						.attr("width", function(d) {
							return self.xScale(self.sum);
						})
						.attr("fill","#f0f0f0"); //TODO ??????
		}


		self.bars = self.graph.append("g")
					.attr("class","bars")
					.style("fill",self.data.color)
					.attr("width",self.width)
					.attr("height",self.height)
					.attr("transform","translate(0,0)");

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
							return 0; //animate from 0 to width
						})
						.attr("fill",self.data.color)
					.transition()
						.delay(function(d, i) { return i * 100; })
						.duration(1000)
						.attr("width", function(d){
							return self.xScale(d.x);
						})
					;

		if ('percentage' == self.type) {
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
						.attr("font-size", FSTATS.fontSizes["small label"] + 'em')
						.attr("fill","#999");
		}


		self.ficCounts = self.graph.append("g")
					.attr("class","fic-counts");

		var countLabels = self.ficCounts.selectAll("text")
					.data(self.dataset)
					.enter()
					.append("text")
					.attr("x",function (d) {
						return self.xScale(d.x) + 5;
					})
					.attr("y",function(d) {
						return self.yScale(d.y) + self.yScale.bandwidth()/2;
					})
					.attr("dy","0.35em")
					.attr("font-size",FSTATS.fontSizes["medium label"] + 'em')
					.attr("height",self.yScale.bandwidth())
					.text(function(d) {
						return d3.format(",")(d.x);
					})
					.attr("fill",self.data.textColor)
					.attr("text-anchor","start");


			if ('percentage' == self.type) {
				countLabels.attr("x",function (d) {
						var left = self.xScale(d.x);
						if (left < (self.width - self.ficCountLabelPadding)) {
							return left + 5;
						} else {
							return left - 5;
						}

						})
						.attr("fill", function(d) {
							var left = self.xScale(d.x);
							if (left < (self.width - self.ficCountLabelPadding)) {
								return self.data.textColor;
							} else {
								return "#fff";
							}
						})
						.attr("text-anchor",function(d) {
							var left = self.xScale(d.x);
							if (left < (self.width - self.ficCountLabelPadding)) {
								return "start";
							} else {
								return "end";
							}
						});
			}

	};
	//additional constructor shit

	this.redraw = function() {
		//console.log("redrawing graph!");

		//get new size of container
		var svgWidth = this.container.width();

		//reset margins
		self.margin.left = FSTATS.defaultMargin.left;
		self.margin.right = FSTATS.defaultMargin.right;

		//recalculate original width (without labels)
		self.width = svgWidth - self.margin.left - self.margin.right;

		//recalculate height (with bar height constraints)
		var height = this.width*this.ratio - this.margin.top - this.margin.bottom;
		var numberOfBars = Object.keys(this.data).length;

		if (height > numberOfBars * FSTATS.maxBarHeight) { //too thick
			this.height = numberOfBars*FSTATS.maxBarHeight;
		} else if (height > numberOfBars * FSTATS.minBarHeight) { //too thin
			this.height = numberOfBars*FSTATS.minBarHeight;
		} else { //just right
			this.height =  height;
		}

		var svgHeight = self.height + self.margin.top + self.margin.bottom;

		self.svg.attr("width",svgWidth)
				.attr("height",svgHeight);

		var maxTextWidth = self.getTextWidth(self.svg,self.dataset);
		self.margin.left = self.margin.left + maxTextWidth;
		self.width = self.width - maxTextWidth;

		self.graph.attr("transform","translate(" + (self.margin.left) + ", "+ self.margin.top +")");


		if ('percentage' == self.type) {
			self.xScale.domain([0,self.sum])
					.range([0,self.width]);
		} else {
			self.xScale.domain([0,self.max])
			.range([0,self.width - self.ficCountLabelPadding]);
		}

		//update scale with new data
		self.yScale.domain(self.dataset.map(function(d) {return d.y;}))
					.rangeRound([0,self.height]);

		self.graph.select(".y.axis")
					.transition()
						.duration(300)
						.attr("transform","translate(0,0)")
						.call(self.yAxis);

		self.bars.selectAll("rect")
					.data(self.dataset)
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


		self.ficCounts.selectAll("text")
					.data(self.dataset)
					.transition()
						.duration(1000)
						.attr("x",function (d) {
							return self.xScale(d.x) + 5;
						})
						.attr("y",function(d) {
							return self.yScale(d.y) + self.yScale.bandwidth()/2;
						})
						.attr("height",self.yScale.bandwidth())
						.text(function(d) {
							return d3.format(",")(d.x);
						});



		if ('percentage' == self.type) {
			self.slots.selectAll("rect")
						.data(self.dataset)
						.transition()
						.duration(300)
							.attr("y", function(d) {
								return self.yScale(d.y);
							})
							.attr("height", self.yScale.bandwidth())
							.attr("width", function(d) {
								return self.xScale(self.sum);
							});

			self.percents.selectAll("text")
					.data(self.dataset)
					.transition()
						.duration(300)
						.attr("x",function (d) {
							return self.width + 5;
						})
						.attr("y",function(d) {
							return self.yScale(d.y) + self.yScale.bandwidth()/2;
						})
						.attr("height",self.yScale.bandwidth())
						.text(function(d) {
							return d3.format(">.0%")(d.percent);
						});

			self.ficCounts.selectAll("text")
					.data(self.dataset)
					.transition()
						.duration(1000)
						.attr("x",function (d) {
							var left = self.xScale(d.x);
							if (left < (self.width - self.ficCountLabelPadding)) {
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
							if (left < (self.width - self.ficCountLabelPadding)) {
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
						})
						.text(function(d) {
							return d3.format(",")(d.x);
						});
			}

	};
};

FSTATS.BarGraph.prototype = Object.create(FSTATS.Graph.prototype); //inheritance
FSTATS.BarGraph.prototype.constructor = FSTATS.BarGraph; //sets the constructor to the right function


FSTATS.PieChart = function(settings) {
	var self = this;
	this.parent = FSTATS.Graph;
	this.parent.call(this,settings); //calls parent constructor


	var parentSetData = this.setData;
	this.setData = function(newData) {
		if (undefined !== self.dataset) {
			console.log("we already have data");
			self.oldDataset = self.dataset;
		}
		if (Array.isArray(newData.values)) {
			self.sum = newData.sum;
			self.dataset = newData.values;
		} else {
			self.parentSetData(newData);
		}
	};
	this.setData(settings.data);

	this.plot = function() {
		self.width = self.container.width() - self.margin.left - self.margin.right;
		self.height = self.width*2/3;

		self.labelPadding = FSTATS.em * 2;
		self.radius = (self.height-2*self.labelPadding)/2;
		//limit the radius (the leftover goes into padding)
		if (self.radius > FSTATS.maxRadius) {
			var leftover = self.radius - FSTATS.maxRadius;
			self.margin.left = self.margin.left + leftover;
			self.width = self.width - leftover;
			self.radius = FSTATS.maxRadius;
			self.height = (self.radius + self.labelPadding)*2; //so there isn't empty space at the bottom
		}

		var svgWidth = self.width + self.margin.left + self.margin.right;
		var svgHeight = self.height + self.margin.top + self.margin.bottom;

		self.svg = d3.select(self.container[0]) //self.container is a JQuery object, this is how we get the DOM element out of it. TODO Maybe do it the other way round and pass a DOM element?
				.append("svg")
				.attr("class","has-graph")
				.attr("width",svgWidth)
				.attr("height",svgHeight);
		self.graph = self.svg.append("g")
					.attr("transform","translate(" + self.margin.left + ", "+ self.margin.top +")");

		self.pieGraph = self.graph.append("g")
					.attr('transform', 'translate(' + (self.radius + self.labelPadding) +  ',' + (self.radius + self.labelPadding) + ')');

		//default colors (if not defined in settings)
		var color = d3.scaleOrdinal(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

		self.pie = d3.pie()
					.sort(null)
					.value(function(d) {return d.x; });

		self.arc = d3.arc()
					.innerRadius(0)
					.outerRadius(self.radius);

		self.pieChart = self.pieGraph.selectAll('path')
					.data(self.pie(self.dataset))
					.enter()
					.append('path')
					.attr('d',self.arc)
					.attr('fill',function(d){
						if (undefined == d.data.color) {
							return color(d.data.y);
						} else {
							return d.data.color;
						}

					})
					.each(function(d) { this._current = d; });

		self.legend = self.graph.append("g")
						.attr("class","legend")
						.attr("transform","translate(" + (self.labelPadding*2 + self.radius*2 + self.labelPadding) + ", "+ (self.labelPadding*2) +")");


		self.legendSamples = self.legend.selectAll('rect')
					.data(self.dataset)
					.enter()
					.append('rect')
					.attr('x',0)
					.attr('y',function(d,i) {
						return i*(FSTATS.em + FSTATS.em*0.5);
					})
					.attr('width',FSTATS.em)
					.attr('height',FSTATS.em)
					.attr('fill',function(d){
						if (undefined == d.color) {
							return color(d.y);
						} else {
							return d.color;
						}
					});


		self.legendLabels = self.legend.selectAll("text")
						.data(self.dataset)
						.enter()
						.append("text")
						.attr("x",FSTATS.em+FSTATS.em*0.5)
						.attr("y",function(d,i) {
							return i*(FSTATS.em + FSTATS.em*0.5) + FSTATS.em*0.5; //i-th box from the top (half em padding) and center
						})
						.attr("dy","0.35em")
						.attr("height",FSTATS.em)
						.text(function(d) {
							return d.description + " ("+d3.format(",")(d.x)+")";
						})
						.attr("font-size", FSTATS.fontSizes["small label"] + 'em')
						.attr("fill","#999");
	};

	this.redraw = function() {
		console.log("redrawing PieChart");

		console.log("old dataset:");
		console.log(self.oldDataset);
		console.log("new dataset:");
		console.log(self.dataset);

		//reset left margin
		self.margin.left = FSTATS.defaultMargin.left;

		//update width from DOM
		self.width = self.container.width() - self.margin.left - self.margin.right;
		self.height = self.width*2/3;

		//recalculate radius
		self.radius = (self.height-2*self.labelPadding)/2;
		if (self.radius > FSTATS.maxRadius) {
			var leftover = self.radius - FSTATS.maxRadius;
			self.margin.left = self.margin.left + leftover;
			self.width = self.width - leftover;
			self.radius = FSTATS.maxRadius;
			self.height = (self.radius + self.labelPadding)*2; //so there isn't empty space at the bottom
		};

		var svgWidth = self.width + self.margin.left + self.margin.right;
		var svgHeight = self.height + self.margin.top + self.margin.bottom;

		self.svg.attr("width",svgWidth)
				.attr("height",svgHeight);

		//left margin might have been updated
		self.graph.attr("transform","translate(" + self.margin.left + ", "+ self.margin.top +")");

		//radius definitely updated
		self.pieGraph.attr('transform', 'translate(' + (self.radius + self.labelPadding) +  ',' + (self.radius + self.labelPadding) + ')');

		self.pie.value(function(d) {return d.x; }); //update function in pie.

		self.arc = d3.arc()
					.innerRadius(0)
					.outerRadius(self.radius);

		//TODO this doesn't work. fix later.
		var arcTween = function(a) {
			var i = d3.interpolate(this._current, a);
			this._current = i(0);
			return function(t) {
			  return self.arc(i(t));
			};
		};

		self.pieGraph.selectAll('path')
					.data(self.pie(self.dataset)) //update data
					.transition()
						.duration(750)
						.attrTween("d",arcTween)
						.each(function(d) { this._current = d; }); //keep past angles for the next draw


		self.legendLabels.data(self.dataset)
					.text(function(d) {
						return d.description + " ("+d3.format(",")(d.x)+")";
					});

		self.legend.attr("transform","translate(" + (self.labelPadding*2 + self.radius*2 + self.labelPadding) + ", "+ (self.labelPadding*2) +")");
	};

 };


FSTATS.PieChart.prototype = Object.create(FSTATS.Graph.prototype); //inheritance
FSTATS.PieChart.prototype.constructor = FSTATS.PieChart; //sets the constructor to the right function


//--------------- UTILITIES --------------------//
function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}
//https://stackoverflow.com/a/7394787/1494766

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

if(!Object.keys) Object.keys = function(o){
 if (o !== Object(o))
      throw new TypeError('Object.keys called on non-object');
 var ret=[],p;
 for(p in o) if(Object.prototype.hasOwnProperty.call(o,p)) ret.push(p);
 return ret;
};//https://stackoverflow.com/a/6723633/1494766
