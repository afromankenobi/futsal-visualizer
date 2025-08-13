import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Create the root React element. Modern React recommends using
// createRoot rather than the older ReactDOM.render for better
// concurrent behaviour. The element with id="root" is defined in
// index.html.
const root = createRoot(document.getElementById('root'));
root.render(<App />);