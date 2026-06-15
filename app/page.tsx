'use client';
import { useCompletion } from '@ai-sdk/react';
import { useState } from 'react';

export default function Page() {
  const [jobDescription, setJD] = useState('');
  const [background, setBg] = useState('');
  const [tone, setTone] = useState('professional');
  const { completion, complete, isLoading } = useCompletion({ api: '/api/generate' });

  const handleGenerate = () => {
    complete('', { body: { jobDescription, background, tone } });
  };

  const handleCopy = async () => {
    if (!completion) return;
    try {
      await navigator.clipboard.writeText(completion);
    } catch (error) {
      console.error('Copy failed', error);
    }
  };

  return (
    <main className="space-y-6 p-6">
      <div className="grid gap-4">
        <label className="flex flex-col">
          Job description
          <textarea
            value={jobDescription}
            onChange={(e) => setJD(e.target.value)}
            rows={4}
            className="mt-2 rounded border p-2"
            placeholder="Paste the job description here"
          />
        </label>

        <label className="flex flex-col">
          Your background
          <textarea
            value={background}
            onChange={(e) => setBg(e.target.value)}
            rows={4}
            className="mt-2 rounded border p-2"
            placeholder="Briefly describe your experience"
          />
        </label>

        <label className="flex flex-col">
          Tone
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="mt-2 rounded border p-2"
          >
            <option value="professional">Professional</option>
            <option value="concise">Concise</option>
            <option value="friendly">Friendly</option>
            <option value="creative">Creative</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isLoading}
          onClick={handleGenerate}
          className="rounded bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
        >
          {isLoading ? 'Writing…' : 'Generate'}
        </button>

        {completion && (
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGenerate}
            className="rounded bg-slate-600 px-4 py-2 text-white disabled:opacity-50"
          >
            Regenerate
          </button>
        )}

        <button
          type="button"
          disabled={!completion}
          onClick={handleCopy}
          className="rounded border px-4 py-2 disabled:opacity-50"
        >
          Copy to clipboard
        </button>
      </div>

      <article className="whitespace-pre-wrap rounded border p-4 bg-slate-50 min-h-[10rem]">
        {completion || 'Generated output will appear here.'}
      </article>
    </main>
  );
}