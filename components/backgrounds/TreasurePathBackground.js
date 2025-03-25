import React, { useEffect, useRef } from "react";

const TreasurePathBackground = () => {
  const svgRef = useRef(null);

  useEffect(() => {
    const path = svgRef.current.querySelector("path");
    const lines = svgRef.current.querySelectorAll("line");

    // Animate path first
    const pathLength = path.getTotalLength();
    path.style.strokeDasharray = pathLength;
    path.style.strokeDashoffset = pathLength;

    const pathAnimation = path.animate(
      [
        { strokeDashoffset: pathLength },
        { strokeDashoffset: 0 },
      ],
      {
        duration: 2000,
        fill: "forwards",
        easing: "ease-in-out",
      }
    );

    // Hide lines initially
    lines.forEach((line) => {
      line.style.opacity = 0;
    });

    // Animate lines (X) sequentially after path finishes
    pathAnimation.onfinish = () => {
      lines.forEach((line, index) => {
        const lineLength = line.getTotalLength();
        line.style.strokeDasharray = lineLength;
        line.style.strokeDashoffset = lineLength;

        setTimeout(() => {
          line.style.opacity = 1; // Make line visible just before animating
          line.animate(
            [
              { strokeDashoffset: lineLength },
              { strokeDashoffset: 0 },
            ],
            {
              duration: 500,
              fill: "forwards",
              easing: "ease-in-out",
            }
          );
        }, index * 100); // stagger the lines' start times
      });
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <svg
        ref={svgRef}
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1470 840"
        className="w-full h-full"
      >
        <style type="text/css">
          {`.st0, .st1 { fill: none; stroke: #FFFFFF; stroke-miterlimit: 10; }`}
        </style>
        <g>
          <g>
            <g>
              <path
                className="st1"
                d="M83.75,726.69C48.83,463.81,277.44,293.9,326.5,275.5c208-78,151.61,279.19,363,432
                  c166,120,357.48,78.77,464,13c149-92,186-286,129-412c-43.89-97.02-160-229-366-153c-200.1,73.82-300.64,505.31-469,584
                  c-179.69,83.99-355.41-184.77-336-421c9.28-113.02,114.23-243.7,228-247c207.84-6.03,269.75,418.12,498,452
                  c116.34,17.27,279.83-66.27,509.59-428.84"
              />
            </g>
          </g>
          <line className="st0" x1="1360.83" y1="49.98" x2="1382.85" y2="72" />
          <line className="st0" x1="1359.57" y1="72.44" x2="1382.48" y2="49.53" />
        </g>
      </svg>
    </div>
  );
};

export default TreasurePathBackground;