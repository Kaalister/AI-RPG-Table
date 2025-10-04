import React from "react";
import "./Home.css";

export default class Home extends React.Component {
  render() {
    return (
      <section className="app-section home-section">
        <h1>Welcome to AI RPG Table</h1>
        <p>
          Bring your tabletop storytelling to life with AI-guided encounters.
          Use the GameChat to collaborate with your party, track campaign
          settings, and iterate on adventures in real time.
        </p>
        <p>
          Jump into the GameChat to start a new conversation or head over to
          Settings to adjust your experience.
        </p>
      </section>
    );
  }
}
