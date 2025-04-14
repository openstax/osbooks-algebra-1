window.addEventListener("load", async () => {
  // Hide page while everything loads.
  document.body.style.visibility = "hidden";

  // Load parameters
  const {
    disableExpressions = false,
    width = "500",
    height = "400",
    equations = "[]",
    scaleTop = "10",
    scaleBottom = "-10",
    scaleRight = "10",
    scaleLeft = "-10",
    tables = "[]",
  } = window.parameters;
  const equationsArray = JSON.parse(equations);
  const tablesArray = JSON.parse(tables);

  // Load
  document.body.innerHTML = `\
  <style>
    body {
      margin: 0;
      padding: 0;
      overflow: hidden;
    }

    .os-desmos-container {
      display: flex;
      justify-content: center;
    }

    .os-desmos-inner-container {
      margin-bottom: 1rem !important;
    }
  </style>

  <div class="os-desmos-container">
    <div class="os-desmos-inner-container"></div>
  </div>`;

  const loadScript = (url) => {
    return new Promise((resolve) => {
      const scriptElement = document.createElement("script");

      scriptElement.setAttribute("src", url);
      scriptElement.setAttribute("type", "text/javascript");
      scriptElement.addEventListener("load", resolve);

      document.body.appendChild(scriptElement);
    });
  };

  // https://github.com/openstax/k12-apps-raise/blob/64927bd2295c163263a1ea4461aba8c2f9101bda/src/components/DesmosBlock.tsx#L32
  const renderCalculator = (calculatorWrapper) => {
    const options = { expressions: !disableExpressions };
    calculatorWrapper.style.width = `${width}px`;
    calculatorWrapper.style.height = `${height}px`;

    const calculator = Desmos.GraphingCalculator(calculatorWrapper, options);

    tablesArray.forEach((table) => {
      calculator.setExpression({
        type: "table",
        columns: table.map((col) => {
          return { latex: col.variable, values: col.values };
        }),
      });
    });

    equationsArray.forEach((str) => {
      calculator.setExpression({ latex: `${str}` });
    });

    calculator.setMathBounds({
      left: parseFloat(scaleLeft),
      right: parseFloat(scaleRight),
      bottom: parseFloat(scaleBottom),
      top: parseFloat(scaleTop),
    });

    // Set the default state explicitly to what was configured so users can
    // easily reset the graph equations and bounds in the rendered UI
    calculator.setDefaultState(calculator.getState());
  };

  const demoApiKey = "dcb31709b452b1cf9dc26972add0fda6";
  await loadScript(
    `https://www.desmos.com/api/v1.7/calculator.js?apiKey=${demoApiKey}`,
  );
  renderCalculator(document.querySelector(".os-desmos-inner-container"));

  document.body.style.visibility = "visible";
});
