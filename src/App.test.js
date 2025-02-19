// src/App.test.js
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the 'Order Book' title", () => {
  render(<App />);
  // Adjust to look for your new text
  const titleElement = screen.getByText(/Order Book/i);
  expect(titleElement).toBeInTheDocument();
});
