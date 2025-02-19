import React from "react";
import "../styles/OrderBook.css";

// Retrieve arrow image URL from the environment variable
const ARROW_URL = "https://img.notionusercontent.com/s3/prod-files-secure%2Ffc9ba8a0-5718-48bf-8a98-e6937e8130a5%2Fd0131074-1581-4d4f-b194-7da5deaa736e%2FIconArrowDown.svg/size/?exp=1740057766&sig=2_iVxqH2FQQVTZoAExEq-csETZeakzh7MelbMrASPk0";

/**
 * Determines the display styles based on the price direction.
 *
 * @param {string} direction - The price movement direction ("up", "down", or other).
 * @returns {object} An object containing the CSS class name, arrow rotation, and arrow filter.
 */
const getPriceDisplayStyle = (direction) => {
  let className = "last-price same"; // Default style when direction is unchanged
  let arrowRotation = ""; // Default arrow rotation (no rotation)
  let arrowFilter = "brightness(0) invert(1)"; // Default arrow filter (grey appearance)

  if (direction === "up") {
    className = "last-price up";
    arrowRotation = "rotate(180deg)";
    // Arrow filter for green color when price increases
    arrowFilter =
      "brightness(0) saturate(100%) invert(48%) sepia(45%) saturate(331%) hue-rotate(95deg) brightness(91%) contrast(89%)";
  } else if (direction === "down") {
    className = "last-price down";
    arrowRotation = "rotate(0deg)";
    // Arrow filter for red color when price decreases
    arrowFilter =
      "brightness(0) saturate(100%) invert(39%) sepia(85%) saturate(541%) hue-rotate(330deg) brightness(99%) contrast(89%)";
  }

  return { className, arrowRotation, arrowFilter };
};

/**
 * LastPriceDisplay Component
 *
 * This presentational component displays the last price along with an arrow icon
 * that indicates the direction of price movement. The styling logic is abstracted
 * into a separate helper function to enhance maintainability.
 *
 * @param {object} props - Component properties.
 * @param {number} props.price - The last traded price.
 * @param {string} props.direction - The direction of the price movement ("up" or "down").
 * @returns {JSX.Element} Rendered component.
 */
export default function LastPriceDisplay({ price, direction }) {
  // Get the CSS class and arrow styling based on the price direction
  const { className, arrowRotation, arrowFilter } = getPriceDisplayStyle(direction);

  return (
    <div className={className}>
      <span>{price ? price.toLocaleString() : "--"}</span>
      {arrowRotation && (
        <img
          src={ARROW_URL}
          alt="Arrow"
          className="arrow-icon"
          style={{
            filter: arrowFilter,
            transform: arrowRotation,
            transition: "transform 0.3s ease"
          }}
        />
      )}
    </div>
  );
}
