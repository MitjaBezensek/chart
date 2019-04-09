module powerbi.extensibility.visual.helpers {
    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;
    const BILLION = 1e9;
    const MILLION = 1e6;
    const THOUSAND = 1e3;
    const ONE = 1;

    export function getDataLabel(value: number, decimalPlaces: number, displayUnits: string, locale: string, percentageFormat?: string, hideUnits: boolean = false): string {
        if (value == null) {
            return "";
        }
        let format = "#,0";
        if (percentageFormat && !hideUnits) {
            format = percentageFormat;
        }
        if (percentageFormat && percentageFormat.indexOf("%") === -1) {
            value = value * 100;
        }
        let formatter: IValueFormatter;

        switch (displayUnits) {
            case "Auto":
                let v = Math.abs(value);
                if (v > BILLION) {
                    formatter = valueFormatter.create({ cultureSelector: locale, value: BILLION, precision: decimalPlaces, format: format });
                    break;
                }
                else if (v > MILLION) {
                    formatter = valueFormatter.create({ cultureSelector: locale, value: MILLION, precision: decimalPlaces, format: format });
                    break;
                }
                else if (v > THOUSAND) {
                    formatter = valueFormatter.create({ cultureSelector: locale, value: THOUSAND, precision: decimalPlaces, format: format });
                    break;
                }
                else {
                    formatter = valueFormatter.create({ cultureSelector: locale, value: ONE, precision: decimalPlaces, format: format });
                    if (percentageFormat) {
                        // for percentage format value should not be rounded with .toFixed(decimalPlaces) so we return here.
                        return formatter.format(value);
                    }
                    break;
                }
            case "G":
                formatter = valueFormatter.create({ cultureSelector: locale, value: BILLION, precision: decimalPlaces, format: format });
                break;
            case "M":
                formatter = valueFormatter.create({ cultureSelector: locale, value: MILLION, precision: decimalPlaces, format: format });
                break;
            case "K":
                formatter = valueFormatter.create({ cultureSelector: locale, value: THOUSAND, precision: decimalPlaces, format: format });
                break;
            case "Relative":
                formatter = valueFormatter.create({ cultureSelector: locale, value: ONE, precision: decimalPlaces, format: format });
                break;
            case "None":
                formatter = valueFormatter.create({ cultureSelector: locale, value: ONE, precision: decimalPlaces, format: format });
                break;
            case "P":
                formatter = valueFormatter.create({ cultureSelector: locale, value: ONE, precision: decimalPlaces, format: format });
                if (formatter.displayUnit) {
                    formatter.displayUnit.labelFormat = getLabelFormat(hideUnits, displayUnits, Math.abs(value));
                }
                // for percentage format value should not be rounded with .toFixed(decimalPlaces) so we return here. TODO?: check if rounding below is ever needed
                return formatter.format(value);
            default:
                formatter = valueFormatter.create({ cultureSelector: locale, precision: 4 });
                break;
        }

        // it appears that labelFormat property is somehow persisted so it has to be always set even though the formatter is created new every time
        if (formatter.displayUnit) {
            formatter.displayUnit.labelFormat = getLabelFormat(hideUnits, displayUnits, Math.abs(value));
        }

        return formatter.format(+value.toFixed(decimalPlaces));
    }

    function getLabelFormat(hideUnits: boolean, displayUnits: string, value: number): string {
        if (hideUnits) {
            return "{0}";
        }

        if (displayUnits === "M" || displayUnits === "K") {
            return "{0}" + displayUnits;
        }
        else if (displayUnits === "G") {
            return "{0}bn";
        }
        else if (displayUnits === "P") {
            return "{0}%";
        }
        else if (displayUnits === "Auto") {
            if (value > BILLION) {
                return "{0}bn";
            }
            else if (value > MILLION) {
                return "{0}M";
            }
            else if (value > THOUSAND) {
                return "{0}K";
            }
            else {
                return "{0}";
            }
        }
    }

    export function measureTextWidth(text: string, fontSize: number, fontFamily: string, fontWeight: string): number {
        let textProperties = getTextProperties(text, fontSize, fontFamily, fontWeight);
        return textMeasurementService.measureSvgTextWidth(textProperties);
    }

    function getTextProperties(text: string, fontSize: number, fontFamily: string, fontWeight: string): TextProperties {
        return {
            text: text,
            fontSize: `${fontSize}px`,
            fontFamily: fontFamily,
            fontWeight: fontWeight,
        };
    }
}