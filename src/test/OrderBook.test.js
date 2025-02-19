// OrderBook.test.js
import React from "react";
import { render, screen } from "@testing-library/react";
// We’ll mock the custom hook that provides data to OrderBook
import useWebSocket from "../hooks/useWebSocket";
import OrderBook from "../componenets/OrderBook";

// Mock the entire module so we can control its return values in each test
jest.mock("../hooks/useWebSocket");

describe("OrderBook Component", () => {
  test("renders with mock data and displays correct elements", () => {
    // 1. Setup mock data for bids, asks, and other hook returns
    const mockBids = [
      { price: 50000, size: 2, total: 2 },
      { price: 49950, size: 3, total: 5 },
    ];
    const mockAsks = [
      { price: 50050, size: 1, total: 1 },
      { price: 50100, size: 4, total: 5 },
    ];
    const mockLastPrice = 50025;
    const mockPriceDirection = "up";
    const mockClearFlash = jest.fn();

    // 2. Mock the return of useWebSocket to supply our test data
    useWebSocket.mockReturnValue({
      bids: mockBids,
      asks: mockAsks,
      lastPrice: mockLastPrice,
      priceDirection: mockPriceDirection,
      clearFlash: mockClearFlash,
    });

    // 3. Render the OrderBook component
    render(<OrderBook />);

    // 4. Assert that the title and headers appear
    expect(screen.getByText(/Order Book/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Price \(USD\)/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Size/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Total/i)[0]).toBeInTheDocument();

    // 5. Check the last traded price is displayed and direction is "up"
    //    The actual text might be formatted by toLocaleString()
    //    e.g. "50,025" if using toLocaleString() for 50025
    const lastPriceRegex = new RegExp(mockLastPrice.toLocaleString());
    expect(screen.getByText(lastPriceRegex)).toBeInTheDocument();

    // 6. Confirm the .last-price element has the "up" class for priceDirection
    const lastPriceElement = screen.getByText(lastPriceRegex).closest(".last-price");
    expect(lastPriceElement).toHaveClass("up");

    // 7. Check that the correct number of rows are rendered for asks and bids
    // By default, you're rendering each ask in the ".asks-table .order-row"
    // and each bid in the ".bids-table .order-row". We can query them by container
    const asksTable = document.querySelector(".asks-table");
    const bidsTable = document.querySelector(".bids-table");

    // We expect to see 2 ask rows and 2 bid rows from our mock data
    expect(asksTable.querySelectorAll(".order-row").length).toBe(2);
    expect(bidsTable.querySelectorAll(".order-row").length).toBe(2);

    // 8. (Optional) Check that the first ask or bid is displayed properly
    // For instance, the first ask row should display "50,050" if your app
    // uses toLocaleString formatting:
    expect(screen.getByText("50,050")).toBeInTheDocument();
    expect(screen.getByText("49,950")).toBeInTheDocument();
  });

  test("renders gracefully with empty data", () => {
    useWebSocket.mockReturnValue({
      bids: [],
      asks: [],
      lastPrice: null,
      priceDirection: "same",
      clearFlash: jest.fn(),
    });
  
    render(<OrderBook />);
  
    // Confirm the main title is displayed
    expect(screen.getByText(/Order Book/i)).toBeInTheDocument();
  
    // Confirm the two table headers for Price (USD)
    const priceHeaders = screen.getAllByText(/Price \(USD\)/i);
    expect(priceHeaders).toHaveLength(2);
  
    // Confirm no rows are rendered
    expect(document.querySelector(".asks-table .order-row")).toBeNull();
    expect(document.querySelector(".bids-table .order-row")).toBeNull();
  
    // Last price element should display '--' if lastPrice is null
    expect(screen.getByText("--")).toBeInTheDocument();
  });
  
});
