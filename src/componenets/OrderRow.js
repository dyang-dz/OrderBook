import React, { useEffect, useState, useRef } from "react";
import "../styles/Animations.css";

/**
 * Custom hook to manage flash animations for OrderRow.
 *
 * @param {object} quote - The quote object containing price, size, and flash properties.
 * @param {function} clearFlash - Function to clear flash effects for a given price and flash type.
 * @returns {object} An object with the current flash state for background and size.
 */
function useOrderRowFlash(quote, clearFlash) {
  // Use optional chaining to safely access quote properties
  const [flashActive, setFlashActive] = useState(!!quote?.flashColor);
  const [sizeFlash, setSizeFlash] = useState(null);
  const prevSizeRef = useRef(quote?.size);

  useEffect(() => {
    if (quote?.flashColor) {
      setFlashActive(true);
      const timer = setTimeout(() => {
        clearFlash(quote.price, "flashColor");
        setFlashActive(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [quote?.flashColor, quote?.price, clearFlash]);

  useEffect(() => {
    if (quote?.flashSizeColor) {
      const timer = setTimeout(() => clearFlash(quote.price, "flashSizeColor"), 500);
      return () => clearTimeout(timer);
    }
  }, [quote?.flashSizeColor, quote?.price, clearFlash]);

  useEffect(() => {
    if (prevSizeRef.current !== undefined && quote?.size !== prevSizeRef.current) {
      if (quote.size > prevSizeRef.current) {
        setSizeFlash("green");
      } else if (quote.size < prevSizeRef.current) {
        setSizeFlash("red");
      }
      prevSizeRef.current = quote.size;
      const timer = setTimeout(() => setSizeFlash(null), 500);
      return () => clearTimeout(timer);
    }
  }, [quote?.size]);

  return { flashActive, sizeFlash };
}

/**
 * OrderRow Component
 *
 * This presentational component displays an order row with price, size, and total.
 * It utilizes the useOrderRowFlash hook to handle flash animations based on changes in the quote.
 *
 * @param {object} props - Component properties.
 * @param {object} props.quote - The quote data including price, size, flash properties, and total.
 * @param {string} props.side - The order side ("bid" or "ask") used for styling.
 * @param {function} props.clearFlash - Function to clear flash effects.
 * @param {number} props.maxTotal - The maximum total value for scaling the depth bar.
 * @returns {JSX.Element|null} The rendered OrderRow component or null if quote data is invalid.
 */
export default function OrderRow({ quote, side, clearFlash, maxTotal }) {
  // Always call hooks unconditionally
  const { flashActive, sizeFlash } = useOrderRowFlash(quote, clearFlash);

  // Validate that quote data contains the required numeric values
  if (!quote || typeof quote.price !== "number" || typeof quote.size !== "number") {
    return null;
  }

  // Calculate percentage width for the depth bar based on the quote total and maximum total
  const percentage = maxTotal ? (quote.total / maxTotal) * 100 : 0;

  return (
    <div className={`order-row ${flashActive ? `flash-bg-${quote.flashColor}` : ""}`}>
      <div className="price-cell" style={{ color: side === "bid" ? "#00b15d" : "#FF5B5A" }}>
        {quote.price.toLocaleString() ?? "--"}
      </div>
      <div
        className={`size-cell ${sizeFlash ? `flash-size-${sizeFlash}` : ""} ${
          quote.flashSizeColor ? `flash-size-${quote.flashSizeColor}` : ""
        }`}
      >
        {quote.size.toLocaleString() ?? "--"}
      </div>
      <div className="total-cell">
        <div className="depth-bar" style={{ width: `${percentage}%` }} />
        <span className="total-text">{quote.total.toLocaleString() ?? "--"}</span>
      </div>
    </div>
  );
}
