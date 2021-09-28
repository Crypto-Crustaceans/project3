var svg = d3.select("#d3calendar")
  .append("svg")

// var lineCanvas = d3.select("#chartjsline")
//   .append("canvas")
//   .attr("id", "linePlot")

// var scatterCanvas = d3.select("#chartjsscatter")
//   .append("canvas")
//   .attr("id", "scatterPlot")

// create group for filter labels
var selectorGroup = d3.select("#plotFilters")
  .append("svg")
  .append("g")

var label_1day = selectorGroup.append("text")
.attr("x", 150)
.attr("y", 25)
.attr("value", "prediction_1day") // value to grab for event listener
.classed("active", true)
.text("1-Day Prediction Model");

var label_7day = selectorGroup.append("text")
.attr("x", 150)
.attr("y", 50)
.attr("value", "prediction_7day") // value to grab for event listener
.classed("inactive", true)
.text("7-Day Prediction Model");


//var selectedValue = "all"

var json = d3.json("data/calendar").then(function(response) {
    
  var calendarData = response.map(function(d) {
    return {
            date: new Date(d.time),
            plus_1day_actual: +d.post_1_day_close,
            plus_1day_actual_perc: +((d.post_1_day_close - d.open) / d.open),
            plus_7day_actual: +d.post_7_day_close,
            plus_7day_actual_perc: +((d.post_7_day_close - d.open) / d.open),
            plus_1day_predicted: +d.prediction_post_1_day_close,
            plus_1day_predicted_perc: +((d.prediction_post_1_day_close - d.open) / d.open),
            plus_7day_predicted: +d.prediction_post_7_day_close,
            plus_7day_predicted_perc: +((d.prediction_post_7_day_close - d.open) / d.open),
            close: +d.close,
    };
  })

  // var lineData = response.map(function(d) {
        
  //   return {
  //       x: new Date(d.date),
  //       y: Math.round(+d.close,0)
  //   };
  // })

  // var scatterData = response.map(function(d) {
        
  //   return {
  //     x: +d.sentiment,
  //     y: +((d.close - d.open) / d.open),
  //     date: new Date(d.date),
  //   };
  // })
  
  d3Calendar(calendarData, "prediction_1day");
  // chartjsLine(lineData, "all");
  // chartjsScatter(scatterData, "all")

  // event listener
  selectorGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== selectedValue) {

      // replaces selectedValue with value
      var selectedValue = value;
      console.log(selectedValue)
      

      // changes classes to change bold text
      if (selectedValue === "prediction_1day") {
        d3.selectAll(".active")
          .classed("active", false)
          .classed("inactive", true)
        label_1day
          .classed("active", true)
          .classed("inactive", false)
      }
      else if (selectedValue == "prediction_7day") {
        d3.selectAll(".active")
        .classed("active", false)
        .classed("inactive", true)
      label_7day
        .classed("active", true)
        .classed("inactive", false)
      }
      }

      // run calendar function with selected year
      d3Calendar(calendarData, selectedValue) 
      // chartjsLine(lineData, selectedValue)
      // chartjsScatter(scatterData, selectedValue)

    });
  });

function d3Calendar(data, selectedData) {

  svg.selectAll("*").remove();

  var years = d3.groups(data, d => d.date.getUTCFullYear()).reverse();
  
  // if (startYear == "all") {
  filteredYears = years;
  // }
  // else {
  //   filteredYears = years.filter(d => d[0] == startYear);
  // }


  var cellSize = 17;
  var width = 2000;
  var height = cellSize * 7;
  var timeWeek =d3.utcMonday;
  var countDay = i => (i + 6) % 7;

  function pathMonth(t) {
      const n = 5;
      const d = Math.max(0, Math.min(n, countDay(t.getUTCDay())));
      const w = timeWeek.count(d3.utcYear(t), t);
      return `${d === 0 ? `M${w * cellSize},0`
          : d === n ? `M${(w + 1) * cellSize},0`
          : `M${(w + 1) * cellSize},0V${d * cellSize}H${w * cellSize}`}V${n * cellSize}`;
    };
  
  var formatPerc = d3.format("+.2%");
  var formatAmt = d3.format("$,.2f");
  var formatDate = d3.utcFormat("%x");
  var formatDay = i => "SMTWTFS"[i];
  var formatMonth = d3.utcFormat("%b");
  // const actualMax = d3.quantile(data, 0.9975, d => Math.abs(d.plus_1day_actual_perc));
  // const predictedMax = d3.quantile(data, 0.9975, d => Math.abs(d.plus_1day_predicted_perc));
  
  if (selectedData == "prediction_1day") {
    var actualMax = .20;
    var predictedMax = .20;
  }
  else {
  var actualMax = .40;
  var predictedMax = .40;
  }

  var actualColor = d3.scaleSequential(d3.interpolatePiYG).domain([-actualMax, +actualMax]);
  var predictedColor = d3.scaleSequential(d3.interpolatePiYG).domain([-predictedMax, +predictedMax]);

      svg.attr("viewBox", [0, 0, 1000, height * filteredYears.length])
          .attr("font-family", "sans-serif")
          .attr("font-size", 10);
      
    
      const year = svg.selectAll("g")
        .data(filteredYears)
        .join("g")
          .attr("transform", (d, i) => `translate(50,${height * i + cellSize * 1.5})`);

      year.append("text")
          .attr("x", -5)
          .attr("y", -5)
          .attr("font-weight", "bold")
          .attr("text-anchor", "end")
          .text(([key]) => key);
    
      year.append("g")
          .attr("text-anchor", "end")
        .selectAll("text")
        .data(d3.range(1, 6))
        .join("text")
          .attr("x", -5)
          .attr("y", i => (countDay(i) + 0.5) * cellSize)
          .attr("dy", "0.31em")
          .text(formatDay);
      
      if (selectedData == "prediction_1day") {
        year.append("g")
          .selectAll("polygon")
          .data(([, values]) => values.filter(d => ![0, 6].includes(d.date.getUTCDay())))
          .join("polygon")
            .attr("points", function(d) {
                return `${timeWeek.count(d3.utcYear(d.date), d.date) * cellSize + 0.5}, ${countDay(d.date.getUTCDay()) * cellSize + 0.5} ${timeWeek.count(d3.utcYear(d.date), d.date) * cellSize + 0.5}, ${countDay(d.date.getUTCDay()) * cellSize + 0.5 + cellSize - 1} ${timeWeek.count(d3.utcYear(d.date), d.date) * cellSize + 0.5 + cellSize - 1}, ${countDay(d.date.getUTCDay()) * cellSize + 0.5 + cellSize - 1}`
            })
            .attr("fill", d => actualColor(d.plus_1day_actual_perc))
          .append("title")
            .text(d => `${formatDate(d.date)}
Actual Change (+1 Day): ${formatPerc(d.plus_1day_actual_perc)}`)
      }

      else {
        year.append("g")
          .selectAll("polygon")
          .data(([, values]) => values.filter(d => ![0, 6].includes(d.date.getUTCDay())))
          .join("polygon")
            .attr("points", function(d) {
                return `${timeWeek.count(d3.utcYear(d.date), d.date) * cellSize + 0.5}, ${countDay(d.date.getUTCDay()) * cellSize + 0.5} ${timeWeek.count(d3.utcYear(d.date), d.date) * cellSize + 0.5}, ${countDay(d.date.getUTCDay()) * cellSize + 0.5 + cellSize - 1} ${timeWeek.count(d3.utcYear(d.date), d.date) * cellSize + 0.5 + cellSize - 1}, ${countDay(d.date.getUTCDay()) * cellSize + 0.5 + cellSize - 1}`
            })
            .attr("fill", d => actualColor(d.plus_7day_actual_perc))
          .append("title")
            .text(d => `${formatDate(d.date)}
Actual Change (+7 Days): ${formatPerc(d.plus_7day_actual_perc)}`)
      }

      if (selectedData == "prediction_1day") {
        year.append("g")
          .selectAll("polygon")
          .data(([, values]) => values.filter(d => ![0, 6].includes(d.date.getUTCDay())))
          .join("polygon")
          .attr("points", function(d) {
              return `${timeWeek.count(d3.utcYear(d.date), d.date) * cellSize + 0.5}, ${countDay(d.date.getUTCDay()) * cellSize + 0.5} ${timeWeek.count(d3.utcYear(d.date), d.date) * cellSize + 0.5 + cellSize - 1}, ${countDay(d.date.getUTCDay()) * cellSize + 0.5} ${timeWeek.count(d3.utcYear(d.date), d.date) * cellSize + 0.5 + cellSize - 1}, ${countDay(d.date.getUTCDay()) * cellSize + 0.5 + cellSize - 1}`
          })
          .attr("fill", d => predictedColor(d.plus_1day_predicted_perc))
          .append("title")
          .text(d => `${formatDate(d.date)}
Test Prediction (+1 Day): ${formatPerc(d.plus_1day_predicted_perc)}`);
      }
      else {
        year.append("g")
          .selectAll("polygon")
          .data(([, values]) => values.filter(d => ![0, 6].includes(d.date.getUTCDay())))
          .join("polygon")
          .attr("points", function(d) {
              return `${timeWeek.count(d3.utcYear(d.date), d.date) * cellSize + 0.5}, ${countDay(d.date.getUTCDay()) * cellSize + 0.5} ${timeWeek.count(d3.utcYear(d.date), d.date) * cellSize + 0.5 + cellSize - 1}, ${countDay(d.date.getUTCDay()) * cellSize + 0.5} ${timeWeek.count(d3.utcYear(d.date), d.date) * cellSize + 0.5 + cellSize - 1}, ${countDay(d.date.getUTCDay()) * cellSize + 0.5 + cellSize - 1}`
          })
          .attr("fill", d => predictedColor(d.plus_7day_predicted_perc))
          .append("title")
          .text(d => `${formatDate(d.date)}
Test Prediction (+7 Days): ${formatPerc(d.plus_7day_predicted_perc)}`);  
      }

      const month = year.append("g")
        .selectAll("g")
        .data(([, values]) => d3.utcMonths(d3.utcMonth(values[0].date), values[values.length - 1].date))
        .join("g");
    
      // month.filter((d, i) => i).append("path")
      //     .attr("fill", "none")
      //     .attr("stroke", "#fff")
      //     .attr("stroke-width", 3)
      //     .attr("d", pathMonth);
    
      month.append("text")
          .attr("x", d => timeWeek.count(d3.utcYear(d), timeWeek.ceil(d)) * cellSize + 2)
          .attr("y", -5)
          .text(formatMonth);
};

// function chartjsLine(data, selectedYear) {

//   d3.select("#chartjsline")
//     .selectAll("canvas")
//     .remove()
//   //d3.selectAll(".chartjs-hidden-iframe").remove();

//   var lineCanvas = d3.select("#chartjsline")
//     .append("canvas")
//     .attr("id", "linePlot")
    
//   var year = d3.groups(data, d => d.x.getUTCFullYear());
  
//   if (selectedYear == "all") {
//     plot_dates = data
//   }
//   else {
//     filteredYear = year.filter(d => d[0] == selectedYear);
//     plot_dates = filteredYear[0][1];
//   }
  
//   var config = {
//       type:'line',
//       data: {
//           datasets: [
//               {
//               label: "GSPC Price",
//               data: plot_dates,
//               fill: false,
//               tension: 0.1,
//               pointHitRadius: 3,
//               borderWidth: 1
//               }
//           ]
//       },
//       options: {
//           responsive: true,
//           title:      {
//               display: true,
//               text: "S&P 500 (GSPC) Price"
//           },
//           elements: {
//               point:{
//                   radius: 0,
//                   hoverRadius: 15,
//                   borderColor: "black"
//               },
//               line:{
//                   borderColor: "black"
//               }
//           },
//           legend: {
//               display: false
//           },
//           scales: {
//               xAxes: [{
//                   type: "time",
//                   display: true,
//                   gridLines: {
//                       display: false
//                   },
//                   labels: {
//                       show: true,
//                   },
//                   time: {
//                       displayFormats: {
//                           //week: 'MMM YYYY'
//                       },
//                       tooltipFormat: 'll'
//                   },
//                   scaleLabel: {
//                       display: true,
//                       labelString: 'Date'
//                   },
//               }],
//               yAxes: [{
//                   type: "linear",
//                   display: true,
//                   position: "left",
//                   gridLines:{
//                       display: false
//                   },
//                   labels: {
//                       show:true,  
//                   },
//                   scaleLabel: {
//                       display: true,
//                       labelString: 'Price ($)'
//                   },
//                   ticks: {
//                       display: true,
//                       callback: function(value, index, values) {
//                          if (parseInt(value) >= 1000) {
//                             return '$' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//                          } else {
//                             return '$' + value;
//                          }
//                       }
//                    }
//               }]
//           },
//           tooltips: {
//               callbacks: {
//                  label: function(t, d) {
//                     var xLabel = d.datasets[t.datasetIndex].label;
//                     var yLabel = t.yLabel >= 1000 ? '$' + t.yLabel.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '$' + t.yLabel;
//                     return xLabel + ': ' + yLabel;
//                  }
//               }
//            },
//       }
//   };
  
//   if (myChart1 != null) {
//     myChart1.destroy()
//   }
//   var myChart1 = new Chart(
//       document.getElementById('linePlot'),
//       config,
//   );
  
//   myChart1.update()
//   myChart1.render()
// };

// function chartjsScatter(data, selectedYear) {

//   d3.select("#chartjsscatter")
//     .selectAll("canvas")
//     .remove()
//   //d3.selectAll(".chartjs-hidden-iframe").remove();

//   var scatterCanvas = d3.select("#chartjsscatter")
//     .append("canvas")
//     .attr("id", "scatterPlot")

//     var year = d3.groups(data, d => d.date.getUTCFullYear());
  
//     if (selectedYear == "all") {
//       plot_data = data
//     }
//     else {
//       filteredYear = year.filter(d => d[0] == selectedYear);
//       plot_data = filteredYear[0][1];
//     }
    
//     var config = {
//         type:'scatter',
//         data: {
//             datasets: [
//                 {
//                 label: "GSPC Scatter",
//                 data: plot_data,
//                 fill: false,
//                 pointHitRadius: 3,
//                 showLine: false
//                 }
//             ]
//         },
//         options: {
//             responsive: true,
//             title:      {
//                 display: true,
//                 text: "S&P 500 (GSPC): News Sentiment vs. Price Change"
//             },
//             elements: {
//                 point:{
//                     radius: 2,
//                     hoverRadius: 10,
//                     borderColor: "black"
//                 },
//                 line: {

//                 }
//             },
//             legend: {
//                 display: false
//             },
//             scales: {
//                 xAxes: [{
//                     type: "linear",
//                     display: true,
//                     gridLines: {
//                         display: false
//                     },
//                     labels: {
//                         show: true,
//                     },
//                     scaleLabel: {
//                         display: true,
//                         labelString: 'Avg. Positive/Negative Sentiment (+/-)'
//                     },
//                     ticks: {
//                         display: true,
//                         callback: function (value) {
//                             return (value).toFixed(2); // convert it to percentage
//                           }
//                     },
//                 }],
//                 yAxes: [{
//                     type: "linear",
//                     display: true,
//                     position: "left",
//                     gridLines:{
//                         display: false
//                     },
//                     labels: {
//                         show:true,  
//                     },
//                     scaleLabel: {
//                         display: true,
//                         labelString: 'Price Increase/Decrease (%)'
//                     },
//                     ticks: {
//                         display: true,
//                         callback: function (value) {
//                             return (value * 100).toFixed(1); // convert it to percentage
//                           }
                      
//                     }
//                 }],
//             },
//             tooltips: {
//                 callbacks: {
//                     label: function(tooltipItem, data) {
//                         var xLabel =  Number(tooltipItem.xLabel).toFixed(2);
//                         var yLabel = Number(tooltipItem.yLabel * 100).toFixed(2) + "%";
//                         return ["Sentiment: " + xLabel, "Price: " + yLabel]
//                     }
//                 }
//             }
//         }
//     };
//     if (myChart2 != null) {
//       myChart2.destroy()
//     }

//     var myChart2 = new Chart(
//         document.getElementById('scatterPlot'),
//         config
//     );

//     myChart2.update()
//     myChart2.render()
// };