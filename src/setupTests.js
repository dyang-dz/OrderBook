// src/setupTests.js
import { createRoot } from 'react-dom/client';
import ReactDOM from 'react-dom';
import '@testing-library/jest-dom';

// Polyfill ReactDOM.render if it's not available
if (typeof ReactDOM.render !== 'function') {
  ReactDOM.render = (element, container) => {
    const root = createRoot(container);
    root.render(element);
  };
}
