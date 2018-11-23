import React from "react";
import ReactDOM from "react-dom";

import ClapButton from './components/ClapButton'

import "./styles.css";

function App() {
  return (
    <div className="App">
      <ClapButton/>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
