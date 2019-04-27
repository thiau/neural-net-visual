<script>
(function() {
  "use strict";

  let chart = require("vue-chartjs").VueCharts;
  let mixins = require("vue-chartjs").mixins;

  module.exports = {
    extends: chart.Line,
    mixins: [mixins.reactiveProp],
    props: ["options", "chartData"],
    data: function() {
      return {};
    },
    components: {},
    methods: {},
    computed: {
      errorData: {
        get: function() {
          return this.chartData;
        },
        set: function(value) {
          this.chartData = value;
        }
      }
    },
    created: function() {},
    mounted() {
      this.renderChart(this.chartData, {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              },
              gridLines: {
                display: true
              }
            }
          ],
          xAxes: [
            {
              gridLines: {
                display: false
              }
            }
          ]
        },
        legend: {
          display: true
        },
        responsive: true,
        maintainAspectRatio: false
      });
    }
  };
})();
</script>


<style scoped>
#app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: white;
  justify-content: center;
  align-items: center;
}
</style>