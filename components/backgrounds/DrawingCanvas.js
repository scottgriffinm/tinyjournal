import React, { useRef, useEffect, useState } from "react";
import { getCache, setCache } from "../../lib/localStorageCache";
import { Pencil, Eraser } from "lucide-react";

const DrawingCanvas = ({ page, controls }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState(null); // 'draw', 'erase', or null
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
    const [hasMoved, setHasMoved] = useState(false);
    const [penSize, setPenSize] = useState(10);
    const CACHE_KEY = `canvasDrawing_${page}`;

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const saved = getCache(CACHE_KEY);
        if (saved) {
            const img = new Image();
            img.src = saved;
            img.onload = () => ctx.drawImage(img, 0, 0);
        }
    }, []);

    const startDrawing = (e) => {
        if (!tool) return;
        const { offsetX, offsetY } = e.nativeEvent;
        setLastPos({ x: offsetX, y: offsetY });
        setIsDrawing(true);
        setHasMoved(false);
    };

    const draw = (e) => {
        if (!isDrawing || !tool) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const { offsetX, offsetY } = e.nativeEvent;

        ctx.beginPath();
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(offsetX, offsetY);
        ctx.lineCap = "round";

        if (tool === "erase") {
            ctx.globalCompositeOperation = "destination-out";
            ctx.lineWidth = 100;
        } else {
            ctx.globalCompositeOperation = "source-over";
            ctx.strokeStyle = "white";
            ctx.lineWidth = penSize;
        }

        ctx.stroke();
        ctx.closePath();
        setLastPos({ x: offsetX, y: offsetY });
        setHasMoved(true);
    };

    const endDrawing = () => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (!hasMoved) {
            ctx.beginPath();
            const radius = tool === "erase" ? 15 : penSize / 2;
            ctx.arc(lastPos.x, lastPos.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = tool === "erase" ? "rgba(0,0,0,1)" : "white";
            ctx.globalCompositeOperation = tool === "erase" ? "destination-out" : "source-over";
            ctx.fill();
            ctx.closePath();
        }

        setIsDrawing(false);
        setHasMoved(false);
        setCache(CACHE_KEY, canvas.toDataURL());
    };

    const toggleTool = (selectedTool) => {
        setTool((prev) => (prev === selectedTool ? null : selectedTool));
    };

    return (
        <>
            <canvas
                ref={canvasRef}
                className="fixed top-0 left-0 z-0"
                style={{ pointerEvents: "auto" }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
            />

            {/* Toolbar with Drawing Controls */}
            {controls && (
            <div className="fixed bottom-2 right-2 z-50 group">
                <div className="flex items-center space-x-3 bg-neutral-900/80 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
                    {/* Pencil with conditional slider */}
                    <div className="relative group flex items-center justify-center">
                        {tool === "draw" && (
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2">
                                <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <div className="flex justify-center bg-neutral-800 px-3 py-3 rounded-lg shadow-lg">
                                        <input
                                            type="range"
                                            min="1"
                                            max="50"
                                            value={penSize}
                                            onChange={(e) => setPenSize(parseInt(e.target.value))}
                                            className="h-28 w-2 appearance-none bg-transparent cursor-pointer"
                                            style={{
                                                writingMode: "bt-lr",
                                                WebkitAppearance: "slider-vertical",
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Invisible hover bridge */}
                                <div className="absolute top-full left-0 w-full h-2 pointer-events-auto group-hover:block" />
                            </div>
                        )}

                        {/* Pencil Button */}
                        <button
                            onClick={() => toggleTool("draw")}
                            className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${
                                tool === "draw"
                                    ? "bg-neutral-500"
                                    : "bg-neutral-700 hover:bg-neutral-600"
                            }`}
                        >
                            <Pencil className="text-white w-5 h-5" />
                        </button>
                    </div>

                    {/* Eraser Button */}
                    <button
                        onClick={() => toggleTool("erase")}
                        className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${
                            tool === "erase"
                                ? "bg-neutral-500"
                                : "bg-neutral-700 hover:bg-neutral-600"
                        }`}
                    >
                        <Eraser className="text-white w-5 h-5" />
                    </button>
                </div>
            </div> 
        )}
        </>
    );
};

export default DrawingCanvas;