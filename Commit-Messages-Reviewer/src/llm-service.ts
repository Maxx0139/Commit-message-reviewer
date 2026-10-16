import axios from 'axios';
import { Commit, ReviewResult } from './types';
import * as dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
    console.error('OPENROUTER_API_KEY not found');
    process.exit(1);
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function reviewCommit(commit: Commit, retryCount: number = 0): Promise<ReviewResult> {
    console.log(`Reviewing: ${commit.message.substring(0, 50)}...`);

    try {
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'openai/gpt-oss-120b:free',
                messages: [
                    {
                        role: 'system',
                        content: `You are a commit message reviewer. Analyze commit messages based on:
            - Clarity: Is the message clear and descriptive?
            - Convention: Does it follow conventional commit format? (feat:, fix:, docs:, etc.)
            - Scope: Is the scope of changes well described?
            - Completeness: Does it explain WHAT and WHY?
            
            Respond ONLY in JSON format with two fields:
            {
              "rating": "excellent" | "good" | "bad",
              "reasoning": "brief explanation of your rating"
            }`
                    },
                    {
                        role: 'user',
                        content: `Commit message: "${commit.message}"`
                    }
                ],
                temperature: 0.3
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'HTTP-Referer': 'http://localhost:3546',
                    'X-Title': 'Commit Message Reviewer',
                    'Content-Type': 'application/json'
                }
            }
        );

        const content = response.data.choices[0].message.content;
        let parsed;
        try {
            parsed = JSON.parse(content);
        } catch (e) {
            const ratingMatch = content.match(/(excellent|good|bad)/i);
            const rating = ratingMatch ? ratingMatch[0].toLowerCase() : 'good';
            parsed = {
                rating: rating,
                reasoning: content.replace(/[{}"]/g, '').trim()
            };
        }

        return {
            hash: commit.hash,
            message: commit.message,
            rating: parsed.rating || 'good',
            reasoning: parsed.reasoning || 'No reasoning provided',
            author: commit.author,
            date: commit.date
        };
    } catch (error) {
        const err = error as any;

        // 429 error (try again twice with time wait due to rate limit)
        if (err.response && err.response.status === 429) {
            const maxRetries = 2;
            if (retryCount < maxRetries) {
                const waitTime = Math.pow(2, retryCount) * 5000;
                console.log(`Rate limit hit. Waiting ${waitTime/1000} seconds before retry ${retryCount + 1}/${maxRetries}...`);
                await delay(waitTime);
                return reviewCommit(commit, retryCount + 1);
            } else {
                console.log(`Max retries reached for commit ${commit.hash}`);
            }
        }

        console.error(`Error reviewing commit ${commit.hash}:`, err.message);
        return {
            hash: commit.hash,
            message: commit.message,
            rating: 'good',
            reasoning: 'Unable to review due to API error',
            author: commit.author,
            date: commit.date
        };
    }
}

export async function reviewCommits(commits: Commit[]): Promise<ReviewResult[]> {
    console.log(`\nReviewing ${commits.length} commit messages...\n`);
    const results: ReviewResult[] = [];

    for (let i = 0; i < commits.length; i++) {
        const commit = commits[i];
        console.log(`[${i + 1}/${commits.length}] Processing...`);
        const result = await reviewCommit(commit);
        results.push(result);
        console.log(`Rating: ${result.rating.toUpperCase()} - ${result.reasoning}\n`);

        await new Promise(resolve => setTimeout(resolve, 500));
    }

    return results;
}