import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import CommentSection from './comment-section';

describe('CommentSection', () => {
  beforeEach(() => localStorage.clear());

  it('renders the Comments heading', () => {
    render(<CommentSection routeId="route-1" />);
    expect(screen.getByText('Comments')).toBeInTheDocument();
  });

  it('shows empty state when there are no comments', () => {
    render(<CommentSection routeId="route-empty" />);
    expect(screen.getByText(/No comments yet/i)).toBeInTheDocument();
  });

  it('renders the comment input and Post button', () => {
    render(<CommentSection routeId="route-1" />);
    expect(screen.getByLabelText('Comment text')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Post' })).toBeInTheDocument();
  });

  it('adds a comment when the form is submitted with text', () => {
    render(<CommentSection routeId="route-2" />);
    const input = screen.getByLabelText('Comment text');
    fireEvent.change(input, { target: { value: 'Loved this drive!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Post' }));
    expect(screen.getByText('Loved this drive!')).toBeInTheDocument();
  });

  it('clears the input after a comment is submitted', () => {
    render(<CommentSection routeId="route-3" />);
    const input = screen.getByLabelText('Comment text');
    fireEvent.change(input, { target: { value: 'Great!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Post' }));
    expect((input as HTMLInputElement).value).toBe('');
  });

  it('does not add an empty comment', () => {
    render(<CommentSection routeId="route-4" />);
    fireEvent.click(screen.getByRole('button', { name: 'Post' }));
    expect(screen.queryByText(/No comments yet/i)).toBeInTheDocument();
  });

  it('does not add a whitespace-only comment', () => {
    render(<CommentSection routeId="route-5" />);
    const input = screen.getByLabelText('Comment text');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Post' }));
    expect(screen.queryByText('   ')).not.toBeInTheDocument();
  });

  it('persists the comment to localStorage', () => {
    render(<CommentSection routeId="route-6" />);
    fireEvent.change(screen.getByLabelText('Comment text'), { target: { value: 'Stored!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Post' }));
    const stored = localStorage.getItem('sre_comments');
    expect(stored).not.toBeNull();
    const comments = JSON.parse(stored!);
    expect(comments.some((c: { text: string }) => c.text === 'Stored!')).toBe(true);
  });

  it('shows the username in the comment', () => {
    localStorage.setItem('sre_username', 'Driver9999');
    render(<CommentSection routeId="route-7" />);
    fireEvent.change(screen.getByLabelText('Comment text'), { target: { value: 'Hi!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Post' }));
    expect(screen.getByText('Driver9999')).toBeInTheDocument();
  });
});
