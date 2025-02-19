// useWebSocket.test.js
import { renderHook, act } from "@testing-library/react-hooks";
import useWebSocket from "../hooks/useWebSocket";

let wsInstances = [];

beforeEach(() => {
  // Mock the global WebSocket so that each time new WebSocket(...) is called,
  // it returns our fake instance, which we also store in an array.
  wsInstances = [];
  global.WebSocket = jest.fn(() => {
    const ws = {
      onopen: null,
      onmessage: null,
      send: jest.fn(),
      close: jest.fn(),
      readyState: 1,
    };
    wsInstances.push(ws);
    return ws;
  });
});

test("should update orderBook on receiving order update message", () => {
  const { result } = renderHook(() => useWebSocket());

  // The effect that creates the WebSocket runs immediately on mount,
  // so wsInstances[0] should be your order book WS instance.
  const orderBookWS = wsInstances[0];
  expect(orderBookWS).toBeTruthy(); // Ensure it's not undefined

  // Simulate an order book update message
  const orderMsg = {
    data: {
      bids: [
        ["100", "1.5"],
        ["99", "2"]
      ],
      asks: [
        ["101", "1.2"],
        ["102", "1.8"]
      ],
      seqNum: 1,
      prevSeqNum: null
    },
  };

  // Fire the WebSocket message event
  act(() => {
    if (orderBookWS.onmessage) {
      orderBookWS.onmessage({ data: JSON.stringify(orderMsg) });
    }
  });

  // Now check your hook state
  expect(result.current.bids.length).toBe(2);
  expect(result.current.asks.length).toBe(2);
  // etc.
});
