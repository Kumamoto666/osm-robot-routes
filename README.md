# Route Operations Inspector

A client-side application for visually inspecting the routes of mobile cleaning
robots and verifying whether their cleaning equipment was active along the way.

> This repository is an anonymized portfolio edition of an internal operational
> tool. The included demo route is a cleaned trace with replacement timestamps;
> robot identifiers and unrelated telemetry fields have been removed.
> Organization names, infrastructure details, credentials, and real robot
> identifiers are not included.

## The problem

When a mobile robot is operated manually, a GPS trace alone does not prove that
the assigned work was completed. Operations teams also need to determine:

- which route the operator actually followed;
- whether the expected route was completed;
- which sections were skipped;
- where the robot was only being driven;
- where the brush or pump was active;
- whether a real cleaning operation took place.

The application combines GPS coordinates with equipment telemetry and presents
the result as a single color-coded route on an interactive map.

## What the application does

- loads telemetry from a local CSV file;
- provides a built-in cleaned route for demonstration;
- validates the CSV structure and coordinate values;
- filters invalid and zero coordinates;
- downsamples long tracks for faster rendering;
- automatically fits the map to the loaded route;
- color-codes each route segment by equipment state;
- displays a concise summary of GPS points and cleaning activity;
- processes uploaded data entirely in the browser.

## Route legend

| Color | Meaning |
| --- | --- |
| Gray | Robot movement without cleaning equipment |
| Red | Brush active |
| Blue | Pump active |
| Purple | Brush and pump active at the same time |

## Original internal architecture

The original internal version was connected to an S3-compatible object storage
service. Robot telemetry was automaticaly exported as CSV files and uploaded to
the storage bucket. The application listed the available files, extracted robot
and date information from their names, and allowed an operator or supervisor to
select a particular run for inspection.

```text
Robot telemetry
      │
      ▼
CSV files in S3-compatible object storage
      │
      ▼
Date and robot filters
      │
      ▼
React application
      │
      ▼
OpenStreetMap route with equipment-state colors
```

That integration made it possible to inspect historical runs without manually
downloading individual telemetry files.

For this public portfolio edition, the storage integration was intentionally
removed and replaced with local CSV upload and a cleaned sample. This keeps
the demo self-contained and prevents any dependency on private infrastructure or
credentials. The sample retains the route geometry and equipment-state
transitions while using a replacement timeline.

```text
Local CSV or cleaned sample
      │
      ▼
CSV parsing and validation
      │
      ▼
React application
      │
      ▼
OpenStreetMap route with equipment-state colors
```

## CSV format

The following columns are required:

| Column | Description |
| --- | --- |
| `Latitude` | Latitude between −90 and 90 |
| `Longitude` | Longitude between −180 and 180 |
| `BrushRPM` | Brush speed; `0` means the brush is inactive |
| `PumpRPM` | Pump speed; `0` means the pump is inactive |

The optional `TimeStamp` column is preserved by the parser for possible future
time-based analysis.

Minimal example:

```csv
TimeStamp,Latitude,Longitude,BrushRPM,PumpRPM
2026-01-15T09:00:00Z,52.51920,13.40020,0,0
2026-01-15T09:00:10Z,52.51940,13.40100,500,220
```

The complete cleaned sample is available in
[`public/demo_route.csv`](public/demo_route.csv).

## Running locally

Use a current Node.js LTS release.

```bash
npm install
npm start
```

The development server will open the application at
`http://localhost:3000`.

## Tests and production build

```bash
npm test -- --watchAll=false
npm run build
```

The parser tests cover:

- valid GPS and equipment telemetry;
- malformed, zero, and out-of-range coordinates;
- downsampling after coordinate validation;
- empty or invalid equipment values;
- missing required columns;
- empty input and invalid sampling rates.

## Technology stack

- React 18;
- Leaflet and React Leaflet;
- OpenStreetMap;
- Papa Parse;
- Jest.

## Privacy and security

Uploaded CSV files are read locally by the browser and are not sent to an
application server. The public repository contains no cloud SDK configuration,
storage credentials, private endpoints, organization-specific branding, or real
operational telemetry.

Map tiles are loaded from the public OpenStreetMap tile service, so displaying
the map requires an internet connection.

## Current limitations

- route completion is assessed visually because no reference route is provided;
- the cleaning percentage is based on the number of sampled GPS points rather
  than traveled distance;
- the result depends on the frequency and accuracy of the source GPS telemetry;
- large gaps in time or distance are not yet split into separate route segments;
- the project still uses Create React App and could be migrated to a modern
  build tool such as Vite.
