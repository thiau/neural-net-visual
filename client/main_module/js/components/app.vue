<template>
	<div id="app">
		<!-- <chart :chartData="chartData" :options="options"></chart> -->
		<GChart
			type="LineChart"
			:data="chartData"
			:options="chartOptions"
			class="chart"
		/>

		<GChart
			type="LineChart"
			:data="accData"
			:options="accOptions"
			class="chart"
		/>
	</div>
</template>

<script>
(function() {
  "use strict";

  //   let chart = require("vue-chartjs").VueCharts;
  let GChart = require("vue-google-charts").GChart;

  module.exports = {
    data: function() {
      return {
        accData: [["Epoch", "Accuracy"], ["0", 0.5]],
        accOptions: {
          vAxis: {
            title: "Accuracy",
            viewWindow: {
              min: 0.4,
              max: 1
            },
            hAxis: {
              title: "Epochs"
            }
          }
        },
        chartData: [["Epoch", "Error"], ["0", 0.7]],
        chartOptions: {
          vAxis: {
            title: "Loss",
            viewWindow: {
              min: 0.2,
              max: 0.7
            },
            hAxis: {
              title: "Epochs"
            }
          },
          chart: {
            title: "Company Performance",
            subtitle: "Sales, Expenses, and Profit: 2014-2017"
          }
        }
      };
    },
    socket: {
      namespace: "/chat",
      events: {
        test: function(data) {
          console.log(data);
          //   this.trenddata.push(data);
          this.chartData.push([data.epoch, data.loss]);
          this.accData.push([data.epoch, data.accuracy]);
        }
      }
    },
    components: {
      //   trend: require("vuetrend"),
      GChart
    },
    methods: {},
    computed: {},
    created: function() {}
  };
})();
</script>


<style scoped>
#app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  /* background-image: linear-gradient(
    to right top,
    #006dda,
    #0b73da,
    #1778da,
    #227eda,
    #2d83d9
  ); */
  background-color: white;
  justify-content: center;
  align-items: center;
}
.chart {
  width: 100%;
  height: 100%;
}
</style>