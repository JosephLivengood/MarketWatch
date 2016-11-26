/*global angular*/
var app = angular.module('marketWatch', []);

app.controller('MainCtrl',['$scope',
function($scope){
    
    /*global io*/
    var socket = io.connect('https://livemarket.herokuapp.com/');
    
    socket.on('stockUpdate', function (data) {
        $("#heading").fadeIn(2000, function() {});
        $scope.stocks = data.stocks;
        $scope.$apply();
        var seriesOptions = [],
        seriesCounter = 0,
        names = data.stocks;
        function createChart() {
            /*global Highcharts*/
            Highcharts.stockChart('container', {
                rangeSelector: { selected: 4 },
                yAxis: { labels: {
                        formatter: function () {
                            return (this.value > 0 ? ' + ' : '') + this.value + '%';
                        } }, plotLines: [{ value: 0,width: 2,color: 'silver' }]
                },
                plotOptions: { series: { compare: 'percent', showInNavigator: true } },
                tooltip: {
                    pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
                    valueDecimals: 2,
                    split: true
                },
                series: seriesOptions
            });
            $("#stock-list").delay(1000).fadeIn(2000, function() {});
            $("#stock-form").delay(1000).fadeIn(4000, function() {});
        }
        /*global $*/
        $.each(names, function (i, name) {
            $.getJSON('http://dev.markitondemand.com/MODApis/Api/v2/InteractiveChart/jsonp?parameters={%22Normalized%22:false,%22NumberOfDays%22:3000,%22DataPeriod%22:%22Day%22,%22Elements%22:[{%22Symbol%22:%22' + name + '%22,%22Type%22:%22price%22,%22Params%22:[%22c%22]}]}&callback=?',    function (data) {
                var data2 = [];
                for(var a=0; a < data.Dates.length; a++) {
                    data2.push([(Date.parse(data.Dates[a]).getTime()),data.Elements[0].DataSeries.close.values[a]]);
                }                
                seriesOptions[i] = {
                    name: name,
                    data: data2
                };
                seriesCounter += 1;
                if (seriesCounter === names.length) {
                    createChart();
                }
            });
        });
    });
    
    $scope.createStock = function() {
        if($scope.formData.text) {
            socket.emit('createStock', { stock: $scope.formData.text.toUpperCase() });
            $scope.formData = {};
            $scope.$apply();
        }
    };
    
    $scope.deleteStock = function(id) {
        socket.emit('deleteStock', { stock: id });
    };
    
}]);