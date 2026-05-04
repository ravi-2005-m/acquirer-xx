import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatNumber } from '../../utils/formatters';

const COLORS = {
  matched:    '#198754',
  mismatched: '#fd7e14',
  unmatched:  '#dc3545',
};

function MatchRateDonut({ summary }) {
  if (!summary) return null;

  const data = [
    { name: 'Matched',    key: 'matched',    value: summary.matchedItems    || 0 },
    { name: 'Mismatched', key: 'mismatched', value: summary.mismatchedItems || 0 },
    { name: 'Unmatched',  key: 'unmatched',  value: summary.unmatchedItems  || 0 },
  ].filter(d => d.value > 0);

  const total = data.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return (
      <div className="text-center text-muted small py-5">
        No items reconciled yet.
      </div>
    );
  }

  const matchedPct = ((summary.matchedItems / total) * 100).toFixed(1);

  return (
    <div style={{ position: 'relative' }}>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            startAngle={90}
            endAngle={-270}
          >
            {data.map(d => (
              <Cell key={d.key} fill={COLORS[d.key]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatNumber(value)}
            contentStyle={{ fontSize: '0.85rem' }}
          />
          <Legend verticalAlign="bottom" height={32} wrapperStyle={{ fontSize: '0.85rem' }} />
        </PieChart>
      </ResponsiveContainer>

      <div
        style={{
          position: 'absolute',
          top: '38%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <div className="text-muted small">Match Rate</div>
        <div className="h4 mb-0 fw-bold">{matchedPct}%</div>
      </div>
    </div>
  );
}

export default MatchRateDonut;
