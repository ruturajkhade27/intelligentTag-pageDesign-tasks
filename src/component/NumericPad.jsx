import React, { useState, useEffect } from "react";

export default function NumericPad({
  visible,
  initialValue = "",
  max = Infinity,
  onClose,
  onApply,
  title = "Enter the amount of EasyDine to use",
}) {
  const [value, setValue] = useState(initialValue?.toString() || "");
  const [error, setError] = useState("");

  useEffect(() => {
    setValue(initialValue?.toString() || "");
    setError("");
  }, [initialValue, visible]);

  if (!visible) return null;

  function pushDigit(d) {
    if (d === "." && value.includes(".")) return;
    if (value.includes(".") && value.split(".")[1].length >= 2) return; // max 2 decimals
    if (value === "0" && d !== ".") setValue(d);
    else setValue((v) => (v === "" && d === "." ? "0." : v + d));
    setError("");
  }

  function backspace() {
    setValue((v) => v.slice(0, -1));
    setError("");
  }

  function clearAll() {
    setValue("");
    setError("");
  }

  function apply() {
    const num = parseFloat(value || "0");
    if (isNaN(num)) {
      setError("Invalid number");
      return;
    }
    const rounded = Math.round(num * 100) / 100;
    if (rounded > max + 0.0001) {
      setError(`Exceeds available EasyDine balance`);
      return;
    }
    setError("");
    onApply(rounded);
    onClose();
  }

  const keys = ["7","8","9","4","5","6","1","2","3",".","0"];

  return (
    <div className="np-overlay">
      <button className="np-close" onClick={onClose} aria-label="close">✕</button>
      <div className="np-modal">
        <div className="np-header-row">
          <div className="np-header-title">{title}</div>
        </div>

        <div className="np-display">
          <div className="np-sub">Available Balance: ${Number(max).toFixed(2)}</div>
          <div className="np-error-top" style={{ display: error ? "block" : "none" }}>
            {error}
          </div>
          <div className="np-value">${value === "" ? "0.00" : value}</div>
        </div>

        <div className="np-pad-grid">
          {keys.map((k) => (
            <button key={k} className="np-key" onClick={() => pushDigit(k)}>{k}</button>
          ))}

          <button className="np-key np-back" onClick={backspace} aria-label="backspace">⌫</button>
        </div>
      </div>
      <div className="np-actions">
          <button className="np-apply" onClick={apply}>Done</button>
      </div>
    </div>
  );
}
