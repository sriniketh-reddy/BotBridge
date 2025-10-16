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
