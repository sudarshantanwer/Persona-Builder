import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDatasets } from '../store/datasetSlice';
import { fetchCampaigns } from '../store/campaignSlice';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { items: datasets } = useSelector((s) => s.datasets);
  const { items: campaigns } = useSelector((s) => s.campaigns);

  useEffect(() => {
    dispatch(fetchDatasets());
    dispatch(fetchCampaigns());
  }, [dispatch]);

  const stats = [
    { label: 'Datasets', value: datasets.length },
    { label: 'Active Campaigns', value: campaigns.filter((c) => c.status === 'active').length },
    { label: 'Total Campaigns', value: campaigns.length },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-3 gap-6 mb-8">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm">{label}</p>
            <p className="text-3xl font-bold text-indigo-600">{value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Recent Campaigns</h2>
        <div className="space-y-2">
          {campaigns.slice(0, 5).map((c) => (
            <div key={c.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>{c.name}</span>
              <span className={`px-2 py-1 rounded text-xs ${c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
