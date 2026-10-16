# Commit Message Reviewer

An AI-powered command-line tool that reviews git commit messages using OpenRouter's free LLM API. It generates detailed reports with ratings and reasoning for each commit, served via a local web server.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [How It Works](#how-it-works)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Building the Project](#building-the-project)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Features

- **Local & Remote Repository Support** - Run against any local git repo or clone remote repositories
- **AI-Powered Reviews** - Uses OpenRouter's free GPT model to analyze commit messages
- **Smart Rating System** - Each commit receives a rating of "excellent", "good", or "bad" with detailed reasoning
- **Beautiful HTML Reports** - Generates styled reports with statistics and detailed reviews
- **Local Web Server** - Serves reports on port 3546 for easy viewing
- **Rate Limit Handling** - Automatically handles API rate limits with retry logic
- **TypeScript** - Fully typed for better development experience

## Prerequisites

Before you begin, ensure you have:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **Git** (for cloning repositories)
- **OpenRouter API Key**

## Getting an OpenRouter API Key

1. Visit [OpenRouter](https://openrouter.ai/)
2. Sign up for a free account
3. Navigate to your dashboard
4. Generate an API key 


## How to Build

1. **Install dependencies** 
- npm install
2. **Create environment**
- echo "OPENROUTER_API_KEY=your_api_key_here" > .env
3. **Run Build**
- npm run build

## Usage
- **Review current directory repository** (npm start)
- **Review a remote repository** (npm start -- --url "https://github.com/better-auth/better-auth")
- **Review a specific number of commits** (npm start -- --count 5)
- **Both options** (npm start -- --url "https://github.com/better-auth/better-auth" --count 15)

## View Report
After running the program:
1. Terminal Output: Shows real-time progress and ratings
2. HTML Report: Automatically generated as report.html
3. Web Server: Visit http://localhost:3546 in your browser

## Overview
Command Processing: The CLI parses user arguments using commander

Repository Access: Uses simple-git to read local repos or clone remote ones

Commit Extraction: Fetches the most recent commits (default: 10)

AI Review: Sends each commit message to OpenRouter's API

Rating Generation: AI analyzes messages based on:

- Clarity: Is the message clear and descriptive?

- Convention: Does it follow conventional commit format? (feat:, fix:, docs:)

- Scope: Is the scope of changes well described?

- Completeness: Does it explain WHAT and WHY?

Report Generation: Creates an HTML report with statistics and detailed reviews

Web Server: Serves the report on port 3546 for easy viewing