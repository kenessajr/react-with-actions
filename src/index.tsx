import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { ApplicationInsights } from '@microsoft/applicationinsights-web'

const key = process.env["REACT_APP_APP_INSIGHTS_KEY"];

ReactDOM.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();


const appInsights = new ApplicationInsights({ config: {
  instrumentationKey:  key
} });
appInsights.loadAppInsights();
appInsights.trackPageView();