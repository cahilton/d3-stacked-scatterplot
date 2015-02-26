/**
 *
 * This still needs some love, but it's a start.
 *
 * The variables at the top are for your tweaking. Touch other stuff at your own experimentation!
 */
var timeIncrements = 1;
var showSubjectId = true;
var chartLabel = "Hospital Acquired Infections";
var chartFor = "Overall Standardized Infection Ration";
var maxLongTransition = 3000;
var maxShortTransition = 900;
var subjectLabel = "Hospital"; // here you could put patient, state, whatever is in column 3
var timeUnit = "year";
var summary = "Data begins in 2008. Source data can be found <a href='https://catalog.data.gov/dataset/hospital-acquired-infections-beginning-2008'>here</a>.";
/**
 *
 * End of custom variables!!!
 */


var opac = "0.6";

function parseNumeric(data) {
    try {
        return +(data.trim());
    } catch (e) {
        console.log("unable to parse " + data);
    }
    return -1;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function initChart() {

    var staticTypes = [];
    var structDictionary = {};

    var d3Charts = [];
    var patData = {};
    var conditions = [];

    d3.csv('data/static.csv', function(data) {
        $.each(data, function() {
            if (!structDictionary[this.TYPE]) {
                structDictionary[this.TYPE] = {};
                structDictionary[this.TYPE].struct = {};
                structDictionary[this.TYPE].structInverse = {};
                staticTypes.push(this.TYPE);
            }
            if (!structDictionary[this.TYPE].struct[this.SUBJECT_ID]) {
                structDictionary[this.TYPE].struct[this.SUBJECT_ID] = [];
            }
            if (!structDictionary[this.TYPE].structInverse[this.VALUE]) {
                structDictionary[this.TYPE].structInverse[this.VALUE] = [];
            }
            structDictionary[this.TYPE].struct[this.SUBJECT_ID].push(this.VALUE);
            structDictionary[this.TYPE].structInverse[this.VALUE].push(this.SUBJECT_ID);
        });


        $.each(staticTypes, function() {
            var div = $("<div><h3 class='filter' style='opacity:0.1' key='" + this + "'>" + this.split("_").join(" ") + "</h3><p class='filter-detail' key='" + this + "'/></div>")
                .appendTo($("#right-filters"));
        });

        $(".filter").click(function(event) {
            filterCircles($(this), event);
        });
    });

    setTimeout(function() {
        d3.csv('data/data.csv', createChart);
    }, 100);

    function convertTime(time) {
        var timeOffset = Math.floor(time/timeIncrements);

        return timeOffset;
    }

    function createChart(data) {


        /* Let's make sure these are all numbers,
         we don't want javaScript thinking it's text

         Let's also figure out the maximum data point
         We'll use this later to set the Y-Axis scale
         */
        var maxTime = 0;
        var minTime = 10000000;
        var chartData = {};

        var color = d3.scale.category10();
        data.forEach(function (d) {

            var invalidType = false;

            if (!patData[d.SUBJECT_ID]) {
                patData[d.SUBJECT_ID] = [];
            }


            if ($.inArray(d.TYPE, conditions) < 0) {
                conditions.push(d.TYPE);
                chartData[d.TYPE] = {};
                chartData[d.TYPE].data = [];
                chartData[d.TYPE].maxDataPoint = 0;
            }

            d.time = convertTime(+d.TIME);
            if (d.time > maxTime) {
                maxTime = d.time;
            }
            if (d.time < minTime) {
                minTime = d.time;
            }


            d.type = d.TYPE;

            // transitionTime
            d.transition = getRandomInt(100, maxLongTransition) + "";
            d.fast_transition = getRandomInt(25, maxShortTransition) + "";
            // do some custom stuff here
            d.raw_value = +d.VALUE;

            if (!$.isNumeric(d.raw_value)) {
                invalidType = true;
            }

            if (!invalidType) {
                if (d.raw_value > chartData[d.type].maxDataPoint) {
                    chartData[d.type].maxDataPoint = d.raw_value;
                }

                patData[d.SUBJECT_ID].push(d);
                chartData[d.type].data.push(d);
            }
        });



        var n = 0;
        $.each(chartData, function (k, v) {
            d3Charts.push(new Chart().renderChart(k, v.data, (n++ === conditions.length - 1), minTime, maxTime, v.maxDataPoint, color(k), true));

        });

    }
    function Chart() {
        var self = this;
        this.renderChart = function(label, data, showBottomLegend, minXAxisVal, maxXAxisVal, maxYAxisVal, color, isNew) {
            this.label = label;
            if (isNew) {
                this.data = data;
            }
            this.showBottonLegend = showBottomLegend;
            this.minXAxisVal = minXAxisVal;
            this.maxXAxisVal = maxXAxisVal;
            this.maxYAxisVal = maxYAxisVal;
            this.color = color;

            var bottomV = showBottomLegend ? 40 : 8;
            var margin = {top: 10, right: 20, bottom: bottomV, left: 100},
                width = $("#chart").width() - margin.left - margin.right,
                height = 200 - margin.top - margin.bottom;

            this.width = width;
            this.height = height;


            var x = d3.scale.linear()
                .range([0, width]);

            var y = d3.scale.linear()
                .range([height, 0]);


            var xAxis = d3.svg.axis()
                .tickFormat(d3.format("d"))
                .scale(x)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .tickFormat(d3.format("d"))
                .scale(y)
                .orient("left");

            var svg = d3.select("#chart").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            $("#scaleright").val(maxXAxisVal);

            x.domain([0, maxXAxisVal]).nice();
            y.domain([0, maxYAxisVal]).nice();

            $("#scale-left").val(minXAxisVal);
            $("#scale-right").val(maxXAxisVal);

            this.bottomAxis = undefined;


            if (showBottomLegend) {
                this.bottomAxis = svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .style("fill", "lightgray")
                    .call(xAxis);

            }
            svg.append("g")
                .attr("class", "y axis")
                .style("fill", "lightgray")
                .call(yAxis)
                .append("text")
                .attr("class", "label")
                //.attr("transform", "rotate(-90)")
                .attr("y", 2)
                .attr("x", function (d) {
                    return x(maxXAxisVal) - 10;
                })
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .style("font-size", "12px")
                .text(label);

            var tip = d3.tip().attr('class', 'd3-tip s')
                .html(function (d) {
                    var html = showSubjectId ? subjectLabel + ":<br/><span class='tip-info'>" + d.SUBJECT_ID + "</span><br/><br/>" : "";
                    $.each(staticTypes, function() {
                        if (structDictionary[this].struct[d.SUBJECT_ID]) {
                            html += ("Filters:");
                            $.each(structDictionary[this].struct[d.SUBJECT_ID], function () {
                                html += ("<br/><span class='tip-info'> " + this.split("_").join(" ") + "</span>");
                            });
                        }
                    });


                    html += ("<br/><br/>" + label + ":");
                    html += ("<br/><span class='tip-info'> " + d.raw_value + "<span class='tip-sub-info'> (at " + timeUnit + " " + d.time + "</span>)</span>");
                    return html;
                });
            svg.call(tip);

            svg.selectAll(".dot")
                .data(data)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("color", color)
                .attr("subject_id", function (d) {
                    return d.SUBJECT_ID;
                })
                .attr("r", 5)
                .attr("cx", function (d) {
                    return x(d.time);
                })
                .attr("cy", function (d) {
                    return y(d.raw_value);
                })
                .style("opacity", 0)
                .style("cursor", "pointer")
                .style("fill", function (d) {
                    return color;
                })
                .on("click", function () {
                    var subjId = $(this).attr("subject_id");

                    // show click line for all charts
                    $.each(d3Charts, function () {
                        this.showClickLine(subjId);
                    });

                    // reset filters
                    $(".filter").css("opacity", "0.1");

                    $.each(staticTypes, function() {
                        var sType = this;
                        var sData = structDictionary[this].struct[subjId];
                        $(".filter-detail[key='" + sType + "'").empty();
                        if (sData) {
                            $.each(sData, function (k, v) {
                                $(".filter[key='" + sType + "'")
                                    .css("opacity", "1");
                                $(".filter-detail[key='" + sType + "'")
                                    .append(v + "<br/>");
                            });
                        }
                    });

                    $("#subject").css("opacity", "1");
                    $("#subject-detail").text(subjId);

                    d3.selectAll(".line[subject_id='" + subjId + "']")
                        .style("opacity", "1");

                    d3.selectAll("circle:not([subject_id='" + subjId + "'])")
                        .transition()
                        .duration(function(d) {
                            return d.fast_transition ;
                        })
                        .ease("bounce")
                        .style("fill", "white")
                        .style("opacity", 0.009)
                        .style("z-index", "1");
                    setTimeout(function () {
                        d3.selectAll("[subject_id='" + subjId + "']")
                            .transition()
                            .duration(function(d) {
                                return d.fast_transition ;
                            })
                            .ease("bounce")
                            .style("z-index", "90000")
                            .style("fill", function (d) {
                                return $(this).attr("color");
                            })
                            .style("opacity", 1);
                    }, 100);

                })
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);


            d3.selectAll(".dot")
                .transition()
                .duration(function(d) {
                    return d.transition ;
                })
                .ease("bounce")
                .style("opacity", opac);



            this.svg = svg;
            this.xScale = x;
            this.yScale = y;
            this.xAxis = xAxis;
            this.yAxis = yAxis;


            // dynamically add structured data attributes
            $.each(staticTypes, function() {
                var sType = this;
                var inverseLookup = structDictionary[sType].structInverse
                $.each(inverseLookup, function () {
                    var sVal = this;
                    var sAttr = (sType.split(" ").join("_")).toLowerCase();
                    svg.selectAll("circle.dot")
                        .attr(sAttr, function (d) {
                            if ($.inArray(d.SUBJECT_ID, sVal) >= 0) {
                                return "true";
                            } else {
                                return "false";
                            }
                        });
                });
            });


            return self;
        }

        this.showClickLine = function(subj) {
            var line = d3.svg.line()
                .x(function(d) { return self.xScale(d.time); })
                .y(function(d) { return self.yScale(d.raw_value); });

            var data = [];
            $.each(patData[subj], function() {
                console.log(this);
                if (this.TYPE === self.label) {
                    data.push(this);
                }
            });

            this.svg.append("path")
                .datum(data)
                .attr("class", "line click-line")
                .attr("d", line)
                .attr("stroke", this.color);
        }

        this.updateChart = function(min, max) {
            var newData = filterData(min, max, this.data);


            self.renderChart(self.label, newData, self.showBottonLegend, +min, +max, self.maxYAxisVal, self.color, false);
            return self;
        }

        function filterData(min, max, data) {
            var newData = [];
            maxN = +max;
            minN = +min;
            $.each(data, function() {
               if (this.time >= minN && this.time <= maxN) {
                   newData.push(this);
               }
            });
            return newData;
        }

    }


    $( "body" ).click(function( event ) {
       if (event.target.nodeName !== "circle") {
            reset();
       }

    });

    $("#reset-scale").click(function() {

        // TODO this is hokey for now, should be able to use d3 selectors to update
        // just takes a bit more time than I have to spend on this right now
        $("#chart").empty();

        $.each(d3Charts, function() {
           this.updateChart($("#scale-left").val(), $("#scale-right").val());
        });
    });

    $('.scale-box').keypress(function (e) {
        if (e.which == 13) {
            $("#reset-scale").trigger("click");
        }

    });


}



function reset() {
    setTimeout(function() {
        d3.selectAll("circle")
            .transition()
            .duration(function(d) {
                return d.fast_transition ;
            })
            .style("opacity", opac)
            .style("fill", function() {
                return $(this).attr("color");
            });
    }, 100);

    $("#patient").css("opacity", "0.1");
    $("#patient-detail").text("");
    $(".click-line").detach();

    $(".filter-detail")
        .text("")
        .css("opacity", "1");
    $(".filter")
        .css("opacity", "0.1");
}

function filterCircles($this, event) {
    var key = $this.attr("key").toLowerCase();
    if ($this.css("opacity") === "1") {
        reset();
    } else {
        var onSelector = "circle[" + key + "='true']";
        offSelector = "circle[" + key + "='false']";
        $(".filter[key!='" + key + "']").css("opacity", "0.1");

        d3.selectAll(onSelector)
            .transition()
            .duration(function(d) {
                return d.fast_transition ;
            })
            .ease("bounce")
            // .css("fill", "white")
            .style("opacity", "1")
            .style("fill", function () {
                return $(this).attr("color");
            })
            .style("z-index", "99999");
        d3.selectAll(offSelector)
            .transition()
            .duration(function(d) {
                return d.fast_transition ;
            })
            .style("bounce")
            .style("fill", "white")
            .style("opacity", 0.009)
            .style("z-index", "1");

        $this.css("opacity", "1");
    }
    event.stopPropagation();
}

$(document).ready(function () {
    initChart();
    if (!showSubjectId) {
        $("#patient-filter").hide();
    }
    $("#day-increments").text(timeIncrements);
    $("#chart-label").text(chartLabel);
    $("#chart-for").text(chartFor);
    $("#summary").html(summary);
    $("#subject").text(subjectLabel);
    $(".time-unit").text(_.startCase(timeUnit));
});