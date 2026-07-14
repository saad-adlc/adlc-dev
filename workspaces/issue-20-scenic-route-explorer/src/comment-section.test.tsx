import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import CommentSection from './comment-section';
import { AppProvider } from './app-context';
import type { ReactNode } from 'react';

beforeEach(() => {
  vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => undefined);
});

function Wrapper({ children }: { children: ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}

describe('CommentSection', () => {
  it('shows empty state message when no comments', () => {
    render(<CommentSection routeId="seed-1" />, { wrapper: Wrapper });
    expect(screen.getByText('Be the first to comment!')).toBeInTheDocument();
  });

  it('Post button is disabled when textarea is empty', () => {
    render(<CommentSection routeId="seed-1" />, { wrapper: Wrapper });
    expect(screen.getByRole('button', { name: 'Post' })).toBeDisabled();
  });

  it('Post button enables when text is typed', () => {
    render(<CommentSection routeId="seed-1" />, { wrapper: Wrapper });
    const textarea = screen.getByLabelText('Comment text');
    fireEvent.change(textarea, { target: { value: 'Nice route!' } });
    expect(screen.getByRole('button', { name: 'Post' })).not.toBeDisabled();
  });

  it('submitting a comment displays it in the list', () => {
    render(<CommentSection routeId="seed-1" />, { wrapper: Wrapper });
    const textarea = screen.getByLabelText('Comment text');
    fireEvent.change(textarea, { target: { value: 'Amazing scenery!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Post' }));
    expect(screen.getByText('Amazing scenery!')).toBeInTheDocument();
  });

  it('clears textarea after posting', () => {
    render(<CommentSection routeId="seed-1" />, { wrapper: Wrapper });
    const textarea = screen.getByLabelText('Comment text') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Hello road!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Post' }));
    expect(textarea.value).toBe('');
  });

  it('does not post when text is only whitespace', () => {
    render(<CommentSection routeId="seed-1" />, { wrapper: Wrapper });
    const textarea = screen.getByLabelText('Comment text');
    fireEvent.change(textarea, { target: { value: '   ' } });
    expect(screen.getByRole('button', { name: 'Post' })).toBeDisabled();
  });

  it('updates comment count in heading after posting', () => {
    render(<CommentSection routeId="seed-1" />, { wrapper: Wrapper });
    expect(screen.getByText('Comments (0)')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Comment text'), { target: { value: 'Test' } });
    fireEvent.click(screen.getByRole('button', { name: 'Post' }));
    expect(screen.getByText('Comments (1)')).toBeInTheDocument();
  });

  it('posts comment with Ctrl+Enter', () => {
    render(<CommentSection routeId="seed-1" />, { wrapper: Wrapper });
    const textarea = screen.getByLabelText('Comment text');
    fireEvent.change(textarea, { target: { value: 'Keyboard post' } });
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });
    expect(screen.getByText('Keyboard post')).toBeInTheDocument();
  });

  it('does not post with Enter alone', () => {
    render(<CommentSection routeId="seed-1" />, { wrapper: Wrapper });
    const textarea = screen.getByLabelText('Comment text');
    fireEvent.change(textarea, { target: { value: 'Enter only' } });
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: false });
    expect(screen.getByText('Comments (0)')).toBeInTheDocument();
  });

  it('shows username on the comment', () => {
    render(<CommentSection routeId="seed-1" />, { wrapper: Wrapper });
    fireEvent.change(screen.getByLabelText('Comment text'), { target: { value: 'Hi' } });
    fireEvent.click(screen.getByRole('button', { name: 'Post' }));
    expect(screen.getByText(/^Driver\d{4}$/)).toBeInTheDocument();
  });
});
