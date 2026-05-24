import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCampaign, fetchCampaigns, activateCampaign } from '../store/campaignSlice';

export default function Campaigns() {
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.campaigns);
  const [form, setForm] = useState({ name: '', brand_context: '', budget: '', channels: [] });

  useEffect(() => { dispatch(fetchCampaigns()); }, [dispatch]);

  const handleCreate = (e) => {
    e.preventDefault();
    dispatch(createCampaign({ ...form, budget: Number(form.budget), channels: form.channels }));
    setForm({ name: '', brand_context: '', budget: '', channels: [] });
  };

  const channelOptions = ['YouTube', 'TikTok', 'Programmatic', 'Instagram', 'Google Ads'];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Campaigns</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Create Campaign</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <input
            type="text" placeholder="Campaign Name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded p-2"
          />
          <textarea
            placeholder="Brand context and targeting goals..."
            value={form.brand_context}
            onChange={(e) => setForm({ ...form, brand_context: e.target.value })}
            className="w-full border rounded p-2 h-24"
          />
          <input
            type="number" placeholder="Budget" value={form.budget}
            onChange={(e) => setForm({ ...form, budget: e.target.value })}
            className="w-full border rounded p-2"
          />
          <div className="flex flex-wrap gap-2">
            {channelOptions.map((ch) => (
              <label key={ch} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={form.channels.includes(ch)}
                  onChange={(e) => {
                    const channels = e.target.checked
                      ? [...form.channels, ch]
                      : form.channels.filter((c) => c !== ch);
                    setForm({ ...form, channels });
                  }}
                />
                {ch}
              </label>
            ))}
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">
            Create & Match
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((c) => (
              <tr key={c.id}>
                <td className="px-6 py-4">{c.name}</td>
                <td className="px-6 py-4">${c.budget}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {c.status === 'draft' && (
                    <button onClick={() => dispatch(activateCampaign(c.id))} className="text-indigo-600 hover:underline">
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
