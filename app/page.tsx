'use client';
import { useCompletion } from '@ai-sdk/react';
import { useState } from 'react';

export default function Page() {
  const [jobDescription, setJD] = useState('');
  const [background, setBg] = useState('');
  const [tone, setTone] = useState('professional');
  const { completion, complete, isLoading } = useCompletion({ api: '/api/generate' });

  return (
    <main>
      {/* Textareas for jobDescription + background, Select for tone */}
      <button
        disabled={isLoading}
        onClick={() => complete('', { body: { jobDescription, background, tone } })}
      >
        {isLoading ? 'Writing…' : 'Generate'}
      </button>
      <article className="whitespace-pre-wrap">{completion}</article>
    </main>
  );
}