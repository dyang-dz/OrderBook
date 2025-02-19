import { useState, useEffect } from "react";

/**
 * useWebSocket - Manages websocket connections to update the order book and trade data.
 *
 * Returns an object with:
 *   - bids: Array of bid objects.
 *   - asks: Array of ask objects.
 *   - lastPrice: The most recent trade price.
 *   - priceDirection: Direction of price movement ("up", "down", or "same").
 *   - clearFlash: Function to clear flash effects for a given price level.
 */
export default function useWebSocket() {
  const [orderBook, setOrderBook] = useState({
    bids: {},
    asks: {},
    seqNum: null,
  });
  const [lastPrice, setLastPrice] = useState(null);
  const [priceDirection, setPriceDirection] = useState("same");

  /**
   * applyDelta - Updates order book data based on delta updates.
   *
   * @param {Object} prevQuotes - Existing quotes (keyed by price).
   * @param {Array} updates - Array of updates, e.g., [[price, size], ...].
   * @param {String} side - "bid" or "ask".
   * @returns {Object} The updated quotes object.
   */
  function applyDelta(prevQuotes, updates, side) {
    const updatedQuotes = { ...prevQuotes };

    updates.forEach(([price, size]) => {
      const numericPrice = parseFloat(price);
      const numericSize = parseFloat(size);

      // If size is 0, remove the price level.
      if (numericSize === 0) {
        delete updatedQuotes[numericPrice];
      } else {
        if (!updatedQuotes[numericPrice]) {
          // New price level: add it with a flash effect (green for bid, red for ask).
          updatedQuotes[numericPrice] = {
            price: numericPrice,
            size: numericSize,
            flashColor: side === "bid" ? "green" : "red",
          };
        } else {
          // Existing price level: update size without altering the flashColor.
          updatedQuotes[numericPrice] = {
            ...updatedQuotes[numericPrice],
            price: numericPrice,
            size: numericSize,
          };
        }
      }
    });
    return updatedQuotes;
  }

  /**
   * clearQuoteFlash - Clears a specified flash field for a given price level.
   *
   * @param {Object} quotes - The quotes object.
   * @param {number} price - The price level.
   * @param {string} field - The flash field to clear (e.g., flashColor, flashSizeColor).
   * @returns {Object} The updated quotes object.
   */
  function clearQuoteFlash(quotes, price, field) {
    const updatedQuotes = { ...quotes };
    if (updatedQuotes[price]) {
      updatedQuotes[price] = { ...updatedQuotes[price], [field]: null };
    }
    return updatedQuotes;
  }

  /**
   * clearFlash - Clears the flash effect for a specified price and field
   * across both bids and asks.
   *
   * @param {number} price - The price level.
   * @param {string} field - The flash field to clear.
   */
  function clearFlash(price, field) {
    setOrderBook((prev) => ({
      bids: clearQuoteFlash(prev.bids, price, field),
      asks: clearQuoteFlash(prev.asks, price, field),
      seqNum: prev.seqNum,
    }));
  }

  // WebSocket connection for order book updates.
  useEffect(() => {
    const wsOrderBook = new WebSocket("wss://ws.btse.com/ws/oss/futures");

    wsOrderBook.onopen = () => {
      wsOrderBook.send(
        JSON.stringify({ op: "subscribe", args: ["update:BTCPFC_0"] })
      );
    };

    wsOrderBook.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);
      if (!msg.data || !msg.data.bids || !msg.data.asks || !msg.data.seqNum)
        return;

      // Ensure sequence updates are correct.
      if (
        orderBook.seqNum !== null &&
        msg.data.prevSeqNum !== orderBook.seqNum
      ) {
        wsOrderBook.send(
          JSON.stringify({ op: "unsubscribe", args: ["update:BTCPFC_0"] })
        );
        wsOrderBook.send(
          JSON.stringify({ op: "subscribe", args: ["update:BTCPFC_0"] })
        );
        return;
      }

      // Update bids and asks based on the delta updates.
      setOrderBook((prev) => ({
        bids: applyDelta(prev.bids, msg.data.bids, "bid"),
        asks: applyDelta(prev.asks, msg.data.asks, "ask"),
        seqNum: msg.data.seqNum,
      }));
    };

    return () => wsOrderBook.close();
  }, []); // Dependency array remains empty as in the original.

  // WebSocket connection for trade updates.
  useEffect(() => {
    const wsTrades = new WebSocket("wss://ws.btse.com/ws/futures");

    wsTrades.onopen = () => {
      wsTrades.send(
        JSON.stringify({ op: "subscribe", args: ["tradeHistoryApi:BTCPFC"] })
      );
    };

    wsTrades.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);
      if (!msg.data || !Array.isArray(msg.data) || msg.data.length === 0)
        return;
      const newPrice = msg.data[0].price;

      setPriceDirection((prevDirection) => {
        if (lastPrice === null) return prevDirection;
        if (newPrice > lastPrice) return "up";
        if (newPrice < lastPrice) return "down";
        return prevDirection;
      });

      setLastPrice(newPrice);
    };

    return () => wsTrades.close();
  }, [lastPrice]); // Dependency array remains as in the original.

  return {
    bids: Object.values(orderBook.bids),
    asks: Object.values(orderBook.asks),
    lastPrice,
    priceDirection,
    clearFlash,
  };
}
