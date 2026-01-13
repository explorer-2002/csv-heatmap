
## Project Setup

This Project is created using React + Vite + Typescript, it's a mini project in which we can parse csv data from csv files
and display it in the form of a table in the form of a heat map.

How to run locally

```js
npm install
npm run dev
```

Project will be visible at

```js
http://localhost:5173
```

## Library Usage

papaparse - for parsing csv files
material-react-table - for Displaying Parsed CSV data in a table
lucide-react - for icons
tailwind css - for styling

## Solution Approach and Logic

File Upload


Using an input field to Upload files, accepting csv files only

Applied validation if the uploaded file is not csv file, throwing an error

Also applied validation for the csv content, if the csv doesn't include the required fields,
throwing an error message to the user that some required fields are missing in the csv.


Table and Heat Map Logic

The data table is constructed using Material React Table which has the following advantages

    -  Unlike "headless" libraries where you have to build every row and cell manually, MRT comes with 
    
       almost every data-grid feature pre-wired.

    -  Includes built in virtualization which helps in rendering thousands of rows efficiently

    - Minimizes Re-renders

    - Less Boilerplate

    - Typescript support

Heatmap logic 

    This function applies relative heatmap styling to highlight cost differences within a single row.

    -  Contextual: Compares a cell's value against the Minimum (best) and Maximum (worst) rates in that

       specific row

    -  Gradient Logic: Interpolates colors across a 5-stop scale:

       🟢 Low Rates: Green (0%)
       🟡 Mid Rates: Yellow to Orange
       🔴 High Rates: Red (100%)

    ```js
      function getSupplierRateColorRelativeInRow(
        value: number,
        allRatesInRow: number[],
      ): { bgColor: string; textColor: string } {
      if (!Array.isArray(allRatesInRow) || allRatesInRow.length === 0) {
        return { bgColor: '#E8F5E9', textColor: '#1F2937' }; // light green with dark text
      }

      const validRates = allRatesInRow.filter((n) => isFinite(n));
      if (validRates.length === 0) {
        return { bgColor: '#E8F5E9', textColor: '#1F2937' };
      }

      const min = Math.min(...validRates);
      const max = Math.max(...validRates);

      if (!isFinite(value) || max === min) {
        return { bgColor: '#E8F5E9', textColor: '#1F2937' }; // fallback/lightest for corner cases
      }
      // Ratio: 0 for min (lightest), 1 for max (darkest)
      const ratio = (value - min) / (max - min);

      // Multi-stop color gradient: Light green → Yellow → Orange → Light red → Dark red
      // Color stops with RGB values
      const colorStops = [
        { stop: 0.0, rgb: [232, 245, 233] },   // #E8F5E9 - Light green
        { stop: 0.25, rgb: [255, 249, 196] },  // #FFF9C4 - Yellow
        { stop: 0.5, rgb: [255, 183, 77] },    // #FFB74D - Orange
        { stop: 0.75, rgb: [239, 83, 80] },    // #EF5350 - Light red
        { stop: 1.0, rgb: [198, 40, 40] },     // #C62828 - Dark red
      ];

      // Find which two color stops to interpolate between
      let startStop = colorStops[0];
      let endStop = colorStops[colorStops.length - 1];

      for (let i = 0; i < colorStops.length - 1; i++) {
          if (ratio >= colorStops[i].stop && ratio <= colorStops[i + 1].stop) {
            startStop = colorStops[i];
            endStop = colorStops[i + 1];
            break;
      }
    }

    // Calculate interpolation factor within the current segment
    const segmentRange = endStop.stop - startStop.stop;
    const segmentRatio = segmentRange > 0 
      ? (ratio - startStop.stop) / segmentRange 
      : 0;

    // Interpolate between the two color stops
    function interpolateColor(start: number[], end: number[], t: number): number[] {
      return start.map((s, i) => Math.round(s + (end[i] - s) * t));
    }

    const [r, g, b] = interpolateColor(startStop.rgb, endStop.rgb, segmentRatio);
    const bgColor = `rgb(${r},${g},${b})`;
    const textColor = getTextColorForBackground(r, g, b);

    return { bgColor, textColor };
  }
    ```

 Required Fields for Validating parsed csv data

   - Item Code
   - Estimated Rate
   - Quantity
   - Supplier 1 (Rate)
   - Supplier 2 (Rate)
   - Supplier 3 (Rate)
   - Supplier 4 (Rate)
   - Supplier 5 (Rate)

## Scope for Improvement

   - Validation Logic can be made more generalized and robust to not check for particular column names but  
   
     their types only

   - Logic for generating color coding for heatmap can be made more generalized and dynamic to generate the

     colors dynamically based on the number of columns ( instead of using fixed number of color stops )

   - Writing tests to improve reliability

   - Through testing in different browsers to ensure that the entire functionality works as expected

     also we can test for different devices.

   - Making the table UI responsive for mobile devices also. 
     










