import fs from 'fs-extra';
import path from 'path';
import { ReviewResult } from './types';

export function generateHTMLReport(reviews: ReviewResult[]): string {
  const ratingColors = {
    excellent: '#22c55e',
    good: '#3b82f6',
    bad: '#ef4444'
  };

  const ratingLabels = {
    excellent: 'Excellent',
    good: 'Good',
    bad: 'Bad'
  };

  const stats = {
    excellent: reviews.filter(r => r.rating === 'excellent').length,
    good: reviews.filter(r => r.rating === 'good').length,
    bad: reviews.filter(r => r.rating === 'bad').length
  };

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Commit Message Review Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: #f8fafc;
            padding: 40px 20px;
            color: #1e293b;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
            padding: 40px;
        }
        h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .subtitle {
            color: #64748b;
            margin-bottom: 30px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin: 30px 0;
        }
        .stat-card {
            background: #f1f5f9;
            padding: 16px;
            border-radius: 12px;
            text-align: center;
            transition: transform 0.2s;
        }
        .stat-card:hover { transform: translateY(-2px); }
        .stat-number {
            font-size: 32px;
            font-weight: 700;
        }
        .stat-label {
            font-size: 14px;
            color: #475569;
            margin-top: 4px;
        }
        .excellent .stat-number { color: #22c55e; }
        .good .stat-number { color: #3b82f6; }
        .bad .stat-number { color: #ef4444; }
        
        .commit-item {
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin: 16px 0;
            transition: all 0.2s;
        }
        .commit-item:hover {
            border-color: #94a3b8;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        .commit-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
        }
        .commit-hash {
            font-family: 'Courier New', monospace;
            background: #f1f5f9;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 14px;
        }
        .commit-message {
            font-size: 16px;
            font-weight: 500;
            margin: 8px 0;
        }
        .commit-meta {
            color: #64748b;
            font-size: 14px;
            margin: 4px 0;
        }
        .rating-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
            color: white;
        }
        .rating-excellent { background: #22c55e; }
        .rating-good { background: #3b82f6; }
        .rating-bad { background: #ef4444; }
        
        .reasoning {
            background: #f8fafc;
            padding: 12px 16px;
            border-radius: 8px;
            margin-top: 10px;
            font-size: 14px;
            color: #475569;
            border-left: 4px solid #94a3b8;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #94a3b8;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Commit Message Review Report</h1>
        <div class="subtitle">AI-powered analysis of recent commit messages</div>
        
        <div class="stats">
            <div class="stat-card excellent">
                <div class="stat-number">${stats.excellent}</div>
                <div class="stat-label">Excellent</div>
            </div>
            <div class="stat-card good">
                <div class="stat-number">${stats.good}</div>
                <div class="stat-label">Good</div>
            </div>
            <div class="stat-card bad">
                <div class="stat-number">${stats.bad}</div>
                <div class="stat-label">Needs Improvement</div>
            </div>
        </div>
        
        <h2 style="margin: 30px 0 20px 0; font-size: 20px;">Detailed Reviews</h2>
        
        ${reviews.map(review => `
            <div class="commit-item">
                <div class="commit-header">
                    <div>
                        <div class="commit-message">${escapeHtml(review.message)}</div>
                        <div class="commit-meta">
                            <span class="commit-hash">${review.hash}</span>
                            • ${review.author} • ${review.date}
                        </div>
                    </div>
                    <span class="rating-badge rating-${review.rating}">
                        ${review.rating}
                    </span>
                </div>
                <div class="reasoning">
                    <strong>Reasoning:</strong> ${escapeHtml(review.reasoning)}
                </div>
            </div>
        `).join('')}
        
        <div class="footer">
            Generated by Commit Message Reviewer • ${new Date().toLocaleString()}
        </div>
    </div>
</body>
</html>
  `;

  return html;
}

function escapeHtml(text: string): string {
  const map: {[key: string]: string} = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

export async function generateReport(reviews: ReviewResult[], outputPath: string): Promise<string> {
  const html = generateHTMLReport(reviews);
  await fs.writeFile(outputPath, html, 'utf8');
  return outputPath;
}