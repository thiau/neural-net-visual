<template>
	<div id="app">	
		<div class="header"></div>
		<div class="main">
			<div class="main-left">
				<div class="chart-box">
					<div class="chart-box-container">
						<GChart
							type="LineChart"
							:data="lossChart.data"
							:options="lossChart.options"
							class="chart"
						/>
					</div>
					<div class="chart-box-footer">
						<span class="chart-footer-text">
							Loss by Epoch
						</span>
					</div>
				</div>
			</div>
			<div class="main-right">
				<div class="chart-box">
					<div class="chart-box-container">
						<GChart
							type="LineChart"
							:data="accuracyChart.data"
							:options="accuracyChart.options"
							class="chart"
						/>
					</div>
					<div class="chart-box-footer">
						<span class="chart-footer-text">
							Accuracy by Epoch
						</span>
					</div>
					<!-- <GChart
						type="LineChart"
						:data="accuracyChart.data"
						:options="accuracyChart.options"
						class="chart"
					/> -->
				</div>
			</div>
		</div>
		<!-- <GChart
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
		/> -->
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
            backgroundColor: "transparent",
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
          data: [["Epoch", "Accuracy"], ["0", 0]],
          options: {
            backgroundColor: "transparent",
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

  background: #bbc4cc;

  justify-content: center;
  align-items: center;
}
.chart {
  width: 100%;
  height: 100%;
}

.header {
  height: 100px;
  width: 100%;
}

.main {
  width: 100%;
  height: 100%;
  display: flex;
}

.main-left,
.main-right {
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  padding-left: 30px;
  padding-right: 30px;
}

/* .main-left {
  justify-content: center;
  align-items: center;
  padding-left: 30px;
  padding-right: 30px;
} */

.chart-box {
  display: flex;
  width: 100%;
  height: 500px;
  background-color: white;
  border-radius: 30px;
  box-shadow: 0 2px 43px -4px rgba(0, 0, 0, 0.19);
  flex-direction: column;
}

.chart-box-footer {
  height: 50px;
  width: 100%;
  border-top: 1px solid rgba(67, 91, 113, 0.2);
}

.chart-box-container {
  height: 100%;
  width: 100%;
  display: flex;
}

.chart-footer-text {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: rgba(67, 91, 113, 0.7);
}
</style>