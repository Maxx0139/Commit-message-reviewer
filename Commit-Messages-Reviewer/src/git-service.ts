import simpleGit from 'simple-git';
import { Commit } from './types';

export async function getCommitMessages(repoPath: string, count: number = 10): Promise<Commit[]> {
    try {
        const git = simpleGit(repoPath);
        const logs = await git.log({ maxCount: count });

        return logs.all.map(log => ({
            hash: log.hash.substring(0, 8),
            message: log.message,
            author: log.author_name,
            date: new Date(log.date).toLocaleDateString()
        }));
    } catch (error) {
        console.error('Error reading git repo:', error);
        throw new Error('Failed to read commit history. Make sure this is a git repo');
    }
}

export async function cloneRepository(url: string, targetPath: string): Promise<string> {
    const simpleGit = require('simple-git');
    await simpleGit().clone(url, targetPath);
    return targetPath;
}