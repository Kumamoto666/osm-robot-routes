import React, { useState } from 'react';
import { parseCsvData } from './utils/parseCsv';
import MapView from './components/MapView';
import './App.css';

const SAMPLE_OPTIONS = [1, 2, 5, 10, 20, 50];

function calculateSummary(points) {
  const cleaningPoints = points.filter(point => point.brush > 0 || point.pump > 0).length;
  return {
    total: points.length,
    cleaning: cleaningPoints,
    cleaningShare: points.length ? Math.round((cleaningPoints / points.length) * 100) : 0,
  };
}

function App() {
  const [sampleRate, setSampleRate] = useState(1);
  const [coordinates, setCoordinates] = useState([]);
  const [fileName, setFileName] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [error, setError] = useState('');

  const processCsv = (csvText, name, rate = sampleRate) => {
    try {
      const points = parseCsvData(csvText, rate);
      if (points.length < 2) {
        throw new Error('The file must contain at least two rows with valid coordinates.');
      }
      setSourceText(csvText);
      setCoordinates(points);
      setFileName(name);
      setError('');
    } catch (parseError) {
      setSourceText('');
      setCoordinates([]);
      setFileName('');
      setError(parseError.message || 'The CSV file could not be read.');
    }
  };

  const handleFileUpload = async event => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      processCsv(await file.text(), file.name);
    } catch {
      setError('The selected file could not be opened.');
    } finally {
      event.target.value = '';
    }
  };

  const handleDemoLoad = async () => {
    try {
      const response = await fetch(`${process.env.PUBLIC_URL}/demo_route.csv`);
      if (!response.ok) throw new Error();
      processCsv(await response.text(), 'demo_route.csv');
    } catch {
      setError('The demo route could not be loaded.');
    }
  };

  const handleSampleRateChange = event => {
    const rate = Number(event.target.value);
    setSampleRate(rate);
    if (sourceText) processCsv(sourceText, fileName, rate);
  };

  const summary = calculateSummary(coordinates);

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">DEMO</p>
          <h1>Cleaning Robot Route Inspector</h1>
          <p className="hero-copy">
            Upload a GPS telemetry CSV to inspect the actual route and identify
            where the brush and pump were active.
          </p>
        </div>
        <div className="privacy-note">Data stays in your browser</div>
      </header>

      <section className="toolbar" aria-label="Route controls">
        <label className="upload-button">
          <span>Choose a CSV file</span>
          <input type="file" accept=".csv,text/csv" onChange={handleFileUpload} />
        </label>
        <button className="secondary-button" type="button" onClick={handleDemoLoad}>
          Open demo route
        </button>
        <label className="sample-field">
          <span>Display</span>
          <select value={sampleRate} onChange={handleSampleRateChange}>
            {SAMPLE_OPTIONS.map(rate => (
              <option key={rate} value={rate}>
                {rate === 1 ? 'every point' : `every ${rate}th point`}
              </option>
            ))}
          </select>
        </label>
      </section>

      {error && <div className="error-message" role="alert">{error}</div>}

      <section className="status-row" aria-live="polite">
        <div>
          <span className="status-label">Source</span>
          <strong>{fileName || 'No file selected'}</strong>
        </div>
        <div>
          <span className="status-label">GPS points</span>
          <strong>{summary.total}</strong>
        </div>
        <div>
          <span className="status-label">Cleaning points</span>
          <strong>{summary.cleaning} ({summary.cleaningShare}%)</strong>
        </div>
      </section>

      <section className="legend" aria-label="Route legend">
        <span><i className="legend-line idle" />Movement without equipment</span>
        <span><i className="legend-line brush" />Brush active</span>
        <span><i className="legend-line pump" />Pump active</span>
        <span><i className="legend-line cleaning" />Brush and pump active</span>
      </section>

      <section className="map-frame">
        <MapView coordinates={coordinates} />
        {!coordinates.length && (
          <div className="empty-state">
            Choose your own CSV file or open the cleaned demo route.
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
