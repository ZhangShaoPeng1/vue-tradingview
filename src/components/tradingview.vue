<template>
  <div class="trade-view-comp cont-box">
    <div id="trade-view-root">
    </div>
  </div>
</template>

<script>
  import wsBus from "../assets/wsBus";
  import Datafeeds from "../assets/myDatafeeds";
  export default {
    name: "kline-comp",
    computed: {
      klineSymbol() {
        return "BTC_USDT"; // 根据交易对重新绘制K线，动态赋值
      }
    },
    watch: {
      klineSymbol() {
        this.tradingViewInit();
      }
    },
    methods: {
      tradingViewInit() {
        let widget = new window.TradingView.widget({
          width: "100%",
          height: "100%",
          fullscreen: false,
          symbol: this.klineSymbol,
          interval: localStorage.getItem("tradingview.interval") || "D",
          container_id: "trade-view-root",
          datafeed: new Datafeeds(this.klineSymbol),
          library_path: "/static/chartTool/",
          locale: "zh",
          timezone: "Asia/Hong_Kong",
          drawings_access: {
            type: "black",
            tools: [{name: "Regression Trend"}]
          },
          disabled_features: [
            "pane_context_menu",
            "header_fullscreen_button", //全屏
            "go_to_date",
            "header_compare", //对比或叠加品种
            "header_interval_dialog_button",
            "header_screenshot",
            "header_symbol_search",
            "header_undo_redo",
            "legend_context_menu",
            "show_hide_button_in_legend",
            "symbol_info",
            "volume_force_overlay",
            "items_favoriting",
            "header_layouttoggle",
            "symbol_search_hot_key",
            "control_bar",
            "save_chart_properties_to_local_storage",
            "display_market_status",
            "timeframes_toolbar",
            "use_localstorage_for_settings",
            'header_resolutions'
          ],
          enabled_features: [
            "hide_last_na_study_output",
            "hide_left_toolbar_by_default"
          ],
          studies_overrides: {},
          charts_storage_api_version: "1.1",
          client_id: "tradingview.com",
          user_id: "public_user_id",
          loading_screen: {
            backgroundColor: "#181b2a"
          },
          toolbar_bg: "#181b2a",
          overrides: {
            volumePaneSize: "small",
            "paneProperties.legendProperties.showStudyValues": true,
            "paneProperties.legendProperties.showLegend": false, // 隐藏MA值
            "paneProperties.background": "#181b2a",
            "paneProperties.vertGridProperties.color": "#1f2943",
            "paneProperties.horzGridProperties.color": "#1f2943",
            "paneProperties.crossHairProperties.color": "#989898",
            "symbolWatermarkProperties.transparency": 90,
            "scalesProperties.textColor": "#ffffff",
            "header_widget_dom_node": "off",

            // 实心k
            "mainSeriesProperties.candleStyle.upColor": "rgb(0, 255, 0)",
            "mainSeriesProperties.candleStyle.downColor": "rgb(255, 0, 0)",
            "mainSeriesProperties.candleStyle.drawWick": true,
            "mainSeriesProperties.candleStyle.drawBorder": true,
            "mainSeriesProperties.candleStyle.borderColor": "#C400CB",
            "mainSeriesProperties.candleStyle.borderUpColor": "rgb(0, 255, 0)",
            "mainSeriesProperties.candleStyle.borderDownColor": "rgb(255, 0, 0)",
            "mainSeriesProperties.candleStyle.wickUpColor": "#589065",
            "mainSeriesProperties.candleStyle.wickDownColor": "#ae4e54",
            // 空心k
            "mainSeriesProperties.hollowCandleStyle.upColor": "#589065",
            "mainSeriesProperties.hollowCandleStyle.downColor": "#ae4e54",
            "mainSeriesProperties.hollowCandleStyle.drawWick": true,
            "mainSeriesProperties.hollowCandleStyle.drawBorder": true,
            "mainSeriesProperties.hollowCandleStyle.borderColor": "#C400CB",
            "mainSeriesProperties.hollowCandleStyle.borderUpColor": "#589065",
            //'mainSeriesProperties.hollowCandleStyle.borderDownColor': '#ae4e54',
            "mainSeriesProperties.hollowCandleStyle.borderDownColor": "#acaea4",
            "mainSeriesProperties.hollowCandleStyle.wickUpColor": "#589065",
            // 'mainSeriesProperties.hollowCandleStyle.wickDownColor': '#ae4e54',
            "mainSeriesProperties.hollowCandleStyle.wickDownColor": "#acaea4",
            "scalesProperties.lineColor": "#61688a",

            "paneProperties.legendProperties.showSeriesTitle": false, // 取消symbolInfo
          },
          custom_css_url: "./night.css"
        });
        widget.onChartReady(() => {
          let chart = widget.activeChart();
          chart.createStudy("Moving Average", false, false, [5], null, {
            "Plot.color": "#965fc4",
            "Plot.linewidth": 1
          });
          chart.createStudy("Moving Average", false, false, [10], null, {
            "Plot.color": "#84aad5",
            "Plot.linewidth": 1
          });
          chart.createStudy("Moving Average", false, false, [30], null, {
            "Plot.color": "#55b263",
            "Plot.linewidth": 1
          });
          chart.createStudy("Moving Average", false, false, [60], null, {
            "Plot.color": "#b7248a",
            "Plot.linewidth": 1
          });
          chart.onIntervalChanged().subscribe(null, (interval, obj) => {
            localStorage.setItem("tradingview.interval", interval);
          });
          let buttonArr = [
            {
              value: "1",
              period: "1m",
              text: "1分钟"
            },
            {
              value: "5",
              period: "5m",
              text: "5分钟"
            },
            {
              value: "15",
              period: "15m",
              text: "15分钟"
            },
            {
              value: "30",
              period: "30m",
              text: "30分钟"
            },
            {
              value: "60",
              period: "1h",
              text: "1小时"
            },
            {
              value: "D",
              period: "1D",
              text: "日线"
            }
          ];
          let btn = {};
          let nowTime = '';
          let handleClick = (e, value) => {
            widget.chart().setResolution(value);
            $(e.target)
              .addClass("select")
              .closest("div.space-single")
              .siblings("div.space-single")
              .find("div.button")
              .removeClass("select");
          };
          buttonArr.forEach((v, i) => {
            btn = widget.createButton().on("click", function (e) {
              handleClick(e, v.value);
            });
            btn[0].innerHTML = v.text;
            btn[0].title = v.text;
            // 显示当前K线分辨率按钮
            let klineTime = localStorage.getItem('klineTime');
            let hour = 0,day = 0;
            if(klineTime.replace('H','') == 1){
              hour = 60;
            }
            if(klineTime.replace('D','') == 1){
              day = 'D';
            }
            if (v.value == klineTime.replace('MIN','') || v.value == day || v.value == hour) {
              $(btn[0]).addClass("select");
            }
          });
        });
      }
    },
    mounted() {
      this.tradingViewInit();
    }
  };
</script>

<style type="text/css">
  #trade-view-root {
    height: 540px;
  }
</style>
