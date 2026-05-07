import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

function UploadZone({ onExtractionComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('document', file);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/transactions/extract', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      onExtractionComplete(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to extract data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [onExtractionComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt', '.pptx'],
      'text/plain': ['.txt'],
      'image/*': ['.png', '.jpg', '.jpeg']
    }
  });

  return (
    <div className="mb-8">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-10 rounded-lg text-center cursor-pointer transition ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        {loading ? (
          <p className="text-gray-500 font-semibold">Extracting data...</p>
        ) : isDragActive ? (
          <p className="text-blue-500 font-semibold">Drop the files here ...</p>
        ) : (
          <p className="text-gray-500 font-semibold">Drag 'n' drop a financial document here, or click to select files</p>
        )}
      </div>
      {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
    </div>
  );
}

export default UploadZone;
