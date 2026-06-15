import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryManager from './category-manager';
import type { Category, Expense } from '../types';

const categories: Category[] = [
  { id: 'c1', name: 'Food' },
  { id: 'c2', name: 'Travel' },
];

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('CategoryManager', () => {
  it('renders empty state when no categories', () => {
    render(
      <CategoryManager
        categories={[]}
        expenses={[]}
        onAdd={vi.fn()}
        onRename={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText('No categories yet. Add one below.')).toBeInTheDocument();
  });

  it('renders category pills', () => {
    render(
      <CategoryManager
        categories={categories}
        expenses={[]}
        onAdd={vi.fn()}
        onRename={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Travel')).toBeInTheDocument();
  });

  it('calls onAdd with trimmed name', () => {
    const onAdd = vi.fn();
    render(
      <CategoryManager
        categories={[]}
        expenses={[]}
        onAdd={onAdd}
        onRename={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText('New category name…'), {
      target: { value: '  Groceries  ' },
    });
    fireEvent.click(screen.getByText('+ Add'));
    expect(onAdd).toHaveBeenCalledWith('Groceries');
  });

  it('does not call onAdd when name is blank', () => {
    const onAdd = vi.fn();
    render(
      <CategoryManager
        categories={[]}
        expenses={[]}
        onAdd={onAdd}
        onRename={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText('+ Add'));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('calls onDelete without confirm when category is unused', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const onDelete = vi.fn();
    render(
      <CategoryManager
        categories={categories}
        expenses={[]}
        onAdd={vi.fn()}
        onRename={vi.fn()}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Delete Food' }));
    expect(onDelete).toHaveBeenCalledWith('c1');
  });

  it('shows warning when deleting a category in use', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const expenses: Expense[] = [
      { id: 'e1', amount: 10, category: 'Food', date: '2024-01-01', notes: '' },
    ];
    const onDelete = vi.fn();
    render(
      <CategoryManager
        categories={categories}
        expenses={expenses}
        onAdd={vi.fn()}
        onRename={vi.fn()}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Delete Food' }));
    expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining('existing expenses'));
    expect(onDelete).toHaveBeenCalledWith('c1');
  });

  it('does not delete when user cancels the confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const expenses: Expense[] = [
      { id: 'e1', amount: 10, category: 'Food', date: '2024-01-01', notes: '' },
    ];
    const onDelete = vi.fn();
    render(
      <CategoryManager
        categories={categories}
        expenses={expenses}
        onAdd={vi.fn()}
        onRename={vi.fn()}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Delete Food' }));
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('enters edit mode on pencil click', () => {
    render(
      <CategoryManager
        categories={categories}
        expenses={[]}
        onAdd={vi.fn()}
        onRename={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Edit Food' }));
    expect(screen.getByDisplayValue('Food')).toBeInTheDocument();
  });

  it('calls onRename when edit is committed via button', () => {
    const onRename = vi.fn();
    render(
      <CategoryManager
        categories={categories}
        expenses={[]}
        onAdd={vi.fn()}
        onRename={onRename}
        onDelete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Edit Food' }));
    const input = screen.getByDisplayValue('Food');
    fireEvent.change(input, { target: { value: 'Meals' } });
    fireEvent.click(screen.getByRole('button', { name: '✓' }));
    expect(onRename).toHaveBeenCalledWith('c1', 'Meals');
  });

  it('cancels edit on Escape key', () => {
    render(
      <CategoryManager
        categories={categories}
        expenses={[]}
        onAdd={vi.fn()}
        onRename={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Edit Food' }));
    const input = screen.getByDisplayValue('Food');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByDisplayValue('Food')).toBeNull();
    expect(screen.getByText('Food')).toBeInTheDocument();
  });

  it('commits edit on Enter key', () => {
    const onRename = vi.fn();
    render(
      <CategoryManager
        categories={categories}
        expenses={[]}
        onAdd={vi.fn()}
        onRename={onRename}
        onDelete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Edit Food' }));
    const input = screen.getByDisplayValue('Food');
    fireEvent.change(input, { target: { value: 'Dining' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onRename).toHaveBeenCalledWith('c1', 'Dining');
  });

  it('adds category via Enter key', () => {
    const onAdd = vi.fn();
    render(
      <CategoryManager
        categories={[]}
        expenses={[]}
        onAdd={onAdd}
        onRename={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    const input = screen.getByPlaceholderText('New category name…');
    fireEvent.change(input, { target: { value: 'Sports' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onAdd).toHaveBeenCalledWith('Sports');
  });
});
