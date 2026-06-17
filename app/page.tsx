'use client';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import styles from './page.module.css';

export default function Page() {
  const [jobDescription, setJD] = useState('');
  const [background, setBg] = useState('');
  const [tone, setTone] = useState('professional');
  const [completion, setCompletion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [jdUrl, setJdUrl] = useState('');
  const [isFetchingJd, setIsFetchingJd] = useState(false);
  const [jdFetchError, setJdFetchError] = useState('');

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [resumeError, setResumeError] = useState('');
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const handleFetchJd = async () => {
    if (!jdUrl.trim()) return;
    setIsFetchingJd(true);
    setJdFetchError('');
    try {
      const res = await fetch('/api/fetch-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: jdUrl }),
      });
      const data = await res.json().catch(() => ({ error: res.statusText || 'Request failed' }));
      if (!res.ok) throw new Error(data.error || 'Fetch failed');
      setJD(data.text);
    } catch (err) {
      setJdFetchError(err instanceof Error ? err.message : 'Could not fetch URL.');
    } finally {
      setIsFetchingJd(false);
    }
  };

  const handleResumeUpload = async (file: File) => {
    setResumeFile(file);
    setIsParsingResume(true);
    setResumeError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/parse-resume', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({ error: res.statusText || 'Request failed' }));
      if (!res.ok) throw new Error(data.error || 'Parse failed');
      setBg(data.text);
    } catch (err) {
      setResumeError(err instanceof Error ? err.message : 'Could not parse file.');
      setResumeFile(null);
    } finally {
      setIsParsingResume(false);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setCompletion('');
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, background, tone }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to generate output.');
      }
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setCompletion(text);
      }
    } catch (error) {
      console.error('Generation failed', error);
      setCompletion('Failed to generate cover letter. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!completion) return;
    try {
      await navigator.clipboard.writeText(completion);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed', error);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <svg className={styles.icon} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </div>
          <h1 className={styles.title}>Cover Letter AI</h1>
          <p className={styles.subtitle}>Tailored cover letters in seconds — no clichés, no fluff.</p>
        </div>

        {/* Form card */}
        <Card className={styles.formCard}>
          <CardHeader className="pb-4">
            <CardTitle className={styles.formCardTitle}>Your details</CardTitle>
            <CardDescription>Fill in the fields below and click Generate.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Job description */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Job description</label>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJD(e.target.value)}
                rows={5}
                placeholder="Paste the job description here…"
                className={styles.textarea}
              />
              <div className={styles.inputRow}>
                <span className={styles.inputRowLabel}>or URL:</span>
                <input
                  type="url"
                  value={jdUrl}
                  onChange={(e) => { setJdUrl(e.target.value); setJdFetchError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleFetchJd()}
                  placeholder="https://…"
                  className={styles.urlInput}
                />
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isFetchingJd || !jdUrl.trim()}
                  onClick={handleFetchJd}
                  className={styles.fetchButton}
                >
                  {isFetchingJd ? 'Fetching…' : 'Fetch'}
                </Button>
              </div>
              {jdFetchError && <p className={styles.errorText}>{jdFetchError}</p>}
            </div>

            {/* Background / resume */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Your background</label>
              <Textarea
                value={background}
                onChange={(e) => setBg(e.target.value)}
                rows={4}
                placeholder="Briefly describe your experience, skills, and what makes you a great fit…"
                className={styles.textarea}
              />
              <div className={styles.inputRow}>
                <span className={styles.inputRowLabel}>or upload resume:</span>
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleResumeUpload(file);
                    e.target.value = '';
                  }}
                />
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isParsingResume}
                  onClick={() => resumeInputRef.current?.click()}
                  className={styles.uploadButton}
                >
                  {isParsingResume ? 'Parsing…' : 'Upload'}
                </Button>
                {resumeFile && !isParsingResume && (
                  <span className={styles.fileChip}>
                    <svg className={styles.fileChipIcon} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {resumeFile.name}
                  </span>
                )}
              </div>
              {resumeError && <p className={styles.errorText}>{resumeError}</p>}
            </div>

            {/* Tone */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Tone</label>
              <Select value={tone} onValueChange={(value) => value && setTone(value)}>
                <SelectTrigger className={styles.toneSelect}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="concise">Concise</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={styles.buttonRow}>
              <Button
                disabled={isLoading || (!jobDescription.trim() && !background.trim())}
                onClick={handleGenerate}
                className={styles.generateButton}
              >
                {isLoading ? (
                  <span className={styles.spinnerWrapper}>
                    <svg className={styles.spinner} viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                    </svg>
                    Writing…
                  </span>
                ) : completion ? 'Regenerate' : 'Generate'}
              </Button>

              {completion && (
                <Button variant="outline" disabled={isLoading} onClick={handleCopy}>
                  {copied ? (
                    <span className={styles.copyIconWrapper}>
                      <svg className={styles.copySuccessIcon} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Copied!
                    </span>
                  ) : (
                    <span className={styles.copyIconWrapper}>
                      <svg className={styles.copyIcon} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                      </svg>
                      Copy to clipboard
                    </span>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        {(completion || isLoading) && (
          <Card className={styles.outputCard}>
            <CardHeader className="pb-2">
              <CardTitle className={styles.outputCardTitle}>
                Cover letter
                {isLoading && <span className={styles.pulseDot} />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.outputContent}>
                {completion}
                {isLoading && <span className={styles.cursor}>▍</span>}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
