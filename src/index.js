import React from 'react';
import ReactDOM from 'react-dom';

/* Import order matters: any framework / legacy stylesheet first, then the
   design system last so it always wins the cascade. */
import './App.css';
import './index.css';

import App from './App';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
