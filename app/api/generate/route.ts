import {anthropic} from '@ai-sdk/anthropic';
import {streamText} from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
    const {jobDescription, background, tone} = await req.json();
    const result = streamText({
        model: anthropic('claude-sonnet-4-6'),
        system: `You are an expert cover-letter writer. Write a tailored, ${tone} letter.
        Open with a specific hook, map real experience to the job's needs, no clichés,
        no invented facts, 250-350 words, ready to send.`,
        prompt: `JOB DESCRIPTION:\n${jobDescription}\n\nBACKGROUND:\n${background}`,
        maxOutputTokens: 1024,
    });
    return result.toTextStreamResponse();

}