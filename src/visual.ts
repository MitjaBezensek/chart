module powerbi.extensibility.visual {
    "use strict";
    export class Visual implements IVisual {
        private settings: VisualSettings;
        private svg: d3.Selection<any>;
        private locale: string;

        constructor(options: VisualConstructorOptions) {
            console.log('Visual constructor', options);
            this.svg = d3.select(options.element)
                .append("svg");
            this.locale = options.host.locale;
        }

        public update(options: VisualUpdateOptions) {
            console.log('Visual update', options);
            this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
            this.svg.attr({
                width: Math.round(options.viewport.width),
                height: Math.round(options.viewport.height),
            });
            let dataPoints = this.getDataPoints(options);
            console.log("Data points", dataPoints);
            this.plotBarChart(dataPoints, options.viewport.width, options.viewport.height);
        }

        private getDataPoints(options: VisualUpdateOptions): DataPoint[] {
            let dataView = options.dataViews[0];
            let categories = dataView.categorical.categories[0];
            let values = dataView.categorical.values[0];
            if (!dataView) {
                return;
            }
            let dataPoints: DataPoint[] = [];
            values.values.map((value, index) => {
                let label = helpers.getDataLabel(<number>value, 2, "Auto", this.locale, "");
                dataPoints.push({
                    value: <number>value,
                    category: <string>(categories ? categories.values[index] : ""),
                    label: label,
                    // Getting the width of the label, based on font type, size, font weight
                    labelWidth: helpers.measureTextWidth(label, 12, "Segoe UI", "normal")
                });
            });
            return dataPoints;
        }

        private plotBarChart(dataPoints: DataPoint[], width: number, height: number): any {
            let values = dataPoints.map(d => d.value);
            let categories = dataPoints.map(d => d.category);
            let min = d3.min(values);
            let max = d3.max(values);
            let margin = 25;
            let xScale = d3.scale.ordinal().domain(categories).rangeBands([margin, width - margin], 0.3);
            let yScale = d3.scale.linear().domain([min, max]).rangeRound([height - margin, margin]);

            // Plot the bars
            let bars = this.svg.selectAll(".bar").data(dataPoints);
            bars.enter().append("rect").classed("bar", true);
            bars.exit().remove();
            bars.attr({
                fill: "black",
                x: d => Math.round(xScale(d.category)),
                y: d => Math.round(yScale(d.value)),
                height: d => Math.round(Math.abs(yScale(max - d.value) - margin)),
                width: Math.round(xScale.rangeBand())
            });

            // Add the labels
            let labels = this.svg.selectAll(".labels").data(dataPoints);
            labels.enter().append("text").classed("labels", true);
            labels.exit().remove();
            labels
                .text(d => d.label)
                .attr({
                    x: d => Math.round(xScale(d.category)),
                    y: d => Math.round(yScale(d.value) - 10),
                })
                .style("font-family", "Segoe UI")
                .style("font-size", "12")
                .style("font-weight", "normal");
        }

        private static parseSettings(dataView: DataView): VisualSettings {
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
        }
    }
    interface DataPoint {
        value: number;
        label: string;
        category: string;
        labelWidth: number;
    }
}