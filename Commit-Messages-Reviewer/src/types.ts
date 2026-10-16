export interface Commit {
    hash: string;
    message: string;
    author: string;
    date: string;
}

export interface ReviewResult {
    hash: string;
    message: string;
    rating: 'excellent' | 'good' | 'bad';
    reasoning: string;
    author: string;
    date: string;
}