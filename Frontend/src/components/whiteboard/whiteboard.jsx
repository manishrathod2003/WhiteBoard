import React, { useRef, useEffect, useState, useCallback, useContext } from "react";
import axios from "axios";
import "./Whiteboard.css";
import { useAuth } from "@clerk/clerk-react";
import { StoreContext } from "../../Context/StoreContext";
import { io } from "socket.io-client";

const Whiteboard = ({ boardId, name }) => {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState("pen");
    const [color, setColor] = useState("#000000");
    const [lineWidth, setLineWidth] = useState(3);
    const [history, setHistory] = useState([]);
    const startPointRef = useRef(null);
    const pathRef = useRef([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const { getToken } = useAuth()
    const { url, whiteboards, refreshWhiteboards, setWhiteboards, isAuthenticated, setIsAuthenticated } = useContext(StoreContext)
    const [passcode, setPasscode] = useState("");
    const [error, setError] = useState("");
    const [showJoin, setShowJoin] = useState(false)


    const socket = io("http://localhost:5000", {
        transports: ["websocket", "polling"],  // Ensure both transports are available
        withCredentials: true,  // If using cookies for authentication
    });

    socket.on("connect", () => {
        console.log("Connected to server:", socket.id);
    });

    socket.on("connect_error", (err) => {
        console.error("WebSocket Connection Error:", err.message);
    });

    const handleJoinBoard = () => {

    };



    const saveWhiteboard = async () => {
        try {
            setIsSaving(true);
            setSaveError(null);

            const canvas = canvasRef.current;
            const imageDataUrl = canvas.toDataURL('image/png');

            const payload = {
                name,
                imageData: imageDataUrl,
                createdAt: new Date().toISOString(),
                tool: tool,
                color: color,
                lineWidth: lineWidth
            };

            const token = await getToken()

            const response = await axios.post(url + '/whiteboard/save', payload, {
                headers: { token }
            });

            if (response.data.success) {
                // Optimistically update the local state
                const newBoard = {
                    ...response.data.whiteboard,
                    imageData: imageDataUrl
                };

                setWhiteboards(prevBoards => [...prevBoards, newBoard]);
                refreshWhiteboards();
                alert('Whiteboard saved successfully!');
            }
        } catch (error) {
            console.error('Error saving whiteboard:', error);
            setSaveError('Failed to save whiteboard. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const updateWhiteboard = async (id) => {
        try {
            setIsSaving(true);
            setSaveError(null);

            const canvas = canvasRef.current;
            const imageDataUrl = canvas.toDataURL('image/png');

            const payload = {
                id,
                imageData: imageDataUrl,
                lastModified: new Date().toISOString(),
                tool: tool,
                color: color,
                lineWidth: lineWidth
            };

            const token = await getToken()

            const response = await axios.post(url + '/whiteboard/update', payload, {
                headers: { token }
            });

            if (response.data.success) {
                // Optimistically update the local state
                setWhiteboards(prevBoards =>
                    prevBoards.map(board =>
                        board._id === id
                            ? { ...board, imageData: imageDataUrl, lastModified: new Date().toISOString() }
                            : board
                    )
                );
                refreshWhiteboards();
                alert(response.data.message);
            }
        } catch (error) {
            console.error('Error updating whiteboard:', error);
            setSaveError('Failed to update whiteboard. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }

    const deleteWhiteboard = async (id) => {
        try {
            setIsSaving(true);
            setSaveError(null);

            const token = await getToken()

            const response = await axios.post(url + '/whiteboard/delete', { id }, {
                headers: { token }
            });

            if (response.data.success) {
                // Optimistically remove the board from local state
                setWhiteboards(prevBoards =>
                    prevBoards.filter(board => board._id !== id)
                );
                refreshWhiteboards();
                alert(response.data.message);

                // Clear the canvas
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        } catch (error) {
            console.error('Error deleting whiteboard:', error);
            setSaveError('Failed to delete whiteboard. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }

    const activeWhiteboard = whiteboards.find(board => board._id === boardId);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth * 0.8;
        canvas.height = window.innerHeight * 0.7;

        const ctx = canvas.getContext("2d");
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctxRef.current = ctx;

        // If a whiteboard exists, load its saved image
        if (activeWhiteboard && activeWhiteboard.imageData) {
            loadWhiteboard(activeWhiteboard.imageData);
        }

        socket.emit("joinBoard", { boardId }, (response) => {
            console.log("Server response:", response);
            if (response.success) {
                setIsAuthenticated(true);
                setError("");
            } else {
                setError(response.message || "Unable to join the board.");
            }
            setShowJoin(false);
        });
        return () => {
            socket.off("draw");
        };
    }, [activeWhiteboard]);

    const loadWhiteboard = (imageData) => {
        const img = new Image();
        img.src = imageData;
        img.onload = () => {
            const canvas = canvasRef.current;
            const ctx = ctxRef.current;

            // Ensure existing drawings stay while loading
            ctx.drawImage(img, 0, 0);
        };
    };
    // Function to fetch saved whiteboards

    // Sanitize color input
    const sanitizeColor = (inputColor) => {
        // Ensure color is a valid hex color
        const hexColor = /^#([0-9A-Fa-f]{6})$/.test(inputColor)
            ? inputColor
            : "#000000";
        return hexColor;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth * 0.8;
        canvas.height = window.innerHeight * 0.7;

        const ctx = canvas.getContext("2d");
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctxRef.current = ctx;

        if (activeWhiteboard && activeWhiteboard.imageData) {
            loadWhiteboard(activeWhiteboard.imageData);
        }
    }, [activeWhiteboard]); // Problem: This runs on every change of activeWhiteboard

    // Update drawing properties
    useEffect(() => {
        if (ctxRef.current) {
            ctxRef.current.lineWidth = lineWidth;
            ctxRef.current.strokeStyle = sanitizeColor(color);
        }
    }, [lineWidth, color]);

    const saveInitialState = () => {
        const canvas = canvasRef.current;
        const initialState = canvas.toDataURL();
        setHistory([initialState]);
    };

    const startDrawing = useCallback((e) => {
        const { offsetX, offsetY } = e.nativeEvent;
        const ctx = ctxRef.current;

        startPointRef.current = { x: offsetX, y: offsetY };
        setIsDrawing(true);

        // Reset path for pen drawing
        pathRef.current = [{ x: offsetX, y: offsetY }];

        switch (tool) {
            case "pen":
                ctx.beginPath();
                ctx.moveTo(offsetX, offsetY);
                break;
            case "rectangle":
            case "circle":
            case "line":
                ctx.beginPath();
                ctx.moveTo(offsetX, offsetY);
                break;
        }
    }, [tool]);

    const draw = useCallback((e) => {
        if (!isDrawing) return;

        const { offsetX, offsetY } = e.nativeEvent;
        const ctx = ctxRef.current;
        const startPoint = startPointRef.current;

        // Clear the entire canvas and redraw the last saved state
        if (history.length > 0) {
            const lastState = history[history.length - 1];
            const img = new Image();
            img.src = lastState;

            // Synchronously clear and redraw previous state
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.drawImage(img, 0, 0);
        }

        // Set drawing properties
        ctx.strokeStyle = sanitizeColor(color);
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        switch (tool) {
            case "pen":
                // Draw the entire path
                if (pathRef.current.length > 0) {
                    ctx.beginPath();
                    ctx.moveTo(pathRef.current[0].x, pathRef.current[0].y);
                    pathRef.current.forEach(point => {
                        ctx.lineTo(point.x, point.y);
                    });
                    // Add current point
                    ctx.lineTo(offsetX, offsetY);
                    pathRef.current.push({ x: offsetX, y: offsetY });
                    ctx.stroke();
                }
                break;
            case "rectangle":
                ctx.beginPath();
                ctx.strokeRect(
                    startPoint.x,
                    startPoint.y,
                    offsetX - startPoint.x,
                    offsetY - startPoint.y
                );
                break;
            case "circle":
                ctx.beginPath();
                const radius = Math.sqrt(
                    Math.pow(offsetX - startPoint.x, 2) +
                    Math.pow(offsetY - startPoint.y, 2)
                );
                ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
                ctx.stroke();
                break;
            case "line":
                ctx.beginPath();
                ctx.moveTo(startPoint.x, startPoint.y);
                ctx.lineTo(offsetX, offsetY);
                ctx.stroke();
                break;
        }

        socket.emit("draw", { boardId, x: offsetX, y: offsetY });
    }, [isDrawing, tool, color, lineWidth, history]);

    const stopDrawing = useCallback((e) => {
        if (!isDrawing) return;

        const { offsetX, offsetY } = e.nativeEvent;
        const ctx = ctxRef.current;
        const startPoint = startPointRef.current;

        switch (tool) {
            case "pen":
                // Ensure the final drawing is saved
                ctx.beginPath();
                if (pathRef.current.length > 0) {
                    ctx.moveTo(pathRef.current[0].x, pathRef.current[0].y);
                    pathRef.current.forEach(point => {
                        ctx.lineTo(point.x, point.y);
                    });
                    ctx.stroke();
                }
                break;
            case "rectangle":
                ctx.strokeRect(
                    startPoint.x,
                    startPoint.y,
                    offsetX - startPoint.x,
                    offsetY - startPoint.y
                );
                break;
            case "circle":
                const radius = Math.sqrt(
                    Math.pow(offsetX - startPoint.x, 2) +
                    Math.pow(offsetY - startPoint.y, 2)
                );
                ctx.beginPath();
                ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
                ctx.stroke();
                break;
            case "line":
                ctx.beginPath();
                ctx.moveTo(startPoint.x, startPoint.y);
                ctx.lineTo(offsetX, offsetY);
                ctx.stroke();
                break;
        }

        setIsDrawing(false);
        saveHistory();
        startPointRef.current = null;
        pathRef.current = [];
    }, [isDrawing, tool]);

    const saveHistory = () => {
        const canvas = canvasRef.current;
        const currentState = canvas.toDataURL();
        setHistory(prevHistory => [...prevHistory, currentState]);
    };

    const undo = () => {
        if (history.length <= 1) return;

        const newHistory = history.slice(0, -1);
        setHistory(newHistory);

        const previousState = newHistory[newHistory.length - 1];
        const img = new Image();
        img.src = previousState;
        img.onload = () => {
            const canvas = canvasRef.current;
            const ctx = ctxRef.current;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);

        const emptyCanvasState = canvas.toDataURL();
        setHistory([emptyCanvasState]);
    };

    const handleColorChange = (e) => {
        const newColor = sanitizeColor(e.target.value);
        setColor(newColor);
    };

    useEffect(() => {
        if (isAuthenticated) {
            socket.on("draw", (data) => {
                const ctx = canvasRef.current.getContext("2d");
                ctx.lineTo(data.x, data.y);
                ctx.stroke();
            });

            return () => socket.off("draw");
        }
    }, [isAuthenticated]);

    return (
        <div className="whiteboard-container">
            <div className="toolbar">
                <button
                    className={tool === "pen" ? "active" : ""}
                    onClick={() => setTool("pen")}
                >
                    ✏ Pen
                </button>
                <button
                    className={tool === "line" ? "active" : ""}
                    onClick={() => setTool("line")}
                >
                    ➖ Line
                </button>
                <button
                    className={tool === "rectangle" ? "active" : ""}
                    onClick={() => setTool("rectangle")}
                >
                    🟥 Rectangle
                </button>
                <button
                    className={tool === "circle" ? "active" : ""}
                    onClick={() => setTool("circle")}
                >
                    ⭕ Circle
                </button>
                <button onClick={undo} disabled={history.length <= 1}>↩ Undo</button>
                <button onClick={clearCanvas}>🗑 Clear</button>
                <input
                    type="color"
                    value={color}
                    onChange={handleColorChange}
                />
                <input
                    type="range"
                    min="1"
                    max="10"
                    value={lineWidth}
                    onChange={(e) => setLineWidth(Number(e.target.value))}
                />

                {activeWhiteboard?.["_id"] ? (
                    <button
                        onClick={() => updateWhiteboard(activeWhiteboard._id)}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Updating...' : '💾 Update'}
                    </button>
                ) : (
                    <button
                        onClick={() => saveWhiteboard()}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : '💾 Save'}
                    </button>
                )}

                <button
                    onClick={() => deleteWhiteboard(activeWhiteboard._id)}
                    disabled={isSaving}
                >
                    {isSaving ? 'Deleting...' : '💾 Delete'}
                </button>
                <button onClick={() => setShowJoin(true)} >
                    Join
                </button>
                {showJoin &&
                    <div className="passcode-popup-overlay">
                        <div className="passcode-container">
                            <h2>Enter Passcode to Access Whiteboard</h2>
                            <input
                                type="password"
                                placeholder="Enter Passcode"
                                value={passcode}
                                onChange={(e) => setPasscode(e.target.value)}
                            />
                            <button onClick={handleJoinBoard}>Submit</button>
                            {error && <p className="error">{error}</p>}
                        </div>
                    </div>

                }

            </div>

            {activeWhiteboard ?
                <div className="whiteboard-container">
                    <canvas ref={canvasRef}
                        className="whiteboard"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseOut={stopDrawing}
                    ></canvas>
                </div>
                :
                <canvas
                    ref={canvasRef}
                    className="whiteboard"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseOut={stopDrawing}
                ></canvas>
            }


        </div>
    );
};

export default Whiteboard;