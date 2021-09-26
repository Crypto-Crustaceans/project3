
var json = d3.json("data/predictions").then(function(response) {
  

    var formatPerc = d3.format("+.2%");
    var formatAmt = d3.format("$,.0f");

    current_price = response.current_price
    prediction_1day = response.prediction_1day
    prediction_7day = response.prediction_7day
    prediction_1day_perc = (prediction_1day - current_price) / current_price
    prediction_7day_perc = (prediction_7day - current_price) / current_price

    console.log((prediction_1day - current_price) / current_price)

    d3.select("#current-price").select(".price").text(`${formatAmt(current_price)}`)
    d3.select("#prediction-1day").select(".price").text(`${formatAmt(prediction_1day)}`)
    d3.select("#prediction-7day").select(".price").text(`${formatAmt(prediction_7day)}`)
    d3.select("#prediction-1day").select(".percent").text(`${formatPerc(prediction_1day_perc)}`)
    d3.select("#prediction-7day").select(".percent").text(`${formatPerc(prediction_7day_perc)}`)
    
    if (prediction_1day_perc > 0) {
        color_1day = "LightGreen";
        }
    else {
        color_1day =  "LightCoral"; 
    };

    if (prediction_7day_perc > 0) {
        color_7day = "LightGreen";
        }
    else {
        color_7day =  "LightCoral"; 
    };


    d3.select("#prediction-7day").select(".percent").style("color", color_7day);
    d3.select("#prediction-1day").select(".percent").style("color", color_1day);

});