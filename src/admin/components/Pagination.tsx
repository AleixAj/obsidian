interface PaginationProps {
  page: number;
  lastPage: number;
  onChange: (page: number) => void;
}

/** "Previous · Page 2 of 9 · Next" bar under the tables. */
export function Pagination({ page, lastPage, onChange }: PaginationProps) {
  if (lastPage <= 1) return null;

  return (
    <div className="adm-pagination">
      <button type="button" className="adm-btn" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </button>
      <span className="adm-muted">
        Page {page} of {lastPage}
      </span>
      <button type="button" className="adm-btn" disabled={page >= lastPage} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </div>
  );
}
