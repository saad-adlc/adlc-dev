import { useState } from 'react';
import type { Category, Expense } from '../types';
import styles from '../app.module.css';

interface CategoryManagerProps {
  categories: Category[];
  expenses: Expense[];
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

/** Inline category manager: add, rename, delete with referential-integrity warning. */
export default function CategoryManager({
  categories,
  expenses,
  onAdd,
  onRename,
  onDelete,
}: CategoryManagerProps) {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setNewName('');
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditValue(cat.name);
  }

  function commitEdit(id: string) {
    const trimmed = editValue.trim();
    if (trimmed) onRename(id, trimmed);
    setEditingId(null);
  }

  function handleDelete(cat: Category) {
    const inUse = expenses.some((e) => e.category === cat.name);
    if (inUse) {
      const ok = window.confirm(
        `"${cat.name}" is used by existing expenses. Those expenses will keep the name as text. Delete anyway?`,
      );
      if (!ok) return;
    }
    onDelete(cat.id);
  }

  return (
    <div className={styles.categorySection}>
      <div className={styles.categorySectionHeader}>
        <h3>Categories</h3>
      </div>
      {categories.length === 0 && (
        <p className={styles.emptyState}>No categories yet. Add one below.</p>
      )}
      <div className={styles.categoryPills}>
        {categories.map((cat) =>
          editingId === cat.id ? (
            <span key={cat.id} className={styles.categoryPill}>
              <input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitEdit(cat.id);
                  if (e.key === 'Escape') setEditingId(null);
                }}
                style={{ width: '80px', fontSize: '0.8rem', border: 'none', background: 'transparent' }}
              />
              <button className={styles.pillBtn} onClick={() => commitEdit(cat.id)}>✓</button>
              <button className={styles.pillBtn} onClick={() => setEditingId(null)}>✕</button>
            </span>
          ) : (
            <span key={cat.id} className={styles.categoryPill}>
              {cat.name}
              <button className={styles.pillBtn} onClick={() => startEdit(cat)} aria-label={`Edit ${cat.name}`}>✏</button>
              <button className={styles.pillBtn} onClick={() => handleDelete(cat)} aria-label={`Delete ${cat.name}`}>✕</button>
            </span>
          ),
        )}
      </div>
      <div className={styles.addCategoryRow}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name…"
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
        />
        <button className={styles.btnSmall} onClick={handleAdd}>+ Add</button>
      </div>
    </div>
  );
}
