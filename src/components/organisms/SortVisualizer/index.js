import React, { Component } from 'react';
import './style.css';

// Sub components
import SortChart from '../SortChart';
import VisualizerControls from '../../molecules/VisualizerControls';
import ProgressBar from '../../molecules/ProgressBar';

class SortVisualizer extends Component {
  state = {
    trace: [],
    traceStep: -1,

    originalArray: [],
    array: [],
    comparingIndices: [],
    comparedIndices: [],
    sortedIndices: [],

    timeoutIds: [],
    playbackSpeed: 1
  };

  componentDidUpdate(prevProps) {
    if (prevProps.array !== this.props.array) {
      this._reset(this.props.array);
    }
    if (prevProps.trace !== this.props.trace) {
      this.clearTimeouts();
      this.setState({ trace: this.props.trace });
    }
  }

  // Actions

  _reset = (array) => {
    this.setState({
      array,
      trace: [],
      traceStep: -1,
      comparingIndices: [],
      comparedIndices: [],
      sortedIndices: [],
      originalArray: [...array]
    });
  };

  clearTimeouts = () => {
    this.state.timeoutIds.forEach((timeoutId) =>
      clearTimeout(timeoutId)
    );
    this.setState({ timeoutIds: [] });
  };

  _changeVisualState = (visualState) => {
    this.setState({
      array: visualState.array,
      comparingIndices: visualState.comparingIndices,
      comparedIndices: visualState.comparedIndices,
      sortedIndices: visualState.sortedIndices
    });
  };

  run = (trace) => {
    const timeoutIds = [];
    const timer = 500 / this.state.playbackSpeed;

    // Set a timeout for each item in the trace
    trace.forEach((item, i) => {
      let timeoutId = setTimeout(
        (item) => {
          this.setState(
            (prevState) => ({
              traceStep: prevState.traceStep + 1
            }),
            this._changeVisualState(item)
          );
        },
        i * timer,
        item
      );

      timeoutIds.push(timeoutId);
    });

    // Clear timeouts upon completion
    let timeoutId = setTimeout(
      this.clearTimeouts,
      trace.length * timer
    );
    timeoutIds.push(timeoutId);

    this.setState({ timeoutIds });
  };

  pause = () => {
    this.clearTimeouts();
  };

  continue = () => {
    const trace = this.state.trace.slice(this.state.traceStep);
    this.run(trace);
  };

  stepForward = () => {
    const trace = this.state.trace;
    const step = this.state.traceStep;
    if (step < trace.length - 1) {
      const item = trace[step + 1];
      this.setState(
        { traceStep: step + 1 },
        this._changeVisualState(item)
      );
    }
  };

  stepBackward = () => {
    const trace = this.state.trace;
    const step = this.state.traceStep;
    if (step > 0) {
      const item = trace[step - 1];
      this.setState(
        { traceStep: step - 1 },
        this._changeVisualState(item)
      );
    }
  };

  repeat = () => {
    this.clearTimeouts();
    this.setState((prevState) => ({
      array: [...prevState.originalArray],
      traceStep: -1,
      comparing: [],
      compared: [],
      sorted: []
    }));
    this.run(this.state.trace);
  };

  adjustPlaybackSpeed = (speed) => {
    const playing = this.state.timeoutIds.length > 0;
    this.pause();
    const playbackSpeed = Number(speed.split('x')[0]);
    this.setState({ playbackSpeed }, () => {
      if (playing) this.continue();
    });
  };

  render() {
    // Chart
    // Controls
    // Progress Bar
    // Expand Button
    // Legend

    return (
      <div className="SortVisualizer">
        <SortChart
          numbers={this.state.array}
          maxNum={Math.max(...this.state.array)}
          comparingIndices={this.state.comparingIndices}
          comparedIndices={this.state.comparedIndices}
          sortedIndices={this.state.sortedIndices}
        />
        <ProgressBar
          width={
            (this.state.traceStep / (this.state.trace.length - 1)) * 100
          }
        />
        <VisualizerControls
          onPlay={
            this.state.traceStep === -1
              ? this.run.bind(this, this.state.trace)
              : this.continue.bind(this)
          }
          onPause={this.pause.bind(this)}
          onForward={this.stepForward.bind(this)}
          onBackward={this.stepBackward.bind(this)}
          onRepeat={this.repeat.bind(this)}
          onAdjustSpeed={this.adjustPlaybackSpeed}
          playing={this.state.timeoutIds.length > 0}
          playDisabled={
            (this.state.traceStep >= this.state.trace.length - 1 &&
              this.state.traceStep !== -1) ||
            this.state.trace.length <= 0
          }
          forwardDisabled={
            this.state.traceStep >= this.state.trace.length - 1
          }
          backwardDisabled={this.state.traceStep <= 0}
          repeatDisabled={this.state.traceStep <= 0}
          playbackSpeed={this.state.playbackSpeed}
        />
      </div>
    );
  }
}

export default SortVisualizer;