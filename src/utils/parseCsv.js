import Papa from 'papaparse';

const REQUIRED_COLUMNS = ['Latitude', 'Longitude', 'BrushRPM', 'PumpRPM'];

export function parseCsvData(csvText, sampleRate = 1) {
  if (typeof csvText !== 'string' || !csvText.trim()) {
    throw new Error('The CSV file is empty.');
  }

  const rate = Number(sampleRate);
  if (!Number.isInteger(rate) || rate < 1) {
    throw new Error('The sampling rate must be a positive integer.');
  }

  const results = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: header => header.trim(),
  });

  if (results.errors.some(error => error.code !== 'TooFewFields')) {
    throw new Error(`Invalid CSV format: ${results.errors[0].message}`);
  }

  const missingColumns = REQUIRED_COLUMNS.filter(column => !results.meta.fields?.includes(column));
  if (missingColumns.length) {
    throw new Error(`Missing required CSV columns: ${missingColumns.join(', ')}.`);
  }

  const validPoints = results.data
    .map(row => ({
      timestamp: row.TimeStamp?.trim() || '',
      lat: Number.parseFloat(row.Latitude),
      lng: Number.parseFloat(row.Longitude),
      brush: Number.parseFloat(row.BrushRPM) || 0,
      pump: Number.parseFloat(row.PumpRPM) || 0,
    }))
    .filter(point =>
      Number.isFinite(point.lat) &&
      Number.isFinite(point.lng) &&
      point.lat >= -90 && point.lat <= 90 &&
      point.lng >= -180 && point.lng <= 180 &&
      !(point.lat === 0 && point.lng === 0)
    );

  return validPoints.filter((_, index) => index % rate === 0);
}
