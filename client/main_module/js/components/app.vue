<template>
	<div id="app">
		<GChart
			type="LineChart"
			:data="lossChart.data"
			:options="lossChart.options"
			class="chart"
		/>

		<GChart
			type="LineChart"
			:data="accuracyChart.data"
			:options="accuracyChart.options"
			class="chart"
		/>
	</div>
</template>

<script>
(function() {
  "use strict";

  module.exports = {
    data: function() {
      return {
        lossChart: {
          data: [["Epoch", "Error"], ["0", 0.7]],
          options: {
            vAxis: {
              title: "Loss",
              viewWindow: {
                min: 0.2,
                max: 0.7
              },
              hAxis: {
                title: "Epochs"
              }
            }
          }
        },
        accuracyChart: {
          data: [["Epoch", "Accuracy"], ["0", 0.5]],
          options: {
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
          }
        }
      };
    },
    socket: {
      namespace: "/training",
      events: {
        trainingInfo: function(data) {
          this.lossChart.data.push([data.epoch, data.loss]);
          this.accuracyChart.data.push([data.epoch, data.accuracy]);
        }
      }
    },
    components: {
      GChart: require("vue-google-charts").GChart
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