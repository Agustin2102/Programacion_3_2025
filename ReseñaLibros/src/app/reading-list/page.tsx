import React from 'react';
import { getReadingList } from '../api/tools/reading-list';

export default async function ReadingListPage() {
  let items: any[] = [];
  try {
    items = await getReadingList({ limit: 100 });
  } catch (err) {
    console.error('Error loading reading list page:', err);
  }

  return (
    <section>
      <h1>Mi lista de lectura</h1>
      {items.length === 0 ? (
        <p>No hay libros en tu lista aún.</p>
      ) : (
        <ul>
          {items.map((it) => (
            <li key={it.id} style={{marginBottom: 12}}>
              <strong>{it.title}</strong>
              <div>{it.authors}</div>
              <div>Prioridad: {it.priority ?? 'medium'}</div>
              {it.notes ? <div>Notas: {it.notes}</div> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
