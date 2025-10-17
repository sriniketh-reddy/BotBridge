import React, { useState } from 'react';

const mask = (s?: string) => {
  if (!s) return 'missing';
  if (s.length <= 10) return s;
  return `${s.slice(0,4)}…${s.slice(-4)}`;
};

const DebugFirebase: React.FC = () => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined;

  const info = {
    apiKey: !!apiKey,
    authDomain: !!authDomain,
    projectId: !!projectId,
    appId: !!appId,
  };

  const [testResult, setTestResult] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [usersList, setUsersList] = useState<any>(null);
  const [lookupUid, setLookupUid] = useState('');
  const [lookupResult, setLookupResult] = useState<any>(null);

  const runAuthTest = async () => {
    if (!apiKey) {
      setTestResult({ error: 'missing_api_key' });
      return;
    }
    setRunning(true);
    setTestResult(null);
    try {
      const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'debug-nonexistent@example.com', password: 'x', returnSecureToken: true }),
      });
      const data = await res.json();
      setTestResult({ status: res.status, data });
    } catch (err: any) {
      setTestResult({ error: err.message || String(err) });
    } finally {
      setRunning(false);
    }
  };

  const fetchUsers = async () => {
    setUsersList(null);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
      const url = `${API_BASE.replace(/\/$/, '')}/api/debug/users`;
      const res = await fetch(url, { credentials: 'include' });
      let data: any;
      try {
        data = await res.json();
      } catch (jsonErr) {
        const text = await res.text();
        setUsersList({ status: res.status, error: 'non-json response', body: text });
        return;
      }
      setUsersList({ status: res.status, data });
    } catch (err: any) {
      setUsersList({ error: err.message || String(err) });
    }
  };

  const lookupUser = async () => {
    setLookupResult(null);
    if (!lookupUid) return;
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
      const url = `${API_BASE.replace(/\/$/, '')}/api/debug/user/${lookupUid}`;
      const res = await fetch(url, { credentials: 'include' });
      try {
        const data = await res.json();
        setLookupResult({ status: res.status, data });
      } catch (jsonErr) {
        const text = await res.text();
        setLookupResult({ status: res.status, error: 'non-json response', body: text });
      }
    } catch (err: any) {
      setLookupResult({ error: err.message || String(err) });
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-3">Firebase Debug</h2>

      <div className="mb-3">
        <div className="text-sm text-slate-600 dark:text-slate-300">apiKey: <span className="font-mono ml-2">{mask(apiKey)}</span></div>
        <div className="text-sm text-slate-600 dark:text-slate-300">authDomain: <span className="font-mono ml-2">{mask(authDomain)}</span></div>
        <div className="text-sm text-slate-600 dark:text-slate-300">projectId: <span className="font-mono ml-2">{mask(projectId)}</span></div>
        <div className="text-sm text-slate-600 dark:text-slate-300">appId: <span className="font-mono ml-2">{mask(appId)}</span></div>
      </div>

      <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded mb-3">{JSON.stringify(info, null, 2)}</pre>

      <div className="flex items-center gap-2">
        <button onClick={runAuthTest} disabled={running} className="px-3 py-2 bg-indigo-600 text-white rounded">{running ? 'Running...' : 'Run Auth Test'}</button>
        <div className="text-sm text-slate-500">This will attempt a safe auth request to the Identity Toolkit to show the returned error (no account will be created).</div>
      </div>

      <hr className="my-4" />

      <div className="mb-3">
        <h3 className="font-semibold mb-2">Firestore debug</h3>
        <div className="flex gap-2 items-center mb-2">
          <button onClick={fetchUsers} className="px-3 py-2 bg-green-600 text-white rounded">List users</button>
          <div className="text-sm text-slate-500">Calls <code>/api/debug/users</code> and shows documents in the <code>users</code> collection.</div>
        </div>
        {usersList && (
          <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded">{JSON.stringify(usersList, null, 2)}</pre>
        )}

        <div className="flex gap-2 items-center mt-3">
          <input value={lookupUid} onChange={(e) => setLookupUid(e.target.value)} placeholder="uid to lookup" className="px-2 py-1 border rounded" />
          <button onClick={lookupUser} className="px-3 py-2 bg-blue-600 text-white rounded">Lookup user</button>
        </div>
        {lookupResult && (
          <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded mt-2">{JSON.stringify(lookupResult, null, 2)}</pre>
        )}
      </div>

      {testResult && (
        <div className="mt-4">
          <h3 className="font-semibold">Result</h3>
          <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded mt-2">{JSON.stringify(testResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default DebugFirebase;
