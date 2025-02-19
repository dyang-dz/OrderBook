import React from "react";
import useWebSocket from "../hooks/useWebSocket";
import OrderRow from "./OrderRow";
import LastPriceDisplay from "./LastPriceDisplay";
import "../styles/OrderBook.css";

/**
 * Helper function to process bids.
 * Sorts bids in descending order, limits to top 8, and accumulates totals.
 * @param {Array} bids - Array of bid objects.
 * @returns {Array} Processed bids with cumulative total.
 */
const processBids = (bids) => {
  // Sort bids by price in descending order and take top 8
  const sortedBids = [...bids].sort((a, b) => b.price - a.price).slice(0, 8);
  let cumulativeTotal = 0;
  // Map over sorted bids to calculate cumulative total
  return sortedBids.map(bid => {
    cumulativeTotal += bid.size;
    return { ...bid, total: cumulativeTotal };
  });
};

/**
 * Helper function to process asks.
 * Sorts asks in ascending order, limits to top 8, and accumulates totals from bottom up.
 * @param {Array} asks - Array of ask objects.
 * @returns {Array} Processed asks with cumulative total.
 */
const processAsks = (asks) => {
  // Sort asks by price in ascending order and take top 8
  const sortedAsks = [...asks].sort((a, b) => a.price - b.price).slice(0, 8);
  let cumulativeTotal = 0;
  // Accumulate ask sizes from highest price to lowest
  for (let i = sortedAsks.length - 1; i >= 0; i--) {
    cumulativeTotal += sortedAsks[i].size;
    sortedAsks[i].total = cumulativeTotal;
  }
  return sortedAsks;
};

/**
 * OrderBook Component - container component that handles data processing and passes
 * the processed data down to presentational components.
 */
export default function OrderBook() {
  // Retrieve order data and price info from the WebSocket hook
  const { bids, asks, lastPrice, priceDirection, clearFlash } = useWebSocket();

  // Process bids and asks separately using helper functions
  const processedBids = processBids(bids);
  const processedAsks = processAsks(asks);

  // Determine maximum totals for UI scaling purposes
  const maxBidTotal = processedBids.length ? processedBids[processedBids.length - 1].total : 1;
  const maxAskTotal = processedAsks.length ? processedAsks[0].total : 1;

  return (
    <div className="orderbook-container">
      <h2 className="orderbook-title">Order Book</h2>

      {/* Asks Table */}
      <div className="asks-table">
        <div className="table-header">
          <div className="price-header">Price (USD)</div>
          <div className="size-header">Size</div>
          <div className="total-header">Total</div>
        </div>
        {processedAsks.map(ask => (
          <OrderRow
            key={ask.price}
            quote={ask}
            side="ask"
            clearFlash={clearFlash}
            maxTotal={maxAskTotal}
          />
        ))}
      </div>

      {/* Display last traded price */}
      <LastPriceDisplay price={lastPrice} direction={priceDirection} />

      {/* Bids Table */}
      <div className="bids-table">
        <div className="table-header">
          <div className="price-header">Price (USD)</div>
          <div className="size-header">Size</div>
          <div className="total-header">Total</div>
        </div>
        {processedBids.map(bid => (
          <OrderRow
            key={bid.price}
            quote={bid}
            side="bid"
            clearFlash={clearFlash}
            maxTotal={maxBidTotal}
          />
        ))}
      </div>
    </div>
  );
}
