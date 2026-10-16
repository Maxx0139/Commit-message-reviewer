#!/usr/bin/env node

import { program } from 'commander';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { getCommitMessages, cloneRepository } from './git-service';
import { reviewCommits } from './llm-service';
import { generateReport } from './report-generator';
import { startServer } from './server';

// Parse command line arguments
program
    .name('review-commits')
    .description('Review git commit messages using AI')
    .option('-u, --url <url>', 'URL of remote repository to review')
    .option('-c, --count <number>', 'Number of commits to review', '10')
    .parse(process.argv);

const options = program.opts();
const commitCount = parseInt(options.count) || 10;

async function main() {
    console.log(chalk.bold.blue('\nCommit Message Reviewer\n'));

    let repoPath = process.cwd();
    let shouldCleanup = false;

    // Handle remote repository
    if (options.url) {
        console.log(chalk.yellow(`Cloning repo from ${options.url}...`));
        const tempDir = path.join('/tmp', `review-${Date.now()}`);
        try {
            await cloneRepository(options.url, tempDir);
            repoPath = tempDir;
            shouldCleanup = true;
            console.log(chalk.green('Repo cloned successfully\n'));
        } catch (error) {
            const err = error as Error;
            console.error(chalk.red('Failed to clone repo:'), err.message);
            process.exit(1);
        }
    } else {
        console.log(chalk.blue(`Using current directory: ${repoPath}\n`));
    }

    try {
        // Get commit messages
        console.log(chalk.blue(`Fetching last ${commitCount} commits...`));
        const commits = await getCommitMessages(repoPath, commitCount);

        if (commits.length === 0) {
            console.log(chalk.yellow('⚠No commits found in this repository'));
            process.exit(0);
        }

        console.log(chalk.green(`Found ${commits.length} commits\n`));

        // review commits
        const reviews = await reviewCommits(commits);

        // Generate report
        const reportPath = path.join(process.cwd(), 'report.html');
        await generateReport(reviews, reportPath);
        console.log(chalk.green(`\nReport generated: ${reportPath}`));

        // Set environment variable for server
        process.env.REPORT_PATH = reportPath;

        console.log(chalk.blue('\nStarting web server'));
        startServer(3546);

        // temp directory cleanup
        if (shouldCleanup) {
            setTimeout(async () => {
                try {
                    await fs.remove(repoPath);
                    console.log(chalk.gray('Cleaned up temporary repo'));
                } catch (error) {
                    // Ignore cleanup errors
                }
            }, 5000);
        }

    } catch (error) {
        const err = error as Error;
        console.error(chalk.red('\n Error:'), err.message);
        process.exit(1);
    }
}

// Cleanup on exit
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\nShutting down'));
    process.exit(0);
});

main();