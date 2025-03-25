import React, { useEffect, useRef, useState } from "react";

// Unused background animation component


const svgOptions = [
  {
    viewBox: "0 0 1354.97 707.19",
    path: `M3.26,38.43c-38,631,327.84,614.81,378,596,208-78,30.61-749.81,242-597,166,120,489.48,642.77,596,577C1368.26,522.43,1089.26-1.57,981.26,75.43c-86.71,61.82,152,544-54,620-200.1,73.82-157.64-242.69-326-164C421.57,615.42-41.54,41.4,192.26,2.43c270-45-127.43,711.41-14,702,146.93-12.19-127.13-476.97,428-410,117.85,14.22,491.87,297.18,725-74`,
    lines: [
      { x1: 1332.59, y1: 179.91, x2: 1354.61, y2: 201.93 },
      { x1: 1331.33, y1: 202.37, x2: 1354.24, y2: 179.46 },
    ],
  },
  {
    viewBox: "0 0 1303.57 731.73",
    path: `M6.86,695.32C-41.14,422.32,196.7,245.13,246.86,226.32c208-78,143.61-321.81,355-169,166,120,230.48,734.77,337,669,149-92,392-81,335-207-43.89-97.02-158-162-364-86-200.1,73.82-373.64,178.31-542,257C188.17,774.31,12.45,505.55,31.86,269.32c9.28-113.02,62.23-191.7,176-195,207.84-6.03-173.25,384.12,55,418,117.42,17.43,777.87-85.82,1011-457`,
    lines: [
      { x1: 1281.19, y1: 0.8, x2: 1303.21, y2: 22.82 },
      { x1: 1279.93, y1: 23.26, x2: 1302.84, y2: 0.35 },
    ],
  },
  {
    viewBox: "0 0 1304.07 706.23",
    path: `M5.36,669.83c-48-273,273.84-242.19,324-261,208-78,59.61-529.81,271-377,166,120,230.48,734.77,337,669,149-92,365-453,308-579-43.89-97.02-166,509-630,262-188.27-100.22-80.64,202.31-249,281C186.67,748.81,10.96,480.06,30.36,243.83c9.28-113.02,62.23-191.7,176-195,207.84-6.03,429.75-50.88,658-17,117.42,17.43,364,405,416,597`,
    lines: [
      { x1: 1281.69, y1: 638.3, x2: 1303.72, y2: 660.33 },
      { x1: 1280.44, y1: 660.76, x2: 1303.34, y2: 637.86 },
    ],
  },
];

const TreasurePathBackground = () => {
  const svgRef = useRef(null);
  const [selectedSvg, setSelectedSvg] = useState(null);

  useEffect(() => {
    // Pick one SVG randomly
    const chosen = svgOptions[Math.floor(Math.random() * svgOptions.length)];
    setSelectedSvg(chosen);
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const path = svgRef.current.querySelector("path");
    const lines = svgRef.current.querySelectorAll("line");

    const pathLength = path.getTotalLength();
    path.style.strokeDasharray = pathLength;
    path.style.strokeDashoffset = pathLength;

    const pathAnimation = path.animate(
      [{ strokeDashoffset: pathLength }, { strokeDashoffset: 0 }],
      {
        duration: 2000,
        fill: "forwards",
        easing: "ease-in-out",
      }
    );

    lines.forEach((line) => {
      line.style.opacity = 0;
    });

    pathAnimation.onfinish = () => {
      lines.forEach((line, index) => {
        const lineLength = line.getTotalLength();
        line.style.strokeDasharray = lineLength;
        line.style.strokeDashoffset = lineLength;

        setTimeout(() => {
          line.style.opacity = 1;
          line.animate(
            [{ strokeDashoffset: lineLength }, { strokeDashoffset: 0 }],
            {
              duration: 500,
              fill: "forwards",
              easing: "ease-in-out",
            }
          );
        }, index * 100);
      });
    };
  }, [selectedSvg]);

  if (!selectedSvg) return null;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <svg
        ref={svgRef}
        viewBox={selectedSvg.viewBox}
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <style>{`.cls-1 { fill: none; stroke: #FFFFFF; stroke-miterlimit: 10; }`}</style>
        <path className="cls-1" d={selectedSvg.path} />
        {selectedSvg.lines.map((line, idx) => (
          <line
            key={idx}
            className="cls-1"
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
          />
        ))}
      </svg>
    </div>
  );
};

export default TreasurePathBackground;