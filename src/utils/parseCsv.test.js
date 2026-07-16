import { parseCsvData } from './parseCsv';

const header = 'TimeStamp,Latitude,Longitude,BrushRPM,PumpRPM';

test('parses coordinates and equipment telemetry', () => {
  const csv = `${header}\n2026-01-01T10:00:00Z,52.52,13.405,600,300`;

  expect(parseCsvData(csv)).toEqual([
    {
      timestamp: '2026-01-01T10:00:00Z',
      lat: 52.52,
      lng: 13.405,
      brush: 600,
      pump: 300,
    },
  ]);
});

test('removes zero, malformed and out-of-range coordinates before sampling', () => {
  const csv = [
    header,
    '2026-01-01T10:00:00Z,0,0,0,0',
    '2026-01-01T10:00:01Z,not-a-number,13.4,0,0',
    '2026-01-01T10:00:02Z,95,13.4,0,0',
    '2026-01-01T10:00:03Z,52.52,13.405,0,0',
    '2026-01-01T10:00:04Z,52.521,13.406,0,0',
  ].join('\n');

  expect(parseCsvData(csv, 2)).toHaveLength(1);
  expect(parseCsvData(csv, 2)[0].lat).toBe(52.52);
});

test('uses zero when equipment RPM is empty or invalid', () => {
  const csv = `${header}\n,52.52,13.405,,offline`;

  expect(parseCsvData(csv)[0]).toMatchObject({ brush: 0, pump: 0 });
});

test('reports missing required columns', () => {
  const csv = 'Latitude,Longitude\n52.52,13.405';

  expect(() => parseCsvData(csv)).toThrow('BrushRPM, PumpRPM');
});

test('rejects empty input and invalid sampling rates', () => {
  expect(() => parseCsvData('')).toThrow('The CSV file is empty');
  expect(() => parseCsvData(`${header}\n,52.52,13.405,0,0`, 0)).toThrow(
    'The sampling rate'
  );
});
