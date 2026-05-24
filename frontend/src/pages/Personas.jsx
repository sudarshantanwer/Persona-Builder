import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { matchBrand, clearMatches } from '../store/personaSlice';

export default function Personas() {
  const [brandContext, setBrandContext] = useState('');
  const dispatch = useDispatch();
  const { items, matches } = useSelector((s) => s.personas);

  const handleMatch = () => {
    if (brandContext.trim()) dispatch(matchBrand(brandContext));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Personas & Brand Matching</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Brand Persona Matching</h2>
        <textarea
          value={brandContext}
          onChange={(e) => setBrandContext(e.target.value)}
          placeholder="Describe your brand, target audience, campaign goals..."
          className="w-full border rounded p-3 h-32 mb-4"
        />
        <div className="flex gap-4">
          <button onClick={handleMatch} className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">
            Find Matching Personas
          </button>
          <button onClick={() => dispatch(clearMatches())} className="border px-6 py-2 rounded hover:bg-gray-50">
            Clear
          </button>
        </div>
      </div>

      {matches.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Matching Results</h2>
          <div className="space-y-4">
            {matches.map((m, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">{m.persona?.persona_name}</h3>
                  <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                    {(m.similarity_score * 100).toFixed(1)}% match
                  </span>
                </div>
                <p className="text-sm text-gray-600">Interests: {m.persona?.interests?.join(', ')}</p>
                <p className="text-sm text-gray-600">Channels: {m.persona?.preferred_channels?.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Generated Personas</h2>
          <div className="grid grid-cols-2 gap-4">
            {items.map((p, i) => (
              <div key={i} className="border rounded-lg p-4">
                <h3 className="font-semibold text-indigo-600">{p.persona_data?.persona_name}</h3>
                <p className="text-sm text-gray-500 mt-1">Cluster {p.cluster_id}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {p.persona_data?.interests?.slice(0, 4).map((interest) => (
                    <span key={interest} className="bg-gray-100 px-2 py-0.5 rounded text-xs">{interest}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
