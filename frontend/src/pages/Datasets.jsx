import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadDataset, fetchDatasets } from '../store/datasetSlice';
import { generatePersonas } from '../store/personaSlice';

export default function Datasets() {
  const dispatch = useDispatch();
  const fileRef = useRef();
  const { items, uploading } = useSelector((s) => s.datasets);
  const { generating } = useSelector((s) => s.personas);

  useEffect(() => { dispatch(fetchDatasets()); }, [dispatch]);

  const handleUpload = () => {
    const file = fileRef.current?.files[0];
    if (file) dispatch(uploadDataset(file));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Datasets</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Upload Dataset</h2>
        <div className="flex gap-4">
          <input ref={fileRef} type="file" accept=".csv" className="flex-1 border rounded p-2" />
          <button onClick={handleUpload} disabled={uploading} className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50">
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Filename</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rows</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((d) => (
              <tr key={d.id}>
                <td className="px-6 py-4">{d.filename}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${d.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {d.status}
                  </span>
                </td>
                <td className="px-6 py-4">{d.row_count}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => dispatch(generatePersonas({ datasetId: d.id, k: 5 }))}
                    disabled={generating || d.status !== 'completed'}
                    className="text-indigo-600 hover:underline disabled:opacity-50"
                  >
                    Generate Personas
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
